import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env from root
dotenv.config({ path: join(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error(' MONGO_URI not found in .env');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'agent', 'customer'], default: 'customer' },
});

async function seed() {
    console.log('⏳ Connecting to MongoDB Atlas...');
    try {
        await mongoose.connect(MONGO_URI!);
        console.log('✅ Connected!');

        const User = mongoose.model('User', UserSchema);

        const email = 'jass@user.io';
        const password = 'user123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existing = await User.findOne({ email });
        if (existing) {
            console.log(`⚠️ User ${email} already exists. Updating password...`);
            existing.password = hashedPassword;
            await existing.save();
        } else {
            await User.create({
                name: 'Jass',
                email,
                password: hashedPassword,
                role: 'customer',
            });
            console.log(`✅ User ${email} created successfully!`);
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
