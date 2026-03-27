import mongoose from 'mongoose';

const MONGO_URI = 'mongodb+srv://prerna:P6CTddoNdtu7NXVW@crm.raefdo8.mongodb.net/crm_ticketing';

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const usersData = [
        {
            _id: '69c5876e5df71bddb4ac42e2',
            name: "Support_Agent_2_1",
            email: "support_agent1_l2@example.com",
            password: "$2b$10$tsEjFGBFzT8Nx1mprQT5u.WhB.Ca85v70s7YF3sFIXkrDzJ//hxfC",
            role: "agent",
            sector: "Support",
            supportLevel: 2
        },
        {
            _id: '69c5876e5df71bddb4ac42e4',
            name: "Support_Agent_2_2",
            email: "support_agent2_l2@example.com",
            password: "$2b$10$tsEjFGBFzT8Nx1mprQT5u.WhB.Ca85v70s7YF3sFIXkrDzJ//hxfC",
            role: "agent",
            sector: "Support",
            supportLevel: 2
        },
        {
            _id: '69c5876f5df71bddb4ac42e6',
            name: "Support_Agent_3_1",
            email: "support_agent1_l3@example.com",
            password: "$2b$10$tsEjFGBFzT8Nx1mprQT5u.WhB.Ca85v70s7YF3sFIXkrDzJ//hxfC",
            role: "agent",
            sector: "Support",
            supportLevel: 3
        },
        {
            _id: '69c5876f5df71bddb4ac42e8',
            name: "Support_Agent_3_2",
            email: "support_agent2_l3@example.com",
            password: "$2b$10$tsEjFGBFzT8Nx1mprQT5u.WhB.Ca85v70s7YF3sFIXkrDzJ//hxfC",
            role: "agent",
            sector: "Support",
            supportLevel: 3
        },
        {
            _id: '69c58c3a4bf0bfbf49d3d8b4',
            name: "prerna",
            email: "prernaarora457@gmail.com",
            password: "$2b$10$e.nE0z3hwnVt/yuP7/3m4ucijDaMb0kvd/pfkaJNgrz./bafFJuiS",
            supportLevel: 1,
            role: "customer"
        }
    ];

    // Upsert Users
    for (const userData of usersData) {
        await mongoose.connection.collection('users').updateOne(
            { _id: new mongoose.Types.ObjectId(userData._id) },
            { $set: { ...userData, _id: new mongoose.Types.ObjectId(userData._id) } },
            { upsert: true }
        );
    }
    console.log('✅ Users seeded/updated');

    const ordersData = [
        { orderId: '69c27dfce8c3b9a369e6d5be', itemId: '69c26166656b8028ccdc0638' },
        { orderId: '69c27e4fe8c3b9a369e6d5c2', itemId: '69c26257656b8028ccdc063d' },
        { orderId: '69c282de17ed36ddf986b64d', itemId: '69c26300d01659542dfc334f' },
        { orderId: '69c386cfc144171c00766747', itemId: '69c2632ad01659542dfc3357' }
    ];

    const agentIds = [
        '69c5876e5df71bddb4ac42e2',
        '69c5876e5df71bddb4ac42e4',
        '69c5876f5df71bddb4ac42e6',
        '69c5876f5df71bddb4ac42e8'
    ];

    const customerId = '69c58c3a4bf0bfbf49d3d8b4';

    // Create Tickets
    for (let i = 0; i < ordersData.length; i++) {
        const order = ordersData[i];
        const agentId = agentIds[i % agentIds.length];

        const ticketData = {
            title: `Support Ticket for Order #${order.orderId}`,
            description: `Issue reported with item #${order.itemId} in order #${order.orderId}.`,
            sector: 'Support',
            status: 'received',
            level: 1,
            assignedTo: new mongoose.Types.ObjectId(agentId),
            createdBy: new mongoose.Types.ObjectId(customerId),
            orderId: new mongoose.Types.ObjectId(order.orderId),
            itemId: new mongoose.Types.ObjectId(order.itemId),
            history: [
                {
                    action: 'Ticket Created',
                    performedBy: new mongoose.Types.ObjectId(customerId),
                    timestamp: new Date()
                },
                {
                    action: 'Assigned to Agent',
                    performedBy: new mongoose.Types.ObjectId(agentId),
                    performedOn: new mongoose.Types.ObjectId(agentId),
                    timestamp: new Date()
                }
            ],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await mongoose.connection.collection('tickets').insertOne(ticketData);
    }

    console.log('✅ 4 Tickets seeded as per request');
    console.log('🚀 Seeding complete.');
    await mongoose.disconnect();
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
