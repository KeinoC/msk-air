# Plan: Data Sync by Range

## Overview
Implement functionality to pull measurement data from Air Gradient API by date range and save/update it in our PostgreSQL database using Prisma.

## Current State Analysis

### Available API Endpoints
1. **`getLocationRawMeasures`** - Raw measurements for a location with `from`/`to` date range
2. **`getLocationPastMeasures`** - Past measurements for a location with `from`/`to` date range  
3. **`getLocationBuckets`** - Aggregated measurements with bucket sizes (1h, 3h, 1d, 1w, 1m)

### Database Schema
- **Location** - Stores location information
- **Sensor** - Stores sensor information (linked to Location)
- **Measurement** - Stores measurement data (linked to Sensor)
  - Indexed on: `sensorId`, `serialNumber`, `timestamp`, `createdAt`

### Data Flow
```
Air Gradient API → Fetch by Range → Transform → Upsert to Database
```

## Implementation Plan

### 1. Create Data Sync Service Module
**Location**: `features/data-sync/service/data-sync.service.ts`

**Responsibilities**:
- Fetch measurements from Air Gradient API by date range
- Transform API response to match Prisma schema
- Upsert measurements to database (update if exists, insert if new)
- Handle deduplication (timestamp + serialNumber)
- Error handling and retry logic

### 2. Key Functions to Implement

#### `fetchMeasurementsByRange(locationId, from, to)`
- Use `getLocationRawMeasures` endpoint
- Handle pagination if API supports it
- Return array of measurements

#### `saveMeasurements(measurements[])`
- Transform Air Gradient measure format to Prisma Measurement format
- Upsert logic:
  - Check if measurement exists (by timestamp + serialNumber)
  - Update if exists, create if new
- Handle sensor lookup/creation
- Batch operations for performance

#### `syncLocationData(locationId, from, to)`
- Orchestrates the sync process
- Fetches data from API
- Saves to database
- Returns sync statistics (counts, errors)

### 3. Data Transformation

**Complete Field Mapping (Air Gradient API → Prisma Measurement)**:

**Direct 1:1 Mappings** (field name unchanged):
- `locationId` → `locationId` (Int)
- `locationName` → `locationName` (String)
- `locationType` → `locationType` (String)
- `serialno` → `serialNumber` (String)
- `model` → `model` (String)
- `pm01` → `pm01` (Float)
- `pm02` → `pm02` (Float) - represents PM2.5
- `pm10` → `pm10` (Float)
- `pm003Count` → `pm03PCount` (Float)
- `pm01_corrected` → `pm01_corrected` (Float)
- `pm02_corrected` → `pm02_corrected` (Float) - represents PM2.5 corrected
- `pm10_corrected` → `pm10_corrected` (Float)
- `atmp` → `atmp` (Float)
- `rhum` → `rhum` (Float)
- `rco2` → `rco2` (Float)
- `atmp_corrected` → `atmp_corrected` (Float)
- `rhum_corrected` → `rhum_corrected` (Float)
- `rco2_corrected` → `rco2_corrected` (Float)
- `tvoc` → `tvoc` (Float)
- `tvocIndex` → `tvocIndex` (Float)
- `noxIndex` → `noxIndex` (Float)
- `wifi` → `wifi` (Float)
- `datapoints` → `datapoints` (Int) - for aggregated data
- `firmwareVersion` → `firmwareVersion` (String)
- `longitude` → `longitude` (Float)
- `latitude` → `latitude` (Float)

**Transformations**:
- `timestamp` (ISO string) → `timestamp` (Int, converted from ISO) + `date` (String, extracted from ISO)
- `serialno` → `serialNumber` (field name change)
- `pm003Count` → `pm03PCount` (field name change)

**Additional Prisma Fields** (not from API):
- `id` - UUID primary key
- `sensorId` - Foreign key to Sensor (looked up by serialNumber)
- `createdAt` - Auto-generated timestamp

**Note**: The Prisma Measurement model is now 1:1 with the Air Gradient Measure API model, including all fields from the Swagger documentation. All fields are stored even if not actively used in the UI to maintain complete data fidelity.

### 4. Deduplication Strategy

**Unique Key**: `timestamp` + `serialNumber`
- Check existing measurements before insert
- Use Prisma `upsert` with unique constraint
- Or use `findUnique` + `create`/`update` pattern

### 5. Error Handling

- API rate limiting (retry with backoff)
- Network failures (retry logic)
- Database constraint violations (skip duplicates)
- Partial failures (continue processing remaining items)

### 6. API Endpoint for Manual Sync

**Route**: `/api/sync/locations/[locationId]`
- POST endpoint
- Query params: `from`, `to` (ISO date strings)
- Returns sync results and statistics

### 7. Background Sync (Future)

- Scheduled jobs (cron-like)
- Incremental sync (only fetch new data)
- Track last sync timestamp per location

## File Structure

```
features/
  data-sync/
    service/
      data-sync.service.ts      # Main sync service
      measurement-transformer.ts # Transform API → Prisma format
    types/
      sync.types.ts             # TypeScript types
    api/
      sync.route.ts             # API endpoint for manual sync
```

## Implementation Steps

1. ✅ Create service module structure
2. ✅ Implement fetchMeasurementsByRange
3. ✅ Implement measurement transformer
4. ✅ Implement saveMeasurements with upsert logic
5. ✅ Implement syncLocationData orchestrator
6. ✅ Create API endpoint for manual sync
7. ✅ Add error handling and retry logic
8. ✅ Add logging and progress tracking

## Considerations

- **Performance**: Batch database operations
- **Rate Limiting**: Respect API limits, add delays if needed
- **Data Integrity**: Handle partial failures gracefully
- **Monitoring**: Log sync operations, track success/failure rates
- **Incremental Sync**: Track last sync time to avoid re-fetching old data

