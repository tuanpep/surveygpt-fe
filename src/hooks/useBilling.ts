import { useQuery } from '@tanstack/react-query';
import {
  getPlanInfo,
  getPlans,
  changePlan,
  getPortalUrl,
  getInvoiceHistory,
} from '@/services/billing';
import type { ChangePlanInput } from '@/types/billing';
import { useOptimisticMutation } from './createMutation';

export function usePlanInfo() {
  return useQuery({
    queryKey: ['billing', 'plan-info'],
    queryFn: getPlanInfo,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: ['billing', 'plans'],
    queryFn: getPlans,
  });
}

export function useChangePlan() {
  return useOptimisticMutation<ChangePlanInput>({
    mutationFn: (input) => changePlan(input),
    invalidateKeys: [['billing']],
  });
}

export function useBillingPortal() {
  return useOptimisticMutation<void, { url: string }>({
    mutationFn: () => getPortalUrl(),
  });
}

export function useInvoiceHistory() {
  return useQuery({
    queryKey: ['billing', 'invoices'],
    queryFn: getInvoiceHistory,
  });
}
