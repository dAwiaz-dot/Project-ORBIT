import type { AutomationRuleView, FollowUpCadence } from "@/types/crm";
import type { LeadStatus } from "@/types/lead";

export const defaultFollowUpCadence: FollowUpCadence[] = [
  { label: "Primeiro retorno", daysAfterContact: 3 },
  { label: "Segundo retorno", daysAfterContact: 7 },
  { label: "Ultima tentativa consultiva", daysAfterContact: 15 }
];

export const defaultAutomationRules: AutomationRuleView[] = [
  {
    id: "rule_interested_followup",
    name: "Interessado cria lembrete",
    trigger: "Lead virou Interessado",
    action: "Criar follow-up em 3 dias",
    active: true
  },
  {
    id: "rule_client_contract",
    name: "Cliente gera contrato",
    trigger: "Lead virou Cliente",
    action: "Gerar contrato automaticamente",
    active: true
  },
  {
    id: "rule_proposal_quote",
    name: "Proposta gera orcamento",
    trigger: "Lead virou Proposta",
    action: "Gerar orcamento em PDF",
    active: true
  }
];

export function automationActionsForStatus(status: LeadStatus) {
  if (status === "INTERESTED") return ["Criar lembrete", "Sugerir mensagem de follow-up"];
  if (status === "PROPOSAL") return ["Gerar orcamento", "Criar tarefa de revisao"];
  if (status === "CLIENT") return ["Gerar contrato", "Registrar venda", "Notificar financeiro"];
  return ["Registrar movimentacao no historico"];
}
