import type { LeadStatus } from "@/types/lead";

export const leadStatusLabels: Record<LeadStatus, string> = {
  NEW: "Novo",
  SENT: "Mensagem enviada",
  REPLIED: "Respondeu",
  INTERESTED: "Interessado",
  MEETING: "Reuniao",
  PROPOSAL: "Proposta",
  CLIENT: "Cliente",
  LOST: "Perdido"
};

export const leadStatusTone: Record<LeadStatus, "info" | "secondary" | "success" | "warning" | "danger"> = {
  NEW: "info",
  SENT: "secondary",
  REPLIED: "success",
  INTERESTED: "warning",
  MEETING: "info",
  PROPOSAL: "warning",
  CLIENT: "success",
  LOST: "danger"
};

export const crmPipelineStatuses: LeadStatus[] = ["NEW", "SENT", "REPLIED", "INTERESTED", "MEETING", "PROPOSAL", "CLIENT", "LOST"];
