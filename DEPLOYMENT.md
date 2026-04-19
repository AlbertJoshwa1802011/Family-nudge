# Deployment Guide — Zero-Cost Stack

This guide walks you through deploying Family Nudge for **$0/month** using free tiers.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Vercel (Free)  │────▶│  Render (Free)   │────▶│  Neon (Free) │
│  Next.js Web    │     │  Express API     │     │  PostgreSQL  │
│  apps/web       │     │  apps/api        │     │              │
└─────────────────┘     └──────┬───────────┘     └──────────────┘
                               │
                        ┌──────▼───────────┐
                        │  Upstash (Free)  │
                        │  Redis           │
                        └──────────────────┘
```

| Service | What | Free Tier Limits |
|---------|------|-----------------|
| **Vercel** | Web frontend (Next.js) | 100 GB bandwidth, serverless functions |
| **Render** | API backend (Express) | 750 hours/month, auto-sleep after 15 min inactivity |
| **Neon** | PostgreSQL database | 0.5 GB storage, 190 compute hours/month |
| **Upstash** | Redis (queues/cache) | 10,000 commands/day, 256 MB storage |

---

## Step 1: Database — Neon (PostgreSQL)

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub login works)
2. Click **"Create Project"**
   - Project name: `family-nudge`
   - Region: Pick closest to you (US East recommended)
3. Copy the **connection string** — it looks like:
   ```
   postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/family_nudge?sslmode=require
   ```
4. Save this — you'll need it as `DATABASE_URL`

---

## Step 2: Redis — Upstash

1. Go to [upstash.com](https://upstash.com) and sign up
2. Click **"Create Database"**
   - Name: `family-nudge`
   - Region: Same as your Neon database
   - Type: Regional
3. Copy the **Redis URL** from the dashboard:
   ```
   rediss://default:password@us1-random-name.upstash.io:6379
   ```
4. Save this — you'll need it as `REDIS_URL`

---

## Step 3: Generate Encryption Key

Run this on your local machine:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the 64-character hex string. This is your `ENCRYPTION_MASTER_KEY`.

**CRITICAL: Store this somewhere safe. If you lose it, all encrypted documents become unrecoverable.**

---

## Step 4: Deploy API — Render

1. Go to [render.com](https://render.com) and sign up (GitHub login works)
2. Click **"New" → "Web Service"**
3. Connect your GitHub repo: `AlbertJoshwa1802011/Family-nudge`
4. Configure:
   - **Name:** `family-nudge-api`
   - **Region:** Oregon (or closest to your DB)
   - **Branch:** `main`
   - **Root Directory:** (leave empty)
   - **Runtime:** Node
   - **Build Command:**
     ```
     corepack enable && pnpm install --frozen-lockfile && cd apps/api && npx prisma generate && cd ../../packages/shared && npx tsc && cd ../crypto && npx tsc && cd ../../apps/api && npx tsc
     ```
   - **Start Command:**
     ```
     cd apps/api && npx prisma db push --accept-data-loss && node dist/main.js
     ```
   - **Plan:** Free

5. Add **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `DATABASE_URL` | *(paste from Step 1)* |
   | `REDIS_URL` | *(paste from Step 2)* |
   | `JWT_SECRET` | *(click "Generate" for a random value)* |
   | `ENCRYPTION_MASTER_KEY` | *(paste from Step 3)* |
   | `CORS_ORIGIN` | *(your Vercel URL after Step 5, e.g., `https://family-nudge.vercel.app`)* |

6. Click **"Create Web Service"** — it will build and deploy

7. Copy your Render URL (e.g., `https://family-nudge-api.onrender.com`)

> **Note:** Free tier spins down after 15 min of inactivity. First request after sleep takes ~30s.

---

## Step 5: Deploy Web — Vercel

1. Go to [vercel.com](https://vercel.com) and sign up (GitHub login works)
2. Click **"Add New" → "Project"**
3. Import your GitHub repo: `AlbertJoshwa1802011/Family-nudge`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
   - **Build Command:** (leave default, Vercel auto-detects)
   - **Install Command:** `corepack enable && pnpm install`

5. Add **Environment Variables:**
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://family-nudge-api.onrender.com/api` |

6. Click **"Deploy"**

7. After deploy, copy your Vercel URL (e.g., `https://family-nudge.vercel.app`)

8. **Go back to Render** and update `CORS_ORIGIN` env var with your Vercel URL

---

## Step 6: Mobile App — Expo (EAS)

The mobile app uses Expo and can be tested without deployment:

```bash
cd apps/mobile
npx expo start
```

For production builds:

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Configure: `eas build:configure`
4. Build:
   - Android: `eas build --platform android --profile preview`
   - iOS: `eas build --platform ios --profile preview`

Free Expo accounts get limited build minutes. For testing, use Expo Go app.

---

## Pending Configuration (Do Later)

### Firebase (Push Notifications)

You need to create a Firebase project yourself — this requires Google account login:

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → Name: `family-nudge`
3. Enable **Cloud Messaging** (for push notifications)
4. Go to **Project Settings → Service Accounts → Generate new private key**
5. Download the JSON file
6. Add these env vars to Render:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

### Twilio (SMS, WhatsApp, Voice Calls)

1. Sign up at [twilio.com](https://twilio.com) (free trial gives $15 credit)
2. Get your Account SID and Auth Token from the dashboard
3. Get a phone number (free with trial)
4. For WhatsApp: Join the Twilio WhatsApp sandbox
5. Add these env vars to Render:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_FROM` (your Twilio number)
   - `TWILIO_WHATSAPP_FROM` (your WhatsApp sandbox number)

---

## Cost Summary

| Service | Monthly Cost | What You Get |
|---------|-------------|-------------|
| Vercel | $0 | Web hosting, CDN, serverless |
| Render | $0 | API hosting (sleeps after 15 min idle) |
| Neon | $0 | 0.5 GB PostgreSQL |
| Upstash | $0 | 10K Redis commands/day |
| Expo | $0 | Mobile app builds (limited) |
| Twilio | $0-15 | Free trial credit for SMS/WhatsApp |
| Firebase | $0 | Push notifications (generous free tier) |
| **Total** | **$0** | Full-stack family app |

---

## Custom Domain (Optional)

- **Vercel:** Settings → Domains → Add your domain (free)
- **Render:** Settings → Custom Domains → Add your domain (free with paid plan, or use subdomain)

---

## Upgrading Later

When you outgrow the free tier:

| Need | Upgrade To | Cost |
|------|-----------|------|
| No sleep on API | Render Starter | $7/mo |
| More database | Neon Launch | $19/mo |
| More Redis | Upstash Pay-as-you-go | ~$0.20/10K commands |
| Custom domain on API | Render paid | Included in Starter |
