
export interface ApiResponse<T = unknown> {
    message?: string;
    data?: T;
}

export interface IMailConfig {
    from: string,
    to: string,
    subject: string | 'Untitled',
    text: string,
    html?: string,
    template?: string
};

export interface IUserPayload {
    id: string;
    email?: string;
    role: 'USER' | 'HOST' | 'ADMIN';
    iat?: number;
    exp?: number;
    bannedAt?: Date | null;
    banReason?: string | null;
    banExpiresAt?: Date | null;
};

export interface IPaymentStrategy {
    pay: (amount: number) => Promise<void>;
}