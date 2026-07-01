import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { MessageEditor } from "@/components/forms/message-editor";

export default function MensagensPage() {
  return (
    <AppShell>
      <div className="page-shell">
        <PageHeader
          eyebrow="Outreach"
          title="Mensagens"
          description="Crie modelos personalizados com variaveis de empresa, cidade e categoria para abrir conversas pelo WhatsApp."
        />
        <MessageEditor />
      </div>
    </AppShell>
  );
}
