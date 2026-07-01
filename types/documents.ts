import type { Lead } from "@/types/lead";

export type CommercialDocumentKind = "proposal" | "contract" | "quote";

export type CommercialDocumentInput = {
  lead: Lead;
  value: number;
  deadline: string;
  services: string[];
  companyName?: string;
};

export type CommercialDocument = {
  kind: CommercialDocumentKind;
  title: string;
  fileName: string;
  sections: Array<{
    title: string;
    body: string;
  }>;
  createdAt: string;
};
