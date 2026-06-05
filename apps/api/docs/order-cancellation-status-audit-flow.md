# Order Cancellation And Status Audit Flow

## Core Rules

- Order cancellation is allowed only before shipping.
- Client can cancel only while order status is `pending`.
- Admin can cancel while order status is `pending` or `processing`.
- `shipped`, `delivered`, `cancelled`, and legacy `refunded` orders cannot be cancelled.
- There is no standalone admin order-refund endpoint.
- Partial refunds happen only through return refunds or exchange price-difference refunds.
- API responses are converted to `snake_case`.

## Status Transitions

Admin transitions:

```txt
pending -> processing | cancelled
processing -> shipped | cancelled
shipped -> delivered
delivered -> no transition
cancelled -> no transition
refunded -> legacy read-only
```

Client transition:

```txt
pending -> cancelled
```

## Cancellation Flow

Cancellation is a single business operation:

1. Lock the order row.
2. Validate that the actor can cancel the current order status.
3. Calculate:
   - `original_paid_amount`
   - `refunded_amount`
   - `reserved_refund_amount`
   - `remaining_refundable_amount`
4. If payment remains, reserve the full remaining amount with a cancellation refund transaction.
5. Call the payment strategy.
6. Only after refund success:
   - mark the refund transaction `refunded`
   - restore all order item stock once
   - fail pending/awaiting-confirmation payment transactions
   - change order status to `cancelled`
   - create the cancellation status-audit entry.

Cancellation never performs a partial refund. If a return previously refunded part of the payment, cancellation refunds only the remaining amount.

## Payment Methods

### Stripe

- Cancellation refund uses the original completed Stripe transaction.
- Stripe receives a stable idempotency key for retry safety.
- While Stripe refund is processing, order payment status is `processing_payment`.
- If Stripe refund fails or is uncertain:
  - refund transaction becomes `requires_review`
  - order payment status becomes `requires_review`
  - order status and stock remain unchanged
  - admin can retry using:

```txt
POST /admin/orders/:orderId/cancellation-refunds/:refundId/retry
```

### COD And Bank Transfer

- Payment strategies record the manual refund as completed.
- Cancellation then restores stock and moves the order to `cancelled`.

## Partial Return And Exchange Refunds

- Partial refund transactions are created only by return/exchange flows.
- Every refund shares the same remaining-refundable ceiling.
- Parent order payment status becomes:
  - `completed`: no completed refunds
  - `partially_refunded`: some payment was refunded
  - `refunded`: all completed payment was refunded.
- Return/exchange refunds do not change the order fulfillment status.

## Status Audit

Every new order receives an initial status-history entry.

Every later fulfillment status change writes an `order_status_history` entry in the same database transaction as the status update:

- `previous_status`
- `new_status`
- `actor_type`: `client`, `admin`, or `system`
- `actor_user_id`
- `reason`
- `metadata`
- `created_at`

Admin order detail returns the complete timeline. Client order detail returns only safe timeline fields:

```json
{
  "status_history": [
    {
      "new_status": "pending",
      "created_at": "2026-06-05T07:00:00.000Z"
    }
  ]
}
```

## Admin API

```txt
GET   /admin/orders
GET   /admin/orders/:id
PATCH /admin/orders/:id/status
POST  /admin/orders/:id/confirm-payment
POST  /admin/orders/:orderId/cancellation-refunds/:refundId/retry
```

Cancel payload:

```json
{
  "status": "cancelled",
  "reason": "Customer requested cancellation before shipment"
}
```

Order detail includes:

```json
{
  "original_paid_amount": 500,
  "refunded_amount": 100,
  "reserved_refund_amount": 0,
  "remaining_refundable_amount": 400,
  "status_history": []
}
```

## Client API

```txt
GET  /client/orders
GET  /client/orders/:id
POST /client/orders/:id/cancel
```

Client cancel payload:

```json
{
  "reason": "Changed my mind"
}
```
