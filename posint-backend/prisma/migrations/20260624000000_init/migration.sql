-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'EDITOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "chamber" AS ENUM ('SENATE', 'HOUSE_OF_REPRESENTATIVES');

-- CreateEnum
CREATE TYPE "Vote" AS ENUM ('YES', 'NO', 'ABSTAIN', 'ABSENT');

-- CreateEnum
CREATE TYPE "BillStatus" AS ENUM ('FIRST_READING', 'SECOND_READING', 'THIRD_READING', 'PASSED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('NOT_STARTED', 'ONGOING', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ElectionLevel" AS ENUM ('FEDERAL', 'STATE', 'LOCAL_GOVERNMENT', 'PARTY_PRIMARY');

-- CreateEnum
CREATE TYPE "CaseStatus" AS ENUM ('UNDER_INVESTIGATION', 'ONGOING', 'CONVICTED', 'ACQUITTED', 'DISMISSED', 'APPEALING');

-- CreateEnum
CREATE TYPE "Agency" AS ENUM ('EFCC', 'ICPC', 'CCB', 'NFIU');

-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('TWITTER', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEGATIVE', 'NEUTRAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "avatar_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "refresh_token" TEXT,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_watchlists" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_watchlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "political_parties" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6B7280',
    "logo_url" TEXT,
    "founded_year" INTEGER,
    "ideology" TEXT,
    "chairman" TEXT,
    "headquarters" TEXT,
    "website_url" TEXT,
    "seats_total" INTEGER NOT NULL DEFAULT 0,
    "senate_seats" INTEGER NOT NULL DEFAULT 0,
    "house_seats" INTEGER NOT NULL DEFAULT 0,
    "governors" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "political_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "politicians" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "party_id" UUID,
    "position" TEXT NOT NULL,
    "chamber" "chamber",
    "constituency" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lga" TEXT,
    "photo_url" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT,
    "education" TEXT,
    "biography" TEXT,
    "first_elected" INTEGER,
    "current_term_start" INTEGER,
    "years_in_office" INTEGER NOT NULL DEFAULT 0,
    "bills_sponsored" INTEGER NOT NULL DEFAULT 0,
    "attendance_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "politicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "politician_contacts" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "office_address" TEXT,
    "website" TEXT,
    "twitter_handle" TEXT,
    "facebook_url" TEXT,
    "instagram_handle" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "politician_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting_records" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "bill_title" TEXT NOT NULL,
    "bill_id" UUID,
    "vote" "Vote" NOT NULL,
    "session_date" DATE NOT NULL,
    "bill_status" "BillStatus",
    "session_id" TEXT,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voting_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sponsored_bills" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "status" "BillStatus" NOT NULL DEFAULT 'FIRST_READING',
    "chamber" "chamber" NOT NULL,
    "date_introduced" DATE NOT NULL,
    "date_passed" DATE,
    "co_sponsors" INTEGER NOT NULL DEFAULT 0,
    "full_text_url" TEXT,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sponsored_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bill_readings" (
    "id" UUID NOT NULL,
    "bill_id" UUID NOT NULL,
    "reading_number" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "outcome" TEXT NOT NULL,
    "votes_for" INTEGER,
    "votes_against" INTEGER,
    "votes_abstain" INTEGER,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bill_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_declarations" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimated_value_kobo" BIGINT NOT NULL,
    "year_declared" INTEGER NOT NULL,
    "source_document_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constituency_projects" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "budget_kobo" BIGINT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "year" INTEGER NOT NULL,
    "completion_pct" INTEGER NOT NULL DEFAULT 0,
    "contractor" TEXT,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constituency_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_defections" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "from_party_id" UUID,
    "to_party_id" UUID,
    "defection_date" DATE NOT NULL,
    "reason" TEXT,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "party_defections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_events" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "career_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "committee_assignments" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "committee_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Member',
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "chamber" "chamber" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "committee_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elections" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "level" "ElectionLevel" NOT NULL,
    "state" TEXT,
    "lga" TEXT,
    "ward" TEXT,
    "winner_name" TEXT NOT NULL,
    "winner_party_id" UUID,
    "winner_votes" INTEGER NOT NULL,
    "total_votes" INTEGER NOT NULL,
    "registered_voters" INTEGER,
    "turnout_pct" DECIMAL(5,2),
    "margin" TEXT,
    "declared_date" DATE,
    "source_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_candidates" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "candidate_name" TEXT NOT NULL,
    "party_id" UUID,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "election_candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corruption_cases" (
    "id" UUID NOT NULL,
    "politician_id" UUID,
    "politician_name" TEXT NOT NULL,
    "agency" "Agency" NOT NULL,
    "case_number" TEXT,
    "charges" TEXT NOT NULL,
    "amount_involved_kobo" BIGINT,
    "amount_recovered_kobo" BIGINT NOT NULL DEFAULT 0,
    "status" "CaseStatus" NOT NULL DEFAULT 'UNDER_INVESTIGATION',
    "court" TEXT,
    "judge" TEXT,
    "filing_date" DATE,
    "verdict_date" DATE,
    "sentence" TEXT,
    "description" TEXT NOT NULL,
    "source_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "corruption_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_mentions" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT,
    "published_at" TIMESTAMP(3) NOT NULL,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'NEUTRAL',
    "sentiment_score" DECIMAL(4,3),
    "engagement_total" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "is_by_politician" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_mentions" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "mention_count" INTEGER NOT NULL DEFAULT 1,
    "avg_sentiment" DECIMAL(4,3) NOT NULL DEFAULT 0,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_mentions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "politician_social_stats" (
    "id" UUID NOT NULL,
    "politician_id" UUID NOT NULL,
    "overall_sentiment" DECIMAL(4,3) NOT NULL DEFAULT 0,
    "total_mentions" INTEGER NOT NULL DEFAULT 0,
    "follower_count" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "last_computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "politician_social_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "last_scraped_at" TIMESTAMP(3),
    "last_success_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "error_count" INTEGER NOT NULL DEFAULT 0,
    "records_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "table_name" TEXT NOT NULL,
    "record_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "changed_by" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_watchlists_user_id_politician_id_key" ON "user_watchlists"("user_id", "politician_id");

-- CreateIndex
CREATE UNIQUE INDEX "political_parties_abbreviation_key" ON "political_parties"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "political_parties_slug_key" ON "political_parties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "politicians_slug_key" ON "politicians"("slug");

-- CreateIndex
CREATE INDEX "politicians_party_id_idx" ON "politicians"("party_id");

-- CreateIndex
CREATE INDEX "politicians_state_idx" ON "politicians"("state");

-- CreateIndex
CREATE INDEX "politicians_chamber_idx" ON "politicians"("chamber");

-- CreateIndex
CREATE INDEX "politicians_is_active_idx" ON "politicians"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "politician_contacts_politician_id_key" ON "politician_contacts"("politician_id");

-- CreateIndex
CREATE INDEX "voting_records_politician_id_idx" ON "voting_records"("politician_id");

-- CreateIndex
CREATE INDEX "voting_records_session_date_idx" ON "voting_records"("session_date" DESC);

-- CreateIndex
CREATE INDEX "sponsored_bills_politician_id_idx" ON "sponsored_bills"("politician_id");

-- CreateIndex
CREATE INDEX "sponsored_bills_status_idx" ON "sponsored_bills"("status");

-- CreateIndex
CREATE INDEX "sponsored_bills_chamber_idx" ON "sponsored_bills"("chamber");

-- CreateIndex
CREATE INDEX "sponsored_bills_date_introduced_idx" ON "sponsored_bills"("date_introduced" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "bill_readings_bill_id_reading_number_key" ON "bill_readings"("bill_id", "reading_number");

-- CreateIndex
CREATE INDEX "bill_readings_bill_id_idx" ON "bill_readings"("bill_id");

-- CreateIndex
CREATE INDEX "asset_declarations_politician_id_idx" ON "asset_declarations"("politician_id");

-- CreateIndex
CREATE INDEX "asset_declarations_year_declared_idx" ON "asset_declarations"("year_declared" DESC);

-- CreateIndex
CREATE INDEX "constituency_projects_politician_id_idx" ON "constituency_projects"("politician_id");

-- CreateIndex
CREATE INDEX "constituency_projects_status_idx" ON "constituency_projects"("status");

-- CreateIndex
CREATE INDEX "party_defections_politician_id_idx" ON "party_defections"("politician_id");

-- CreateIndex
CREATE INDEX "party_defections_defection_date_idx" ON "party_defections"("defection_date" DESC);

-- CreateIndex
CREATE INDEX "career_events_politician_id_idx" ON "career_events"("politician_id");

-- CreateIndex
CREATE INDEX "career_events_year_idx" ON "career_events"("year" DESC);

-- CreateIndex
CREATE INDEX "committee_assignments_politician_id_idx" ON "committee_assignments"("politician_id");

-- CreateIndex
CREATE INDEX "elections_year_idx" ON "elections"("year" DESC);

-- CreateIndex
CREATE INDEX "elections_level_idx" ON "elections"("level");

-- CreateIndex
CREATE INDEX "elections_state_idx" ON "elections"("state");

-- CreateIndex
CREATE INDEX "elections_winner_party_id_idx" ON "elections"("winner_party_id");

-- CreateIndex
CREATE INDEX "election_candidates_election_id_idx" ON "election_candidates"("election_id");

-- CreateIndex
CREATE INDEX "corruption_cases_politician_id_idx" ON "corruption_cases"("politician_id");

-- CreateIndex
CREATE INDEX "corruption_cases_agency_idx" ON "corruption_cases"("agency");

-- CreateIndex
CREATE INDEX "corruption_cases_status_idx" ON "corruption_cases"("status");

-- CreateIndex
CREATE INDEX "corruption_cases_filing_date_idx" ON "corruption_cases"("filing_date" DESC);

-- CreateIndex
CREATE INDEX "social_mentions_politician_id_idx" ON "social_mentions"("politician_id");

-- CreateIndex
CREATE INDEX "social_mentions_published_at_idx" ON "social_mentions"("published_at" DESC);

-- CreateIndex
CREATE INDEX "social_mentions_platform_idx" ON "social_mentions"("platform");

-- CreateIndex
CREATE INDEX "social_mentions_sentiment_idx" ON "social_mentions"("sentiment");

-- CreateIndex
CREATE INDEX "topic_mentions_politician_id_idx" ON "topic_mentions"("politician_id");

-- CreateIndex
CREATE UNIQUE INDEX "politician_social_stats_politician_id_key" ON "politician_social_stats"("politician_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_sources_name_key" ON "data_sources"("name");

-- CreateIndex
CREATE INDEX "audit_log_table_name_idx" ON "audit_log"("table_name");

-- CreateIndex
CREATE INDEX "audit_log_record_id_idx" ON "audit_log"("record_id");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "user_watchlists" ADD CONSTRAINT "user_watchlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_watchlists" ADD CONSTRAINT "user_watchlists_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "politicians" ADD CONSTRAINT "politicians_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "political_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "politician_contacts" ADD CONSTRAINT "politician_contacts_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_records" ADD CONSTRAINT "voting_records_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sponsored_bills" ADD CONSTRAINT "sponsored_bills_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bill_readings" ADD CONSTRAINT "bill_readings_bill_id_fkey" FOREIGN KEY ("bill_id") REFERENCES "sponsored_bills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset_declarations" ADD CONSTRAINT "asset_declarations_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "constituency_projects" ADD CONSTRAINT "constituency_projects_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_defections" ADD CONSTRAINT "party_defections_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_defections" ADD CONSTRAINT "party_defections_from_party_id_fkey" FOREIGN KEY ("from_party_id") REFERENCES "political_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_defections" ADD CONSTRAINT "party_defections_to_party_id_fkey" FOREIGN KEY ("to_party_id") REFERENCES "political_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "career_events" ADD CONSTRAINT "career_events_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "committee_assignments" ADD CONSTRAINT "committee_assignments_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_winner_party_id_fkey" FOREIGN KEY ("winner_party_id") REFERENCES "political_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_candidates" ADD CONSTRAINT "election_candidates_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "political_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corruption_cases" ADD CONSTRAINT "corruption_cases_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_mentions" ADD CONSTRAINT "social_mentions_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_mentions" ADD CONSTRAINT "topic_mentions_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "politician_social_stats" ADD CONSTRAINT "politician_social_stats_politician_id_fkey" FOREIGN KEY ("politician_id") REFERENCES "politicians"("id") ON DELETE CASCADE ON UPDATE CASCADE;
