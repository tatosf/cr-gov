const USER_AGENT = "cr-gov-scraper/1.0 (https://github.com/santiagofischel/cr-gov)";
const DEFAULT_TIMEOUT = 15_000;
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000];

// Track last request time per domain for rate limiting
const lastRequestByDomain = new Map<string, number>();
const MIN_DELAY_MS = 2000;

async function rateLimitDelay(url: string): Promise<void> {
  const domain = new URL(url).hostname;
  const last = lastRequestByDomain.get(domain);
  if (last) {
    const elapsed = Date.now() - last;
    if (elapsed < MIN_DELAY_MS) {
      await new Promise((r) => setTimeout(r, MIN_DELAY_MS - elapsed));
    }
  }
  lastRequestByDomain.set(domain, Date.now());
}

export async function fetchHTML(url: string): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt - 1]));
    }

    await rateLimitDelay(url);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch(url, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "es-CR,es;q=0.9,en;q=0.8",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`  Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${url}: ${lastError.message}`);
    }
  }

  throw new Error(`Failed to fetch ${url} after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}

export async function fetchXML(url: string, params?: URLSearchParams): Promise<string> {
  const fullUrl = params ? `${url}?${params}` : url;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt - 1]));
    }

    await rateLimitDelay(fullUrl);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

      const response = await fetch(fullUrl, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/xml,application/xml",
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.text();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`  Attempt ${attempt + 1}/${MAX_RETRIES} failed for ${fullUrl}: ${lastError.message}`);
    }
  }

  throw new Error(`Failed to fetch ${fullUrl} after ${MAX_RETRIES} attempts: ${lastError?.message}`);
}
