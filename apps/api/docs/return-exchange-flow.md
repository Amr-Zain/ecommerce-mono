# Return And Exchange Flow

## Shared Rules

- Requests are parent records linked to an order and user, with one or more item rows linked to `order_item`.
- The order must be `delivered`.
- The request must be created within 14 days from `orders.delivered_at`.
- Requested quantity cannot exceed the remaining item quantity after active returns/exchanges.
- Client can cancel only while status is `requested`.
- API responses are transformed to `snake_case` by the response interceptor.
- Request bodies may be sent as `snake_case`; the global pipe converts them to camelCase for DTOs.

## Pricing

Order creation stores these snapshots on every `order_item`:

- `line_subtotal_snapshot = unit_price_snapshot * quantity`
- `coupon_discount_share`
- `net_line_total = line_subtotal_snapshot - coupon_discount_share`
- `net_unit_price = net_line_total / quantity`
- `vat_share`

Coupon allocation:

- Variant/product discount is applied first.
- Coupon is applied after item discount.
- Percentage and fixed coupons are allocated proportionally by discounted line subtotal.
- Rounding remainder is assigned to the largest line.
- Coupon share is capped so it cannot exceed the line subtotal.
- VAT share is allocated by net line total after coupon.

Return refund value:

- Item refund: `net_unit_price * accepted_quantity`
- VAT refund: proportional item VAT share
- Shipping refund: admin controlled, suggested by reason, and capped by the original paid `shipping_fee`
- Final refund transaction amount: item refund + VAT refund + shipping refund
- Admin can reduce item/VAT refunds during receive, but cannot increase any line above the calculated amount.
- If admin reduces a calculated refund or changes the suggested shipping refund, a reason is required.
- The final refund cannot exceed the remaining paid amount after previous refunds.
- Return, exchange, and cancellation refunds share the same remaining-refundable calculation.
- A partial completed return/exchange refund changes the parent order payment status to `partially_refunded`.
- When all completed payment has been refunded, the parent order payment status becomes `refunded`.
- Return/exchange refunds do not change the parent order fulfillment status.

Exchange difference:

- `old_value = old_net_unit_price * quantity`
- `new_value = current_discounted_replacement_unit_price * quantity`
- `price_difference = new_value - old_value`
- `settlement_amount = total_price_difference + replacement_shipping_fee`
- Positive difference means customer must pay.
- Negative difference means customer must be refunded.
- Zero means no money action.
- Replacement shipping is admin controlled. Store-fault reasons default to zero replacement shipping; customer-change reasons default to the original order shipping fee.

## Return Cycle

Statuses:

```txt
requested -> approved -> item_received -> refunded -> completed
requested -> rejected
requested -> cancelled_by_client
```

Client actions:

- `POST /client/returns`
- `GET /client/returns`
- `POST /client/returns/:id/cancel`

Create payload:

```json
{
  "note": "Return two items from the order",
  "items": [
    {
      "order_item_id": "1",
      "quantity": 1,
      "reason": "wrong_size",
      "note": "Size does not fit"
    }
  ]
}
```

Admin actions:

- `GET /admin/returns`
- `GET /admin/returns/:id`
- `POST /admin/returns/:id/approve`
- `POST /admin/returns/:id/reject`
- `POST /admin/returns/:id/receive`
- `POST /admin/returns/:id/refund`
- `POST /admin/returns/:id/complete`

Stock handling:

- No stock is restored when the client creates a return request.
- Stock is restored only when admin marks item received with `item_disposition = restock`.
- Damaged/defective items use `quarantine`, `damaged`, or `discarded` and are not restored to sellable stock.

Refund handling:

- Refund happens after item receipt.
- Admin receive payload must include all request items, with accepted quantity and disposition.
- Admin can adjust item refund down from the calculated value, never above it.
- Admin can set shipping refund up to the original order shipping fee.
- Online payments use the original completed payment transaction.
- COD/bank/manual methods create a manual refund transaction.
- Return can complete only after refund is done or refund is waived.
- Order cancellation is a separate full-remaining-refund flow documented in `docs/order-cancellation-status-audit-flow.md`.

## Exchange Cycle

Statuses:

```txt
requested -> approved -> item_received -> replacement_shipped -> completed
requested -> rejected
requested -> cancelled_by_client
approved -> rejected
requested -> requires_review
```

Price adjustment statuses:

```txt
none
requires_payment -> paid
requires_refund -> refunded
requires_payment/requires_refund -> waived
```

Client actions:

- `POST /client/exchanges`
- `GET /client/exchanges`
- `POST /client/exchanges/:id/cancel`

Create payload:

```json
{
  "note": "Exchange sizes",
  "items": [
    {
      "order_item_id": "1",
      "new_variant_id": "2",
      "quantity": 1,
      "reason": "wrong_size",
      "note": "Need a larger size"
    }
  ]
}
```

Admin actions:

- `GET /admin/exchanges`
- `GET /admin/exchanges/:id`
- `POST /admin/exchanges/:id/approve`
- `POST /admin/exchanges/:id/retry-reservation`
- `POST /admin/exchanges/release-expired`
- `POST /admin/exchanges/:id/reject`
- `POST /admin/exchanges/:id/receive`
- `POST /admin/exchanges/:id/payment`
- `POST /admin/exchanges/:id/verify-payment`
- `POST /admin/exchanges/:id/refund-difference`
- `POST /admin/exchanges/:id/waive-adjustment`
- `POST /admin/exchanges/:id/ship`
- `POST /admin/exchanges/:id/complete`

Replacement stock handling:

- Replacement stock is not deducted when the client creates an exchange request.
- Admin approval checks all replacement quantities first, then reserves replacement stock by decrementing the replacement variant quantity.
- If stock is unavailable at approval, exchange moves to `requires_review`.
- Admin can retry a `requires_review` reservation after stock becomes available.
- Approved reservations have `replacement_expires_at`. The release-expired action releases stock and moves expired exchanges to review.
- If an approved exchange is rejected, reserved replacement stock is released.
- Shipping does not deduct stock again because it was already reserved at approval.

Old item handling:

- If the old item is accepted and disposition is `restock`, old variant stock is incremented on item receipt.
- If the old item is damaged/defective, it is quarantined or discarded and not returned to sellable stock.

Money settlement before shipping/completion:

- Same price: `price_adjustment_status = none`, replacement can ship after item receipt.
- More expensive or paid replacement shipping: `requires_payment`; replacement cannot ship until paid or waived.
- Cheaper after shipping fee: `requires_refund`; replacement cannot ship until refunded or waived.
- Exchange cannot complete until replacement is shipped and price adjustment is settled.
- The admin payment endpoint creates the gateway session for the required difference. The customer must receive and open its redirect URL/client secret in the client application.
- Stripe payment completion must come from the verified Stripe webhook or gateway verification. The dashboard must not manually mark a Stripe payment paid.

## Dashboard

Dashboard sections:

- `/orders`
- `/returns`
- `/exchanges`

The dashboard consumes API response fields as `snake_case`, for example:

- `order_number`
- `payment_status`
- `total_price`
- `final_refund_amount`
- `price_adjustment_status`
- `settlement_amount`

Dashboard return actions call:

- `returns/:id/approve`
- `returns/:id/reject`
- `returns/:id/receive`
- `returns/:id/refund`
- `returns/:id/complete`

Dashboard exchange actions call:

- `exchanges/:id/approve`
- `exchanges/:id/retry-reservation`
- `exchanges/release-expired`
- `exchanges/:id/reject`
- `exchanges/:id/receive`
- `exchanges/:id/refund-difference`
- `exchanges/:id/waive-adjustment`
- `exchanges/:id/ship`
- `exchanges/:id/complete`

The dashboard displays `requires_payment` as awaiting customer payment. It does not expose an admin action that falsely confirms a Stripe payment.
