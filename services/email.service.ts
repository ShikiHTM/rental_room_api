import nodemailer from 'nodemailer';
import { mailConfig } from '../config/mail.config.js';
import { logger } from './logger.service.js';
import { transport } from 'winston';

interface IMailConfig {
    to: string,
    subject: string | 'Untitled',
    text: string,
    html?: string,
}

export default class Mail {
    static #instance: Mail;
    static transporter: nodemailer.Transporter;

    private constructor() {
        Mail.transporter = nodemailer.createTransport({
            host: mailConfig.host.name!,
            port: mailConfig.host.port,
            secure: (process.env.NODE_ENV === 'production'),
            auth: {
                user: mailConfig.user.name,
                pass: mailConfig.user.password
            }
        });

        ( async () => {
            try {
                await Mail.transporter.verify();
                logger.info('Mail server is ready');
            }
            catch(error) {
                logger.error('Verification error:', error);
            }
        })
    };

    public static get instance(): Mail {
        if(!Mail.#instance) {
            Mail.#instance = new Mail();
        }
        return Mail.#instance;
    }

    public static async send(config: IMailConfig) {
        try {
            await Mail.transporter.sendMail(config);
            logger.info('email sent successfully');
        } catch(error) {
            logger.error('Error while sending email', error);
        }
    }
}