export const safeCount = (value: { count?: number | null } | null | undefined): number => {
  if (!value) return 0;
  return typeof value.count === 'number' ? value.count : 0;
};

export const calculateProgress = (delivered: number, target: number) => {
  if (!target || target <= 0) return 0;
  return Math.min(100, Math.round((delivered / target) * 100));
};

export const getStatusTone = (status: string) => {
  const normalized = status?.toLowerCase() ?? "planned";

  switch (normalized) {
    case "delivered":
    case "completed":
    case "active":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
    case "in_progress":
    case "processing":
    case "dispatched":
      return "bg-primary/10 text-primary border-primary/30";
    case "delayed":
    case "risk":
    case "at_risk":
      return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};

export const formatCurrency = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const getProgressLabel = (status: string | null | undefined) => {
  const normalized = status?.toLowerCase() ?? "planned";

  switch (normalized) {
    case "completed":
    case "delivered":
      return "Completed";
    case "in_progress":
    case "processing":
    case "active":
      return "On track";
    case "delayed":
    case "risk":
    case "at_risk":
      return "At risk";
    default:
      return "Planned";
  }
};

export const getDeliveryStatusTone = (status: string | null | undefined) => {
  const normalized = status?.toLowerCase() ?? "planned";

  switch (normalized) {
    case "delivered":
    case "complete":
    case "confirmed":
      return "bg-emerald-500/10 text-emerald-700 border-emerald-500/30";
    case "in_transit":
    case "dispatched":
    case "processing":
      return "bg-primary/10 text-primary border-primary/30";
    case "pending":
    case "scheduled":
      return "bg-amber-500/10 text-amber-700 border-amber-500/30";
    case "planned":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
};
