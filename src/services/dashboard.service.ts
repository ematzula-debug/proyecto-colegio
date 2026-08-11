import { apiRequest } from "./api";
import type {
  DashboardSummary,
  DashboardSummaryResponse,
} from "@/types/dashboard";

export async function getDashboardSummaryService(): Promise<DashboardSummary> {
  const response =
    await apiRequest<DashboardSummaryResponse>("/dashboard/summary");

  return response.data;
}
