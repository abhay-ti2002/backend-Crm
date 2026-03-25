import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailingService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailingService.name);

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('MAIL_HOST') || 'smtp.ethereal.email',
            port: this.configService.get<number>('MAIL_PORT') || 587,
            auth: {
                user: this.configService.get<string>('MAIL_USER') || 'placeholder@example.com',
                pass: this.configService.get<string>('MAIL_PASS') || 'password',
            },
        });
    }

    async sendEmail(to: string, subject: string, text: string, html?: string) {
        this.logger.log(`Attempting to send email to: ${to} | Subject: ${subject}`);
        try {
            const info = await this.transporter.sendMail({
                from: '"Ticket CRM" <no-reply@ticketcrm.com>',
                to,
                subject,
                text,
                html,
            });
            this.logger.log(`SUCCESS: Email sent to ${to}. MessageId: ${info.messageId}`);
            return info;
        } catch (error) {
            this.logger.error(`FAILURE: Could not send email to ${to}. Error: ${error.message}`);
        }
    }
}
