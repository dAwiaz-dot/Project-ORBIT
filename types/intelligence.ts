import type { Lead } from "@/types/lead";

export type IntelligenceGrade = "A" | "B" | "C" | "D";

export type ChannelScore = {
  score: number;
  label: string;
  status: "strong" | "average" | "weak" | "missing";
  signals: string[];
};

export type InstagramProfile = {
  handle: string | null;
  photoUrl: string | null;
  bio: string | null;
  followers: number | null;
  following: number | null;
  posts: number | null;
  lastPostAt: string | null;
  score: number;
};

export type SiteAudit = {
  url: string | null;
  hasHttps: boolean;
  performanceScore: number | null;
  responsiveScore: number | null;
  seoScore: number | null;
  technologies: string[];
  report: string[];
};

export type LeadIntelligenceReport = {
  lead: Lead;
  grade: IntelligenceGrade;
  stars: number;
  potentialScore: number;
  closeProbability: number;
  reasons: string[];
  opportunities: string[];
  googleMaps: ChannelScore;
  site: ChannelScore;
  instagram: ChannelScore;
  instagramProfile: InstagramProfile;
  siteAudit: SiteAudit;
  generatedMessage: string;
  createdAt: string;
};
