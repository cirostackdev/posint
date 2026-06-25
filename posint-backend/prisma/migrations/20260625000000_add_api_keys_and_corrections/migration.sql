-- CreateEnum
CREATE TYPE "ApiTier" AS ENUM ('FREE', 'RESEARCHER', 'INSTITUTIONAL');

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "ApiTier" NOT NULL DEFAULT 'FREE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_used_at" TIMESTAMP(3),
    "request_count" INTEGER NOT NULL DEFAULT 0,
    "daily_limit" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "correction_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "field_name" TEXT NOT NULL,
    "current_value" TEXT NOT NULL,
    "proposed_value" TEXT NOT NULL,
    "evidence" TEXT,
    "submitter_name" TEXT NOT NULL,
    "submitter_email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "review_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "correction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");
CREATE INDEX "api_keys_key_idx" ON "api_keys"("key");
CREATE INDEX "api_keys_user_id_idx" ON "api_keys"("user_id");
CREATE INDEX "correction_requests_status_idx" ON "correction_requests"("status");
CREATE INDEX "correction_requests_entity_idx" ON "correction_requests"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
