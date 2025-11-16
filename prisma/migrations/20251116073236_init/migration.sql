-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sensors" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT,
    "name" TEXT,
    "locationId" TEXT,
    "locationName" TEXT,
    "wifiSsid" TEXT,
    "pm25" DOUBLE PRECISION,
    "pm01" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "pm03PCount" DOUBLE PRECISION,
    "atmp" DOUBLE PRECISION,
    "rhum" DOUBLE PRECISION,
    "rco2" DOUBLE PRECISION,
    "tvoc" DOUBLE PRECISION,
    "nox" DOUBLE PRECISION,
    "wifi" DOUBLE PRECISION,
    "boot" DOUBLE PRECISION,
    "model" TEXT,
    "firmwareVersion" TEXT,
    "ledBarTest" TEXT,
    "date" TEXT,
    "timestamp" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT,
    "serialNumber" TEXT,
    "pm25" DOUBLE PRECISION,
    "pm01" DOUBLE PRECISION,
    "pm10" DOUBLE PRECISION,
    "pm03PCount" DOUBLE PRECISION,
    "atmp" DOUBLE PRECISION,
    "rhum" DOUBLE PRECISION,
    "rco2" DOUBLE PRECISION,
    "tvoc" DOUBLE PRECISION,
    "nox" DOUBLE PRECISION,
    "wifi" DOUBLE PRECISION,
    "boot" DOUBLE PRECISION,
    "date" TEXT,
    "timestamp" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT,
    "serialNumber" TEXT,
    "type" TEXT,
    "severity" "AlertSeverity",
    "message" TEXT,
    "threshold" DOUBLE PRECISION,
    "currentValue" DOUBLE PRECISION,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "sensorId" TEXT,
    "serialNumber" TEXT,
    "key" TEXT,
    "value" JSONB,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "measurements_sensorId_idx" ON "measurements"("sensorId");

-- CreateIndex
CREATE INDEX "measurements_serialNumber_idx" ON "measurements"("serialNumber");

-- CreateIndex
CREATE INDEX "measurements_timestamp_idx" ON "measurements"("timestamp");

-- CreateIndex
CREATE INDEX "measurements_createdAt_idx" ON "measurements"("createdAt");

-- CreateIndex
CREATE INDEX "alerts_sensorId_idx" ON "alerts"("sensorId");

-- CreateIndex
CREATE INDEX "alerts_serialNumber_idx" ON "alerts"("serialNumber");

-- CreateIndex
CREATE INDEX "alerts_isActive_idx" ON "alerts"("isActive");

-- CreateIndex
CREATE INDEX "configurations_sensorId_idx" ON "configurations"("sensorId");

-- CreateIndex
CREATE INDEX "configurations_serialNumber_idx" ON "configurations"("serialNumber");

-- CreateIndex
CREATE INDEX "configurations_key_idx" ON "configurations"("key");

-- AddForeignKey
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "sensors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "sensors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_sensorId_fkey" FOREIGN KEY ("sensorId") REFERENCES "sensors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
