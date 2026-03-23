import { z } from "zod";

export const analyticsPeriodSchema = z.enum(["7d", "30d", "90d", "180d", "365d"]).default("30d");

export type AnalyticsPeriod = z.infer<typeof analyticsPeriodSchema>;
