// src/modules/items/items.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';

import { Item, ItemSchema } from '../../schemas/itemsSchema/item.schema';
import {
  Product,
  ProductSchema,
} from '../../schemas/productSchema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
  ],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
