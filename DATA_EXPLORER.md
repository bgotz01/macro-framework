# Data Explorer

A web-based interface for browsing and filtering macroeconomic data from the SQLite database.

## Features

- **Paginated Table View**: Browse data with 20 rows per page
- **Asset Class Filter**: Filter by economic, bonds, equities, commodities, etc.
- **Series Filter**: Select specific data series within an asset class
- **Date Range Filter**: Filter data by start and end dates
- **Formatted Values**: Automatic formatting based on units (billions, percent, etc.)
- **Responsive Design**: Works on desktop and mobile devices

## Access

Navigate to `/data` or click "Data Explorer" in the sidebar.

## Usage

### Filters

1. **Asset Class**: Select a category to narrow down available series
   - Economic (GDP, CPI, debt, etc.)
   - Bonds (yields, rates)
   - Equities (stock indices)
   - Commodities (gold, oil, etc.)
   - FX (currency pairs)
   - Crypto (Bitcoin, Ethereum)
   - Volatility (VIX)

2. **Series**: Choose a specific data series (only available after selecting asset class)
   - Shows display names from metadata
   - Automatically filtered based on asset class

3. **Date Range**: Filter by start and/or end date
   - Start Date: Show data from this date onwards
   - End Date: Show data up to this date
   - Both optional - leave blank to see all dates

4. **Reset**: Clear all filters to see all data

### Table Columns

- **Date**: Observation date (YYYY-MM-DD format)
- **Asset Class**: Category of the data
- **Series**: Display name of the data series
- **Column**: Column name (usually "Value")
- **Value**: The data point, formatted based on units
  - Billions: $1,234.56B
  - Millions: $1,234.56M
  - Percent: 12.34%
  - Index/Ratio: 1,234.56
- **Geography**: Geographic region (US, UK, JP, etc.)

### Pagination

- Navigate through pages using First, Previous, Next, Last buttons
- Shows current page and total pages
- Displays result count (e.g., "Showing 1 to 20 of 1,234 results")
- 20 rows per page

## API Endpoints

### GET /api/data-table

Fetch paginated data with filters.

**Query Parameters:**
- `assetClass` (optional): Filter by asset class
- `seriesName` (optional): Filter by series name
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `page` (default: 1): Page number
- `pageSize` (default: 20): Results per page

**Response:**
```json
{
  "data": [
    {
      "date": "2024-01-01",
      "timestamp": 1704067200000,
      "assetClass": "economic",
      "seriesName": "GDP",
      "displayName": "GDP",
      "columnName": "Value",
      "value": 27000.5,
      "units": "billions",
      "geography": "US"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 1234,
    "totalPages": 62
  }
}
```

### GET /api/series-list

Get available asset classes and series for filters.

**Response:**
```json
{
  "assetClasses": ["economic", "bonds", "equities"],
  "series": [
    {
      "asset_class": "economic",
      "series_name": "GDP",
      "display_name": "GDP"
    }
  ]
}
```

## Components

### DataTable (`components/data-table.tsx`)

Main table component with pagination.

**Props:**
- `assetClass?: string` - Filter by asset class
- `seriesName?: string` - Filter by series name
- `startDate?: string` - Filter by start date
- `endDate?: string` - Filter by end date

**Features:**
- Automatic data fetching on filter changes
- Loading states
- Error handling
- Value formatting based on units
- Responsive table layout

### DataPage (`app/data/page.tsx`)

Page component with filters and table.

**Features:**
- Asset class dropdown
- Series dropdown (filtered by asset class)
- Date range inputs
- Reset filters button
- Active filter indicator

## Styling

Matches the design system from `/chart` page:
- Card-based layout
- Muted backgrounds
- Hover effects on table rows
- Consistent typography
- Dark/light mode support

## Database Schema

Queries the following tables:

**time_series**
- `date` - Unix timestamp
- `asset_class` - Category
- `series_name` - Series identifier
- `column_name` - Column name
- `value` - Data point

**series_metadata**
- `asset_class` - Category
- `series_name` - Series identifier
- `display_name` - Human-readable name
- `description` - Full description
- `geography` - Geographic region
- `units` - Unit of measurement

## Performance

- Server-side pagination (only loads 20 rows at a time)
- Indexed database queries
- Efficient date filtering using timestamps
- No client-side data caching (always fresh data)

## Future Enhancements

Potential improvements:
- Export to CSV
- Column sorting
- Search functionality
- Advanced filters (value ranges, multiple series)
- Data visualization toggle
- Bookmark/save filter combinations
- Download filtered dataset
