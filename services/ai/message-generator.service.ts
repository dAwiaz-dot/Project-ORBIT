import type { Lead } from "@/types/lead";

const openers = [
  "Vi alguns sinais interessantes sobre a presença digital de vocês.",
  "Analisei rapidamente como a empresa aparece para novos clientes na região.",
  "Percebi uma oportunidade concreta para transformar a reputação local em mais contatos.",
  "Notei pontos fortes no posicionamento de vocês e alguns ajustes que podem gerar demanda."
];

const closers = [
  "Posso te mostrar um modelo simples pensado para empresas como a de vocês?",
  "Faz sentido eu te enviar uma análise rápida, sem compromisso?",
  "Posso compartilhar uma ideia prática para captar mais oportunidades pelo WhatsApp?",
  "Se fizer sentido, preparo uma visão objetiva de melhoria para vocês."
];

export function generateUniqueLeadMessage(lead: Lead, reasons: string[] = [], opportunities: string[] = []) {
  const seed = hash(`${lead.company}-${lead.city}-${lead.category}-${lead.reviewCount ?? 0}`);
  const opener = openers[seed % openers.length];
  const closer = closers[(seed + 2) % closers.length];
  const strongestReason = reasons[seed % Math.max(1, reasons.length)] ?? "vocês têm potencial de crescimento local";
  const opportunity = opportunities[(seed + 1) % Math.max(1, opportunities.length)] ?? "melhorar a geração de contatos qualificados";

  return [
    `Olá ${lead.company}!`,
    "",
    opener,
    `O ponto que mais chamou atenção foi: ${strongestReason.toLowerCase()}.`,
    `Acredito que uma boa oportunidade seria trabalhar ${opportunity.toLowerCase()} em ${lead.city}.`,
    "",
    closer
  ].join("\n");
}

function hash(value: string) {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
