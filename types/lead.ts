export type LeadStatus = "NEW" | "SENT" | "REPLIED" | "INTERESTED" | "MEETING" | "PROPOSAL" | "CLIENT" | "LOST";

export type Lead = {
  id: string;
  company: string;
  phone: string | null;
  address: string;
  city: string;
  state: string;
  website: string | null;
  instagram: string | null;
  googleMapsUrl: string | null;
  category: string;
  rating: number | null;
  reviewCount: number | null;
  latitude: number | null;
  longitude: number | null;
  hasWhatsApp: boolean;
  status: LeadStatus;
  createdAt: string;
};

export type LeadSearchFilters = {
  state: string;
  city: string;
  category: string;
  maxResults: number;
  minRating: number;
  minReviews: number;
  onlyWithoutWebsite: boolean;
  onlyWithPhone: boolean;
  onlyWithWhatsApp: boolean;
  ignoreDuplicates: boolean;
};

export type LeadMetric = {
  label: string;
  value: string;
  trend: string;
  tone: "blue" | "green" | "amber" | "rose" | "slate";
};

export type PaginatedLeadsResult = {
  leads: Lead[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
