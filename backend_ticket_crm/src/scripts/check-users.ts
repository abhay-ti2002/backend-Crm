import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { join } from 'path';

dotenv.config({ path: join(process.cwd(), '.env') });
const MONGO_URI = process.env.MONGO_URI;

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: String,
});

async function check() {
    await mongoose.connect(MONGO_URI!);
    const User = mongoose.model('User', UserSchema);
    const users = await User.find({}, { name: 1, email: 1, role: 1, password: 1 });
    console.log('--- DATABASE USERS ---');
    users.forEach(u => {
        console.log(`- ${u.name} (${u.role}): ${u.email} | Hash starts with: ${u.password?.substring(0, 10)}`);
    });
    console.log('----------------------');
    await mongoose.disconnect();
}
check();
