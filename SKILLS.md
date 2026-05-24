# AutoSWOT — Agent Skills Registry

## Overview

Skills are atomic, reusable capabilities that agents invoke to perform their work. Each skill is a standalone function with typed input/output, can be unit-tested in isolation, and is registered in the skill registry for agent discovery.

---

## Skill Definitions

### 📊 Research Skills

#### `fetch_yahoo_finance`

| Property | Value |
|---|---|
| **File** | `src/backend/skills/research/fetch-yahoo-finance.skill.ts` |
| **Used by** | Research Agent |
| **Dependencies** | `yahoo-finance2` |

**Purpose:** Fetches core financial metrics for a given ticker from Yahoo Finance.

**Input:**
```typescript
{ ticker: string }
```

**Output:**
```typescript
{
  quote: {
    price: number;
    marketCap: number;
    peRatio: number | null;
    eps: number | null;
    dividendYield: number | null;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    volume: number;
  };
  profile: {
    companyName: string;
    sector: string;
    industry: string;
    country: string;
    website: string;
    description: string;
    fullTimeEmployees: number;
    ipoYear: number | null;
  };
  financials: {
    totalRevenue: number | null;
    revenueGrowth: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
  };
}
```

**Error handling:** Returns `null` fields for unavailable data. Throws `SkillError` with code `DATA_UNAVAILABLE` if ticker is invalid.

---

#### `fetch_company_profile`

| Property | Value |
|---|---|
| **File** | `src/backend/skills/research/fetch-company-profile.skill.ts` |
| **Used by** | Research Agent |
| **Dependencies** | `yahoo-finance2` |

**Purpose:** Fetches extended company profile including historical data and revenue breakdown where available.

**Input:**
```typescript
{ ticker: string, includeHistory?: boolean }
```

**Output:**
```typescript
{
  founded: string | null;
  headquarters: string;
  ceo: string | null;
  historicalPrices: { date: string; close: number }[];  // last 5 years, monthly
  revenueBySegment: { segment: string; revenue: number }[] | null;
}
```

---

### 🧠 Analysis Skills

#### `generate_swot_analysis`

| Property | Value |
|---|---|
| **File** | `src/backend/skills/analysis/generate-swot.skill.ts` |
| **Used by** | Analyst Agent |
| **Dependencies** | `@google/genai` |

**Purpose:** Sends a structured prompt to Gemini requesting a complete security analysis with SWOT, grounded by real financial data.

**Input:**
```typescript
{
  ticker: string;
  researchData: ResearchData;
  corrections?: string;        // Reviewer feedback for retry
  enableSearchGrounding: boolean;
}
```

**Output:** `SecurityAnalysis` (full structured JSON via Gemini response schema)

**Prompt strategy:**
- System prompt establishes the agent as a senior equity analyst
- Research data is injected as grounding context ("Based on these VERIFIED financial facts...")
- If corrections are provided, they are prepended as "Previous review feedback to address"
- Response schema enforced via Zod → Gemini `responseSchema` parameter

---

### 🔍 Review Skills

#### `validate_analysis`

| Property | Value |
|---|---|
| **File** | `src/backend/skills/review/validate-analysis.skill.ts` |
| **Used by** | Reviewer Agent |
| **Dependencies** | `@google/genai` |

**Purpose:** Uses Gemini to cross-reference the AI-generated analysis against Yahoo Finance ground truth data.

**Input:**
```typescript
{
  analysis: SecurityAnalysis;
  researchData: ResearchData;
}
```

**Output:**
```typescript
{
  approved: boolean;
  overallScore: number;          // 0-100
  verdicts: {
    field: string;               // e.g., "sector", "revenue", "ipoYear"
    status: 'PASS' | 'WARN' | 'FAIL';
    expected: string | null;     // from Yahoo Finance
    received: string;            // from Gemini analysis
    note: string;
  }[];
  corrections: string | null;   // Natural language feedback for Analyst retry
}
```

**Logic:**
- Numeric fields: FAIL if >15% deviation, WARN if >5%
- Categorical fields (sector, industry): FAIL if mismatch
- Date fields (IPO year, founding): FAIL if off by >1 year
- SWOT content: WARN if any quadrant has <2 items
- `approved = true` only if zero FAIL verdicts

---

#### `cross_reference_data`

| Property | Value |
|---|---|
| **File** | `src/backend/skills/review/cross-reference.skill.ts` |
| **Used by** | Reviewer Agent |
| **Dependencies** | None (pure logic) |

**Purpose:** Pure function that compares numeric and categorical fields between analysis output and research data. No LLM needed — deterministic comparison logic.

**Input:**
```typescript
{ analysis: SecurityAnalysis, researchData: ResearchData }
```

**Output:**
```typescript
{ fieldComparisons: FieldComparison[] }
```

---

### 🎨 Design Skills

#### `generate_infographic`

| Property | Value |
|---|---|
| **File** | `src/backend/skills/design/generate-infographic.skill.ts` |
| **Used by** | Designer Agent |
| **Dependencies** | `canvas`, `sharp` |

**Purpose:** Renders the 1080×1920 infographic image using Node Canvas, applying the selected design style template.

**Input:**
```typescript
{
  analysis: SecurityAnalysis;
  style: 'dark_gradient' | 'clean_corporate' | 'bold_editorial';
  layoutHints: {
    highlightedMilestones: string[];
    abbreviatedTexts: Record<string, string>;
    sectorAccentColor: string;
  };
}
```

**Output:**
```typescript
{
  jpegBuffer: Buffer;
  pngBuffer: Buffer;
  jpegPath: string;
  pngPath: string;
}
```

**Rendering sections (top → bottom):**
1. Header: Company name, ticker badge, sector tag
2. Overview: 2-3 sentence summary in a card
3. Timeline: Horizontal milestones with dots and dates
4. Revenue: Donut chart with segment labels
5. SWOT Grid: 2×2 color-coded quadrants
6. Footer: Date, AutoSWOT branding

---

#### `apply_design_style`

| Property | Value |
|---|---|
| **File** | `src/backend/skills/design/apply-style.skill.ts` |
| **Used by** | Designer Agent |
| **Dependencies** | None (pure config) |

**Purpose:** Returns the complete style configuration (colors, fonts, spacing, effects) for the selected design template.

**Input:**
```typescript
{ style: 'dark_gradient' | 'clean_corporate' | 'bold_editorial' }
```

**Output:**
```typescript
{
  background: { type: 'gradient' | 'solid'; colors: string[] };
  cardStyle: { fill: string; stroke: string; radius: number; blur: number };
  typography: {
    heading: { font: string; size: number; color: string; weight: number };
    body: { font: string; size: number; color: string; weight: number };
    label: { font: string; size: number; color: string; weight: number };
  };
  swotColors: { S: string; W: string; O: string; T: string };
  chartColors: string[];
  spacing: { padding: number; gap: number; sectionGap: number };
}
```

**Style definitions:**
- **Dark Gradient**: Navy→purple gradient, glassmorphism cards, white/teal text, neon accents
- **Clean Corporate**: White background, subtle gray cards, dark text, blue accents
- **Bold Editorial**: Vibrant yellow/orange backgrounds, black text, large bold typography, high contrast

---

### ✅ Quality Skills

#### `validate_infographic`

| Property | Value |
|---|---|
| **File** | `src/backend/skills/quality/validate-infographic.skill.ts` |
| **Used by** | Quality Agent |
| **Dependencies** | `@google/genai` (multimodal vision) |

**Purpose:** Uses Gemini's vision capabilities to analyze the rendered infographic image and assess quality.

**Input:**
```typescript
{
  imagePath: string;
  analysis: SecurityAnalysis;  // to verify content completeness
}
```

**Output:**
```typescript
{
  approved: boolean;
  score: number;               // 0-100
  issues: {
    severity: 'critical' | 'warning' | 'info';
    category: 'readability' | 'completeness' | 'layout' | 'contrast' | 'branding';
    description: string;
    suggestion: string;
  }[];
}
```

**Checks performed:**
- Text readability (no overlaps, no truncation)
- Content completeness (all 4 SWOT quadrants, chart present, header present)
- Color contrast (WCAG-like assessment)
- Layout balance (no excessive whitespace, no cramped sections)
- Branding (footer present, date shown)

---

## Skill Registry

All skills are registered in `src/backend/skills/registry.ts`:

```typescript
export const skillRegistry = {
  // Research
  'fetch_yahoo_finance': fetchYahooFinanceSkill,
  'fetch_company_profile': fetchCompanyProfileSkill,

  // Analysis
  'generate_swot_analysis': generateSwotSkill,

  // Review
  'validate_analysis': validateAnalysisSkill,
  'cross_reference_data': crossReferenceSkill,

  // Design
  'generate_infographic': generateInfographicSkill,
  'apply_design_style': applyStyleSkill,

  // Quality
  'validate_infographic': validateInfographicSkill,
} as const;
```

Each skill is independently testable with mocked inputs and follows the interface:

```typescript
interface Skill<TInput, TOutput> {
  name: string;
  description: string;
  inputSchema: ZodSchema<TInput>;
  outputSchema: ZodSchema<TOutput>;
  execute(input: TInput): Promise<TOutput>;
}
```
