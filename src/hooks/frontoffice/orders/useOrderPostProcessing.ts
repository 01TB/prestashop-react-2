import { useCallback } from 'react';

/**
 * Hook to post-process an order:
 * - Delete order_payments by reference
 * - Delete order_invoices by id
 * - Set current_state to 13
 */
export function useOrderPostProcessing() {
  const processOrder = useCallback(async (orderId: number): Promise<void> => {
    const { postProcessOrder } = await import(
      '../../../services/frontoffice/orders/orderPostProcessingService'
    );
    await postProcessOrder(orderId);
  }, []);

  return { processOrder };
}
