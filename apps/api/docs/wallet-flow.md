# Wallet Flow

## Purpose

The wallet stores client credit as a ledger plus balances. It supports online deposit through Stripe and manual withdrawal through admin finance operations.

## Balances

- `available_balance`: money the client can spend or request to withdraw.
- `pending_balance`: money reserved for a withdrawal request that admin has not finished yet.

## Transactions

Every money movement creates a `wallet_transactions` row.

- `deposit`: credit from Stripe/payment gateway.
- `withdrawal`: debit requested by the client and paid manually by admin.
- Future order/refund wallet movements can use `purchase`, `refund`, `adjustment`, `hold`, `release`, or `capture`.

Statuses:

- `pending`: created but not settled.
- `completed`: money movement is final.
- `failed`, `expired`, `cancelled`, `reversed`: terminal non-completed states.
- `requires_review`: payment arrived but transaction data is inconsistent.

## Online Deposit

1. Client calls `POST /client/wallet/deposits` with `amount` and `payment_method`.
2. API creates a pending credit transaction.
3. API creates a Stripe Checkout Session or PaymentIntent with metadata:
   - `purpose = wallet_deposit`
   - `wallet_transaction_id`
   - `wallet_id`
   - `user_id`
4. Stripe calls `POST /webhooks/stripe`.
5. Webhook checks the metadata purpose.
6. If paid, API atomically changes transaction from `pending` to `completed` and increments `available_balance`.
7. If failed/expired, API marks the transaction failed/expired and does not change wallet balance.

Manual verify endpoint:

- `POST /client/wallet/deposits/:id/verify`
- Used when the frontend needs to confirm after redirect or when webhook delivery is delayed.
- It is idempotent. If the transaction is already completed, it returns the completed transaction without crediting twice.
- It must verify the payment with the configured gateway and must never trust a client-only success flag.

Deposit detail endpoint:

- `GET /client/wallet/deposits/:id`
- Returns the authenticated client's deposit transaction and current gateway/payment status.

## Withdrawal

1. Client calls `POST /client/wallet/withdrawals`.
2. API atomically checks `available_balance >= amount`.
3. API moves amount from `available_balance` to `pending_balance`.
4. API creates a pending debit transaction and a `wallet_withdrawal_requests` row.
5. Client can cancel only while status is `requested`.
6. Admin can approve, reject/fail, or mark paid.

Admin actions:

- `approve`: status becomes `approved`; balances do not change.
- `paid`: status becomes `paid`; `pending_balance` decreases and transaction becomes `completed`.
- `reject` or `fail`: pending money returns to `available_balance`; transaction becomes `reversed` or `failed`.

## Queries

Wallet list endpoints use advanced query syntax:

```txt
GET /admin/wallet-transactions?filters[type]=deposit&filters[status]=completed&sort[created_at]=desc
GET /admin/wallet-withdrawals?filters[status]=requested&page=1&limit=10
GET /client/wallet/transactions?filters[direction]=credit
```

API responses are converted to `snake_case` by the response interceptor.
