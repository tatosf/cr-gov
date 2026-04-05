export function formatCRC(amount: number): string {
  if (amount >= 1_000_000_000_000) {
    return `₡${(amount / 1_000_000_000_000).toFixed(2)}B`;
  }
  if (amount >= 1_000_000_000) {
    return `₡${(amount / 1_000_000_000).toFixed(1)}MM`;
  }
  if (amount >= 1_000_000) {
    return `₡${(amount / 1_000_000).toFixed(1)}M`;
  }
  return `₡${amount.toLocaleString("es-CR")}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "short",
  });
}

export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("es-CR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
