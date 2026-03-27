import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load .env from root
dotenv.config({ path: join(process.cwd(), '.env') });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'agent', 'customer'], default: 'customer' },
    supportLevel: { type: Number, default: 1 },
});

async function seed() {
    console.log('⏳ Connecting to MongoDB Atlas...');
    try {
        await mongoose.connect(MONGO_URI!);
        console.log('✅ Connected!');

        const User = mongoose.model('User', UserSchema);

        const adminEmail = 'admin@crm.io';
        const adminPassword = 'admin123';

        const adminEntry = {
            name: 'admin',
            email: adminEmail,
            password: adminPassword,
            role: 'admin',
            supportLevel: 3, // Highest level for admin
        };

        const existing = await User.findOne({ email: adminEmail });
        if (existing) {
            console.log('⚠️ Admin with this email already exists. Updating password...');
            existing.password = adminPassword;
            await existing.save();
            console.log('✅ Password updated!');
        } else {
            await User.create(adminEntry);
            console.log('✅ Admin account created successfully!');
        }

        console.log('\n--- Credentials ---');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log('-------------------\n');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
