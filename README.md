# TalkingMate

Learn languages through natural voice conversations with AI. Speak in English, German, or Spanish and get instant voice feedback from an AI language tutor.

## How It Works

1. **Pick a language** — English, German, or Spanish
2. **Choose a mode** — Free Talk or guided Scenario (restaurant, airport, hotel, etc.)
3. **Start talking** — your speech is transcribed in real-time
4. **AI responds** — a language tutor replies in the target language and speaks it aloud
5. **Loop continues** — the conversation flows naturally with automatic listening restart

The app uses a state machine (`IDLE → LISTENING → PROCESSING → SPEAKING → IDLE`) with barge-in support — interrupt the AI anytime by speaking.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js API Routes |
| AI | GLM API via `zhipu-ai-provider` + Vercel AI SDK |
| Speech | Web Speech API (browser-native STT/TTS) |
| Auth & DB | Supabase (email/password auth, PostgreSQL) |
| Deployment | Vercel |

## Features

- Voice conversation with AI language tutor
- Real-time speech transcription with interim results
- Streaming AI responses with text-to-speech playback
- Guided conversation scenarios (restaurant, airport, hotel, shopping, small talk)
- Conversation history with persistence
- Mobile-first responsive design
- PWA-ready manifest
- Browser support detection

## Prerequisites

- Node.js 18+
- [Supabase](https://supabase.com) account and project
- [Zhipu AI](https://open.bigmodel.cn) API key (or [z.ai](https://z.ai) for international)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/rafalwizen/talking-mate.git
cd talking-mate
npm install
```

### 2. Configure Supabase

Create a new project on [supabase.com](https://supabase.com), then:

**Run the database migration** — go to **SQL Editor** in your Supabase dashboard, create a new query, paste the contents of `supabase/migrations/001_initial_schema.sql`, and run it.

**Configure email confirmation** — go to **Authentication > Email Templates > Confirm signup** and set the link to:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

**Set the Site URL** — in **Authentication > URL Configuration**, set Site URL to `http://localhost:3000` for local development.

### 3. Get API keys

- **Supabase**: go to **Settings > API** — copy **Project URL** and **anon public** key
- **GLM API**: go to [open.bigmodel.cn](https://open.bigmodel.cn) or [z.ai](https://z.ai) — create an API key

### 4. Create environment file

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbG...
ZHIPU_API_KEY=your-zhipu-api-key
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. For voice features, use **Chrome** or **Safari**.

## Project Structure

```
src/
  app/
    page.tsx                              # Landing page
    (auth)/
      login/                              # Sign in
      register/                           # Sign up
      auth/confirm/                       # Email confirmation handler
    (app)/
      layout.tsx                          # Authenticated layout with nav
      practice/
        page.tsx                          # Language & mode selector
        session/page.tsx                  # Voice conversation screen
      conversations/
        page.tsx                          # Conversation history
        [id]/page.tsx                     # Single conversation view
    api/
      chat/route.ts                       # AI streaming endpoint (GLM API)
      conversations/
        route.ts                          # List / create conversations
        [id]/route.ts                     # Get / delete conversation
        messages/route.ts                 # Save messages
  components/
    ui/                                   # Button, Card, MicButton, ChatBubble, etc.
    auth/                                 # LogoutButton
    conversation/                         # VoiceConversation orchestrator
  hooks/
    useSpeechRecognition.ts               # Web Speech API STT wrapper
    useSpeechSynthesis.ts                 # Web Speech API TTS wrapper
    useConversationState.ts               # State machine (IDLE/LISTENING/PROCESSING/SPEAKING)
    useVoiceChat.ts                       # Orchestrator: AI SDK + speech + state machine
  lib/
    supabase/                             # Client, server, middleware, types
    ai/                                   # GLM provider, system prompts, scenarios
    constants.ts                          # Languages, states, config
    utils.ts                              # Helpers
  types/                                  # Conversation, speech type definitions
supabase/
  migrations/001_initial_schema.sql       # Database schema with RLS
```

## Browser Support

Voice features require browsers with `SpeechRecognition` support:

| Browser | STT | TTS |
|---|---|---|
| Chrome (desktop & Android) | Supported | Supported |
| Safari (macOS & iOS) | Supported | Supported |
| Firefox | Not supported | Supported |
| Edge | Not supported | Supported |

The app displays a browser warning when SpeechRecognition is unavailable.

## Author

Rafał Wiżeń — [GitHub](https://github.com/rafalwizen)
