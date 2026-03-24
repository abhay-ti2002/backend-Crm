// src/modules/items/schemas/item.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ItemDocument = HydratedDocument<Item>;

@Schema({ timestamps: true })
export class Item {
  //  Product reference (FIXED)
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  // Unique per unit
  @Prop({ required: true, unique: true })
  serialNumber: string;

  // SKU (comes from product ideally)
  @Prop({ required: true })
  sku: string;

  //  Owner (User)
  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId?: Types.ObjectId;

  //  Status
  @Prop({
    enum: ['available', 'sold', 'assigned', 'defective', 'returned'],
    default: 'available',
  })
  status: string;

  // Order reference
  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;

  // Warranty
  @Prop()
  warrantyStartDate?: Date;

  @Prop()
  warrantyEndDate?: Date;

  // Location
  @Prop()
  location?: string;

  // Notes
  @Prop()
  notes?: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
