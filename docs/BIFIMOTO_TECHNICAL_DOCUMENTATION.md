# Bifimoto Technical Documentation
## Complete End-to-End Implementation Guide with Supabase

**Version:** 1.0  
**Last Updated:** January 2025  
**Project Manager:** Senior Engineering Team  
**Status:** Implementation Ready

> **Current implementation note:** This guide contains the original v0 proposal and includes placeholder examples that are not the live application. Do not copy its legacy service-role or authorization examples. The implemented authentication/database foundation, server-side admin checks, and trade-order RLS/review flow are documented in [SUPABASE_SETUP.md](SUPABASE_SETUP.md) and the timestamped migrations.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Email Verification Flow](#2-email-verification-flow)
3. [Database Schema Design](#3-database-schema-design)
4. [Supabase Setup & Configuration](#4-supabase-setup--configuration)
5. [Authentication System](#5-authentication-system)
6. [API Endpoints Documentation](#6-api-endpoints-documentation)
7. [Transaction Management](#7-transaction-management)
8. [Admin Panel Features](#8-admin-panel-features)
9. [Rate Management System](#9-rate-management-system)
10. [Security Implementation](#10-security-implementation)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Guide](#12-deployment-guide)
13. [Monitoring & Maintenance](#13-monitoring--maintenance)

---

## 1. Project Overview

### 1.1 Application Architecture

Bifimoto is a cryptocurrency exchange platform built with:
- **Frontend:** Next.js 14 (App Router), React 19, TypeScript
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth with email verification
- **Styling:** Tailwind CSS v4 with shadcn/ui components
- **State Management:** React Hooks, SWR for data fetching

### 1.2 Core Features

- ✅ User authentication with email verification
- ✅ Multi-currency crypto trading (Buy/Sell)
- ✅ Real-time transaction management
- ✅ Admin dashboard for platform management
- ✅ Dynamic exchange rate management
- ✅ Multi-language support (6 languages)
- ✅ Role-based access control (User/Admin)
- ✅ Security features (rate limiting, input validation)

---

## 2. Email Verification Flow

### 2.1 Complete User Registration Flow

\`\`\`
┌─────────────┐
│   User      │
│  Sign Up    │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Step 1: Frontend Validation            │
│  - Check password strength              │
│  - Validate email format                │
│  - Ensure terms acceptance              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Step 2: POST /api/auth/signup          │
│  - Rate limit check (3 req/min)         │
│  - Disposable email validation          │
│  - Create unverified user in DB         │
│  - Generate secure token (32 bytes)     │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Step 3: Send Verification Email        │
│  - Queue email to prevent DDoS          │
│  - Include verification link            │
│  - Set 24-hour expiration               │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Step 4: User Clicks Email Link         │
│  GET /api/auth/verify-email?token=xxx   │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Step 5: Token Verification             │
│  - Validate token exists                │
│  - Check expiration (24 hours)          │
│  - Verify not already used              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Step 6: Account Activation             │
│  - Update user.verified = true          │
│  - Delete verification token            │
│  - Create user session                  │
│  - Redirect to /verification-success    │
└─────────────────────────────────────────┘
\`\`\`

### 2.2 Implementation Steps

#### Step 1: Create Supabase Tables

\`\`\`sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verification tokens table
CREATE TABLE public.verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster token lookups
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_expires ON verification_tokens(expires_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for verification tokens (admin only)
CREATE POLICY "Only system can manage tokens"
  ON public.verification_tokens
  USING (false);
\`\`\`

#### Step 2: Update Signup API Route

\`\`\`typescript
// app/api/auth/signup/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { sendVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

// Legacy example omitted: use the Identity bounded context and session-aware
// Supabase client; do not use a service-role key for user-facing routes.

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.ip ?? '127.0.0.1'
    const { success } = await limiter.check(ip, 3)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many sign-up attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const { email, password, fullName, username, privacyPolicyChecked, termsChecked } = await request.json()

    // Validation
    if (!privacyPolicyChecked || !termsChecked) {
      return NextResponse.json(
        { error: 'You must agree to the Privacy Policy and Terms & Conditions.' },
        { status: 400 }
      )
    }

    // Block disposable emails
    const disposableDomains = ['tempmail.com', 'guerrillamail.com', '10minutemail.com']
    const emailDomain = email.split('@')[1]
    if (disposableDomains.includes(emailDomain)) {
      return NextResponse.json(
        { error: 'Disposable email addresses are not allowed.' },
        { status: 400 }
      )
    }

    // Create user in Supabase Auth (unverified)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // User must verify email
      user_metadata: {
        full_name: fullName,
        username,
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName,
        username,
        verified: false,
      })

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile.' },
        { status: 500 }
      )
    }

    // Generate secure verification token
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    const { error: tokenError } = await supabase
      .from('verification_tokens')
      .insert({
        user_id: authData.user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      console.error('[v0] Token storage error:', tokenError)
    }

    // Send verification email
    await sendVerificationEmail({
      to: email,
      token,
      username: fullName,
    })

    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email to verify your account.',
      userId: authData.user.id,
    })

  } catch (error) {
    console.error('[v0] Sign-up error:', error)
    return NextResponse.json(
      { error: 'An error occurred during sign-up. Please try again.' },
      { status: 500 }
    )
  }
}
\`\`\`

#### Step 3: Update Email Verification Route

\`\`\`typescript
// app/api/auth/verify-email/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Legacy example omitted: use the Identity bounded context and session-aware
// Supabase client; do not use a service-role key for user-facing routes.

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required.' },
        { status: 400 }
      )
    }

    // Verify token exists and not expired
    const { data: tokenData, error: tokenError } = await supabase
      .from('verification_tokens')
      .select('user_id, expires_at')
      .eq('token', token)
      .single()

    if (tokenError || !tokenData) {
      return NextResponse.json(
        { error: 'Invalid verification token.' },
        { status: 400 }
      )
    }

    // Check expiration
    if (new Date(tokenData.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired.' },
        { status: 400 }
      )
    }

    // Update user as verified in Supabase Auth
    const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
      tokenData.user_id,
      { email_confirm: true }
    )

    if (updateAuthError) {
      return NextResponse.json(
        { error: 'Failed to verify account.' },
        { status: 500 }
      )
    }

    // Update profile
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ verified: true, updated_at: new Date().toISOString() })
      .eq('id', tokenData.user_id)

    if (updateProfileError) {
      console.error('[v0] Profile update error:', updateProfileError)
    }

    // Delete used token
    await supabase
      .from('verification_tokens')
      .delete()
      .eq('token', token)

    // Redirect to success page
    return NextResponse.redirect(new URL('/verification-success', request.url))

  } catch (error) {
    console.error('[v0] Email verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred during verification.' },
      { status: 500 }
    )
  }
}
\`\`\`

#### Step 4: Email Service Integration

\`\`\`typescript
// lib/email.tsx
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface VerificationEmailParams {
  to: string
  token: string
  username: string
}

export async function sendVerificationEmail({ to, token, username }: VerificationEmailParams) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: 'Bifimoto <noreply@bifimoto.com>',
      to,
      subject: 'Verify your Bifimoto account',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Bifimoto!</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${username},</h2>
              
              <p style="font-size: 16px; color: #555;">
                Thank you for signing up for Bifimoto. We're excited to have you on board!
              </p>
              
              <p style="font-size: 16px; color: #555;">
                To complete your registration and start trading, please verify your email address by clicking the button below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <p style="font-size: 14px; color: #777;">
                Or copy and paste this link into your browser:
              </p>
              <p style="word-break: break-all; color: #667eea; font-size: 14px; background: white; padding: 10px; border-radius: 5px;">
                ${verificationUrl}
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="font-size: 12px; color: #999; margin: 5px 0;">
                  ⏰ This link will expire in 24 hours
                </p>
                <p style="font-size: 12px; color: #999; margin: 5px 0;">
                  🔒 If you didn't create an account, please ignore this email
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© 2025 Bifimoto. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    })
  } catch (error) {
    console.error('[v0] Email sending error:', error)
    throw new Error('Failed to send verification email')
  }
}
\`\`\`

---

## 3. Database Schema Design

### 3.1 Complete Database Schema

\`\`\`sql
-- ============================================
-- BIFIMOTO DATABASE SCHEMA
-- PostgreSQL with Supabase
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  verified BOOLEAN DEFAULT FALSE,
  phone_number TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. VERIFICATION TOKENS TABLE
-- ============================================
CREATE TABLE public.verification_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CRYPTOCURRENCIES TABLE
-- ============================================
CREATE TABLE public.cryptocurrencies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL, -- BTC, ETH, USDT, etc.
  name TEXT NOT NULL, -- Bitcoin, Ethereum, Tether
  icon_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. EXCHANGE RATES TABLE
-- ============================================
CREATE TABLE public.exchange_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  crypto_id UUID REFERENCES cryptocurrencies(id) ON DELETE CASCADE,
  buy_rate DECIMAL(20, 8) NOT NULL, -- Rate for buying crypto
  sell_rate DECIMAL(20, 8) NOT NULL, -- Rate for selling crypto
  currency TEXT DEFAULT 'NGN', -- NGN, USD, etc.
  effective_from TIMESTAMPTZ DEFAULT NOW(),
  effective_to TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. TRANSACTIONS TABLE
-- ============================================
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crypto_id UUID REFERENCES cryptocurrencies(id),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  crypto_amount DECIMAL(20, 8) NOT NULL,
  fiat_amount DECIMAL(20, 2) NOT NULL,
  exchange_rate DECIMAL(20, 8) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  payment_method TEXT, -- bank_transfer, card, etc.
  payment_reference TEXT UNIQUE,
  
  -- Bank details for transactions
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  
  -- Crypto wallet details
  wallet_address TEXT,
  
  -- Proof of payment
  proof_of_payment_url TEXT,
  
  -- Admin notes
  admin_notes TEXT,
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. SYSTEM ACCOUNTS TABLE (for admin)
-- ============================================
CREATE TABLE public.system_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_type TEXT NOT NULL CHECK (account_type IN ('bank', 'crypto_wallet')),
  
  -- Bank account details
  bank_name TEXT,
  account_number TEXT,
  account_name TEXT,
  
  -- Crypto wallet details
  crypto_id UUID REFERENCES cryptocurrencies(id),
  wallet_address TEXT,
  network TEXT, -- ERC20, TRC20, BEP20, etc.
  
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- login, transaction_created, rate_updated, etc.
  entity_type TEXT, -- transaction, rate, user, etc.
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token);
CREATE INDEX idx_verification_tokens_expires ON verification_tokens(expires_at);
CREATE INDEX idx_exchange_rates_crypto ON exchange_rates(crypto_id);
CREATE INDEX idx_exchange_rates_effective ON exchange_rates(effective_from, effective_to);
CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cryptocurrencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Cryptocurrencies policies (public read)
CREATE POLICY "Anyone can view active cryptocurrencies"
  ON public.cryptocurrencies FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Only admins can manage cryptocurrencies"
  ON public.cryptocurrencies FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Exchange rates policies (public read)
CREATE POLICY "Anyone can view current rates"
  ON public.exchange_rates FOR SELECT
  USING (
    effective_from <= NOW() AND
    (effective_to IS NULL OR effective_to > NOW())
  );

CREATE POLICY "Only admins can manage rates"
  ON public.exchange_rates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON public.transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update transactions"
  ON public.transactions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- System accounts policies (admin only)
CREATE POLICY "Only admins can manage system accounts"
  ON public.system_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Audit logs policies (admin only)
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cryptocurrencies_updated_at
  BEFORE UPDATE ON cryptocurrencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_accounts_updated_at
  BEFORE UPDATE ON system_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log on transaction changes
CREATE OR REPLACE FUNCTION log_transaction_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (
      auth.uid(),
      'transaction_updated',
      'transaction',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_transaction_changes
  AFTER UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION log_transaction_changes();

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default cryptocurrencies
INSERT INTO cryptocurrencies (symbol, name, is_active) VALUES
  ('BTC', 'Bitcoin', TRUE),
  ('ETH', 'Ethereum', TRUE),
  ('USDT', 'Tether', TRUE),
  ('BNB', 'Binance Coin', TRUE),
  ('USDC', 'USD Coin', TRUE);

-- Insert initial exchange rates (example rates)
INSERT INTO exchange_rates (crypto_id, buy_rate, sell_rate, currency)
SELECT 
  id,
  CASE symbol
    WHEN 'BTC' THEN 45000000.00
    WHEN 'ETH' THEN 2500000.00
    WHEN 'USDT' THEN 1650.00
    WHEN 'BNB' THEN 450000.00
    WHEN 'USDC' THEN 1650.00
  END,
  CASE symbol
    WHEN 'BTC' THEN 44500000.00
    WHEN 'ETH' THEN 2475000.00
    WHEN 'USDT' THEN 1630.00
    WHEN 'BNB' THEN 445000.00
    WHEN 'USDC' THEN 1630.00
  END,
  'NGN'
FROM cryptocurrencies;
\`\`\`

### 3.2 Database Relationships Diagram

\`\`\`
┌─────────────────┐
│   auth.users    │ (Supabase Auth)
│  (id, email)    │
└────────┬────────┘
         │
         │ 1:1
         ▼
┌─────────────────┐
│    profiles     │
│  - full_name    │
│  - username     │
│  - role         │
│  - verified     │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌──────────────────┐
│  transactions   │──────▶│ cryptocurrencies │
│  - type         │  N:1  │  - symbol        │
│  - amount       │       │  - name          │
│  - status       │       └──────────────────┘
└─────────────────┘              │
                                 │ 1:N
                                 ▼
                        ┌──────────────────┐
                        │  exchange_rates  │
                        │  - buy_rate      │
                        │  - sell_rate     │
                        └──────────────────┘
\`\`\`

---

## 4. Supabase Setup & Configuration

### 4.1 Initial Supabase Project Setup

**Step 1: Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Enter project details:
   - Name: `bifimoto-production`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project provisioning (~2 minutes)

**Step 2: Get API Keys**
1. Go to Project Settings → API
2. Copy the following:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Step 3: Configure Environment Variables**

Create `.env.local` file:
\`\`\`bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Service (Resend)
RESEND_API_KEY=re_your_api_key

# Optional: For production
NODE_ENV=production
\`\`\`

### 4.2 Supabase Client Setup

**Create Supabase Client Utilities**

\`\`\`typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
\`\`\`

\`\`\`typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie removal errors
          }
        },
      },
    }
  )
}
\`\`\`

\`\`\`typescript
// lib/supabase/middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
\`\`\`

**Update Middleware**

\`\`\`typescript
// middleware.ts
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
\`\`\`

### 4.3 Run Database Migrations

**Option 1: Using Supabase Dashboard**
1. Go to SQL Editor in Supabase Dashboard
2. Copy the complete schema from Section 3.1
3. Click "Run" to execute

**Option 2: Using Supabase CLI**
\`\`\`bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create migration file
supabase migration new initial_schema

# Add schema SQL to the migration file
# Then push to Supabase
supabase db push
\`\`\`

---

## 5. Authentication System

### 5.1 Sign-In Implementation

\`\`\`typescript
// app/api/auth/signin/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    // Check if user is verified
    const { data: profile } = await supabase
      .from('profiles')
      .select('verified, role')
      .eq('id', data.user.id)
      .single()

    if (!profile?.verified) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'Please verify your email before signing in.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      role: profile.role,
    })

  } catch (error) {
    console.error('[v0] Sign-in error:', error)
    return NextResponse.json(
      { error: 'An error occurred during sign-in.' },
      { status: 500 }
    )
  }
}
\`\`\`

### 5.2 Protected Routes

\`\`\`typescript
// app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if verified
  const { data: profile } = await supabase
    .from('profiles')
    .select('verified')
    .eq('id', user.id)
    .single()

  if (!profile?.verified) {
    redirect('/verification-pending')
  }

  return <>{children}</>
}
\`\`\`

### 5.3 Admin Route Protection

\`\`\`typescript
// app/admin/layout.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
\`\`\`

---

## 6. API Endpoints Documentation

### 6.1 Authentication Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/signup` | POST | Create new user account | No |
| `/api/auth/signin` | POST | Sign in existing user | No |
| `/api/auth/signout` | POST | Sign out current user | Yes |
| `/api/auth/verify-email` | GET | Verify email with token | No |
| `/api/auth/forgot-password` | POST | Request password reset | No |
| `/api/auth/reset-password` | POST | Reset password with token | No |

### 6.2 Transaction Endpoints

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/transactions` | GET | Get user transactions | Yes | User |
| `/api/transactions` | POST | Create new transaction | Yes | User |
| `/api/transactions/[id]` | GET | Get transaction details | Yes | User |
| `/api/transactions/[id]` | PATCH | Update transaction status | Yes | Admin |
| `/api/transactions/admin` | GET | Get all transactions | Yes | Admin |

### 6.3 Exchange Rate Endpoints

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/rates` | GET | Get current rates | No | - |
| `/api/rates` | POST | Create new rate | Yes | Admin |
| `/api/rates/[id]` | PATCH | Update rate | Yes | Admin |
| `/api/rates/history` | GET | Get rate history | Yes | Admin |

### 6.4 Cryptocurrency Endpoints

| Endpoint | Method | Description | Auth Required | Role |
|----------|--------|-------------|---------------|------|
| `/api/cryptocurrencies` | GET | Get all cryptos | No | - |
| `/api/cryptocurrencies` | POST | Add new crypto | Yes | Admin |
| `/api/cryptocurrencies/[id]` | PATCH | Update crypto | Yes | Admin |
| `/api/cryptocurrencies/[id]` | DELETE | Deactivate crypto | Yes | Admin |

---

## 7. Transaction Management

### 7.1 Buy Transaction Flow

\`\`\`typescript
// app/api/transactions/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      cryptoId,
      cryptoAmount,
      fiatAmount,
      exchangeRate,
      transactionType,
      bankName,
      accountNumber,
      accountName,
      walletAddress,
      proofOfPaymentUrl,
    } = body

    // Validate transaction data
    if (!cryptoId || !cryptoAmount || !fiatAmount || !exchangeRate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        crypto_id: cryptoId,
        transaction_type: transactionType,
        crypto_amount: cryptoAmount,
        fiat_amount: fiatAmount,
        exchange_rate: exchangeRate,
        currency: 'NGN',
        status: 'pending',
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        wallet_address: walletAddress,
        proof_of_payment_url: proofOfPaymentUrl,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Transaction creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'transaction_created',
      entity_type: 'transaction',
      entity_id: transaction.id,
      new_values: transaction,
    })

    return NextResponse.json({
      success: true,
      transaction,
    })

  } catch (error) {
    console.error('[v0] Transaction error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user transactions with crypto details
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        *,
        cryptocurrencies (
          symbol,
          name,
          icon_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[v0] Fetch transactions error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({ transactions })

  } catch (error) {
    console.error('[v0] Transaction fetch error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
\`\`\`

### 7.2 Admin Transaction Management

\`\`\`typescript
// app/api/transactions/[id]/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { status, adminNotes } = await request.json()

    // Get old transaction data for audit
    const { data: oldTransaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', params.id)
      .single()

    // Update transaction
    const { data: transaction, error } = await supabase
      .from('transactions')
      .update({
        status,
        admin_notes: adminNotes,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('[v0] Transaction update error:', error)
      return NextResponse.json(
        { error: 'Failed to update transaction' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'transaction_updated',
      entity_type: 'transaction',
      entity_id: transaction.id,
      old_values: oldTransaction,
      new_values: transaction,
    })

    return NextResponse.json({
      success: true,
      transaction,
    })

  } catch (error) {
    console.error('[v0] Transaction update error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
\`\`\`

---

## 8. Admin Panel Features

### 8.1 Dashboard Statistics

\`\`\`typescript
// app/api/admin/stats/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get statistics
    const [
      { count: totalUsers },
      { count: totalTransactions },
      { count: pendingTransactions },
      { data: recentTransactions },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('*', { count: 'exact', head: true }),
      supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('transactions')
        .select(`
          *,
          profiles (full_name, username),
          cryptocurrencies (symbol, name)
        `)
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Calculate total volume
    const { data: volumeData } = await supabase
      .from('transactions')
      .select('fiat_amount')
      .eq('status', 'completed')

    const totalVolume = volumeData?.reduce((sum, t) => sum + parseFloat(t.fiat_amount), 0) || 0

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTransactions,
        pendingTransactions,
        totalVolume,
      },
      recentTransactions,
    })

  } catch (error) {
    console.error('[v0] Stats fetch error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
\`\`\`

---

## 9. Rate Management System

### 9.1 Update Exchange Rates

\`\`\`typescript
// app/api/rates/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { cryptoId, buyRate, sellRate, currency = 'NGN' } = await request.json()

    // Expire old rates
    await supabase
      .from('exchange_rates')
      .update({ effective_to: new Date().toISOString() })
      .eq('crypto_id', cryptoId)
      .is('effective_to', null)

    // Create new rate
    const { data: rate, error } = await supabase
      .from('exchange_rates')
      .insert({
        crypto_id: cryptoId,
        buy_rate: buyRate,
        sell_rate: sellRate,
        currency,
        created_by: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('[v0] Rate creation error:', error)
      return NextResponse.json(
        { error: 'Failed to create rate' },
        { status: 500 }
      )
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'rate_updated',
      entity_type: 'exchange_rate',
      entity_id: rate.id,
      new_values: rate,
    })

    return NextResponse.json({
      success: true,
      rate,
    })

  } catch (error) {
    console.error('[v0] Rate update error:', error)
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    )
  }
}
\`\`\`

---

## 10. Security Implementation

### 10.1 Security Checklist

- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ **Rate limiting** on authentication endpoints
- ✅ **Input validation** and sanitization
- ✅ **File upload validation** (magic bytes, size limits)
- ✅ **Disposable email blocking**
- ✅ **Email verification** required before access
- ✅ **Audit logging** for sensitive operations
- ✅ **HTTPS only** in production
- ✅ **Secure password hashing** (handled by Supabase)
- ✅ **CSRF protection** (Next.js built-in)

### 10.2 Environment Variables Security

\`\`\`bash
# .env.local (NEVER commit to git)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_APP_URL=https://bifimoto.com
\`\`\`

Add to `.gitignore`:
\`\`\`
.env.local
.env*.local
\`\`\`

---

## 11. Testing Strategy

### 11.1 Unit Tests

\`\`\`typescript
// __tests__/lib/security.test.ts
import { validateAccountNumber, validateAccountName, sanitizeInput } from '@/lib/security'

describe('Security Utils', () => {
  describe('validateAccountNumber', () => {
    it('should validate correct account number', () => {
      expect(validateAccountNumber('1234567890')).toBe(true)
    })

    it('should reject invalid account number', () => {
      expect(validateAccountNumber('123')).toBe(false)
      expect(validateAccountNumber('12345678901')).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script')
    })

    it('should trim whitespace', () => {
      expect(sanitizeInput('  test  ')).toBe('test')
    })
  })
})
\`\`\`

### 11.2 Integration Tests

\`\`\`typescript
// __tests__/api/auth/signup.test.ts
import { POST } from '@/app/api/auth/signup/route'
import { NextRequest } from 'next/server'

describe('POST /api/auth/signup', () => {
  it('should create user with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'SecurePass123!',
        fullName: 'Test User',
        username: 'testuser',
        privacyPolicyChecked: true,
        termsChecked: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.userId).toBeDefined()
  })

  it('should reject disposable email', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@tempmail.com',
        password: 'SecurePass123!',
        fullName: 'Test User',
        username: 'testuser',
        privacyPolicyChecked: true,
        termsChecked: true,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Disposable email')
  })
})
\`\`\`

### 11.3 E2E Tests (Playwright)

\`\`\`typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should complete sign-up and email verification', async ({ page }) => {
    // Navigate to sign-up page
    await page.goto('/sign-up')

    // Fill form
    await page.fill('input[name="fullName"]', 'Test User')
    await page.fill('input[name="username"]', 'testuser')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'SecurePass123!')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!')
    
    // Accept terms
    await page.check('input[id="privacy-policy"]')
    await page.check('input[id="terms-conditions"]')

    // Submit
    await page.click('button[type="submit"]')

    // Should redirect to verification pending
    await expect(page).toHaveURL('/verification-pending')
  })
})
\`\`\`

---

## 12. Deployment Guide

### 12.1 Vercel Deployment

**Step 1: Connect Repository**
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository

**Step 2: Configure Environment Variables**
\`\`\`bash
# Add in Vercel Dashboard → Settings → Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
RESEND_API_KEY=re_xxx
NEXT_PUBLIC_APP_URL=https://bifimoto.vercel.app
NODE_ENV=production
\`\`\`

**Step 3: Deploy**
1. Click "Deploy"
2. Wait for build to complete
3. Visit your production URL

### 12.2 Custom Domain Setup

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain (e.g., `bifimoto.com`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` environment variable

### 12.3 Supabase Production Configuration

1. Update Supabase Auth settings:
   - Site URL: `https://bifimoto.com`
   - Redirect URLs: `https://bifimoto.com/**`
2. Configure email templates in Supabase Dashboard
3. Set up custom SMTP (optional)

---

## 13. Monitoring & Maintenance

### 13.1 Monitoring Setup

**Vercel Analytics**
\`\`\`typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
\`\`\`

**Supabase Monitoring**
- Database performance: Supabase Dashboard → Database → Performance
- API usage: Supabase Dashboard → API → Usage
- Auth metrics: Supabase Dashboard → Authentication → Users

### 13.2 Backup Strategy

**Database Backups**
- Supabase Pro: Daily automatic backups
- Manual backups: Use `pg_dump` via Supabase CLI

\`\`\`bash
# Manual backup
supabase db dump -f backup.sql

# Restore backup
supabase db reset --db-url postgresql://...
\`\`\`

### 13.3 Maintenance Tasks

**Daily:**
- Monitor transaction queue
- Check for failed transactions
- Review error logs

**Weekly:**
- Update exchange rates
- Review user feedback
- Check system performance

**Monthly:**
- Database optimization
- Security audit
- Backup verification
- Update dependencies

---

## Appendix A: Quick Reference

### Common Commands

\`\`\`bash
# Development
npm run dev

# Build
npm run build

# Start production
npm start

# Supabase
supabase start
supabase db reset
supabase migration new <name>
supabase db push

# Testing
npm test
npm run test:e2e
\`\`\`

### Useful Queries

\`\`\`sql
-- Get pending transactions
SELECT * FROM transactions WHERE status = 'pending' ORDER BY created_at DESC;

-- Get user transaction history
SELECT t.*, c.symbol, c.name 
FROM transactions t
JOIN cryptocurrencies c ON t.crypto_id = c.id
WHERE t.user_id = 'user-uuid'
ORDER BY t.created_at DESC;

-- Get current exchange rates
SELECT er.*, c.symbol, c.name
FROM exchange_rates er
JOIN cryptocurrencies c ON er.crypto_id = c.id
WHERE er.effective_from <= NOW()
AND (er.effective_to IS NULL OR er.effective_to > NOW());
\`\`\`

---

## Appendix B: Troubleshooting

### Common Issues

**Issue: Email verification not working**
- Check `NEXT_PUBLIC_APP_URL` is correct
- Verify Resend API key is valid
- Check Supabase email settings

**Issue: RLS policies blocking queries**
- Ensure user is authenticated
- Check policy conditions match user role
- Enforce admin authorization server-side and in database policies; do not bypass RLS with a service-role key in user-facing operations.

**Issue: Rate limiting too aggressive**
- Adjust interval and limit in `rateLimit()` config
- Consider using Redis for distributed rate limiting

---

**Document Version:** 1.0  
**Last Updated:** January 2025  
**Maintained By:** Bifimoto Engineering Team
