import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ unique: true, required: true })
  sku: string; // Stock Keeping Unit (unique)

  @Prop()
  description?: string;

  @Prop({
    type: String,
    enum: ['hardware', 'software', 'service'],
    default: 'hardware',
  })
  type: string;

  //  Pricing
  @Prop({ required: true })
  price: number;

  @Prop({ default: 0 })
  costPrice: number;

  //  Inventory
  @Prop({ default: 0 })
  stock: number;

  @Prop({ default: 0 })
  reservedStock: number;

  // Serial tracking (for support/ticketing)
  @Prop({ type: [String], default: [] })
  serialNumbers: string[];

  //  CRM relation
  @Prop({ type: String, ref: 'User' })
  createdBy: string;

  //  Category / tags
  @Prop({ type: [String], default: [] })
  tags: string[];

  // Warranty (important for ticketing)
  @Prop()
  warrantyPeriodMonths?: number;

  @Prop()
  warrantyStartDate?: Date;

  // 📊 Status
  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
