import * as dotenv from 'dotenv';
dotenv.config();

export const meilisearchConfig = {
    host: process.env.MEILISEARCH_HOST ?? 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY ?? '',
};
