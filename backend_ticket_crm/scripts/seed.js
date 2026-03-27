const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const DB_URI = 'mongodb+srv://prerna:P6CTddoNdtu7NXVW@crm.raefdo8.mongodb.net/crm_ticketing';

async function seed() {
    await mongoose.connect(DB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // 1. Find the agent
    const agent = await db.collection('users').findOne({ email: 'support_agent2_l3@example.com' });
    if (!agent) {
        console.error('Agent support_agent2_l3@example.com not found. Exiting...');
        process.exit(1);
    }

    // 2. Create users
    const hashedPassword = await bcrypt.hash('password123', 10);

    const usersToInsert = [
        {
            name: 'krish',
            email: 'krisharora3406@gmail.com',
            password: hashedPassword,
            role: 'customer',
            supportLevel: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Rohan Sharma',
            email: 'rohan.random@example.com',
            password: hashedPassword,
            role: 'customer',
            supportLevel: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Anita Verma',
            email: 'anita.random@example.com',
            password: hashedPassword,
            role: 'customer',
            supportLevel: 1,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const userOps = usersToInsert.map(u => ({
        updateOne: {
            filter: { email: u.email },
            update: { $set: u },
            upsert: true
        }
    }));

    await db.collection('users').bulkWrite(userOps);
    console.log('Upserted 3 users (krish, Rohan, Anita)');

    const krish = await db.collection('users').findOne({ email: 'krisharora3406@gmail.com' });
    const rohan = await db.collection('users').findOne({ email: 'rohan.random@example.com' });
    const anita = await db.collection('users').findOne({ email: 'anita.random@example.com' });

    // 3. Raise issues (tickets)
    const ticketsToInsert = [
        {
            title: 'Login Issue for Krish',
            description: 'Unable to access the portal after recent update.',
            sector: 'Support',
            status: 'forwarded',
            level: 1,
            createdBy: krish._id,
            assignedTo: agent._id,
            history: [
                {
                    action: "Ticket Created",
                    performedBy: krish._id,
                    timestamp: new Date()
                },
                {
                    action: "Status updated to forwarded",
                    performedBy: agent._id,
                    timestamp: new Date()
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: 'Billing discrepancy for Rohan',
            description: 'My recent order shows incorrect total amount.',
            sector: 'Support',
            status: 'forwarded',
            level: 1,
            createdBy: rohan._id,
            assignedTo: agent._id,
            history: [
                {
                    action: "Ticket Created",
                    performedBy: rohan._id,
                    timestamp: new Date()
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            title: 'Product defect reported by Anita',
            description: 'The received item is missing critical components.',
            sector: 'Support',
            status: 'forwarded',
            level: 1,
            createdBy: anita._id,
            assignedTo: agent._id,
            history: [
                {
                    action: "Ticket Created",
                    performedBy: anita._id,
                    timestamp: new Date()
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const result = await db.collection('tickets').insertMany(ticketsToInsert);
    console.log(`Inserted ${result.insertedCount} tickets assigned to ${agent.email}`);

    await mongoose.disconnect();
}

seed().catch(console.error);
