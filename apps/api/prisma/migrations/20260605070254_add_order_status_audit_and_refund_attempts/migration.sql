-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "idempotency_key" TEXT,
ADD COLUMN     "refund_reason" TEXT,
ADD COLUMN     "refund_source" TEXT,
ADD COLUMN     "requested_by_id" BIGINT;

-- CreateTable
CREATE TABLE "order_status_history" (
    "id" BIGSERIAL NOT NULL,
    "order_id" BIGINT NOT NULL,
    "previous_status" TEXT,
    "new_status" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_user_id" BIGINT,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_status_history_order_id_idx" ON "order_status_history"("order_id");

-- CreateIndex
CREATE INDEX "order_status_history_new_status_idx" ON "order_status_history"("new_status");

-- CreateIndex
CREATE INDEX "order_status_history_created_at_idx" ON "order_status_history"("created_at");

-- CreateIndex
CREATE INDEX "payment_transactions_idempotency_key_idx" ON "payment_transactions"("idempotency_key");

-- AddForeignKey
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
