import cron from 'node-cron';
import db from '../Database/Utils/db.js';
import { logger } from '../services/logger.service.js';

const PAYMENT_DEADLINE_HOURS = 24;

export function startCancelExpiredBookingsJob() {
    // runs every 15 minutes
    cron.schedule('*/15 * * * *', async () => {
        const deadline = new Date(Date.now() - PAYMENT_DEADLINE_HOURS * 60 * 60 * 1000);

        const { count } = await db.booking.updateMany({
            where: {
                status: 'PENDING',
                createdAt: { lt: deadline }
            },
            data: { status: 'CANCELLED' }
        });

        if (count > 0) logger.info(`Auto-cancelled ${count} expired booking(s)`);
    });
}
