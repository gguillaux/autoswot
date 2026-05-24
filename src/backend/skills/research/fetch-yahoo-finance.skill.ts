import { z } from 'zod';
import yahooFinance from 'yahoo-finance2';
import { Skill, SkillError } from '../skill.interface.js';
import {
  ResearchData,
  ResearchDataSchema,
  QuoteData,
  CompanyProfile,
  FinancialData,
} from '../../agents/types/research.types.js';

const InputSchema = z.object({ ticker: z.string().min(1) });
type Input = z.infer<typeof InputSchema>;

export const fetchYahooFinanceSkill: Skill<Input, ResearchData> = {
  name: 'fetch_yahoo_finance',
  description: 'Fetches core financial metrics and company profile from Yahoo Finance',
  inputSchema: InputSchema,
  outputSchema: ResearchDataSchema as any,

  async execute(input: Input): Promise<ResearchData> {
    const { ticker } = input;

    try {
      // Fetch quote summary
      const quote = await yahooFinance.quote(ticker);
      if (!quote) {
        throw new SkillError('fetch_yahoo_finance', 'DATA_UNAVAILABLE', `No quote data for ${ticker}`);
      }

      // Fetch detailed quote summary for financials
      let summaryDetail: any = {};
      let financialData: any = {};
      let assetProfile: any = {};

      try {
        const summary = await yahooFinance.quoteSummary(ticker, {
          modules: ['summaryDetail', 'financialData', 'assetProfile', 'incomeStatementHistory'],
        });
        summaryDetail = summary?.summaryDetail || {};
        financialData = summary?.financialData || {};
        assetProfile = summary?.assetProfile || {};
      } catch {
        // Some modules may not be available for all tickers
      }

      const quoteData: QuoteData = {
        price: quote.regularMarketPrice ?? null,
        marketCap: quote.marketCap ?? null,
        peRatio: quote.trailingPE ?? null,
        eps: (quote as any).epsTrailingTwelveMonths ?? null,
        dividendYield: (quote as any).trailingAnnualDividendYield ?? null,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh ?? null,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow ?? null,
        volume: quote.regularMarketVolume ?? null,
        currency: quote.currency ?? 'USD',
      };

      const profile: CompanyProfile = {
        companyName: quote.longName || quote.shortName || ticker,
        sector: assetProfile.sector ?? null,
        industry: assetProfile.industry ?? null,
        country: assetProfile.country ?? null,
        website: assetProfile.website ?? null,
        description: assetProfile.longBusinessSummary ?? null,
        fullTimeEmployees: assetProfile.fullTimeEmployees ?? null,
        founded: null, // Yahoo Finance doesn't reliably provide founding year
        ceo: assetProfile.companyOfficers?.[0]?.name ?? null,
      };

      const financials: FinancialData = {
        totalRevenue: financialData.totalRevenue ?? null,
        revenueGrowth: financialData.revenueGrowth ?? null,
        grossMargin: financialData.grossMargins ?? null,
        operatingMargin: financialData.operatingMargins ?? null,
        netMargin: financialData.profitMargins ?? null,
      };

      // Fetch historical prices (last 2 years, monthly)
      let historicalPrices: { date: string; close: number }[] = [];
      try {
        const history = await yahooFinance.chart(ticker, {
          period1: new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          period2: new Date().toISOString().split('T')[0],
          interval: '1mo',
        });
        historicalPrices = (history.quotes || [])
          .filter((q: any) => q.close != null)
          .map((q: any) => ({
            date: new Date(q.date).toISOString().split('T')[0],
            close: Number(q.close.toFixed(2)),
          }));
      } catch {
        // Historical data may not be available
      }

      return {
        ticker,
        quote: quoteData,
        profile,
        financials,
        historicalPrices,
        revenueBySegment: null, // Yahoo Finance doesn't provide segment breakdown easily
        fetchedAt: new Date().toISOString(),
      };
    } catch (err) {
      if (err instanceof SkillError) throw err;
      throw new SkillError(
        'fetch_yahoo_finance',
        'FETCH_ERROR',
        `Failed to fetch data for ${ticker}: ${(err as Error).message}`,
        err,
      );
    }
  },
};
