-- CreateTable
CREATE TABLE "sp500_constituents" (
    "symbol" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "gics_sector" TEXT,
    "gics_sub_industry" TEXT,
    "headquarters_location" TEXT,
    "date_added" TEXT,
    "cik" INTEGER,
    "founded" TEXT,
    "extra_notes" TEXT,

    CONSTRAINT "sp500_constituents_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "sp500_changes" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "added_ticker" TEXT,
    "added_company" TEXT,
    "removed_ticker" TEXT,
    "removed_company" TEXT,
    "reason" TEXT,

    CONSTRAINT "sp500_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sp500_snapshots" (
    "snapshot_date" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "company_name" TEXT,

    CONSTRAINT "sp500_snapshots_pkey" PRIMARY KEY ("snapshot_date","ticker")
);

-- CreateTable
CREATE TABLE "waitlist" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sp500_constituents_gics_sector_idx" ON "sp500_constituents"("gics_sector");

-- CreateIndex
CREATE INDEX "sp500_constituents_date_added_idx" ON "sp500_constituents"("date_added");

-- CreateIndex
CREATE INDEX "sp500_changes_date_idx" ON "sp500_changes"("date");

-- CreateIndex
CREATE INDEX "sp500_changes_added_ticker_idx" ON "sp500_changes"("added_ticker");

-- CreateIndex
CREATE INDEX "sp500_changes_removed_ticker_idx" ON "sp500_changes"("removed_ticker");

-- CreateIndex
CREATE INDEX "sp500_snapshots_snapshot_date_idx" ON "sp500_snapshots"("snapshot_date");

-- CreateIndex
CREATE INDEX "sp500_snapshots_ticker_idx" ON "sp500_snapshots"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_email_key" ON "waitlist"("email");
