# MoneyMesh - Personal Finance Tracker (MVP)

An MVP of a Personal Finance Tracker built with React Native (Expo), Node.js (Express), and PostgreSQL.

## Features (MVP)
- **Authentication**: Register, Login (JWT + bcrypt).
- **Transactions**: Add income/expense, list latest, basic receipts stub.
- **Cards**: Add credit cards, track balance updates on credit expenses.
- **Dashboard**: View monthly income/expense summary.

## Prerequisites
- Node.js (v14+)
- PostgreSQL
- Expo Go (on mobile) or Android/iOS Emulator

## Setup

### 1. Backend (Server)

1. Navigate to `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   Ensure `.env` exists with correct `DATABASE_URL`.
   ```env
   PORT=3000
   DATABASE_URL=postgres://postgres:password@localhost:5432/moneymesh
   JWT_SECRET=supersecretkey
   ```
4. Initialize Database:
   ```bash
   npm run db:init
   ```
   *Note: Ensure the database `moneymesh` (or whatever is in your URL) exists. If not, create it first using `createdb moneymesh`.*
   *Note: Ensure your PostgreSQL service is running on the specified port.*

5. Start Server:
   ```bash
   npm run dev
   ```

### 2. Frontend (Mobile)

1. Navigate to `mobile` directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Expo:
   ```bash
   npx expo start
   ```
   - Press `a` for Android Emulator
   - Press `i` for iOS Simulator
   - Scan QR code with Expo Go app

## API Endpoints (Quick Ref)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/cards`, `POST /api/cards`
- `GET /api/transactions`, `POST /api/transactions`

## Notes
- To test credit card balance updates: Add a card, then add an expense transaction with 'credit' payment method and select that card. The card balance will increase.
