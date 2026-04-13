-- CreateTable
CREATE TABLE "macro_time_series" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "asset_class" TEXT NOT NULL,
    "series_name" TEXT NOT NULL,
    "column_name" TEXT NOT NULL,
    "value" DOUBLE PRECISION,

    CONSTRAINT "macro_time_series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macro_percentile_analysis" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "asset_class" TEXT NOT NULL,
    "series_name" TEXT NOT NULL,
    "column_name" TEXT NOT NULL,
    "value" DOUBLE PRECISION,
    "percentile_rank" DOUBLE PRECISION,
    "yoy_percentile_change" DOUBLE PRECISION,

    CONSTRAINT "macro_percentile_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "macro_regime_timeline" (
    "date" TEXT NOT NULL,
    "regime" TEXT NOT NULL,
    "entry_date" TEXT NOT NULL,
    "trigger_reason" TEXT NOT NULL,
    "liquidity_score" DOUBLE PRECISION,
    "rey" DOUBLE PRECISION,
    "eyp" DOUBLE PRECISION,
    "real10Y" DOUBLE PRECISION,
    "real3M" DOUBLE PRECISION,
    "realM2" DOUBLE PRECISION,

    CONSTRAINT "macro_regime_timeline_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "macro_series_metadata" (
    "asset_class" TEXT NOT NULL,
    "series_name" TEXT NOT NULL,
    "display_name" TEXT,
    "description" TEXT,
    "source" TEXT,
    "last_updated" BIGINT,
    "geography" TEXT,
    "units" TEXT,
    "currency" TEXT,

    CONSTRAINT "macro_series_metadata_pkey" PRIMARY KEY ("asset_class","series_name")
);

-- CreateIndex
CREATE INDEX "macro_time_series_date_idx" ON "macro_time_series"("date");

-- CreateIndex
CREATE INDEX "macro_time_series_asset_class_idx" ON "macro_time_series"("asset_class");

-- CreateIndex
CREATE INDEX "macro_time_series_series_name_idx" ON "macro_time_series"("series_name");

-- CreateIndex
CREATE INDEX "macro_time_series_asset_class_series_name_date_idx" ON "macro_time_series"("asset_class", "series_name", "date");

-- CreateIndex
CREATE UNIQUE INDEX "macro_time_series_date_asset_class_series_name_column_name_key" ON "macro_time_series"("date", "asset_class", "series_name", "column_name");

-- CreateIndex
CREATE INDEX "macro_percentile_analysis_date_idx" ON "macro_percentile_analysis"("date");

-- CreateIndex
CREATE INDEX "macro_percentile_analysis_asset_class_series_name_date_idx" ON "macro_percentile_analysis"("asset_class", "series_name", "date");

-- CreateIndex
CREATE UNIQUE INDEX "macro_percentile_analysis_date_asset_class_series_name_colu_key" ON "macro_percentile_analysis"("date", "asset_class", "series_name", "column_name");

-- CreateIndex
CREATE INDEX "macro_regime_timeline_regime_idx" ON "macro_regime_timeline"("regime");

-- CreateIndex
CREATE INDEX "macro_regime_timeline_entry_date_idx" ON "macro_regime_timeline"("entry_date");
