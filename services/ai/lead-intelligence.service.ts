import type { Lead } from "@/types/lead";
import type { ChannelScore, IntelligenceGrade, LeadIntelligenceReport } from "@/types/intelligence";
import { generateUniqueLeadMessage } from "@/services/ai/message-generator.service";

export class LeadIntelligenceService {
  analyze(lead: Lead): LeadIntelligenceReport {
    const googleMaps = this.scoreGoogleMaps(lead);
    const site = this.scoreSite(lead);
    const instagram = this.scoreInstagram(lead);
    const potentialScore = this.calculatePotentialScore(googleMaps.score, site.score, instagram.score, lead);
    const closeProbability = Math.min(97, Math.max(22, potentialScore + this.intentBoost(lead)));
    const grade = this.grade(potentialScore);
    const reasons = this.reasons(lead, googleMaps, site, instagram);
    const opportunities = this.opportunities(lead, site, instagram);

    return {
      lead,
      grade,
      stars: Math.max(1, Math.round(potentialScore / 20)),
      potentialScore,
      closeProbability,
      reasons,
      opportunities,
      googleMaps,
      site,
      instagram,
      instagramProfile: {
        handle: lead.instagram,
        photoUrl: null,
        bio: lead.instagram ? `${lead.category} em ${lead.city}. Atendimento local e relacionamento direto com clientes.` : null,
        followers: lead.instagram ? this.estimateFollowers(lead) : null,
        following: lead.instagram ? 420 : null,
        posts: lead.instagram ? 96 : null,
        lastPostAt: lead.instagram ? "2025-11-10T12:00:00.000Z" : null,
        score: instagram.score
      },
      siteAudit: {
        url: lead.website,
        hasHttps: Boolean(lead.website?.startsWith("https://")),
        performanceScore: lead.website ? Math.max(48, site.score - 8) : null,
        responsiveScore: lead.website ? Math.max(56, site.score - 2) : null,
        seoScore: lead.website ? Math.max(42, site.score - 14) : null,
        technologies: lead.website ? this.detectTechnologies(lead.website) : [],
        report: lead.website
          ? ["Site encontrado para auditoria tecnica.", "Recomenda-se validar Lighthouse em ambiente de producao.", "Oportunidade de SEO local e rastreamento de conversoes."]
          : ["Empresa sem site identificado.", "Perde oportunidades em pesquisa local e campanhas.", "Alta oportunidade para landing page de conversao."]
      },
      generatedMessage: generateUniqueLeadMessage(lead, reasons, opportunities),
      createdAt: new Date().toISOString()
    };
  }

  private scoreGoogleMaps(lead: Lead): ChannelScore {
    const rating = Number(lead.rating ?? 0);
    const reviews = Number(lead.reviewCount ?? 0);
    const score = Math.min(100, Math.round(rating * 14 + Math.min(32, reviews / 5)));

    return {
      score,
      label: score >= 82 ? "Forte prova social" : score >= 60 ? "Boa reputacao local" : "Reputacao a desenvolver",
      status: score >= 82 ? "strong" : score >= 60 ? "average" : "weak",
      signals: [`Nota ${lead.rating ?? "-"}`, `${lead.reviewCount ?? 0} avaliacoes`, lead.googleMapsUrl ? "Google Maps localizado" : "Link do Maps ausente"]
    };
  }

  private scoreSite(lead: Lead): ChannelScore {
    if (!lead.website) {
      return {
        score: 24,
        label: "Sem site profissional",
        status: "missing",
        signals: ["Site nao identificado", "Baixa captura de demanda", "Oportunidade clara para landing page"]
      };
    }

    const https = lead.website.startsWith("https://");
    const score = https ? 76 : 58;

    return {
      score,
      label: https ? "Site ativo com HTTPS" : "Site ativo com seguranca limitada",
      status: score >= 72 ? "average" : "weak",
      signals: [https ? "HTTPS ativo" : "HTTPS ausente", "Requer auditoria Lighthouse", "Pode melhorar SEO local"]
    };
  }

  private scoreInstagram(lead: Lead): ChannelScore {
    if (!lead.instagram) {
      return {
        score: 30,
        label: "Instagram ausente",
        status: "missing",
        signals: ["Perfil nao encontrado", "Pouca prova visual", "Oportunidade para conteudo recorrente"]
      };
    }

    const score = lead.website ? 68 : 56;
    return {
      score,
      label: score >= 65 ? "Perfil com potencial" : "Perfil precisa de consistencia",
      status: "average",
      signals: ["Handle identificado", "Ultima postagem estimada antiga", "Pode melhorar identidade visual"]
    };
  }

  private calculatePotentialScore(googleScore: number, siteScore: number, instagramScore: number, lead: Lead) {
    const gapBonus = !lead.website ? 18 : 4;
    const whatsappBonus = lead.hasWhatsApp ? 6 : 0;
    return Math.min(100, Math.round(googleScore * 0.42 + (100 - siteScore) * 0.28 + (100 - instagramScore) * 0.18 + gapBonus + whatsappBonus));
  }

  private intentBoost(lead: Lead) {
    return (lead.hasWhatsApp ? 4 : 0) + (!lead.website ? 7 : 0) + (Number(lead.reviewCount ?? 0) > 100 ? 5 : 0);
  }

  private grade(score: number): IntelligenceGrade {
    if (score >= 82) return "A";
    if (score >= 68) return "B";
    if (score >= 52) return "C";
    return "D";
  }

  private reasons(lead: Lead, googleMaps: ChannelScore, site: ChannelScore, instagram: ChannelScore) {
    return [
      googleMaps.label,
      !lead.website ? "Nao possui site profissional identificado" : site.label,
      lead.instagram ? instagram.label : "Instagram nao encontrado",
      lead.hasWhatsApp ? "Contato via WhatsApp disponivel" : "Telefone precisa ser validado",
      "Grande potencial para marketing digital local"
    ];
  }

  private opportunities(lead: Lead, site: ChannelScore, instagram: ChannelScore) {
    const opportunities = ["Campanha local para capturar demanda ativa", "Script de WhatsApp consultivo com prova social"];
    if (site.status === "missing" || site.status === "weak") opportunities.push("Landing page profissional com rastreamento de conversoes");
    if (instagram.status !== "strong") opportunities.push("Reposicionamento visual e calendario de conteudo");
    if (lead.rating && lead.rating >= 4.5) opportunities.push("Anuncios usando reputacao Google como argumento central");
    return opportunities;
  }

  private estimateFollowers(lead: Lead) {
    return Math.round(700 + Number(lead.reviewCount ?? 40) * 7.8);
  }

  private detectTechnologies(url: string) {
    const lower = url.toLowerCase();
    if (lower.includes("wp") || lower.includes("wordpress")) return ["WordPress", "PHP", "Google Analytics"];
    if (lower.includes("vercel") || lower.includes("react")) return ["React", "Next.js", "Vercel"];
    return ["HTML", "CSS", "JavaScript", "Google Analytics"];
  }
}
