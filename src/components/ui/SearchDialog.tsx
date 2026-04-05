"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import institutionsData from "@/data/seed/institutions.json";
import officialsData from "@/data/seed/officials.json";
import legislatorsData from "@/data/seed/legislators.json";
import procurementData from "@/data/seed/procurement.json";

interface SearchResult {
  type: "institution" | "official" | "legislator" | "contractor";
  label: string;
  sublabel: string;
  href: string;
}

function buildIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  for (const inst of institutionsData.institutions) {
    results.push({
      type: "institution",
      label: inst.name,
      sublabel: inst.type === "ministry" ? "Ministerio" : inst.type === "autonomous" ? "Autónoma" : inst.type === "power" ? "Poder" : "Institución",
      href: `/gobierno/${inst.id}`,
    });
  }

  for (const off of officialsData.officials) {
    results.push({
      type: "official",
      label: off.name,
      sublabel: `${off.position} — ${off.institution}`,
      href: "/gobierno",
    });
  }

  for (const leg of legislatorsData.legislators) {
    results.push({
      type: "legislator",
      label: leg.name,
      sublabel: `${leg.party} — ${leg.province}`,
      href: `/asamblea/${leg.id}`,
    });
  }

  const seen = new Set<string>();
  for (const c of procurementData.contracts) {
    if (!seen.has(c.contractorId)) {
      seen.add(c.contractorId);
      results.push({
        type: "contractor",
        label: c.contractor,
        sublabel: "Proveedor",
        href: "/contrataciones",
      });
    }
  }

  return results;
}

const typeLabels: Record<SearchResult["type"], string> = {
  institution: "Institución",
  official: "Funcionario",
  legislator: "Diputado/a",
  contractor: "Proveedor",
};

const typeColors: Record<SearchResult["type"], string> = {
  institution: "bg-blue-100 text-blue-800",
  official: "bg-purple-100 text-purple-800",
  legislator: "bg-green-100 text-green-800",
  contractor: "bg-amber-100 text-amber-800",
};

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const indexRef = useRef<SearchResult[]>([]);
  const router = useRouter();

  useEffect(() => {
    indexRef.current = buildIndex();
  }, []);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  const search = useCallback((q: string) => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = indexRef.current.filter(
      (r) =>
        r.label.toLowerCase().includes(lower) ||
        r.sublabel.toLowerCase().includes(lower)
    );
    setResults(filtered.slice(0, 10));
    setSelectedIndex(0);
  }, []);

  function navigate(result: SearchResult) {
    setOpen(false);
    router.push(result.href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      navigate(results[selectedIndex]);
    }
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-light/30 hover:bg-primary-light/50 transition-colors text-sm text-white/80"
        aria-label="Buscar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <span>Buscar...</span>
        <kbd className="text-xs bg-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      {/* Mobile search button */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-2 rounded-md hover:bg-primary-light"
        aria-label="Buscar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>

      {/* Dialog overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[15vh]"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <svg className="w-5 h-5 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => search(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Buscar instituciones, diputados, proveedores..."
                className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted"
              />
              <kbd className="text-xs text-muted bg-background px-1.5 py-0.5 rounded border border-border">ESC</kbd>
            </div>

            {/* Results */}
            {results.length > 0 && (
              <ul className="max-h-80 overflow-y-auto py-2">
                {results.map((r, i) => (
                  <li key={`${r.type}-${r.label}`}>
                    <button
                      className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                        i === selectedIndex ? "bg-primary/10" : "hover:bg-background"
                      }`}
                      onClick={() => navigate(r)}
                      onMouseEnter={() => setSelectedIndex(i)}
                    >
                      <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap ${typeColors[r.type]}`}>
                        {typeLabels[r.type]}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium truncate">{r.label}</div>
                        <div className="text-xs text-muted truncate">{r.sublabel}</div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {query.length >= 2 && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted">
                No se encontraron resultados para &ldquo;{query}&rdquo;
              </div>
            )}

            {query.length < 2 && (
              <div className="px-4 py-6 text-center text-xs text-muted">
                Escribe al menos 2 caracteres para buscar
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
