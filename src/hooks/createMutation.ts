import { useMutation, useQueryClient } from '@tanstack/react-query';

type QueryKey = string | string[];

/**
 * Create a mutation hook that automatically invalidates query cache keys on success.
 *
 * @example
 * // Single key
 * useOptimisticMutation({
 *   mutationFn: (id: string) => deleteSurvey(id),
 *   invalidateKeys: ['surveys'],
 * });
 *
 * @example
 * // Multiple keys
 * useOptimisticMutation({
 *   mutationFn: (id: string) => publishSurvey(id),
 *   invalidateKeys: [['surveys'], ['survey', id]],
 * });
 *
 * @example
 * // Dynamic keys based on input
 * useOptimisticMutation({
 *   mutationFn: (id: string) => updateSurvey(id, input),
 *   invalidateKeys: (id) => [['survey', id], ['surveys']],
 * });
 */
export function useOptimisticMutation<TInput, TData = unknown>(options: {
  mutationFn: (input: TInput) => Promise<TData>;
  invalidateKeys?: QueryKey[] | ((input: TInput, data: TData) => QueryKey[]);
  onSuccess?: (data: TData, input: TInput) => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: options.mutationFn,
    onSuccess: (data, input) => {
      if (options.invalidateKeys) {
        const keys = typeof options.invalidateKeys === 'function'
          ? options.invalidateKeys(input, data)
          : options.invalidateKeys;
        keys.forEach((key) => {
          const queryKey = Array.isArray(key) ? key : [key];
          queryClient.invalidateQueries({ queryKey });
        });
      }
      options.onSuccess?.(data, input);
    },
  });
}
