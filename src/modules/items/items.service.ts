import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Item, ItemDocument } from '../../schemas/itemsSchema/item.schema';
import {
  Product,
  ProductDocument,
} from '../../schemas/productSchema/product.schema';
import { CreateItemDto } from './dto/assign-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  //  CREATE ITEM
  async create(createItemDto: CreateItemDto) {
    const product = await this.productModel.findById(createItemDto.productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const exists = await this.itemModel.findOne({
      serialNumber: createItemDto.serialNumber,
    });

    if (exists) {
      throw new BadRequestException('Serial number already exists');
    }

    const item = new this.itemModel({
      productId: product._id,
      serialNumber: createItemDto.serialNumber,
      sku: product.sku, //  auto from product
      status: 'available',
      location: createItemDto.location,
      notes: createItemDto.notes,
    });

    return item.save();
  }

  // GET ALL
  async findAll() {
    return this.itemModel.find().populate('productId').populate('ownerId');
  }

  // GET ONE
  async findOne(id: string) {
    const item = await this.itemModel
      .findById(id)
      .populate('productId')
      .populate('ownerId');

    if (!item) throw new NotFoundException('Item not found');

    return item;
  }

  //  UPDATE
  async update(id: string, updateItemDto: UpdateItemDto) {
    const item = await this.itemModel.findByIdAndUpdate(id, updateItemDto, {
      new: true,
    });

    if (!item) throw new NotFoundException('Item not found');

    return item;
  }

  //  DELETE
  async remove(id: string) {
    const item = await this.itemModel.findByIdAndDelete(id);

    if (!item) throw new NotFoundException('Item not found');

    return { message: 'Item deleted successfully' };
  }
}
