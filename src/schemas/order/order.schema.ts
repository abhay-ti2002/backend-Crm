// src/modules/orders/schemas/order.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
  // Customer
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  // Items in order
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Item' }], required: true })
  items: Types.ObjectId[];

  // Pricing
  @Prop({ required: true })
  totalAmount: number;

  @Prop()
  discount?: number;

  @Prop()
  finalAmount: number;

  // Status
  @Prop({
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  })
  status: string;

  // Payment
  @Prop({
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  })
  paymentStatus: string;

  @Prop()
  paymentMethod?: string;

  // Address
  @Prop()
  shippingAddress?: string;

  // Notes
  @Prop()
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
