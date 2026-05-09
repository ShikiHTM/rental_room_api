
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

export interface IRoomDocument {
    id: string;
    title: string;
    description: string | null;
    address: string;
    city: string;
    pricePerNight: number;
    maxGuests: number;
    status: string;
    hostId: string;
    hostName: string;
    createdAt: string;
}

export interface IBookingDocument {
    id: string;
    status: string;
    checkInDate: string;
    checkOutDate: string;
    totalPrice: number;
    userId: string;
    userName: string;
    userEmail: string;
    roomId: string;
    roomTitle: string;
    roomCity: string;
    createdAt: string;
}