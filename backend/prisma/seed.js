const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const { createClient } = require('@libsql/client');
const bcrypt = require('bcrypt');

async function main() {
    const adapter = new PrismaLibSql({ url: 'file:dev.db' });
    const prisma = new PrismaClient({ adapter });

    const email = 'admin@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Seeding user: ${email}...`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {},
            create: {
                email,
                password: hashedPassword,
                name: 'Admin User',
                role: 'ADMIN',
            },
        });
        console.log('User created:', user);
    } catch (e) {
        console.error('Error seeding user:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
