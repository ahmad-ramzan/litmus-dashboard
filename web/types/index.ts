export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'SUSPENDED' | 'PENDING';
export type UserType = 'PROFESSIONAL' | 'BUSINESS' | 'ADMIN';
export type VerificationLevel = 'LEVEL_0' | 'LEVEL_1' | 'LEVEL_2';
export type ShiftStatus = 'OPEN' | 'PENDING' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'FLAGGED';
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_DOCS';
export type ReviewStatus = 'APPROVED' | 'PENDING' | 'FLAGGED' | 'REJECTED';
export type EntityType = 'PROFESSIONAL' | 'BUSINESS';
export type AdminRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'SHIFT_COORDINATOR'
  | 'CREDENTIALING_MANAGER'
  | 'SUPPORT_AGENT'
  | 'FINANCE_MANAGER';

export interface User {
  user_id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile_image_url: string;
  joined_date: string;
  last_active: string;
  status: UserStatus;
  user_type: UserType;
  role: string;
  verification_level: VerificationLevel;
  rating: number;
  review_count: number;
  ban_reason?: string;
}

export interface Professional {
  professional_id: string;
  title: string;
  primary_role: string;
  specialty: string;
  year_of_experience: string;
  certifications: string[];
  about_me: string;
  license_number: string;
  license_expiry: string;
  license_verified: boolean;
  government_id_verified: boolean;
  users?: User;
}

export interface Business {
  business_id: string;
  business_name: string;
  email: string;
  phone_number: string;
  business_type: string;
  business_logo_url: string;
  country: string;
  status: UserStatus;
  verification_level: VerificationLevel;
  rating: number;
  review_count: number;
  government_id_verified: boolean;
  business_registration_verified: boolean;
  business_license_verified: boolean;
  business_specialties: string[];
  business_areas: string[];
  about_business: string;
  joined_date: string;
  last_active: string;
  admin_user_id: string;
}

export interface Shift {
  shift_id: string;
  shift_title: string;
  business_id: string;
  professional_id: string;
  location: string;
  shift_date: string;
  shift_start_time: string;
  shift_end_time: string;
  duration_hours: number;
  status: ShiftStatus;
  shift_type: string;
  job_types: string[];
  verification_level_required: number;
  qualifications_required: string[];
  required_skills: string[];
  contact_person_name: string;
  contact_person_email: string;
  additional_info: string;
  pay_rate: number;
  pay_type: string;
  payment_methods: string[];
  payment_timeline: string;
  request_document_uploads: boolean;
  flexible_rate_allowed: boolean;
  applicant_count: number;
  is_boosted: boolean;
  created_at: string;
  businesses?: Pick<Business, 'business_id' | 'business_name' | 'business_logo_url'>;
  professionals?: Pick<Professional, 'professional_id'> & { users?: Pick<User, 'first_name' | 'last_name' | 'profile_image_url'> };
}

export interface Verification {
  verification_id: string;
  user_id: string;
  business_id: string;
  verification_type: string;
  verification_level: string;
  document_url: string;
  document_status: DocumentStatus;
  submitted_at: string;
  verified_at: string;
  rejection_reason: string;
  users?: Pick<User, 'user_id' | 'first_name' | 'last_name' | 'email' | 'profile_image_url' | 'last_active'>;
  businesses?: Pick<Business, 'business_id' | 'business_name' | 'email'>;
}

export interface Review {
  review_id: string;
  reviewer_id: string;
  professional_id: string;
  business_id: string;
  entity_type: EntityType;
  rating: number;
  comment: string;
  helpful_count: number;
  review_date: string;
  status: ReviewStatus;
  users?: Pick<User, 'user_id' | 'first_name' | 'last_name' | 'profile_image_url'>;
  professionals?: { primary_role: string; users?: Pick<User, 'first_name' | 'last_name'> };
  businesses?: Pick<Business, 'business_id' | 'business_name'>;
}

export interface AdminUser {
  admin_id: string;
  admin_role: AdminRole;
  permissions: string[];
  assigned_at: string;
  users?: User;
}

export interface DashboardMetrics {
  activeUsers: number;
  shiftsToday: number;
  platformRevenue: number;
  pendingVerifications: number;
}

export interface RevenueData {
  month: string;
  subscription: number;
  advertisement: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  message: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
