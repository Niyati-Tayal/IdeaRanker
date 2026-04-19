# IdeaRanker

An AI-powered idea ranking platform to capture, enrich, and prioritize your best ideas with structured business analysis and dynamic weighted scoring.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Environment Variables

1. Copy `.env.example` to `.env` (or `.env.local` for local development):
   ```bash
   cp .env.example .env.local
   ```
2. Set your `GEMINI_API_KEY` in the `.env.local` file. You can obtain one from the [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Features

- **AI-Powered Enrichment**: Automatically generate business analysis for your ideas.
- **Weighted Ranking**: Prioritize ideas based on custom weights for feasibility, market potential, innovation, and effort.
- **Thread-Based Organization**: Group related ideas into threads for better focus.
- **Real-Time Updates**: Seamlessly sync and update your ideas.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Framer Motion, Recharts
- **State Management**: Zustand
- **Database**: Firebase (Firestore)
- **AI**: Google Gemini API
