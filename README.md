# Ledger Backend System

A robust, atomic ledger system built with Node.js, Express, and MongoDB. This system handles financial transactions with high reliability, ensuring data consistency using MongoDB sessions.

## Features
- **Atomic Transactions**: Money transfers use database sessions to ensure either both accounts are updated or none are.
- **Idempotency Support**: Prevents duplicate transactions if the same request is sent multiple times.
- **Role-Based Access**: Includes standard user routes and protected system/admin routes.
- **Token Blacklisting**: Secure logout mechanism using a blacklisted token system.
- **Email Notifications**: Integrated email alerts for account creation and transactions.

## Tech Stack
- **Node.js & Express**
- **MongoDB & Mongoose** (with Transactions)
- **JWT Authentication** (Cookie & Header support)
- **Nodemailer** (Email services)

## Setup Instructions

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add:
   ```env
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```
4. **Run the server**:
   ```bash
   npm run dev
   ```

## API Documentation
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT
- `POST /api/auth/logout` - Logout (invalidates token)
- `POST /api/accounts/` - Create a ledger account
- `GET /api/accounts/balance/:accountId` - Fetch account balance
- `POST /api/transactions/` - Transfer money between accounts
- `POST /api/transactions/system/initial-funds` - System-initiated fund addition (Admin only)
