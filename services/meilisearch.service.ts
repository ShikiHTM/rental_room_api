import { Meilisearch } from 'meilisearch';
import { meilisearchConfig } from '../config/meilisearch.config.js';
import { logger } from './logger.service.js';
import type { IBookingDocument, IRoomDocument } from '../types/types.js';

class MeilisearchService {
    private client: Meilisearch;
    readonly ROOM_INDEX = 'rooms';
    readonly BOOKING_INDEX = 'bookings';

    constructor() {
        this.client = new Meilisearch({
            host: meilisearchConfig.host,
            apiKey: meilisearchConfig.apiKey,
        });
    }

    async setup() {
        try {
            await this.client.index(this.ROOM_INDEX).updateSettings({
                searchableAttributes: ['title', 'description', 'address', 'city', 'hostName'],
                filterableAttributes: ['status', 'city', 'pricePerNight', 'maxGuests', 'hostId'],
                sortableAttributes: ['pricePerNight', 'createdAt'],
            });

            await this.client.index(this.BOOKING_INDEX).updateSettings({
                searchableAttributes: ['userName', 'userEmail', 'roomTitle', 'roomCity'],
                filterableAttributes: ['status', 'userId', 'roomId'],
                sortableAttributes: ['createdAt', 'totalPrice'],
            });

            logger.info('Meilisearch indexes configured');
        } catch (error) {
            logger.error('Failed to configure Meilisearch indexes', error);
        }
    }

    // ─── Rooms ───────────────────────────────────────────────────────────────

    async upsertRoom(room: IRoomDocument) {
        try {
            await this.client.index(this.ROOM_INDEX).addDocuments([room]);
        } catch (error) {
            logger.error(`Failed to upsert room ${room.id} to Meilisearch`, error);
        }
    }

    async deleteRoom(roomId: string) {
        try {
            await this.client.index(this.ROOM_INDEX).deleteDocument(roomId);
        } catch (error) {
            logger.error(`Failed to delete room ${roomId} from Meilisearch`, error);
        }
    }

    async searchRooms(query: string, filters?: {
        city?: string;
        minPrice?: number;
        maxPrice?: number;
        maxGuests?: number;
        status?: string;
    }) {
        const filterParts: string[] = [];

        if (filters?.city) filterParts.push(`city = "${filters.city}"`);
        if (filters?.minPrice !== undefined) filterParts.push(`pricePerNight >= ${filters.minPrice}`);
        if (filters?.maxPrice !== undefined) filterParts.push(`pricePerNight <= ${filters.maxPrice}`);
        if (filters?.maxGuests !== undefined) filterParts.push(`maxGuests >= ${filters.maxGuests}`);
        if (filters?.status) filterParts.push(`status = "${filters.status}"`);

        return this.client.index(this.ROOM_INDEX).search(query, {
            ...(filterParts.length && { filter: filterParts.join(' AND ') }),
            sort: ['createdAt:desc'],
        });
    }

    // ─── Bookings ─────────────────────────────────────────────────────────────

    async upsertBooking(booking: IBookingDocument) {
        try {
            await this.client.index(this.BOOKING_INDEX).addDocuments([booking]);
        } catch (error) {
            logger.error(`Failed to upsert booking ${booking.id} to Meilisearch`, error);
        }
    }

    async deleteBooking(bookingId: string) {
        try {
            await this.client.index(this.BOOKING_INDEX).deleteDocument(bookingId);
        } catch (error) {
            logger.error(`Failed to delete booking ${bookingId} from Meilisearch`, error);
        }
    }

    async searchBookings(query: string, filters?: {
        status?: string;
        userId?: string;
        roomId?: string;
    }) {
        const filterParts: string[] = [];

        if (filters?.status) filterParts.push(`status = "${filters.status}"`);
        if (filters?.userId) filterParts.push(`userId = "${filters.userId}"`);
        if (filters?.roomId) filterParts.push(`roomId = "${filters.roomId}"`);

        return this.client.index(this.BOOKING_INDEX).search(query, {
            ...(filterParts.length && { filter: filterParts.join(' AND ') }),
            sort: ['createdAt:desc'],
        });
    }
}

export const meiliService = new MeilisearchService();
