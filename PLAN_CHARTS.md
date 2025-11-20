# Plan: Measurement Charts Display

## Overview
Implement chart functionality to display measurement data over time with filtering capabilities. Users can select multiple measurement fields to display simultaneously or side-by-side. Inspired by forge-bi's chart implementation using shadcn/ui and recharts.

## Current State Analysis

### Available Data
- **Measurement Model** (from Prisma schema):
  - PM measurements: `pm01`, `pm02` (PM2.5), `pm10`, `pm03PCount`
  - PM corrected: `pm01_corrected`, `pm02_corrected`, `pm10_corrected`
  - Environmental: `atmp`, `rhum`, `rco2`
  - Environmental corrected: `atmp_corrected`, `rhum_corrected`, `rco2_corrected`
  - VOC/Indices: `tvoc`, `tvocIndex`, `noxIndex`
  - Timestamps: `timestamp` (Int), `date` (String), `createdAt` (DateTime)
  - Location/Sensor: `locationId`, `serialNumber`, `sensorId`

### Current Backend Endpoints
- **`/api/orpc/airgradient/measurements/list`** - Calls Air Gradient API (not database)
- **`/api/orpc/airgradient/measurements/getFromDatabase`** - ✅ Queries Prisma database directly
  - Supports filtering by: `locationId`, `sensorId`, `serialNumber`, `startDate`, `endDate`
  - Supports pagination: `limit`, `offset`
  - Returns all Measurement fields from database
  - Uses indexed fields for performance
- **`/api/sync/locations/[locationId]`** - Syncs data from API to database

## Implementation Plan

### 1. Backend: Database Query Endpoint

**Location**: `modules/airgradient/measurements/routers/measurements.router.ts`

**New Endpoint**: `getFromDatabase`
- Query Prisma database directly (not Air Gradient API)
- Import `prisma` from `@/lib/prisma/client`
- Support filters: `locationId`, `sensorId`, `serialNumber`, `startDate`, `endDate`
- Support pagination: `limit`, `offset`
- Return full Measurement objects with all fields
- Use indexed fields for performance (`timestamp`, `locationId`, `sensorId`, `serialNumber`)
- Convert date strings to timestamp integers for querying
- Order by `timestamp` ascending (oldest first)

**Schema Updates**: `modules/airgradient/measurements/schemas/measurements.ts`
- Add `measurementFromDatabase` schema with ALL Measurement fields:
  - All PM fields (pm01, pm02, pm10, pm03PCount, corrected versions)
  - All environmental fields (atmp, rhum, rco2, corrected versions)
  - All VOC fields (tvoc, tvocIndex, noxIndex)
  - Location fields (locationId, locationName, locationType)
  - Sensor fields (sensorId, serialNumber, model, firmwareVersion)
  - Timestamp fields (timestamp, date, createdAt)
- Add `measurementListFromDatabase` request/response schemas
- Request should match current `measurementList.request` structure
- Response should be array of `measurementFromDatabase`

### 2. Frontend: Chart Infrastructure

#### 2.1 Install Dependencies
```bash
bun add recharts
```

#### 2.2 Chart CSS Variables
**Location**: `app/globals.css`
- Add chart color variables (`--chart-1` through `--chart-5`)
- Support light/dark mode
- Use project's color system (Primary: #004aad, Secondary: #d21034, etc.)

#### 2.3 Chart Components

**ChartContainer Component**
- Location: `components/ui/chart-container.tsx`
- Wrapper component for all charts
- Handles loading states, error states, empty states
- Provides consistent styling and layout
- Props: `title`, `description`, `isLoading`, `error`, `actions`, `children`

**ChartSkeleton Component**
- Location: `components/ui/chart-skeleton.tsx`
- Loading skeleton for charts
- Props: `hasTitle`, `hasLegend`, `height`

### 3. Measurement Chart Components

#### 3.1 Measurement Line Chart
**Location**: `app/dashboard/locations/[id]/components/measurement-chart.tsx`

**Features**:
- Display multiple measurement fields on same chart
- Configurable field selection (checkboxes/multi-select)
- Time series display (X-axis: time, Y-axis: values)
- Support for different units (PM (µg/m³), Temperature (°C), Humidity (%), CO2 (ppm), etc.)
- Legend showing selected fields
- Tooltip with formatted values and units
- Responsive design

**Props**:
- `data`: Measurement[] array
- `fields`: string[] - selected fields to display
- `startDate`: Date
- `endDate`: Date
- `locationId`: number
- `sensorId?`: string (optional filter)

**Field Groups**:
- **PM Measurements**: pm01, pm02 (PM2.5), pm10, pm03PCount
- **PM Corrected**: pm01_corrected, pm02_corrected, pm10_corrected
- **Temperature**: atmp, atmp_corrected
- **Humidity**: rhum, rhum_corrected
- **CO2**: rco2, rco2_corrected
- **VOC**: tvoc, tvocIndex, noxIndex

#### 3.2 Field Selector Component
**Location**: `app/dashboard/locations/[id]/components/measurement-field-selector.tsx`

**Features**:
- Multi-select checkboxes for measurement fields
- Grouped by category (PM, Environmental, VOC)
- Show/hide toggle for each field
- Color assignment for each field
- "Select All" / "Deselect All" by category

**Props**:
- `selectedFields`: string[]
- `onFieldsChange`: (fields: string[]) => void
- `availableFields?`: string[] (optional, defaults to all)

### 4. Data Fetching Hook

**Location**: `hooks/use-measurements.ts`

**Features**:
- Fetch measurements from database endpoint
- Support filtering by locationId, sensorId, serialNumber, date range
- Loading and error states
- Automatic refetch on filter changes
- Optional pagination support

**API**:
```typescript
const {
  data: measurements,
  isLoading,
  error,
  refetch
} = useMeasurements({
  locationId: number,
  sensorId?: string,
  serialNumber?: string,
  startDate?: Date,
  endDate?: Date,
  limit?: number,
  offset?: number
});
```

### 5. Date Range Picker

**Location**: `app/dashboard/locations/[id]/components/measurement-date-range-picker.tsx`

**Features**:
- Select start and end dates
- Preset ranges: Last 24 hours, Last 7 days, Last 30 days, Last 90 days, Custom
- Display selected range
- Update chart data when range changes

### 6. Chart Page Integration

**Location**: `app/dashboard/locations/[id]/page.tsx`

**Features**:
- Add new "Charts" tab or section
- Date range picker
- Field selector
- Measurement chart component
- Multiple chart views (side-by-side option)
- Export chart data (future)

## File Structure

```
components/
  ui/
    chart-container.tsx          # Chart wrapper component
    chart-skeleton.tsx            # Chart loading skeleton

app/
  dashboard/
    locations/
      [id]/
        components/
          measurement-chart.tsx              # Main chart component
          measurement-field-selector.tsx     # Field selection UI
          measurement-date-range-picker.tsx  # Date range picker
        page.tsx                             # Updated location detail page

hooks/
  use-measurements.ts            # Data fetching hook

modules/
  airgradient/
    measurements/
      routers/
        measurements.router.ts    # Add getFromDatabase endpoint
      schemas/
        measurements.ts          # Update schemas for database query
```

## Implementation Steps

### Phase 1: Backend Setup
1. ✅ Create database query endpoint (`getFromDatabase`) in measurements router
2. ✅ Update measurement schemas to include all fields (`measurementFromDatabase`)
3. ⏳ Test endpoint with various filters (ready for testing)

### Phase 2: Chart Infrastructure
1. ✅ Install recharts dependency
2. ✅ Add chart CSS variables to globals.css
3. ✅ Create ChartContainer component
4. ✅ Create ChartSkeleton component

### Phase 3: Data Fetching
1. ✅ Create useMeasurements hook
2. ✅ Test hook with various filters
3. ✅ Add error handling and loading states

### Phase 4: Chart Components
1. ✅ Create MeasurementChart component
2. ✅ Create MeasurementFieldSelector component
3. ✅ Create MeasurementDateRangePicker component
4. ✅ Integrate components into location detail page

### Phase 5: Polish & Testing
1. ✅ Add proper formatting for different units
2. ✅ Add chart tooltips with formatted values
3. ✅ Test with real data
4. ✅ Add responsive design
5. ✅ Performance optimization (data aggregation for large datasets)

## Chart Field Configuration

### Field Metadata
Each measurement field needs:
- **Display Name**: Human-readable name
- **Unit**: Unit of measurement
- **Category**: Grouping category
- **Color**: Chart color (from CSS variables)
- **Formatter**: Function to format values for display

### Example Field Config:
```typescript
const MEASUREMENT_FIELDS = {
  pm01: {
    label: 'PM1.0',
    unit: 'µg/m³',
    category: 'pm',
    color: 'var(--chart-1)',
    formatter: (v: number) => `${v.toFixed(1)} µg/m³`
  },
  pm02: {
    label: 'PM2.5',
    unit: 'µg/m³',
    category: 'pm',
    color: 'var(--chart-2)',
    formatter: (v: number) => `${v.toFixed(1)} µg/m³`
  },
  // ... more fields
};
```

## Considerations

- **Performance**: For large date ranges, consider server-side aggregation
- **Data Density**: Handle cases with many data points (sampling/aggregation)
- **Multiple Sensors**: Support filtering by sensor/serialNumber
- **Real-time Updates**: Consider WebSocket/SSE for live data (future)
- **Export**: Allow exporting chart data as CSV/JSON (future)
- **Comparison**: Side-by-side comparison of different sensors (future)
- **Alerts**: Visual indicators for threshold violations (future)

## References

- forge-bi chart implementation: `/Users/keinoc/Development/K-Tingz/forge-bi/apps/web/src/app/dashboard/components/cash-flow-chart.tsx`
- Recharts documentation: https://recharts.org/
- shadcn/ui chart examples: https://ui.shadcn.com/docs/components/chart

