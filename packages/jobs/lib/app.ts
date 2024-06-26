import './tracer.js';
import { Temporal } from './temporal.js';
import { server } from './server.js';
import { cronAutoIdleDemo } from './crons/autoIdleDemo.js';
import { deleteOldActivityLogs } from './crons/deleteOldActivities.js';
import { deleteSyncsData } from './crons/deleteSyncsData.js';
import { logger } from '@nangohq/shared';

try {
    const port = parseInt(process.env['NANGO_JOBS_PORT'] || '') || 3005;
    server.listen(port);
    logger.info(`🚀 Jobs service ready at http://localhost:${port}`);
    const temporalNs = process.env['TEMPORAL_NAMESPACE'] || 'default';
    const temporal = new Temporal(temporalNs);

    // This promise never resolve
    void temporal.start();

    // Register recurring tasks
    cronAutoIdleDemo();
    deleteOldActivityLogs();
    deleteSyncsData();

    // handle SIGTERM
    process.on('SIGTERM', () => {
        temporal.stop();
        server.server.close(() => {
            process.exit(0);
        });
    });
} catch (err) {
    logger.error(`[JOBS]: ${JSON.stringify(err)}`);
    process.exit(1);
}
