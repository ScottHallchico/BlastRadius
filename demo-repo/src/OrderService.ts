import { RedisClient } from './lib/redis';

export class OrderService {
    private redis = new RedisClient();

    async createOrder(orderData: any) {
        console.log("Saving order to DB...");
        // Hidden coupling: No direct import of NotificationService,
        // but it relies on this exact channel and schema.
        await this.redis.publish('order-events', JSON.stringify({
            type: 'ORDER_CREATED',
            data: orderData
        }));
    }
}
