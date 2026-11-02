-- Project P9 MVP v0.1
-- PostgreSQL schema. Financial amounts use integer centavos to avoid floating-point errors.

CREATE TYPE user_role AS ENUM ('user', 'business_owner', 'admin');
CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended', 'closed');
CREATE TYPE campaign_status AS ENUM ('draft', 'pending_review', 'active', 'paused', 'completed', 'rejected');
CREATE TYPE participant_status AS ENUM ('joined', 'submitted', 'pending_verification', 'verified', 'rejected');
CREATE TYPE transaction_type AS ENUM ('reward', 'adjustment', 'withdrawal', 'refund');
CREATE TYPE transaction_status AS ENUM ('pending', 'available', 'completed', 'reversed');
CREATE TYPE withdrawal_status AS ENUM ('requested', 'reviewing', 'approved', 'paid', 'rejected');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  status account_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES users(id),
  business_name TEXT NOT NULL,
  description TEXT,
  status account_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES businesses(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_centavos BIGINT NOT NULL CHECK (reward_centavos > 0),
  budget_centavos BIGINT NOT NULL CHECK (budget_centavos > 0),
  reserved_centavos BIGINT NOT NULL DEFAULT 0 CHECK (reserved_centavos >= 0),
  slots INTEGER NOT NULL CHECK (slots > 0),
  slots_used INTEGER NOT NULL DEFAULT 0 CHECK (slots_used >= 0),
  status campaign_status NOT NULL DEFAULT 'draft',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (slots_used <= slots),
  CHECK (reserved_centavos <= budget_centavos)
);

CREATE TABLE campaign_participants (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id),
  user_id UUID NOT NULL REFERENCES users(id),
  status participant_status NOT NULL DEFAULT 'joined',
  proof_url TEXT,
  submitted_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES users(id),
  available_centavos BIGINT NOT NULL DEFAULT 0 CHECK (available_centavos >= 0),
  pending_centavos BIGINT NOT NULL DEFAULT 0 CHECK (pending_centavos >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  type transaction_type NOT NULL,
  amount_centavos BIGINT NOT NULL CHECK (amount_centavos > 0),
  status transaction_status NOT NULL,
  reference TEXT UNIQUE,
  campaign_id UUID REFERENCES campaigns(id),
  participant_id UUID REFERENCES campaign_participants(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  amount_centavos BIGINT NOT NULL CHECK (amount_centavos > 0),
  method TEXT NOT NULL,
  account_masked TEXT NOT NULL,
  status withdrawal_status NOT NULL DEFAULT 'requested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE INDEX idx_campaigns_business ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_participants_user ON campaign_participants(user_id);
CREATE INDEX idx_participants_status ON campaign_participants(status);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_withdrawals_user_created ON withdrawals(user_id, created_at DESC);
