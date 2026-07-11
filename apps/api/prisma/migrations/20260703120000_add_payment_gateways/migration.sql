CREATE TABLE "payment_gateways" (
  "id" BIGSERIAL PRIMARY KEY,
  "identifier" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "image" TEXT,
  "icon" TEXT,
  "environment" TEXT NOT NULL DEFAULT 'test',
  "priority" INTEGER NOT NULL DEFAULT 100,
  "is_active" BOOLEAN NOT NULL DEFAULT false,
  "public_settings" JSONB NOT NULL DEFAULT '{}',
  "secret_settings" JSONB NOT NULL DEFAULT '{}',
  "enabled_methods" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "supported_countries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "supported_currencies" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "payment_gateways_identifier_key" ON "payment_gateways"("identifier");
CREATE INDEX "payment_gateways_provider_idx" ON "payment_gateways"("provider");
CREATE INDEX "payment_gateways_is_active_idx" ON "payment_gateways"("is_active");
CREATE INDEX "payment_gateways_priority_idx" ON "payment_gateways"("priority");

CREATE TABLE "payment_sessions" (
  "id" BIGSERIAL PRIMARY KEY,
  "gateway_id" BIGINT,
  "provider_identifier" TEXT NOT NULL,
  "payment_method" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'SAR',
  "transaction_ref" TEXT,
  "session_key" TEXT,
  "checkout_url" TEXT,
  "failure_reason" TEXT,
  "provider_response" JSONB,
  "sdk_parameters" JSONB,
  "metadata" JSONB,
  "pending_checkout_id" BIGINT,
  "order_id" BIGINT,
  "wallet_transaction_id" BIGINT,
  "return_request_id" BIGINT,
  "exchange_request_id" BIGINT,
  "expires_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "payment_sessions_gateway_id_fkey"
    FOREIGN KEY ("gateway_id") REFERENCES "payment_gateways"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "payment_sessions_gateway_id_idx" ON "payment_sessions"("gateway_id");
CREATE INDEX "payment_sessions_provider_identifier_idx" ON "payment_sessions"("provider_identifier");
CREATE INDEX "payment_sessions_payment_method_idx" ON "payment_sessions"("payment_method");
CREATE INDEX "payment_sessions_status_idx" ON "payment_sessions"("status");
CREATE INDEX "payment_sessions_transaction_ref_idx" ON "payment_sessions"("transaction_ref");
CREATE INDEX "payment_sessions_pending_checkout_id_idx" ON "payment_sessions"("pending_checkout_id");
CREATE INDEX "payment_sessions_order_id_idx" ON "payment_sessions"("order_id");
CREATE INDEX "payment_sessions_wallet_transaction_id_idx" ON "payment_sessions"("wallet_transaction_id");
CREATE INDEX "payment_sessions_return_request_id_idx" ON "payment_sessions"("return_request_id");
CREATE INDEX "payment_sessions_exchange_request_id_idx" ON "payment_sessions"("exchange_request_id");
