import * as dotenv from 'dotenv'
dotenv.config();
import { defineConfig } from '@prisma/config'

export default defineConfig({
    schema: './Database/Schema/',
    migrations: {
        path: './Database/Migrations'
    },
    datasource: {
        url: process.env.DATABASE_URl!,
    }
})