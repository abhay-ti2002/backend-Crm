import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AssignmentDocument = HydratedDocument<Assignment>;

@Schema({ timestamps: true })
export class Assignment {
    @Prop({ required: true })
    sector: string;

    @Prop({ type: Number, required: true })
    level: number;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    lastAssignedAgentId: Types.ObjectId;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
AssignmentSchema.index({ sector: 1, level: 1 }, { unique: true });
