import dotenv from 'dotenv';
dotenv.config();

const env = process.env;

export const mailConfig = {
    mailer: env.MAIL_MAILER,
    scheme: env.MAIL_SCHEME,
    host: {
        name: env.MAIL_HOST,
        port: env.MAIL_PORT
    },
    user: {
        name: env.MAIL_USERNAME,
        password: env.MAIL_PASSWORD
    },
    encryption: env.MAIL_ENCRYPTION,
    address: env.MAIL_FROM_ADDRESS,
    name: env.MAIL_FROM_NAME
}