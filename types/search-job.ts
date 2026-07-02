export type SearchJobStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

export type SearchJobDto = {
  id: string;
  status: SearchJobStatus;
  state: string;
  city: string;
  category: string;
  maxResults: number;
  minRating: number | null;
  minReviews: number | null;
  progress: number;
  message: string;
  resultCount: number;
  duplicateCount: number;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
};
