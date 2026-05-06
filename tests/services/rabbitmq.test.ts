import amqp from 'amqplib';
import type { IMailConfig } from '../../types/types.js';
import { logger } from '../../services/logger.service.js';

async function testSend() {
    try {
        const connection = amqp.connect('amqp://shiki:Botan123@localhost:5672');
        const channel = (await connection).createChannel();

        const queue = 'email_queue';
        const msg: IMailConfig = {
            to: 'kizukusan123@gmail.com',
            subject: 'Hello from RabbitMQ',
            text: 'Testing texts'
        };

        (await channel).assertQueue(queue, {durable: true});

        (await channel).sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

        logger.info('Mail is sent to queue successfully');

        setTimeout(async () => {
            (await connection).close();
            process.exit(0);
        }, 500)

    }catch(error) {
        logger.error(`Test Error: `, error);
    }
}

testSend();