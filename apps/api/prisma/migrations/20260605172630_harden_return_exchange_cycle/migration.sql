-- AlterTable
ALTER TABLE "exchange_requests" ADD COLUMN     "replacement_expires_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "payment_transactions" ADD COLUMN     "exchange_request_id" BIGINT,
ADD COLUMN     "return_request_id" BIGINT;

-- CreateTable
CREATE TABLE "return_exchange_status_history" (
    "id" BIGSERIAL NOT NULL,
    "return_request_id" BIGINT,
    "exchange_request_id" BIGINT,
    "previous_status" TEXT,
    "new_status" TEXT NOT NULL,
    "actor_type" TEXT NOT NULL,
    "actor_user_id" BIGINT,
    "reason" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "return_exchange_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "return_exchange_status_history_return_request_id_idx" ON "return_exchange_status_history"("return_request_id");

-- CreateIndex
CREATE INDEX "return_exchange_status_history_exchange_request_id_idx" ON "return_exchange_status_history"("exchange_request_id");

-- CreateIndex
CREATE INDEX "return_exchange_status_history_created_at_idx" ON "return_exchange_status_history"("created_at");

-- CreateIndex
CREATE INDEX "payment_transactions_return_request_id_idx" ON "payment_transactions"("return_request_id");

-- CreateIndex
CREATE INDEX "payment_transactions_exchange_request_id_idx" ON "payment_transactions"("exchange_request_id");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_return_request_id_fkey" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_exchange_request_id_fkey" FOREIGN KEY ("exchange_request_id") REFERENCES "exchange_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_exchange_status_history" ADD CONSTRAINT "return_exchange_status_history_return_request_id_fkey" FOREIGN KEY ("return_request_id") REFERENCES "return_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "return_exchange_status_history" ADD CONSTRAINT "return_exchange_status_history_exchange_request_id_fkey" FOREIGN KEY ("exchange_request_id") REFERENCES "exchange_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
