import * as dotenv from 'dotenv';
dotenv.config();

const parseRate = (raw: string | undefined): number => {
    if (!raw) return 0.10;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0 || n > 1) return 0.10;
    return n;
};

export const platformConfig = {
    feeRate: parseRate(process.env.PLATFORM_FEE_RATE),
} as const;
