import { z } from 'zod';

// ============================================
// Yahoo Finance Data Shapes
// ============================================

export const QuoteDataSchema = z.object({
  price: z.number().nullable(),
  marketCap: z.number().nullable(),
  peRatio: z.number().nullable(),
  eps: z.number().nullable(),
  dividendYield: z.number().nullable(),
  fiftyTwoWeekHigh: z.number().nullable(),
  fiftyTwoWeekLow: z.number().nullable(),
  volume: z.number().nullable(),
  currency: z.string().default('USD'),
});

export type QuoteData = z.infer<typeof QuoteDataSchema>;

export const CompanyProfileSchema = z.object({
  companyName: z.string(),
  sector: z.string().nullable(),
  industry: z.string().nullable(),
  country: z.string().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  fullTimeEmployees: z.number().nullable(),
  founded: z.string().nullable(),
  ceo: z.string().nullable(),
});

export type CompanyProfile = z.infer<typeof CompanyProfileSchema>;

export const FinancialDataSchema = z.object({
  totalRevenue: z.number().nullable(),
  revenueGrowth: z.number().nullable(),
  grossMargin: z.number().nullable(),
  operatingMargin: z.number().nullable(),
  netMargin: z.number().nullable(),
});

export type FinancialData = z.infer<typeof FinancialDataSchema>;

export const HistoricalPriceSchema = z.object({
  date: z.string(),
  close: z.number(),
});

export type HistoricalPrice = z.infer<typeof HistoricalPriceSchema>;

export const RevenueSegmentRawSchema = z.object({
  segment: z.string(),
  revenue: z.number(),
});

export type RevenueSegmentRaw = z.infer<typeof RevenueSegmentRawSchema>;

export const ResearchDataSchema = z.object({
  ticker: z.string(),
  quote: QuoteDataSchema,
  profile: CompanyProfileSchema,
  financials: FinancialDataSchema,
  historicalPrices: z.array(HistoricalPriceSchema),
  revenueBySegment: z.array(RevenueSegmentRawSchema).nullable(),
  fetchedAt: z.string().datetime(),
});

export type ResearchData = z.infer<typeof ResearchDataSchema>;
