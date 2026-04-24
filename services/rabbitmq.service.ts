import amqp from 'amqplib'
import { logger } from './logger.service.js';
import { queueConfig } from '../config/rabbitmq.config.js';

export default class QueueService {
    private static connection: amqp.ChannelModel;
    private static channel: amqp.Channel;

    static async sendToEmailQueue(data: object) {
        try {
            if(!this.channel) {
                this.connection = await amqp.connect(queueConfig.url!);
                this.channel = await this.connection.createChannel();
                await this.channel.assertQueue(`email_queue_task`, {durable: true});
            }

            const payload = Buffer.from(JSON.stringify(data));
            this.channel.sendToQueue(`email_queue_task`, payload, {persistent: true});

            logger.info(" [x] Sent email task to queue");
        }catch(error) {
            logger.error("Failed to push to queue", error);
        }
    }
}