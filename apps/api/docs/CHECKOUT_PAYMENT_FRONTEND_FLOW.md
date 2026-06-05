# Checkout, Place Order, and Frontend Payment Flow

This document describes the current checkout behavior after the Stripe webhook refactor.

## Main Rule

For online Stripe payments, the API does **not** create an order until Stripe confirms that the user paid.

- `cod`: creates an order immediately with pending payment.
- `bank_transfer`: creates an order immediately with awaiting admin confirmation.
- `stripe_checkout`: creates a pending checkout and reserves stock first, then the Stripe webhook creates the order after payment.
- `stripe_intent`: creates a pending checkout and reserves stock first, then the Stripe webhook creates the order after payment.

If a coupon is used with a pending Stripe checkout, the coupon usage is reserved too. Active coupon reservations count against global and per-user coupon limits until the checkout is paid, failed, or expired.

## API Endpoints

### Preview Checkout

`POST /client/checkout/preview`

Use this before payment so the frontend can show server-calculated totals.

Request:

```json
{
  "addressId": 12,
  "couponCode": "SUMMER10"
}
```

### Place Order / Start Payment

`POST /client/checkout/place-order`

Request:

```json
{
  "addressId": 12,
  "paymentMethod": "stripe_checkout",
  "couponCode": "SUMMER10",
  "notes": "Please call before delivery"
}
```

Allowed `paymentMethod` values:

- `cod`
- `bank_transfer`
- `stripe_checkout`
- `stripe_intent`

## Stripe Response

For `stripe_checkout`, this endpoint now returns a pending checkout, not an order:

```json
{
  "checkoutId": "88",
  "orderId": null,
  "orderNumber": null,
  "totalPrice": 123.5,
  "paymentMethod": "stripe_checkout",
  "paymentStatus": "pending",
  "redirectUrl": "https://checkout.stripe.com/..."
}
```

The frontend redirects the user to `redirectUrl`.

For `stripe_intent`, the response can include `clientSecret`:

```json
{
  "checkoutId": "89",
  "orderId": null,
  "orderNumber": null,
  "totalPrice": 123.5,
  "paymentMethod": "stripe_intent",
  "paymentStatus": "pending",
  "clientSecret": "pi_..."
}
```

The frontend should confirm payment with Stripe Elements. The order is still created by webhook only after Stripe confirms payment.

## Stripe Webhook

Webhook endpoint:

`POST /webhooks/stripe`

Configure this URL in the Stripe dashboard. Set `STRIPE_WEBHOOK_SECRET` in the API environment so the backend verifies Stripe signatures.

Handled events:

- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

When Stripe sends a successful payment event:

1. Backend reads `pendingCheckoutId` from Stripe metadata.
2. Backend loads the `PendingCheckout`.
3. Backend checks that reserved stock rows still exist.
4. Backend increments coupon usage.
5. Backend creates the order.
6. Backend creates a completed `PaymentTransaction`.
7. Backend marks stock reservations as `consumed`.
8. Backend marks coupon reservations as `consumed`.
9. Backend clears the cart.
10. Backend marks `PendingCheckout.paymentStatus = "completed"`.

When Stripe sends a failed or expired event:

1. Backend loads the `PendingCheckout`.
2. Backend restores reserved stock to each variant.
3. Backend writes inventory logs with reason `RELEASE`.
4. Backend marks stock reservations as `released`.
5. Backend marks coupon reservations as `released`.
6. Backend cancels the provider payment object when possible, including Stripe PaymentIntents.
7. Backend marks `PendingCheckout.paymentStatus = "failed"` or `"expired"`.

If Stripe never sends an expiry/failure webhook, a scheduled cleanup runs every 5 minutes and releases expired pending checkout reservations.

Stripe Checkout sessions receive an `expires_at` value aligned with the local pending checkout expiration, so the user cannot continue paying through Stripe after the local stock reservation expires.

Manual verification also refuses expired pending checkouts. If `expiresAt` has passed, the backend releases the reservation and returns an expired checkout instead of creating an order.

## Frontend Flow For Stripe Checkout

```ts
const result = await createOrderAction({
  addressId,
  paymentMethod: 'stripe_checkout',
  couponCode,
});

if (!result.ok) {
  setError(result.message);
  return;
}

if (result.data.redirectUrl) {
  window.location.href = result.data.redirectUrl;
}
```

After Stripe redirects back to the success page, do **not** mark the order paid from the frontend. The webhook is the source of truth.

Recommended success page behavior:

- Show "Payment received, preparing your order".
- Poll an order/checkout status endpoint when one exists.
- Or show a message that confirmation may take a few seconds.

## Current Frontend Wiring Notes

Current web files:

- `apps/web/app/[locale]/cart/page.tsx` still uses mock cart items.
- `apps/web/components/cart/step-payment.tsx` simulates payment locally.
- `apps/web/actions/checkout.ts` posts to `/orders`, but it should post to `/checkout/place-order`.

Recommended action:

```ts
type CreateOrderInput = {
  addressId: number;
  paymentMethod: 'cod' | 'bank_transfer' | 'stripe_checkout' | 'stripe_intent';
  couponCode?: string;
  notes?: string;
};

async function createOrderAction(input: CreateOrderInput) {
  const data = await backendPost('/checkout/place-order', input, {
    cache: 'no-store',
    requireAuth: true,
  });

  revalidateCacheTags([cacheTags.cart, cacheTags.orders]);
  return actionSuccess(data, 'Checkout started');
}
```

Do not send `card` or `upi` to the API. Use:

```ts
const METHODS = [
  { id: 'stripe_checkout', label: 'Credit / Debit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'cod', label: 'Cash on Delivery' },
] as const;
```

## Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:3000
```

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/webhooks/stripe
```

Use the API port in the forward URL if your API runs on a different port.

## Manual Payment Verification Fallback

If Stripe webhook delivery is delayed, disabled, or unavailable in a local environment, the frontend can ask the backend to verify the pending checkout directly with the payment provider.

Endpoint:

`POST /client/checkout/verify-payment`

Request:

```json
{
  "checkoutId": "88"
}
```

What it does:

1. Loads the authenticated user's `PendingCheckout`.
2. Uses the stored `transactionRef` to verify the payment with the configured strategy.
3. If the provider says payment is `completed`, creates the real order using the same order creation path as the webhook.
4. If the provider still says `pending` or `failed`, updates the pending checkout status and does not create an order.

Completed response:

```json
{
  "received": true,
  "orderId": "55",
  "orderNumber": "ORD-20260601-12345"
}
```

Pending response:

```json
{
  "checkoutId": "88",
  "orderId": null,
  "paymentStatus": "pending"
}
```

Frontend success page fallback:

```ts
await verifyCheckoutPaymentAction({ checkoutId });
```

The webhook should still be the production source of truth. This endpoint is a fallback for environments where webhook delivery is not available or as a user-facing "refresh payment status" action.

## Admin Order Status Rules

Admin status transitions are restricted:

```ts
const transitions = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
};
```

If an admin cancels an unpaid order:

1. Order status becomes `cancelled`.
2. Pending or awaiting-confirmation payment transactions become `failed`.
3. Stock is restored.

If an admin cancels a paid order:

1. Backend locks the order and calculates the full remaining refundable amount.
2. A cancellation refund attempt is reserved before calling the provider.
3. After refund success, order status becomes `cancelled`, payment status becomes `refunded`, stock is restored, and a status-audit entry is created.
4. If Stripe refund fails or is uncertain, order and stock stay unchanged and payment status becomes `requires_review`.

There is no standalone admin order-refund action. Partial refunds happen only through return/exchange flows. See `docs/order-cancellation-status-audit-flow.md`.
