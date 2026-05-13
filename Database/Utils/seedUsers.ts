import bcrypt from 'bcrypt';
import db from './db.js';

const SEED_PASSWORD = 'Test@1234';

const USERS: Array<{
    email: string;
    fullName: string;
    phoneNumber: string;
    role: 'USER' | 'HOST';
    banned?: boolean;
}> = [
    { email: 'alice.tran@quolifa.test',     fullName: 'Alice Tran',     phoneNumber: '+84901000001', role: 'USER' },
    { email: 'binh.nguyen@quolifa.test',    fullName: 'Binh Nguyen',    phoneNumber: '+84901000002', role: 'USER' },
    { email: 'chau.pham@quolifa.test',      fullName: 'Chau Pham',      phoneNumber: '+84901000003', role: 'USER' },
    { email: 'duc.le@quolifa.test',         fullName: 'Duc Le',         phoneNumber: '+84901000004', role: 'USER' },
    { email: 'evelyn.ho@quolifa.test',      fullName: 'Evelyn Ho',      phoneNumber: '+84901000005', role: 'USER' },
    { email: 'frank.do@quolifa.test',       fullName: 'Frank Do',       phoneNumber: '+84901000006', role: 'USER', banned: true },
    { email: 'giang.vu@quolifa.test',       fullName: 'Giang Vu',       phoneNumber: '+84901000007', role: 'USER' },
    { email: 'hieu.bui@quolifa.test',       fullName: 'Hieu Bui',       phoneNumber: '+84901000008', role: 'HOST' },
    { email: 'ivy.dang@quolifa.test',       fullName: 'Ivy Dang',       phoneNumber: '+84901000009', role: 'HOST' },
    { email: 'khoa.truong@quolifa.test',    fullName: 'Khoa Truong',    phoneNumber: '+84901000010', role: 'HOST' },
];

async function main() {
    const hashed = await bcrypt.hash(SEED_PASSWORD, 10);
    const now = new Date();
    let created = 0, skipped = 0;

    for (const u of USERS) {
        const existing = await db.user.findUnique({ where: { email: u.email } });
        if (existing) {
            skipped++;
            continue;
        }

        await db.user.create({
            data: {
                email: u.email,
                password: hashed,
                fullName: u.fullName,
                phoneNumber: u.phoneNumber,
                role: u.role,
                verifiedAt: now,
                bannedAt: u.banned ? now : null,
                banReason: u.banned ? 'Seeded banned account for testing' : null,
            },
        });
        created++;
    }

    console.log(`Seeded ${created} users (${skipped} already existed).`);
    console.log(`All seeded accounts share password: ${SEED_PASSWORD}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
