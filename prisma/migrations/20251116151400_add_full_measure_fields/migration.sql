/*
  Warnings:

  - You are about to drop the column `nox` on the `measurements` table. All the data in the column will be lost.
  - You are about to drop the column `pm25` on the `measurements` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "measurements" DROP COLUMN "nox",
DROP COLUMN "pm25",
ADD COLUMN     "atmp_corrected" DOUBLE PRECISION,
ADD COLUMN     "datapoints" INTEGER,
ADD COLUMN     "firmwareVersion" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "locationId" INTEGER,
ADD COLUMN     "locationName" TEXT,
ADD COLUMN     "locationType" TEXT,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "noxIndex" DOUBLE PRECISION,
ADD COLUMN     "pm01_corrected" DOUBLE PRECISION,
ADD COLUMN     "pm02" DOUBLE PRECISION,
ADD COLUMN     "pm02_corrected" DOUBLE PRECISION,
ADD COLUMN     "pm10_corrected" DOUBLE PRECISION,
ADD COLUMN     "rco2_corrected" DOUBLE PRECISION,
ADD COLUMN     "rhum_corrected" DOUBLE PRECISION,
ADD COLUMN     "tvocIndex" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "measurements_locationId_idx" ON "measurements"("locationId");
