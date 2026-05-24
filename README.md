# AutoSWOT

AutoSWOT is an AI-powered, multi-agent platform for generating financial security SWOT analyses and rendering visually stunning infographics. It leverages an Orchestrator-Worker agent pattern to gather live market data, perform deep financial analysis, fact-check the AI's claims, and design ready-to-publish social media graphics.

## Features

- **Multi-Agent Pipeline**:
  - **Orchestrator**: Manages state, error handling, and retry loops.
  - **Research Agent**: Fetches ground-truth data from Yahoo Finance (`yahoo-finance2`).
  - **Analyst Agent**: Uses Gemini 2.5 Flash to generate SWOT analysis and company timelines.
  - **Reviewer Agent**: Cross-references Gemini's claims against real financial data for accuracy.
  - **Designer Agent**: Uses `@napi-rs/canvas` to render beautiful 1080x1920 infographics in 3 distinct styles.
  - **Quality Agent**: Uses Gemini's Vision capabilities to ensure text readability, layout balance, and high contrast.
- **Dynamic Infographics**: Choose between Dark Gradient, Clean Corporate, and Bold Editorial styles at runtime.
- **Social Media Publishing**: Integrated publishers for X (Twitter), LinkedIn, Facebook, and TikTok.
- **Cross-Platform**: Built as a PWA and wrapped with Electron for desktop capability.

## Tech Stack

- **Frontend**: React + Vite
- **AI**: Google Gemini 2.5 Flash (`@google/genai`)
- **Infographic Engine**: Canvas + Sharp
- **Desktop**: Electron + PWA Service Worker
- **Social APIs**: X API v2, TikTok Content Posting API, Facebook Graph API, LinkedIn Posts API

## Status

🚧 **Under Development** — See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for the full technical plan.

## License

MIT
