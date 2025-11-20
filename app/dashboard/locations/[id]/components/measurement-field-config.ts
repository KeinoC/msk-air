export interface MeasurementFieldConfig {
  label: string;
  unit: string;
  category: "pm" | "environmental" | "voc";
  color: string;
  formatter: (value: number) => string;
}

export const MEASUREMENT_FIELDS: Record<string, MeasurementFieldConfig> = {
  pm01: {
    label: "PM1.0",
    unit: "µg/m³",
    category: "pm",
    color: "hsl(var(--chart-1))",
    formatter: (v: number) => `${v.toFixed(1)} µg/m³`,
  },
  pm02: {
    label: "PM2.5",
    unit: "µg/m³",
    category: "pm",
    color: "hsl(var(--chart-2))",
    formatter: (v: number) => `${v.toFixed(1)} µg/m³`,
  },
  pm10: {
    label: "PM10",
    unit: "µg/m³",
    category: "pm",
    color: "hsl(var(--chart-3))",
    formatter: (v: number) => `${v.toFixed(1)} µg/m³`,
  },
  pm03PCount: {
    label: "PM0.3 Count",
    unit: "count",
    category: "pm",
    color: "hsl(var(--chart-4))",
    formatter: (v: number) => `${v.toFixed(0)}`,
  },
  pm01_corrected: {
    label: "PM1.0 (Corrected)",
    unit: "µg/m³",
    category: "pm",
    color: "hsl(var(--chart-1))",
    formatter: (v: number) => `${v.toFixed(1)} µg/m³`,
  },
  pm02_corrected: {
    label: "PM2.5 (Corrected)",
    unit: "µg/m³",
    category: "pm",
    color: "hsl(var(--chart-2))",
    formatter: (v: number) => `${v.toFixed(1)} µg/m³`,
  },
  pm10_corrected: {
    label: "PM10 (Corrected)",
    unit: "µg/m³",
    category: "pm",
    color: "hsl(var(--chart-3))",
    formatter: (v: number) => `${v.toFixed(1)} µg/m³`,
  },
  atmp: {
    label: "Temperature",
    unit: "°C",
    category: "environmental",
    color: "hsl(var(--chart-1))",
    formatter: (v: number) => `${v.toFixed(1)}°C`,
  },
  rhum: {
    label: "Humidity",
    unit: "%",
    category: "environmental",
    color: "hsl(var(--chart-2))",
    formatter: (v: number) => `${v.toFixed(1)}%`,
  },
  rco2: {
    label: "CO₂",
    unit: "ppm",
    category: "environmental",
    color: "hsl(var(--chart-3))",
    formatter: (v: number) => `${v.toFixed(0)} ppm`,
  },
  atmp_corrected: {
    label: "Temperature (Corrected)",
    unit: "°C",
    category: "environmental",
    color: "hsl(var(--chart-1))",
    formatter: (v: number) => `${v.toFixed(1)}°C`,
  },
  rhum_corrected: {
    label: "Humidity (Corrected)",
    unit: "%",
    category: "environmental",
    color: "hsl(var(--chart-2))",
    formatter: (v: number) => `${v.toFixed(1)}%`,
  },
  rco2_corrected: {
    label: "CO₂ (Corrected)",
    unit: "ppm",
    category: "environmental",
    color: "hsl(var(--chart-3))",
    formatter: (v: number) => `${v.toFixed(0)} ppm`,
  },
  tvoc: {
    label: "TVOC",
    unit: "ppb",
    category: "voc",
    color: "hsl(var(--chart-4))",
    formatter: (v: number) => `${v.toFixed(0)} ppb`,
  },
  tvocIndex: {
    label: "TVOC Index",
    unit: "",
    category: "voc",
    color: "hsl(var(--chart-5))",
    formatter: (v: number) => `${v.toFixed(1)}`,
  },
  noxIndex: {
    label: "NOx Index",
    unit: "",
    category: "voc",
    color: "hsl(var(--chart-1))",
    formatter: (v: number) => `${v.toFixed(1)}`,
  },
};

export const FIELD_CATEGORIES = {
  pm: "Particulate Matter",
  environmental: "Environmental",
  voc: "VOC & Indices",
} as const;

export function getFieldsByCategory(
  category: keyof typeof FIELD_CATEGORIES
): string[] {
  return Object.keys(MEASUREMENT_FIELDS).filter(
    (key) => MEASUREMENT_FIELDS[key].category === category
  );
}

export function getAllFieldKeys(): string[] {
  return Object.keys(MEASUREMENT_FIELDS);
}

