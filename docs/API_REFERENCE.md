# Bifimoto API Reference

## Base URL
\`\`\`
Development: http://localhost:3000/api
Production: https://bifimoto.com/api
\`\`\`

## Authentication

All authenticated endpoints require a valid session cookie set by Supabase Auth.

### Headers
\`\`\`
Content-Type: application/json
Cookie: sb-access-token=xxx; sb-refresh-token=xxx
\`\`\`

---

## Endpoints

### Authentication

> The signup/signin/token endpoint examples below describe the original prototype and are no longer active. Authentication is handled by Supabase Auth through the Identity bounded context; see [Supabase Setup](SUPABASE_SETUP.md).

#### POST /auth/signup
Create a new user account.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "username": "johndoe",
  "privacyPolicyChecked": true,
  "termsChecked": true
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Account created. Please check your email to verify your account.",
  "userId": "uuid"
}
\`\`\`

**Error Responses:**
- `400`: Validation error
- `429`: Rate limit exceeded

---

#### POST /auth/signin
Sign in an existing user.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "role": "user"
}
\`\`\`

---

#### GET /auth/verify-email
Verify user email address.

**Query Parameters:**
- `token` (required): Verification token from email

**Response:**
- Redirects to `/verification-success` on success
- Returns `400` error if token invalid/expired

---

### Transactions

#### GET /transactions
Get current user's transactions.

**Authentication:** Required

**Response (200):**
\`\`\`json
{
  "transactions": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "crypto_id": "uuid",
      "transaction_type": "buy",
      "crypto_amount": "0.5",
      "fiat_amount": "22500000.00",
      "exchange_rate": "45000000.00",
      "currency": "NGN",
      "status": "pending",
      "created_at": "2025-01-15T10:30:00Z",
      "cryptocurrencies": {
        "symbol": "BTC",
        "name": "Bitcoin",
        "icon_url": "https://..."
      }
    }
  ]
}
\`\`\`

---

#### POST /transactions
Create a new transaction.

**Authentication:** Required

**Request Body:**
\`\`\`json
{
  "cryptoId": "uuid",
  "cryptoAmount": "0.5",
  "fiatAmount": "22500000.00",
  "exchangeRate": "45000000.00",
  "transactionType": "buy",
  "bankName": "GTBank",
  "accountNumber": "1234567890",
  "accountName": "John Doe",
  "walletAddress": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
  "proofOfPaymentUrl": "https://..."
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "status": "pending",
    ...
  }
}
\`\`\`

---

#### PATCH /transactions/[id]
Update transaction status (Admin only).

**Authentication:** Required (Admin)

**Request Body:**
\`\`\`json
{
  "status": "completed",
  "adminNotes": "Payment verified and processed"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "transaction": {
    "id": "uuid",
    "status": "completed",
    "processed_by": "admin-uuid",
    "processed_at": "2025-01-15T11:00:00Z",
    ...
  }
}
\`\`\`

---

### Exchange Rates

#### GET /rates
Get current exchange rates for all cryptocurrencies.

**Authentication:** Not required

**Response (200):**
\`\`\`json
{
  "rates": [
    {
      "id": "uuid",
      "crypto_id": "uuid",
      "buy_rate": "45000000.00",
      "sell_rate": "44500000.00",
      "currency": "NGN",
      "effective_from": "2025-01-15T00:00:00Z",
      "cryptocurrencies": {
        "symbol": "BTC",
        "name": "Bitcoin"
      }
    }
  ]
}
\`\`\`

---

#### POST /rates
Create new exchange rate (Admin only).

**Authentication:** Required (Admin)

**Request Body:**
\`\`\`json
{
  "cryptoId": "uuid",
  "buyRate": "45000000.00",
  "sellRate": "44500000.00",
  "currency": "NGN"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "rate": {
    "id": "uuid",
    "crypto_id": "uuid",
    "buy_rate": "45000000.00",
    "sell_rate": "44500000.00",
    "created_by": "admin-uuid",
    ...
  }
}
\`\`\`

---

### Admin

#### GET /admin/stats
Get platform statistics (Admin only).

**Authentication:** Required (Admin)

**Response (200):**
\`\`\`json
{
  "stats": {
    "totalUsers": 1250,
    "totalTransactions": 3420,
    "pendingTransactions": 15,
    "totalVolume": 1250000000.00
  },
  "recentTransactions": [...]
}
\`\`\`

---

## Error Responses

All endpoints may return these error responses:

**401 Unauthorized:**
\`\`\`json
{
  "error": "Unauthorized"
}
\`\`\`

**403 Forbidden:**
\`\`\`json
{
  "error": "Forbidden"
}
\`\`\`

**500 Internal Server Error:**
\`\`\`json
{
  "error": "An error occurred"
}
\`\`\`

---

## Rate Limiting

- Sign-up endpoint: 3 requests per minute per IP
- Other endpoints: No rate limiting (protected by authentication)

**Rate Limit Response (429):**
\`\`\`json
{
  "error": "Too many requests. Please try again later."
}
