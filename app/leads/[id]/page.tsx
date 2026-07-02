import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { LeadDetailView } from "@/components/leads/lead-detail";
import { LeadRepository } from "@/repositories/lead.repository";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await new LeadRepository().getDetails(id);

  if (!lead) notFound();

  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Detalhe do lead"
          title={lead.company}
          description="Visao comercial completa com canais, IA, documentos, follow-ups e vendas."
        />
        <LeadDetailView lead={lead} />
      </div>
    </AppShell>
  );
}
