import { randomUUID } from 'node:crypto';
import { Meilisearch } from 'meilisearch';
import * as dotenv from 'dotenv';
dotenv.config();

import db from './db.js';

// Override MEILI host for local seeding — the .env value points to the
// public domain (which doesn't expose port 7700). For a host-side script we
// connect to the published Docker port directly.
const meili = new Meilisearch({
    host: process.env.SEED_MEILISEARCH_HOST ?? 'http://localhost:7700',
    apiKey: process.env.MEILISEARCH_API_KEY ?? '',
});

type RoomSeed = {
    title: string;
    description: string;
    address: string;
    city: string;
    pricePerNight: number;
    maxGuests: number;
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    images: string[];
};

const ROOMS: RoomSeed[] = [
    { title: 'Skyline Loft District 1', description: 'Floor-to-ceiling windows over Saigon. Walking distance to Ben Thanh.', address: '12 Le Loi', city: 'Ho Chi Minh', pricePerNight: 1400000, maxGuests: 2, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200'] },
    { title: 'My Khe Oceanfront Studio', description: 'Wake up to the sound of waves. 2 minutes to the beach.', address: '88 Vo Nguyen Giap', city: 'Da Nang', pricePerNight: 1650000, maxGuests: 2, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'] },
    { title: 'Old Quarter Garden House', description: 'Quiet courtyard hidden behind the chaos of Hang Bo street.', address: '24 Hang Be', city: 'Hanoi', pricePerNight: 720000, maxGuests: 3, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200'] },
    { title: 'Da Lat Pine Forest Cabin', description: 'Wood-burning stove, fog every morning, no neighbors.', address: 'Hill 12, Tuyen Lam', city: 'Da Lat', pricePerNight: 2100000, maxGuests: 4, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200'] },
    { title: 'Hoi An Heritage Townhouse', description: '200-year-old tile-roof home, restored. One block from the lantern street.', address: '67 Tran Phu', city: 'Hoi An', pricePerNight: 1300000, maxGuests: 4, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=1200'] },
    { title: 'Riverside Penthouse Saigon', description: 'Wraparound terrace overlooking the Saigon River.', address: '54 Ton Duc Thang', city: 'Ho Chi Minh', pricePerNight: 4800000, maxGuests: 4, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200'] },
    { title: 'Mui Ne Beach Bungalow', description: 'Outdoor shower, hammock, ten steps from the sand.', address: 'Ham Tien Beach Road', city: 'Phan Thiet', pricePerNight: 1100000, maxGuests: 2, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200'] },
    { title: 'Sapa Valley Retreat', description: 'Glass-walled cabin facing the rice terraces of Muong Hoa.', address: 'Muong Hoa Valley', city: 'Sapa', pricePerNight: 1450000, maxGuests: 2, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1518733057094-95b53143d2a7?w=1200'] },
    { title: 'West Lake Designer Apartment', description: 'Mid-century furnishings, lake view, espresso machine.', address: '15 Quang An', city: 'Hanoi', pricePerNight: 1250000, maxGuests: 2, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1200'] },
    { title: 'Phu Quoc Beach Villa', description: 'Private pool, 4 bedrooms, chef on request.', address: 'Ong Lang Bay', city: 'Phu Quoc', pricePerNight: 6800000, maxGuests: 8, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200'] },
    { title: 'Artist Loft District 3', description: 'High ceilings, paint-splattered floor, gallery wall.', address: '22 Vo Van Tan', city: 'Ho Chi Minh', pricePerNight: 980000, maxGuests: 2, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200'] },
    { title: 'Nha Trang Skybox', description: 'Floor 28. Wake up at eye level with the cable cars to Vinpearl.', address: '5 Tran Phu', city: 'Nha Trang', pricePerNight: 1700000, maxGuests: 3, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200'] },
    { title: 'Hanoi Embassy District Studio', description: 'Quiet tree-lined street, walking distance to West Lake cafes.', address: '8 Ba Huyen Thanh Quan', city: 'Hanoi', pricePerNight: 890000, maxGuests: 2, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200'] },
    { title: 'Can Tho Riverboat Stay', description: 'Sleep on a converted Mekong cargo boat, breakfast at the floating market.', address: 'Ninh Kieu Wharf', city: 'Can Tho', pricePerNight: 1350000, maxGuests: 2, status: 'APPROVED', images: ['https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=1200'] },
    { title: 'Quy Nhon Cliff House', description: 'Off-grid solar, cliffside infinity pool, three private coves below.', address: 'Bai Xep', city: 'Quy Nhon', pricePerNight: 3200000, maxGuests: 6, status: 'PENDING', images: ['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200'] },
    { title: 'Modern Minimalist Apartment D7', description: 'White-on-white, smart locks, fast wifi — built for remote work.', address: '120 Le Van Luong', city: 'Ho Chi Minh', pricePerNight: 1150000, maxGuests: 2, status: 'PENDING', images: [] },
    { title: 'Hue Imperial Garden Suite', description: 'Walled garden, lotus pond, just outside the Citadel.', address: '12 Le Loi', city: 'Hue', pricePerNight: 1050000, maxGuests: 3, status: 'PENDING', images: ['https://images.unsplash.com/photo-1551038247-3d9af20df552?w=1200'] },
    { title: 'Vung Tau Surf Shack', description: 'Boards in the hallway, fish grill out back. Sand always in the kitchen.', address: 'Bai Sau Front', city: 'Vung Tau', pricePerNight: 780000, maxGuests: 4, status: 'PENDING', images: [] },
    { title: 'Ha Long Bay Junk Cabin', description: 'Overnight on a wooden junk. Karaoke and kayaks included.', address: 'Tuan Chau Marina', city: 'Ha Long', pricePerNight: 2400000, maxGuests: 2, status: 'REJECTED', images: ['https://images.unsplash.com/photo-1528127269322-539801943592?w=1200'] },
    { title: 'Sketchy Basement Room', description: 'No windows, bring your own light. Dumpster aesthetic.', address: '404 Nowhere Alley', city: 'Ho Chi Minh', pricePerNight: 80000, maxGuests: 1, status: 'REJECTED', images: [] },
];

async function main() {
    const hosts = await db.user.findMany({
        where: { role: { in: ['HOST', 'ADMIN'] } },
        select: { id: true, fullName: true, role: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    });

    if (hosts.length === 0) {
        console.error('No HOST or ADMIN users in the database. Run `pnpm seed:users` first.');
        process.exit(1);
    }

    console.log(`Distributing ${ROOMS.length} rooms across ${hosts.length} host${hosts.length === 1 ? '' : 's'}.`);

    let created = 0, skipped = 0;
    const meiliDocs: any[] = [];

    for (let i = 0; i < ROOMS.length; i++) {
        const seed = ROOMS[i]!;
        const host = hosts[i % hosts.length]!;

        let room = await db.room.findFirst({
            where: { title: seed.title, hostId: host.id },
        });

        if (room) {
            skipped++;
        } else {
            room = await db.room.create({
                data: {
                    title: seed.title,
                    description: seed.description,
                    address: seed.address,
                    city: seed.city,
                    pricePerNight: seed.pricePerNight,
                    maxGuests: seed.maxGuests,
                    status: seed.status,
                    hostId: host.id,
                    images: {
                        create: seed.images.map((imageUrl) => ({
                            imageUrl,
                            publicId: randomUUID(),
                        })),
                    },
                },
            });
            created++;
        }

        meiliDocs.push({
            id: room.id,
            title: room.title,
            description: room.description,
            address: room.address,
            city: room.city,
            pricePerNight: Number(room.pricePerNight),
            maxGuests: room.maxGuests,
            status: room.status,
            hostId: room.hostId,
            hostName: host.fullName,
            createdAt: room.createdAt.toISOString(),
        });
    }

    if (meiliDocs.length > 0) {
        try {
            const task = await meili.index('rooms').addDocuments(meiliDocs, { primaryKey: 'id' });
            await meili.tasks.waitForTask(task.taskUid, { timeOutMs: 15000 });
            const finished = await meili.tasks.getTask(task.taskUid);
            if (finished.status === 'failed') {
                console.warn(`Meilisearch indexing failed: ${finished.error?.message ?? 'unknown error'}`);
            } else {
                console.log(`Pushed ${meiliDocs.length} rooms to Meilisearch (task #${task.taskUid}: ${finished.status}).`);
            }
        } catch (err) {
            console.warn('Meilisearch upsert failed — rooms will only appear via DB queries. Error:', (err as Error).message);
        }
    }

    console.log(`Seeded ${created} rooms (${skipped} already existed).`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
