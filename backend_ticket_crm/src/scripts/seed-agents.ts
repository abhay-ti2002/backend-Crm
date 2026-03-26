import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env from root
dotenv.config({ path: join(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('MONGO_URI not found in .env');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'agent', 'customer'], default: 'customer' },
    sector: { type: String },
    supportLevel: { type: Number, default: 1 },
});

async function seed() {
    console.log('Connecting to MongoDB Atlas...');
    try {
        await mongoose.connect(MONGO_URI!);
        console.log('Connected!');

        const User = mongoose.model('User', UserSchema);
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const sectors = ['Finance', 'IT', 'HR', 'Operations', 'Support'];
        let count = 0;

        for (const sector of sectors) {
            console.log(`\n--- Seeding sector: ${sector} ---`);

            // Seed 2 agents for L1 and 2 for L2
            for (let level = 1; level <= 2; level++) {
                for (let i = 1; i <= 2; i++) {
                    const name = `${sector}_Agent_${level}_${i}`;
                    const email = `${sector.toLowerCase()}_agent${i}_l${level}@example.com`;

                    const existing = await User.findOne({ email });
                    if (existing) {
                        console.log(`Agent ${email} already exists. Skipping...`);
                        continue;
                    }

                    await User.create({
                        name,
                        email,
                        password: hashedPassword,
                        role: 'agent',
                        sector,
                        supportLevel: level,
                    });
                    console.log(`Created: ${name} (${email})`);
                    count++;
                }
            }
        }

        console.log(`\n Successfully seeded ${count} new agents!`);
        console.log(`Password for all: ${password}`);

    } catch (error) {
        console.error(' Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
