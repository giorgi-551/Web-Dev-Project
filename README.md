# 🎫 Virtual Event Registration Platform

A comprehensive event registration and management platform for organizing virtual events with ticketing, payments, and attendee management.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)

## 🎯 Overview

A full-stack event registration platform that enables organizers to create and manage virtual events, sell tickets, and handle attendee registrations with integrated payment processing and automated notifications.

### Key Capabilities

- 🎫 Event discovery and browsing
- 💳 Integrated payment processing (Stripe)
- 📝 Multi-tier ticketing system
- 📊 Analytics dashboard for organizers
- 📧 Automated email notifications
- 🎨 Responsive design (mobile & desktop)
- 🎟️ QR code ticket generation
- 📅 Calendar integration

## 🏗️ System Architecture

### High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Web Browser]
        B[Mobile Browser]
    end
    
    subgraph "Frontend - React App"
        C[React Components]
        D[State Management]
        E[Payment UI]
    end
    
    subgraph "Backend Services"
        F[Express API Server]
        G[Background Jobs]
    end
    
    subgraph "Data Layer"
        I[(PostgreSQL)]
        J[(Redis Cache)]
    end
    
    subgraph "External Services"
        K[Stripe Payments]
        L[SendGrid Email]
        N[Clerk Auth]
        O[QR Code Generator]
    end
    
    A --> C
    B --> C
    C --> F
    F --> I
    F --> K
    F --> L
    F --> N
    F --> O
    G --> I
    G --> L
    F --> J
```

### Detailed Component Architecture

```mermaid
graph LR
    subgraph "Frontend Application"
        A1[Event Listing]
        A2[Event Details]
        A3[Registration Flow]
        A4[Ticket Selection]
        A5[User Dashboard]
        A6[Admin Panel]
        A7[My Tickets]
    end
    
    subgraph "API Layer"
        B1[Auth Routes]
        B2[Event Routes]
        B3[Registration Routes]
        B4[Payment Routes]
        B5[Ticket Routes]
        B6[Analytics Routes]
    end
    
    subgraph "Business Logic"
        C1[Auth Service]
        C2[Event Service]
        C3[Registration Service]
        C4[Payment Service]
        C5[Ticket Service]
        C6[Notification Service]
    end
    
    A1 --> B2
    A2 --> B2
    A3 --> B3
    A4 --> B4
    A5 --> B1
    A6 --> B2
    A7 --> B5
    
    B1 --> C1
    B2 --> C2
    B3 --> C3
    B4 --> C4
    B5 --> C5
    B3 --> C6
```

### Data Flow - Registration Process

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Server
    participant DB as Database
    participant S as Stripe
    participant E as Email Service
    participant Q as QR Service
    
    U->>F: Browse Events
    F->>A: GET /api/events
    A->>DB: Query events
    DB-->>A: Return events
    A-->>F: Event list
    
    U->>F: Select Event & Ticket
    F->>A: POST /api/registrations
    A->>DB: Check availability
    DB-->>A: Tickets available
    A->>S: Create checkout session
    S-->>A: Session URL
    A-->>F: Return checkout URL
    
    F->>S: Redirect to Stripe
    U->>S: Complete payment
    S->>A: Webhook: payment_success
    A->>DB: Create registration
    A->>Q: Generate QR code
    Q-->>A: QR code image
    A->>E: Send confirmation email
    E-->>U: Email with ticket
    A-->>F: Registration confirmed
    F->>U: Show success page
```

### Ticket Generation Flow

```mermaid
graph TB
    A[Payment Confirmed] --> B[Create Registration]
    B --> C[Generate Unique Ticket ID]
    C --> D[Create QR Code]
    D --> E[Store Ticket Data]
    E --> F{Email Template}
    F --> G[PDF Ticket]
    F --> H[HTML Email]
    G --> I[Send to User]
    H --> I
    I --> J[Update Notification Status]
```

## 🗄️ Database Schema

### Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ REGISTRATIONS : creates
    USERS ||--o{ EVENTS : organizes
    EVENTS ||--o{ REGISTRATIONS : has
    EVENTS ||--o{ TICKETS : offers
    EVENTS ||--o{ CATEGORIES : belongs_to
    REGISTRATIONS ||--|| PAYMENTS : has
    REGISTRATIONS ||--|| TICKETS : generates
    
    USERS {
        uuid id PK
        string email UK
        string name
        string role
        string phone
        timestamp created_at
    }
    
    EVENTS {
        uuid id PK
        string title
        text description
        string image_url
        timestamp start_time
        timestamp end_time
        string timezone
        string meeting_link
        int capacity
        uuid organizer_id FK
        uuid category_id FK
        string status
        boolean is_featured
    }
    
    TICKETS {
        uuid id PK
        uuid event_id FK
        string ticket_type
        string name
        text description
        decimal price
        int quantity
        int sold
        timestamp sale_start
        timestamp sale_end
    }
    
    REGISTRATIONS {
        uuid id PK
        uuid user_id FK
        uuid event_id FK
        uuid ticket_id FK
        string status
        uuid payment_id FK
        string ticket_code
        string qr_code_url
        boolean checked_in
        timestamp registered_at
    }
    
    PAYMENTS {
        uuid id PK
        uuid registration_id FK
        string stripe_payment_id
        decimal amount
        string currency
        string status
        timestamp paid_at
    }
    
    CATEGORIES {
        uuid id PK
        string name
        string slug
        string color
    }
```

### Prisma Schema

```prisma
model User {
  id            String         @id @default(uuid())
  email         String         @unique
  name          String
  phone         String?
  role          String         @default("user")
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  registrations Registration[]
  events        Event[]
}

model Event {
  id            String         @id @default(uuid())
  title         String
  description   String
  imageUrl      String
  startTime     DateTime
  endTime       DateTime
  timezone      String         @default("UTC")
  meetingLink   String?
  capacity      Int
  organizerId   String
  categoryId    String
  status        String         @default("draft")
  isFeatured    Boolean        @default(false)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  organizer     User           @relation(fields: [organizerId], references: [id])
  category      Category       @relation(fields: [categoryId], references: [id])
  registrations Registration[]
  tickets       Ticket[]
}

model Ticket {
  id            String         @id @default(uuid())
  eventId       String
  ticketType    String         // "free", "paid", "earlybird", "vip"
  name          String
  description   String?
  price         Decimal        @default(0)
  quantity      Int
  sold          Int            @default(0)
  saleStart     DateTime?
  saleEnd       DateTime?
  event         Event          @relation(fields: [eventId], references: [id])
  registrations Registration[]
}

model Registration {
  id            String    @id @default(uuid())
  userId        String
  eventId       String
  ticketId      String
  status        String    @default("pending")
  paymentId     String?   @unique
  ticketCode    String    @unique
  qrCodeUrl     String?
  checkedIn     Boolean   @default(false)
  registeredAt  DateTime  @default(now())
  user          User      @relation(fields: [userId], references: [id])
  event         Event     @relation(fields: [eventId], references: [id])
  ticket        Ticket    @relation(fields: [ticketId], references: [id])
  payment       Payment?  @relation(fields: [paymentId], references: [id])
  
  @@unique([userId, eventId])
}

model Payment {
  id              String        @id @default(uuid())
  stripePaymentId String        @unique
  amount          Decimal
  currency        String        @default("usd")
  status          String
  paidAt          DateTime      @default(now())
  registration    Registration?
}

model Category {
  id      String  @id @default(uuid())
  name    String
  slug    String  @unique
  color   String  @default("#6366f1")
  events  Event[]
}

model PromoCode {
  id          String   @id @default(uuid())
  code        String   @unique
  discount    Decimal  // percentage or fixed amount
  type        String   // "percentage" or "fixed"
  maxUses     Int
  usedCount   Int      @default(0)
  validFrom   DateTime
  validUntil  DateTime
  isActive    Boolean  @default(true)
}
```

## ✨ Features

### User Features
- ✅ Browse and search events
- ✅ Filter by category, date, price, location
- ✅ View detailed event information
- ✅ Select ticket types (Free, Paid, Early Bird, VIP)
- ✅ Secure payment processing with Stripe
- ✅ Receive confirmation emails with tickets
- ✅ Download PDF tickets with QR codes
- ✅ View registration history
- ✅ Add events to calendar (ICS file)
- ✅ Apply promo codes for discounts
- ✅ Update profile and preferences

### Organizer Features
- ✅ Create and manage events
- ✅ Set up multiple ticket tiers
- ✅ Configure pricing and capacity
- ✅ Upload event images and materials
- ✅ Track registrations in real-time
- ✅ View analytics dashboard
  - Total registrations
  - Revenue tracking
  - Ticket sales by type
  - Registration trends
- ✅ Export attendee lists (CSV/Excel)
- ✅ Send bulk emails to attendees
- ✅ Scan QR codes for check-in
- ✅ Create promo codes
- ✅ Manage event status (draft, published, cancelled)

### Admin Features
- ✅ User management
- ✅ Event approval workflow
- ✅ System-wide analytics
- ✅ Revenue tracking across all events
- ✅ Category management
- ✅ Platform settings

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS
- **State Management:** Zustand / React Query
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod
- **UI Components:** Shadcn UI
- **Date Handling:** date-fns
- **QR Code:** qrcode.react

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **ORM:** Prisma
- **Authentication:** Clerk / JWT
- **Job Queue:** Bull (Redis-based)
- **Email:** SendGrid / Resend
- **Payments:** Stripe
- **PDF Generation:** PDFKit / Puppeteer
- **QR Codes:** qrcode

### Database & Cache
- **Primary DB:** PostgreSQL 15
- **Cache:** Redis 7
- **File Storage:** AWS S3 / Cloudflare R2

### DevOps
- **Frontend Hosting:** Vercel
- **Backend Hosting:** Railway / Render
- **CI/CD:** GitHub Actions
- **Monitoring:** Sentry
- **Analytics:** Mixpanel / PostHog

## 🚀 Getting Started

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
postgresql >= 15
redis >= 7
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/event-registration-platform.git
cd event-registration-platform
```

2. **Install dependencies**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. **Environment Setup**

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventplatform"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
CLERK_SECRET_KEY="your-clerk-secret"
STRIPE_SECRET_KEY="your-stripe-secret"
STRIPE_WEBHOOK_SECRET="your-webhook-secret"
SENDGRID_API_KEY="your-sendgrid-key"
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
FRONTEND_URL="http://localhost:5173"
PORT=5000
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your-clerk-key
VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-key
```

4. **Database Setup**
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. **Run the application**

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Redis (if not running as service)
redis-server
```

Visit `http://localhost:5173` to see the app!

## 📡 API Documentation

### Authentication Endpoints

```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user
PUT    /api/auth/profile        - Update profile
```

### Event Endpoints

```
GET    /api/events              - List all events
GET    /api/events/:id          - Get event details
POST   /api/events              - Create event (organizer)
PUT    /api/events/:id          - Update event (organizer)
DELETE /api/events/:id          - Delete event (organizer)
GET    /api/events/search       - Search events
GET    /api/events/featured     - Get featured events
```

### Ticket Endpoints

```
GET    /api/tickets/event/:eventId  - Get tickets for event
POST   /api/tickets                 - Create ticket type (organizer)
PUT    /api/tickets/:id             - Update ticket (organizer)
DELETE /api/tickets/:id             - Delete ticket (organizer)
```

### Registration Endpoints

```
POST   /api/registrations           - Register for event
GET    /api/registrations/me        - Get my registrations
GET    /api/registrations/:id       - Get registration details
DELETE /api/registrations/:id       - Cancel registration
GET    /api/registrations/:id/ticket - Download ticket PDF
POST   /api/registrations/:id/checkin - Check-in attendee
```

### Payment Endpoints

```
POST   /api/payments/checkout       - Create Stripe checkout session
POST   /api/payments/webhook        - Stripe webhook handler
GET    /api/payments/:id            - Get payment details
POST   /api/payments/apply-promo    - Apply promo code
```

### Analytics Endpoints

```
GET    /api/analytics/event/:id     - Event analytics (organizer)
GET    /api/analytics/overview      - Platform overview (admin)
GET    /api/analytics/revenue       - Revenue reports
```

## 🎯 3-Week Development Timeline

```mermaid
gantt
    title 3-Week Project Timeline
    dateFormat  YYYY-MM-DD
    section Week 1
    Setup & Auth           :w1t1, 2024-01-01, 2d
    Event Listing & CRUD   :w1t2, after w1t1, 3d
    section Week 2
    Ticket System          :w2t1, 2024-01-08, 2d
    Registration Flow      :w2t2, after w2t1, 1d
    Payment Integration    :w2t3, after w2t2, 2d
    section Week 3
    Ticket Generation      :w3t1, 2024-01-15, 2d
    Dashboard & Analytics  :w3t2, after w3t1, 2d
    Testing & Polish       :w3t3, after w3t2, 2d
    Deployment            :w3t4, after w3t3, 1d
```

## 🌐 Deployment

### Frontend (Vercel)

```bash
cd frontend
vercel --prod
```

### Backend (Railway)

```bash
cd backend
railway up
```

### Database Migration

```bash
npx prisma migrate deploy
```

### Environment Variables

Set all environment variables in your hosting platform's dashboard.

## 📊 Project Structure

```
event-registration-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EventCard.jsx
│   │   │   ├── EventList.jsx
│   │   │   ├── TicketSelector.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   ├── Registration.jsx
│   │   │   ├── MyTickets.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── events.js
│   │   │   ├── tickets.js
│   │   │   ├── registrations.js
│   │   │   └── payments.js
│   │   ├── services/
│   │   │   ├── emailService.js
│   │   │   ├── ticketService.js
│   │   │   └── paymentService.js
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Built with modern web technologies
- Stripe for payment processing
- Community feedback and contributions

---

**⭐ Star this repo if you find it helpful!**