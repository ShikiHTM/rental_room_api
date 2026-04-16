import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from 'dotenv';
import { databaseConfig } from "../../config/database.config.js";

dotenv.config();

const safePassword = encodeURIComponent(databaseConfig.user.password || '');

const databaseUrl = `${databaseConfig.connection}://${databaseConfig.user.name}:${safePassword}@${databaseConfig.host}:${databaseConfig.port}/${databaseConfig.dbName}`;

if (!databaseUrl) {
    throw new Error("No 'DATABASE_URL' has been found.")
}

const prismaClientSingleton = () => {

    const pool = new Pool({ connectionString: databaseUrl, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;
