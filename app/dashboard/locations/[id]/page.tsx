"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { orpcClient } from "@/lib/orpc/client";
import { useMeasurements } from "@/hooks/use-measurements";
import { MeasurementChart } from "./components/measurement-chart";
import { MeasurementActionBar } from "./components/measurement-action-bar";
import { type DateRange } from "./components/measurement-date-range-picker";

interface Location {
  id: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Sensor {
  id: string;
  serialNumber?: string;
  name?: string;
  locationId?: string;
  locationName?: string;
  pm25?: number;
  pm01?: number;
  pm10?: number;
  atmp?: number;
  rhum?: number;
  rco2?: number;
  tvoc?: number;
  nox?: number;
  model?: string;
  firmwareVersion?: string;
  date?: string;
  timestamp?: number;
}

interface Measurement {
  locationId?: number;
  locationName?: string;
  serialno?: number;
  pm01?: number;
  pm02?: number;
  pm10?: number;
  pm01_corrected?: number;
  pm02_corrected?: number;
  pm10_corrected?: number;
  pm003Count?: number;
  atmp?: number;
  rhum?: number;
  rco2?: number;
  atmp_corrected?: number;
  rhum_corrected?: number;
  rco2_corrected?: number;
  tvoc?: number;
  tvocIndex?: number;
  noxIndex?: number;
  wifi?: number;
  timestamp?: string;
  firmwareVersion?: string;
  longitude?: number;
  latitude?: number;
}

function getAirQualityStatus(pm25?: number): { label: string; color: string; bgColor: string } {
  if (pm25 === undefined || pm25 === null) {
    return { label: "Unknown", color: "text-muted-foreground", bgColor: "bg-muted" };
  }
  if (pm25 < 12) {
    return { label: "Good", color: "text-success-foreground", bgColor: "bg-success/20" };
  }
  if (pm25 < 35) {
    return { label: "Moderate", color: "text-warning-foreground", bgColor: "bg-warning/20" };
  }
  return { label: "Unhealthy", color: "text-destructive-foreground", bgColor: "bg-destructive/20" };
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function SkeletonLoader() {
  return (
    <div className="p-8 animate-pulse">
      <div className="mb-6">
        <div className="h-4 w-32 bg-muted rounded mb-4"></div>
        <div className="h-8 w-64 bg-muted rounded"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-lg p-6">
            <div className="h-4 w-24 bg-muted rounded mb-2"></div>
            <div className="h-8 w-16 bg-muted rounded"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="h-6 w-32 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-muted rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="h-6 w-32 bg-muted rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-border rounded p-4">
                <div className="h-5 w-40 bg-muted rounded mb-3"></div>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LocationDetailPage() {
  const params = useParams();
  const locationId = params.id as string;

  const [location, setLocation] = useState<Location | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago (today)
    endDate: new Date(), // Today
  });

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
  };

  // Load selected fields from localStorage or use defaults
  const [selectedFields, setSelectedFields] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`msk-air-fields-${locationId}`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved fields, using defaults');
        }
      }
    }
    return ["pm02", "atmp", "rhum"];
  });

  // Save selected fields to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`msk-air-fields-${locationId}`, JSON.stringify(selectedFields));
    }
  }, [selectedFields, locationId]);

  // Convert location ID string to number for measurement queries
  // Location.id is stored as String(apiLocationId), so we need to parse it back
  // Measurements store locationId as Int (number from API)
  const locationIdNumber = location?.id
    ? (() => {
        // Try parsing as decimal first, then hex if that fails
        const decimal = parseInt(location.id, 10);
        if (!isNaN(decimal) && decimal.toString() === location.id) {
          return decimal;
        }
        // Try hex parsing (for IDs like "744dbdc919e4")
        const hex = parseInt(location.id, 16);
        if (!isNaN(hex) && hex.toString(16) === location.id.toLowerCase()) {
          return hex;
        }
        // If parsing fails, log warning but continue (might be a CUID)
        console.warn(`Could not parse locationId "${location.id}" as number. Measurements may not load.`);
        return undefined;
      })()
    : undefined;

  const {
    data: chartMeasurements,
    isLoading: chartLoading,
    error: chartError,
    refetch: refetchChart,
  } = useMeasurements({
    locationId: locationIdNumber,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    limit: 1000,
    enabled: !!location && !!locationIdNumber && !isNaN(locationIdNumber),
  });


  useEffect(() => {
    async function fetchLocationData() {
      if (!locationId) {
        setError("Invalid location ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const locationData = await (orpcClient.airgradient.locations.get as any)({ id: locationId });
        setLocation(locationData);

        // Parse location ID from the actual location data
        const actualLocationId = (() => {
          if (locationData?.id) {
            const parsed = parseInt(String(locationData.id), 10);
            if (!isNaN(parsed)) {
              return parsed;
            }
          }
          // If parsing fails, log warning but continue (might be a CUID)
          console.warn(`Could not parse locationId "${locationData?.id}" as number. Using locationId from URL: ${locationId}`);
          const parsed = parseInt(locationId, 10);
          if (!isNaN(parsed)) {
            return parsed;
          }
          return undefined;
        })();

        const locationMeasuresResponse = actualLocationId
          ? await (orpcClient.airgradient.measures.getLocationCurrentMeasures as any)({ locationId: actualLocationId })
          : [];

        if ((locationMeasuresResponse as any)?.json?.code) {
          const error = (locationMeasuresResponse as any)?.json;
          throw new Error(error.message || `API error: ${error.code}`);
        }

        const rawMeasures = actualLocationId ? ((locationMeasuresResponse as any)?.json || locationMeasuresResponse) : [];

        const sensorsMap = new Map<string, Sensor>();
        if (Array.isArray(rawMeasures)) {
          rawMeasures.forEach((measure: any) => {
            if (measure.serialno && !sensorsMap.has(String(measure.serialno))) {
              sensorsMap.set(String(measure.serialno), {
                id: String(measure.serialno),
                serialNumber: String(measure.serialno),
                name: measure.model,
                pm25: measure.pm02,
                pm01: measure.pm01,
                pm10: measure.pm10,
                atmp: measure.atmp,
                rhum: measure.rhum,
                rco2: measure.rco2,
                tvoc: measure.tvoc,
                model: measure.model,
                firmwareVersion: measure.firmwareVersion,
              });
            }
          });
        }
        setSensors(Array.from(sensorsMap.values()));
        setMeasurements(Array.isArray(rawMeasures) ? rawMeasures.slice(0, 100) : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch location data";
        console.error("Error fetching location data:", err);
        setError(errorMessage);
        setLocation(null);
      } finally {
        setLoading(false);
      }
    }

    fetchLocationData();
  }, [locationId]);

  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 shadow-sm">
          <p className="font-medium">Error loading location</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
        <Link
          href="/dashboard/locations"
          className="inline-flex items-center text-primary hover:text-primary-hover transition-colors font-medium"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Locations
        </Link>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="p-8">
        <div className="bg-card border border-border rounded-lg p-8 text-center shadow-sm">
          <svg className="w-16 h-16 mx-auto text-muted-foreground mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-card-foreground mb-2">Location not found</h2>
          <p className="text-muted-foreground mb-6">The location you're looking for doesn't exist or has been removed.</p>
          <Link
            href="/dashboard/locations"
            className="inline-flex items-center text-primary hover:text-primary-hover transition-colors font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Locations
          </Link>
        </div>
      </div>
    );
  }

  const latestMeasurement = measurements.length > 0 ? measurements[0] : null;
  const latestPm25 = latestMeasurement?.pm02;
  const airQuality = getAirQualityStatus(latestPm25);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <Link
          href="/dashboard/locations"
          className="inline-flex items-center text-primary hover:text-primary-hover transition-colors font-medium mb-4"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Locations
        </Link>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground mt-2">
          {location.name || "Unnamed Location"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Total Sensors</span>
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-card-foreground">{sensors.length}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Latest PM2.5</span>
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-card-foreground">
            {latestPm25 !== undefined ? `${latestPm25.toFixed(1)}` : "—"}
            {latestPm25 !== undefined && (
              <span className="text-lg font-normal text-muted-foreground ml-1">
                &micro;g/m&sup3;
              </span>
            )}
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">Air Quality</span>
            <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${airQuality.bgColor} ${airQuality.color}`}>
              {airQuality.label}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Location Details
          </h2>
          <dl className="space-y-4">
            {location.address && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Address</dt>
                <dd className="text-card-foreground">{location.address}</dd>
              </div>
            )}
            {(location.city || location.state || location.country) && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">City, State, Country</dt>
                <dd className="text-card-foreground">
                  {[location.city, location.state, location.country]
                    .filter(Boolean)
                    .join(", ")}
                </dd>
              </div>
            )}
            {location.zipCode && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Zip Code</dt>
                <dd className="text-card-foreground">{location.zipCode}</dd>
              </div>
            )}
            {(location.latitude != null && location.longitude != null) && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Coordinates</dt>
                <dd className="text-card-foreground">
                  <a
                    href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-primary hover:text-primary-hover transition-colors"
                  >
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </dd>
              </div>
            )}
            {location.timezone && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Timezone</dt>
                <dd className="text-card-foreground">{location.timezone}</dd>
              </div>
            )}
            {location.createdAt && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground mb-1">Created</dt>
                <dd className="text-card-foreground">
                  {new Date(location.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            Sensors ({sensors.length})
          </h2>
          {sensors.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <p className="text-muted-foreground font-medium">No sensors found</p>
              <p className="text-sm text-muted-foreground/70 mt-1">No sensors are currently associated with this location.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sensors.map((sensor) => {
                const sensorAirQuality = getAirQualityStatus(sensor.pm25);
                return (
                  <div
                    key={sensor.id}
                    className="border border-border rounded-lg p-5 hover:shadow-md transition-shadow bg-card"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-card-foreground text-lg">
                        {sensor.name || sensor.serialNumber || `Sensor ${sensor.id}`}
                      </h3>
                      {sensor.pm25 !== undefined && (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sensorAirQuality.bgColor} ${sensorAirQuality.color}`}>
                          {sensorAirQuality.label}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      {sensor.serialNumber && (
                        <div className="flex items-center text-sm">
                          <span className="text-muted-foreground w-20">Serial:</span>
                          <span className="text-card-foreground font-medium">{sensor.serialNumber}</span>
                        </div>
                      )}
                      {sensor.model && (
                        <div className="flex items-center text-sm">
                          <span className="text-muted-foreground w-20">Model:</span>
                          <span className="text-card-foreground font-medium">{sensor.model}</span>
                        </div>
                      )}
                      {sensor.firmwareVersion && (
                        <div className="flex items-center text-sm">
                          <span className="text-muted-foreground w-20">Firmware:</span>
                          <span className="text-card-foreground font-medium">{sensor.firmwareVersion}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Air Quality</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {sensor.pm25 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">PM2.5:</span>
                            <span className="text-sm font-semibold text-card-foreground">
                              {sensor.pm25.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">&micro;g/m&sup3;</span>
                            </span>
                          </div>
                        )}
                        {sensor.rco2 !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">CO₂:</span>
                            <span className="text-sm font-semibold text-card-foreground">{sensor.rco2} <span className="text-xs font-normal text-muted-foreground">ppm</span></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 mt-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Environment</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {sensor.atmp !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Temp:</span>
                            <span className="text-sm font-semibold text-card-foreground">{sensor.atmp.toFixed(1)}<span className="text-xs font-normal text-muted-foreground">°C</span></span>
                          </div>
                        )}
                        {sensor.rhum !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Humidity:</span>
                            <span className="text-sm font-semibold text-card-foreground">{sensor.rhum.toFixed(1)}<span className="text-xs font-normal text-muted-foreground">%</span></span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {measurements.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Recent Measurements ({measurements.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Sensor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    PM2.5
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    CO₂
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Temp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Humidity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {measurements.map((measurement, index) => {
                  const rowAirQuality = getAirQualityStatus(measurement.pm02);
                  return (
                    <tr
                      key={measurement.serialno ? `${measurement.serialno}-${index}` : index}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-card-foreground font-medium">
                        {measurement.serialno ? String(measurement.serialno) : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {measurement.pm02 !== undefined ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rowAirQuality.bgColor} ${rowAirQuality.color}`}>
                            {measurement.pm02.toFixed(1)} <span className="ml-1">&micro;g/m&sup3;</span>
                          </span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {measurement.rco2 !== undefined ? `${measurement.rco2} ppm` : <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {measurement.atmp !== undefined ? `${measurement.atmp.toFixed(1)}°C` : <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground">
                        {measurement.rhum !== undefined ? `${measurement.rhum.toFixed(1)}%` : <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {measurement.timestamp ? (
                          <div>
                            <div>{formatRelativeTime(measurement.timestamp)}</div>
                            <div className="text-xs text-muted-foreground/70 mt-0.5">
                              {new Date(measurement.timestamp).toLocaleString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {measurements.length === 0 && !loading && (
        <div className="bg-card border border-border rounded-lg p-12 text-center shadow-sm">
          <svg className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">No measurements available</h3>
          <p className="text-muted-foreground">There are no recent measurements for this location.</p>
        </div>
      )}

      {location && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Measurement Charts</h2>

            {/* Action Bar */}
            <MeasurementActionBar
              selectedFields={selectedFields}
              onFieldsChange={setSelectedFields}
              dateRange={dateRange}
              onRangeChange={handleDateRangeChange}
              className="mb-6"
            />

            {/* Full Width Chart */}
            <div className="w-full">
              <MeasurementChart
                data={chartMeasurements || []}
                fields={selectedFields}
                isLoading={chartLoading}
                error={chartError}
                onRetry={refetchChart}
                dateRange={dateRange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

