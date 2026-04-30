-- CreateIndex
CREATE INDEX "macro_percentile_analysis_series_name_idx" ON "macro_percentile_analysis"("series_name");

-- CreateIndex
CREATE INDEX "macro_percentile_analysis_asset_class_series_name_idx" ON "macro_percentile_analysis"("asset_class", "series_name");

-- CreateIndex
CREATE INDEX "macro_time_series_asset_class_series_name_idx" ON "macro_time_series"("asset_class", "series_name");
