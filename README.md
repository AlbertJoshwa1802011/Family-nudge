# Family Nudge

**Smart family management platform — solving boring problems in an interesting way.**

Reminders that escalate from push notifications to phone calls. Documents encrypted with AES-256. Insurance policies that never expire unnoticed. All in one place, for your whole family.

---

## What This Solves

Families deal with dozens of recurring, low-urgency-until-they're-not tasks: insurance renewals, medical checkups, warranty expirations, document storage, maintenance schedules. These things slip through the cracks because no single app owns them.

**Family Nudge** is a purpose-built platform that:

- **Sends smart reminders** with escalating notification channels (push → SMS → WhatsApp → automated call)
- **Stores sensitive documents** with AES-256-GCM encryption and full audit trails
- **Tracks insurance & warranties** with configurable early notifications
- **Manages household maintenance** with auto-calculated next-due dates
- **Supports multi-user family groups** with role-based access control

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | pnpm workspaces + Turborepo |
| **Backend API** | Express.js + TypeScript + Prisma ORM |
| **Database** | PostgreSQL 16 |
| **Cache/Queue** | Redis 7 + Bull |
| **Web App** | Next.js 15 + React 19 + Tailwind CSS 4 |
| **Mobile App** | React Native + Expo (iOS & Android) |
| **Encryption** | AES-256-GCM (custom `@family-nudge/crypto` package) |
| **Notifications** | Twilio (SMS, WhatsApp, Voice) + FCM (Push) |
| **Auth** | JWT + scrypt password hashing |

---

## Project Structure

```
family-nudge/
├── apps/
│   ├── api/                    # Backend REST API
│   │   ├── prisma/             # Database schema & migrations
│   │   └── src/
│   │       ├── main.ts         # Express server entry
│   │       ├── routes/         # API route handlers
│   │       │   ├── auth.ts     # Register, login, logout, profile
│   │       │   ├── family.ts   # Family CRUD, invites, join
│   │       │   ├── reminders.ts# Reminder CRUD, complete, snooze
│   │       │   ├── documents.ts# Upload, download (encrypted), audit
│   │       │   ├── policies.ts # Insurance/warranty tracking
│   │       │   ├── maintenance.ts # Home/vehicle maintenance
│   │       │   └── notifications.ts # Notification history
│   │       ├── services/
│   │       │   ├── notification.service.ts  # Multi-channel dispatch
│   │       │   └── scheduler.service.ts     # Cron-based auto-nudges
│   │       ├── middleware/
│   │       │   ├── auth.ts     # JWT auth + role-based family access
│   │       │   ├── error-handler.ts
│   │       │   └── request-logger.ts
│   │       └── lib/
│   │           └── prisma.ts   # Prisma client singleton
│   │
│   ├── web/                    # Next.js web application
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx          # Beautiful landing page
│   │       │   ├── login/page.tsx    # Login screen
│   │       │   ├── register/page.tsx # Registration screen
│   │       │   └── dashboard/page.tsx# Full dashboard with tabs
│   │       └── lib/
│   │           ├── api.ts      # API client
│   │           └── store.ts    # Zustand state management
│   │
│   └── mobile/                 # React Native (Expo) mobile app
│       └── src/app/
│           ├── _layout.tsx     # Root navigation
│           └── (tabs)/         # Tab-based navigation
│               ├── index.tsx   # Home/overview
│               ├── reminders.tsx
│               ├── documents.tsx
│               ├── policies.tsx
│               └── settings.tsx
│
├── packages/
│   ├── shared/                 # Shared types, constants, validators
│   │   └── src/
│   │       ├── types.ts        # All enums, DTOs, interfaces
│   │       ├── constants.ts    # App config, limits, icons
│   │       └── validators.ts   # Email, phone, date utilities
│   │
│   └── crypto/                 # Encryption utilities
│       └── src/
│           ├── encryption.ts   # AES-256-GCM encrypt/decrypt
│           ├── hash.ts         # SHA-256, scrypt passwords, tokens
│           └── key-manager.ts  # Key rotation management
│
├── docker-compose.yml          # PostgreSQL + Redis
├── turbo.json                  # Turborepo pipeline config
├── pnpm-workspace.yaml         # Workspace config
└── tsconfig.base.json          # Shared TypeScript config
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9
- **Docker** (for PostgreSQL & Redis)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/family-nudge.git
cd family-nudge
pnpm install
```

### 2. Start Infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL on port 5432 and Redis on port 6379.

### 3. Configure Environment

```bash
cp .env.example .env

# Generate an encryption key:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Paste it as ENCRYPTION_MASTER_KEY in .env
```

### 4. Set Up Database

```bash
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema to database
```

### 5. Run Development Servers

```bash
pnpm dev            # Starts all apps (API + Web)
```

Or run individually:

```bash
# API only (port 4000)
pnpm --filter @family-nudge/api dev

# Web only (port 3000)
pnpm --filter @family-nudge/web dev

# Mobile
cd apps/mobile && npx expo start
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Get current user profile |

### Families
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/families` | Create a family group |
| GET | `/api/families` | List your families |
| GET | `/api/families/:id` | Get family details |
| POST | `/api/families/:id/invite` | Invite a member |
| POST | `/api/families/join` | Join via invite code |

### Reminders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reminders` | Create a reminder |
| GET | `/api/reminders/family/:familyId` | List family reminders |
| GET | `/api/reminders/upcoming` | Get upcoming reminders |
| PATCH | `/api/reminders/:id/complete` | Mark as done |
| PATCH | `/api/reminders/:id/snooze` | Snooze reminder |
| DELETE | `/api/reminders/:id` | Delete reminder |

### Documents (Encrypted Vault)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents` | Upload & encrypt document |
| GET | `/api/documents/family/:familyId` | List family documents |
| GET | `/api/documents/:id/download` | Decrypt & download |
| GET | `/api/documents/:id/audit` | View audit trail |
| DELETE | `/api/documents/:id` | Delete document |

### Insurance & Warranty Policies
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/policies` | Add a policy |
| GET | `/api/policies/family/:familyId` | List policies |
| GET | `/api/policies/expiring` | Get expiring policies |
| PUT | `/api/policies/:id` | Update policy |
| DELETE | `/api/policies/:id` | Delete policy |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/maintenance` | Add maintenance item |
| GET | `/api/maintenance/family/:familyId` | List items |
| POST | `/api/maintenance/:id/log` | Log completion |
| DELETE | `/api/maintenance/:id` | Deactivate item |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | List notifications |
| GET | `/api/notifications/unread-count` | Unread count |
| PATCH | `/api/notifications/:id/read` | Mark as read |
| PATCH | `/api/notifications/read-all` | Mark all read |

---

## Notification Escalation

| Priority | Channels | Use Case |
|----------|----------|----------|
| **Low** | Push | Gentle reminders |
| **Medium** | Push + SMS | Important but not urgent |
| **High** | Push + SMS + WhatsApp | Time-sensitive tasks |
| **Critical** | Push + SMS + WhatsApp + Call | Insurance renewals, medical deadlines |

Configure Twilio credentials in `.env` to enable SMS, WhatsApp, and voice calls.

---

## Encryption

All documents are encrypted at rest using **AES-256-GCM** via the `@family-nudge/crypto` package:

- Each file is encrypted with a unique IV (initialization vector)
- Authentication tags prevent tampering
- Key rotation is supported via the `KeyManager` class
- Passwords are hashed with **scrypt** (timing-safe comparison)
- Every document access (upload, download, view, delete) is logged in the audit trail

---

## Database Schema

The Prisma schema includes 10 models:

- **User** — accounts with email/phone verification
- **Session** — JWT session management with device tracking
- **Family** — family groups with invite codes
- **FamilyMember** — role-based membership (Admin, Parent, Member, Child, Viewer)
- **Reminder** — smart reminders with multi-channel escalation
- **ReminderAssignee** — assign reminders to specific family members
- **Notification** — notification history and status tracking
- **Document** — encrypted file metadata with audit trail
- **DocumentAuditLog** — who accessed what, when, from where
- **InsurancePolicy** — policies with auto-expiry tracking
- **MaintenanceItem** — recurring maintenance with frequency
- **MaintenanceLog** — maintenance completion history

---

## Roadmap

- [ ] Firebase Cloud Messaging push notifications
- [ ] Twilio WhatsApp/SMS/Voice integration (credentials needed)
- [ ] Email notifications via SMTP
- [ ] Google Calendar sync
- [ ] OCR for scanned documents
- [ ] Biometric lock on mobile app
- [ ] Family activity feed
- [ ] Bill splitting and expense tracking
- [ ] Smart suggestions based on family patterns
- [ ] Multi-language support
- [ ] PWA support for web app
- [ ] End-to-end encrypted sharing between families

---

## License

MIT
