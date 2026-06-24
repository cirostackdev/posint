-- AlterTable: add sourceRecords relation to data_sources (no SQL change needed, relation is on SourceRecord side)

-- CreateTable: source_records
CREATE TABLE "source_records" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "content_hash" TEXT NOT NULL,
    "content_type" TEXT NOT NULL,
    "archive_url" TEXT,
    "raw_content" TEXT,
    "http_status" INTEGER,
    "response_headers" JSONB,
    "source_id" UUID,
    "scrape_job_id" TEXT,
    "verified_at" TIMESTAMP(3),
    "dead_since" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable: fact_sources
CREATE TABLE "fact_sources" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "field_name" TEXT,
    "source_record_id" UUID NOT NULL,
    "extraction_method" TEXT,
    "extracted_text" TEXT,
    "confidence" DECIMAL(4,3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fact_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable: fact_history
CREATE TABLE "fact_history" (
    "id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID NOT NULL,
    "field_name" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT NOT NULL,
    "source_record_id" UUID,
    "change_reason" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fact_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "source_records_url_idx" ON "source_records"("url");

-- CreateIndex
CREATE INDEX "source_records_content_hash_idx" ON "source_records"("content_hash");

-- CreateIndex
CREATE INDEX "source_records_source_id_idx" ON "source_records"("source_id");

-- CreateIndex
CREATE INDEX "fact_sources_entity_type_entity_id_idx" ON "fact_sources"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "fact_sources_source_record_id_idx" ON "fact_sources"("source_record_id");

-- CreateIndex
CREATE INDEX "fact_history_entity_type_entity_id_idx" ON "fact_history"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "fact_history_changed_at_idx" ON "fact_history"("changed_at" DESC);

-- AddForeignKey
ALTER TABLE "source_records" ADD CONSTRAINT "source_records_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "data_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fact_sources" ADD CONSTRAINT "fact_sources_source_record_id_fkey" FOREIGN KEY ("source_record_id") REFERENCES "source_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
