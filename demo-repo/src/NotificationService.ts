import { RedisClient } from './lib/redis';

export class NotificationService {
    private redis = new RedisClient();

    constructor() {
        // INVARIANT: Must remain backward compatible with v1 order events
        // See Architecture Decision Record: ADR-012
        this.redis.subscribe('order-events', (message) => {
            const event = JSON.parse(message);
            if (event.type === 'ORDER_CREATED') {
                this.sendEmail(event.data.userId);
            }
        });
    }

    private sendEmail(userId: string) {
        console.log(`Sending email to ${userId}`);
    }
}
