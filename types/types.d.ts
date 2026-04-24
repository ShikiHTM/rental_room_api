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
    role: 'USER' | 'HOST' | 'ADMIN';
    iat?: number;
    exp?: number;
};
