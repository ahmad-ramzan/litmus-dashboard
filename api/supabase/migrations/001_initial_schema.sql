-- Litmus Platform - Initial Schema
-- Run this in your Supabase SQL editor

-- Enums
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'BANNED', 'SUSPENDED', 'PENDING');
CREATE TYPE user_type AS ENUM ('PROFESSIONAL', 'BUSINESS', 'ADMIN');
CREATE TYPE verification_level AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2');
CREATE TYPE shift_status AS ENUM ('OPEN', 'PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED', 'FLAGGED');
CREATE TYPE shift_type_enum AS ENUM ('INSTANT_ACCEPT', 'ACCEPT_PENDING_REVIEW');
CREATE TYPE pay_type AS ENUM ('PER_HOUR', 'PER_SESSION');
CREATE TYPE document_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'REQUEST_MORE_DOCS');
CREATE TYPE entity_type AS ENUM ('PROFESSIONAL', 'BUSINESS');
CREATE TYPE review_status AS ENUM ('APPROVED', 'PENDING', 'FLAGGED', 'REJECTED');
CREATE TYPE admin_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SHIFT_COORDINATOR', 'CREDENTIALING_MANAGER', 'SUPPORT_AGENT', 'FINANCE_MANAGER');

-- Users table (base for all user types)
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone_number VARCHAR(20),
  profile_image_url TEXT,
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ,
  status user_status DEFAULT 'PENDING',
  user_type user_type NOT NULL,
  role VARCHAR(100),
  verification_level verification_level DEFAULT 'LEVEL_0',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  ban_reason TEXT,
  refresh_token_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Professionals table (extends users)
CREATE TABLE professionals (
  professional_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  title VARCHAR(20),
  primary_role VARCHAR(100),
  specialty VARCHAR(100),
  year_of_experience VARCHAR(10),
  certifications TEXT[],
  about_me TEXT,
  license_number VARCHAR(100),
  license_expiry DATE,
  license_verified BOOLEAN DEFAULT FALSE,
  license_document_url TEXT,
  government_id_verified BOOLEAN DEFAULT FALSE,
  government_id_number VARCHAR(100),
  government_id_document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Businesses table
CREATE TABLE businesses (
  business_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20),
  business_type VARCHAR(100),
  business_logo_url TEXT,
  country VARCHAR(100),
  year_established VARCHAR(10),
  status user_status DEFAULT 'PENDING',
  verification_level verification_level DEFAULT 'LEVEL_0',
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  government_id_verified BOOLEAN DEFAULT FALSE,
  government_id_document_url TEXT,
  business_registration_verified BOOLEAN DEFAULT FALSE,
  business_registration_document_url TEXT,
  business_license_verified BOOLEAN DEFAULT FALSE,
  business_license_document_url TEXT,
  website_url TEXT,
  business_specialties TEXT[],
  business_areas TEXT[],
  about_business TEXT,
  joined_date TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ,
  admin_user_id UUID REFERENCES users(user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts table
CREATE TABLE shifts (
  shift_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_title VARCHAR(255) NOT NULL,
  business_id UUID REFERENCES businesses(business_id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(professional_id),
  location TEXT,
  shift_date DATE,
  shift_start_time TIME,
  shift_end_time TIME,
  duration_hours DECIMAL(4,2),
  status shift_status DEFAULT 'OPEN',
  shift_type shift_type_enum DEFAULT 'ACCEPT_PENDING_REVIEW',
  job_types TEXT[],
  verification_level_required INTEGER DEFAULT 1,
  qualifications_required TEXT[],
  required_skills TEXT[],
  contact_person_name VARCHAR(100),
  contact_person_email VARCHAR(255),
  additional_info TEXT,
  pay_rate DECIMAL(10,2),
  pay_type pay_type DEFAULT 'PER_HOUR',
  payment_methods TEXT[],
  payment_timeline VARCHAR(50),
  request_document_uploads BOOLEAN DEFAULT FALSE,
  flexible_rate_allowed BOOLEAN DEFAULT FALSE,
  applicant_count INTEGER DEFAULT 0,
  assigned_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  is_boosted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verifications table
CREATE TABLE verifications (
  verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  business_id UUID REFERENCES businesses(business_id),
  verification_type VARCHAR(100) NOT NULL,
  verification_level VARCHAR(50),
  document_url TEXT,
  document_status document_status DEFAULT 'PENDING',
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  verified_by_admin_id UUID REFERENCES users(user_id),
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES users(user_id),
  professional_id UUID REFERENCES professionals(professional_id),
  business_id UUID REFERENCES businesses(business_id),
  entity_type entity_type NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  helpful_count INTEGER DEFAULT 0,
  review_date TIMESTAMPTZ DEFAULT NOW(),
  status review_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE admin_users (
  admin_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  admin_role admin_role NOT NULL,
  permissions TEXT[],
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard metrics table
CREATE TABLE dashboard_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  active_users_count INTEGER DEFAULT 0,
  shifts_posted_today INTEGER DEFAULT 0,
  platform_revenue DECIMAL(12,2) DEFAULT 0,
  pending_verifications INTEGER DEFAULT 0,
  month VARCHAR(3),
  subscription_revenue DECIMAL(12,2) DEFAULT 0,
  advertisement_revenue DECIMAL(12,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_business_id ON shifts(business_id);
CREATE INDEX idx_shifts_professional_id ON shifts(professional_id);
CREATE INDEX idx_verifications_document_status ON verifications(document_status);
CREATE INDEX idx_verifications_user_id ON verifications(user_id);
CREATE INDEX idx_reviews_entity_type ON reviews(entity_type);
CREATE INDEX idx_reviews_status ON reviews(status);

-- Seed sample dashboard metrics (12 months)
INSERT INTO dashboard_metrics (month, subscription_revenue, advertisement_revenue, recorded_at) VALUES
  ('Jan', 12000, 4500, '2025-01-31'),
  ('Feb', 13500, 5200, '2025-02-28'),
  ('Mar', 11000, 6100, '2025-03-31'),
  ('Apr', 15000, 7000, '2025-04-30'),
  ('May', 16500, 5800, '2025-05-31'),
  ('Jun', 14000, 8200, '2025-06-30'),
  ('Jul', 18000, 9100, '2025-07-31'),
  ('Aug', 17500, 7600, '2025-08-31'),
  ('Sep', 19000, 8900, '2025-09-30'),
  ('Oct', 21000, 10200, '2025-10-31'),
  ('Nov', 22500, 11000, '2025-11-30'),
  ('Dec', 25000, 12500, '2025-12-31');
