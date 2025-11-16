import { exampleRouter } from '@/modules/example/routers/example.router';
import { measuresRouter } from '@/modules/airgradient/measures/routers/measures.router';
import { locationsRouter } from '@/modules/airgradient/locations/routers/locations.router';
import { sensorsRouter } from '@/modules/airgradient/sensors/routers/sensors.router';
import { measurementsRouter } from '@/modules/airgradient/measurements/routers/measurements.router';
import { alertsRouter } from '@/modules/airgradient/alerts/routers/alerts.router';
import { configurationsRouter } from '@/modules/airgradient/configurations/routers/configurations.router';

export const apiRouter = {
  example: exampleRouter,
  airgradient: {
    measures: measuresRouter,
    locations: locationsRouter,
    sensors: sensorsRouter,
    measurements: measurementsRouter,
    alerts: alertsRouter,
    configurations: configurationsRouter,
  },
};

export type ApiRouter = typeof apiRouter;

