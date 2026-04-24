import dotenv from 'dotenv';
dotenv.config();

export const queueConfig = {
    url: `amqp://${process.env.RABBITMQ_NAME}:${process.env.RABBITMQ_PASS}@${process.env.APP_HOST}:${process.env.RABBITMQ_PORT}`
}