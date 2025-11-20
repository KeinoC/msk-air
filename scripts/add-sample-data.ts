import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupSampleData() {
  try {
    console.log('Removing sample data...');

    // Delete sample measurements
    const deletedMeasurements = await prisma.measurement.deleteMany({
      where: {
        id: {
          in: ['test-1', 'test-2', 'test-3', 'test-4', 'test-5']
        }
      }
    });

    // Delete sample sensor
    const deletedSensor = await prisma.sensor.deleteMany({
      where: {
        id: 'TEST001'
      }
    });

    console.log(`Deleted ${deletedMeasurements.count} sample measurements`);
    console.log(`Deleted ${deletedSensor.count} sample sensor`);
  } catch (error) {
    console.error('Error removing sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function addSampleData() {
  try {
    console.log('Adding sample measurement data...');

    // Create sensor first
    const sensor = await prisma.sensor.upsert({
      where: { id: 'TEST001' },
      update: {},
      create: {
        id: 'TEST001',
        serialNumber: 'TEST001',
        locationId: '176629',
      },
    });

    console.log('Created sensor:', sensor);

    // Add measurements
    const measurements = [
      {
        id: 'test-1',
        serialNumber: 'TEST001',
        sensorId: 'TEST001',
        locationId: 176629,
        locationName: '1738BK',
        pm01: 5.2,
        pm02: 8.1,
        pm10: 12.3,
        atmp: 22.5,
        rhum: 45.2,
        rco2: 650,
        timestamp: 1735689600, // 2025-01-01
        date: '2025-01-01',
      },
      {
        id: 'test-2',
        serialNumber: 'TEST001',
        sensorId: 'TEST001',
        locationId: 176629,
        locationName: '1738BK',
        pm01: 4.8,
        pm02: 7.9,
        pm10: 11.8,
        atmp: 23.1,
        rhum: 46.1,
        rco2: 640,
        timestamp: 1735776000, // 2025-01-02
        date: '2025-01-02',
      },
      {
        id: 'test-3',
        serialNumber: 'TEST001',
        sensorId: 'TEST001',
        locationId: 176629,
        locationName: '1738BK',
        pm01: 6.1,
        pm02: 9.2,
        pm10: 13.7,
        atmp: 21.8,
        rhum: 44.8,
        rco2: 660,
        timestamp: 1735862400, // 2025-01-03
        date: '2025-01-03',
      },
      {
        id: 'test-4',
        serialNumber: 'TEST001',
        sensorId: 'TEST001',
        locationId: 176629,
        locationName: '1738BK',
        pm01: 5.5,
        pm02: 8.7,
        pm10: 12.9,
        atmp: 22.9,
        rhum: 45.8,
        rco2: 655,
        timestamp: 1735948800, // 2025-01-04
        date: '2025-01-04',
      },
      {
        id: 'test-5',
        serialNumber: 'TEST001',
        sensorId: 'TEST001',
        locationId: 176629,
        locationName: '1738BK',
        pm01: 4.9,
        pm02: 8.2,
        pm10: 12.1,
        atmp: 23.5,
        rhum: 46.5,
        rco2: 645,
        timestamp: 1736035200, // 2025-01-05
        date: '2025-01-05',
      },
    ];

    for (const measurement of measurements) {
      await prisma.measurement.upsert({
        where: { id: measurement.id },
        update: measurement,
        create: measurement,
      });
    }

    console.log(`Added ${measurements.length} sample measurements`);
  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const command = process.argv[2];
if (command === '--delete' || command === '--cleanup') {
  cleanupSampleData();
} else {
  addSampleData();
}
