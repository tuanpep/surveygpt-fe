import { api } from './api';
import type {
  PlanInfo,
  Plan,
  Invoice,
  ChangePlanInput,
  ChangePlanOutput,
} from '@/types/billing';

export async function getPlanInfo(): Promise<PlanInfo> {
  return api.get('billing/plan').json<PlanInfo>();
}

export async function getPlans(): Promise<Plan[]> {
  return api.get('billing/plans').json<Plan[]>();
}

export async function changePlan(input: ChangePlanInput): Promise<ChangePlanOutput> {
  return api.post('billing/change-plan', { json: input }).json<ChangePlanOutput>();
}

export async function getPortalUrl(): Promise<{ url: string }> {
  return api.get('billing/portal').json<{ url: string }>();
}

export async function getInvoiceHistory(): Promise<Invoice[]> {
  return api.get('billing/history').json<Invoice[]>();
}
