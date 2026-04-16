import * as dotenv from 'dotenv'
dotenv.config();
import { defineConfig } from '@prisma/config'
import { databaseConfig } from './config/database.config.js';

const safePassword = encodeURIComponent(databaseConfig.user.password || '');

export default defineConfig({
    schema: './Database/Schema/',
    migrations: {
        path: './Database/Migrations'
    },
    datasource: {
        url: `${databaseConfig.connection}://${databaseConfig.user.name}:${safePassword}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.dbName}`!,
    }
})
