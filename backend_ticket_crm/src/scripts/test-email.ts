import * as dotenv from 'dotenv';
import { join } from 'path';
import * as nodemailer from 'nodemailer';

// Load .env
dotenv.config({ path: join(process.cwd(), '.env') });

async function testEmail() {
    console.log('⏳ Testing Email Connectivity to Zoho...');

    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'smtp.zoho.in',
        port: parseInt(process.env.MAIL_PORT || '587'),
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    try {
        // Verify connection configuration
        await transporter.verify();
        console.log('✅ SMTP Connection Verified Successfully!');

        // Send a test email
        const info = await transporter.sendMail({
            from: `"Ticket CRM Test" <${process.env.MAIL_USER}>`,
            to: process.env.MAIL_USER, // Send to yourself
            subject: 'Test Email from Ticket CRM',
            text: 'This is a test email to verify the connection.',
        });

        console.log('✅ Test Email Sent Successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Email Test Failed:', error.message);
    } finally {
        process.exit(0);
    }
}

testEmail();
