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

export interface UserPayload {
    id: string;
    email?: string;
    role: 'USER' | 'HOST' | 'ADMIN';
    iat?: number;
    exp?: number;
};
