# Chat Bruce

A cross-platform, WhatsApp-class real-time chat application built with Next.js, Flutter, and Supabase.

## Architecture

```
chat-bruce/
├── web/          # Next.js 14 (App Router) + TypeScript + Tailwind CSS
│   ├── app/      # Pages + API routes
│   │   ├── api/v1/   # REST API endpoints
│   │   ├── (auth)/   # Auth pages (login, signup, phone OTP)
│   │   ├── (main)/   # Main app pages (chat, contacts, profile)
│   │   └── dashboard/# Admin dashboard
│   ├── components/   # Reusable UI components
│   └── lib/          # Utilities, API clients, hooks, Supabase
├── mobile/       # Flutter app (Android + iOS)
│   └── lib/
│       ├── core/       # Theme, network, router, utils
│       ├── features/   # Auth, chats, messages, profile, contacts
│       └── shared/     # Shared widgets (UI kit)
└── supabase/     # Database schema + migrations
    └── schema.sql
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Web | Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion, Recharts |
| Mobile | Flutter 3.x, Dart, Riverpod, GoRouter, Dio, flutter_animate |
| Backend | Supabase (Postgres, Auth, Realtime, Storage) |
| API | Next.js API Routes (Vercel Serverless Functions) |
| Realtime | Supabase Realtime (Postgres changes + Presence + Broadcast) |
| Storage | Supabase Storage / Cloudinary (optional) |
| Push | Firebase Cloud Messaging (FCM) |

## Free Tier Services Used

- **Supabase**: DB, Auth, Realtime, Storage (500MB DB, 1GB storage, 50k MAU auth)
- **Vercel**: Web hosting + serverless API (100GB bandwidth, 100k invocations)
- **Firebase**: Cloud Messaging for push notifications
- **Cloudinary** (optional): Media processing (25GB free)

## Setup Instructions

### 1. Supabase Project

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run `supabase/schema.sql`
4. Note your Project URL and Anon Key from Settings > API
5. Enable Auth providers: Email/Password + Phone (SMS) in Authentication > Providers
6. Enable Realtime on `messages`, `message_status`, and `chat_members` tables in Database > Replication

### 2. Web App (Next.js)

```bash
cd web
npm install
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

### 3. Flutter App

```bash
cd mobile
flutter pub get
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
API_BASE_URL=http://localhost:3000/api/v1
```

```bash
flutter run
```

### 4. Deploy to Vercel

```bash
cd web
npx vercel --prod
```

Set environment variables in Vercel dashboard > Settings > Environment Variables.

## API Endpoints

Base URL: `/api/v1`

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/phone/request-otp` | Request phone OTP |
| POST | `/auth/phone/verify` | Verify phone OTP |
| POST | `/auth/email/signup` | Email registration |
| POST | `/auth/email/login` | Email login |
| POST | `/auth/refresh` | Refresh tokens |
| POST | `/auth/logout` | Sign out |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/users/me` | Get current user |
| PATCH | `/users/me` | Update profile |
| GET | `/users/:id` | Get user by ID |
| POST | `/users/sync-contacts` | Match contacts |

### Chats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats` | List user's chats |
| POST | `/chats` | Create chat |
| GET | `/chats/:id` | Get chat details |
| POST | `/chats/:id/members` | Add members |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/chats/:id/messages` | Get messages (paginated) |
| POST | `/chats/:id/messages` | Send message |
| PATCH | `/messages/:id` | Edit message |
| DELETE | `/messages/:id` | Delete message |
| PATCH | `/messages/:id/status` | Update status |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/media/upload-url` | Get signed upload URL |

## Design System

Chat Bruce uses a **glassmorphism + neumorphism** design language:

- **Glass panels**: `backdrop-blur` + translucent surfaces for app bars, modals, input bars
- **Neumorphic elements**: Dual soft shadows (light source top-left) for buttons, cards, avatars
- **Bruce gradient**: Purple-to-blue accent gradient used for sent message bubbles and CTAs
- **Animations**: Scale-on-press (0.96), slide transitions, fade-ins, typing dot pulse
- **Dark/Light mode**: System-aware with animated toggle

## Realtime Features

All powered by Supabase Realtime (no polling):

- **Live messaging**: Postgres changes on `messages` table
- **Typing indicators**: Supabase Broadcast channel
- **Online presence**: Supabase Presence on chat channels
- **Read receipts**: Postgres changes on `message_status` table

## Admin Dashboard

Protected `/dashboard` route with:

- Overview stats (users, chats, messages/day)
- User management (search, ban/unban)
- Content moderation queue
- Broadcast announcements
- Live online user count

## License

MIT
