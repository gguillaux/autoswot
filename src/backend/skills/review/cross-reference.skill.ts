import { z } from 'zod';
import { Skill } from '../skill.interface.js';
import { SecurityAnalysis } from '../../agents/types/analysis.types.js';
import { ResearchData } from '../../agents/types/research.types.js';
import { FieldVerdict, VerdictStatus } from '../../agents/types/review.types.js';

const InputSchema = z.object({
  analysis: z.any(),
  researchData: z.any(),
});

const OutputSchema = z.object({
  fieldComparisons: z.array(z.any()),
});

type Input = { analysis: SecurityAnalysis; researchData: ResearchData };
type Output = { fieldComparisons: FieldVerdict[] };

export const crossReferenceSkill: Skill<Input, Output> = {
  name: 'cross_reference_data',
  description: 'Deterministic comparison of analysis fields against Yahoo Finance ground truth',
  inputSchema: InputSchema as any,
  outputSchema: OutputSchema as any,

  async execute(input: Input): Promise<Output> {
    const { analysis, researchData } = input;
    const verdicts: FieldVerdict[] = [];

    // Check sector
    if (researchData.profile.sector) {
      const match = analysis.sector.toLowerCase().includes(researchData.profile.sector.toLowerCase()) ||
        researchData.profile.sector.toLowerCase().includes(analysis.sector.toLowerCase());
      verdicts.push({
        field: 'sector',
        status: match ? 'PASS' : 'FAIL',
        expected: researchData.profile.sector,
        received: analysis.sector,
        note: match ? 'Sector matches Yahoo Finance' : 'Sector mismatch with Yahoo Finance data',
      });
    }

    // Check industry
    if (researchData.profile.industry) {
      const match = analysis.industry.toLowerCase().includes(researchData.profile.industry.toLowerCase()) ||
        researchData.profile.industry.toLowerCase().includes(analysis.industry.toLowerCase());
      verdicts.push({
        field: 'industry',
        status: match ? 'PASS' : 'WARN',
        expected: researchData.profile.industry,
        received: analysis.industry,
        note: match ? 'Industry matches' : 'Industry classification differs — may be acceptable',
      });
    }

    // Check company name
    if (researchData.profile.companyName) {
      const match = analysis.companyName.toLowerCase().includes(researchData.profile.companyName.toLowerCase().split(' ')[0]);
      verdicts.push({
        field: 'companyName',
        status: match ? 'PASS' : 'WARN',
        expected: researchData.profile.companyName,
        received: analysis.companyName,
        note: match ? 'Company name matches' : 'Company name differs from Yahoo Finance',
      });
    }

    // Check revenue segments sum to ~100%
    const totalPercent = analysis.revenueModel.reduce((sum, s) => sum + s.percentageOfRevenue, 0);
    verdicts.push({
      field: 'revenueModel.totalPercentage',
      status: Math.abs(totalPercent - 100) <= 5 ? 'PASS' : totalPercent > 0 ? 'WARN' : 'FAIL',
      expected: '100%',
      received: `${totalPercent.toFixed(1)}%`,
      note: Math.abs(totalPercent - 100) <= 5
        ? 'Revenue segments sum correctly'
        : `Revenue segments sum to ${totalPercent.toFixed(1)}% instead of ~100%`,
    });

    // Check SWOT quadrant completeness
    const quadrants = ['strengths', 'weaknesses', 'opportunities', 'threats'] as const;
    for (const q of quadrants) {
      const count = analysis.swot[q].length;
      verdicts.push({
        field: `swot.${q}`,
        status: count >= 3 ? 'PASS' : count >= 2 ? 'WARN' : 'FAIL',
        expected: '3-4 items',
        received: `${count} items`,
        note: count >= 3 ? `${q} has sufficient items` : `${q} needs more items (has ${count})`,
      });
    }

    // Check history milestones count
    verdicts.push({
      field: 'history.count',
      status: analysis.history.length >= 5 ? 'PASS' : analysis.history.length >= 3 ? 'WARN' : 'FAIL',
      expected: '5-7 milestones',
      received: `${analysis.history.length} milestones`,
      note: analysis.history.length >= 5 ? 'Sufficient milestones' : 'Could use more historical detail',
    });

    return { fieldComparisons: verdicts };
  },
};
