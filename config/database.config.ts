import * as dotenv from 'dotenv';
dotenv.config();

export const databaseConfig = {
    connection: process.env.DATABASE,
    user: {
        name: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD
    },
    port: Number(process.env.DATABASE_PORT) || 3306,
    host: process.env.DATABASE_HOST || '127.0.0.1',
    dbName: process.env.DATABASE_NAME
} as const;