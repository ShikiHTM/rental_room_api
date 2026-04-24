import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';
import { logger } from './logger.service.js';
import type { IMailConfig } from '../types/types.js';
import type SMTPTransport from 'nodemailer/lib/smtp-transport/index.js';
import amqp from 'amqplib';
import { queueConfig } from '../config/rabbitmq.config.js';


export default class MailWorker {
    static #instance: MailWorker;
    static transporter: nodemailer.Transporter;
    private static readonly QUEUE_NAME = 'email_queue_task';

    private constructor() {
        MailWorker.transporter = nodemailer.createTransport({
            host: mailConfig.host.name,
            port: mailConfig.host.port,
            secure: (process.env.NODE_ENV === 'production'),
            auth: {
                user: mailConfig.user.name,
                pass: mailConfig.user.password
            }
        } as SMTPTransport.Options);

        ( async () => {
            try {
                await MailWorker.transporter.verify();
                logger.info('Mail server is ready');
                await this.listen();
            }
            catch(error) {
                logger.error('Worker Initialization Error:', error);
            }
        })();
    };

    public static get instance(): MailWorker {
        if(!MailWorker.#instance) {
            MailWorker.#instance = new MailWorker();
        }
        return MailWorker.#instance;
    }

    private async listen() {
        try {
            const connection = await amqp.connect(queueConfig.url);
            const channel = await connection.createChannel();

            await channel.assertQueue(MailWorker.QUEUE_NAME, {durable: true});

            channel.prefetch(1);

            logger.info(`[x] MailWorker listening for messages in ${MailWorker.QUEUE_NAME}`);

            channel.consume(MailWorker.QUEUE_NAME, async (msg) => {
                if(msg !== null) {
                    try {
                        const config: IMailConfig = JSON.parse(msg.content.toString());

                        await MailWorker.transporter.sendMail(config);

                        logger.info(`Email sent successfully to ${config.to}`);
                        channel.ack(msg);
                    } catch(error) {
                        logger.error(`Failed to process email task: `, error);
                        channel.nack(msg);
                    }
                }
            })
        }catch(error) {
            logger.error('RabbitMQ Connection error:', error);
        }
    }
}