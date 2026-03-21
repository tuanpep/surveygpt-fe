// ── Billing Types ──────────────────────────────────────────────────────────────

export interface PlanLimits {
  surveys: number;       // -1 = unlimited
  responses: number;
  members: number;
  emailCampaigns: number;
  aiCredits: number;
  fileUploadSize: number; // MB
  customBranding: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
  prioritySupport: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  limits: PlanLimits;
  features: string[];
  popular?: boolean;
}

export interface PlanUsage {
  surveys: number;
  responses: number;
  members: number;
  emailCampaigns: number;
  aiCredits: number;
}

export interface PlanInfo {
  currentPlan: Plan;
  usage: PlanUsage;
  billingPeriod: 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'void';
  date: string;
  plan: string;
  invoiceUrl?: string;
}

export interface ChangePlanInput {
  planId: string;
  billingPeriod: 'monthly' | 'yearly';
}

export interface ChangePlanOutput {
  checkoutUrl: string;
}
