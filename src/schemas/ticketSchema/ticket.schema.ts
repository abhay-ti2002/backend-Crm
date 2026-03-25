import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { UserRole } from '../userSchema/user.schema';

export enum TicketStatus {
    NEW = 'new',
    RECEIVED = 'received',
    RESOLVED = 'resolved',
    FORWARDED = 'forwarded',
    REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class HistoryLog {
    @Prop({ required: true })
    action: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    performedBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    performedOn: Types.ObjectId;

    @Prop({ default: Date.now })
    timestamp: Date;
}

export type TicketDocument = HydratedDocument<Ticket>;

@Schema({ timestamps: true })
export class Ticket {
    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    sector: string;

    @Prop({
        type: String,
        enum: TicketStatus,
        default: TicketStatus.NEW,
    })
    status: TicketStatus;

    @Prop({ type: Number, default: 1 }) // L1, L2
    level: number;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    assignedTo: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Order' })
    orderId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Item' })
    itemId?: Types.ObjectId;

    @Prop({ type: [HistoryLog], default: [] })
    history: HistoryLog[];
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
