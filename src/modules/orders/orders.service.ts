import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument } from '../../schemas/order/order.schema';
import { Item, ItemDocument } from '../../schemas/itemsSchema/item.schema';

import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  // CREATE ORDER
  async create(dto: CreateOrderDto & { customerId: string }) {
    if (!Types.ObjectId.isValid(dto.customerId)) {
      throw new BadRequestException('Invalid customerId');
    }
    //  Validate items
    const items = await this.itemModel.find({
      _id: { $in: dto.items },
    });

    if (items.length !== dto.items.length) {
      throw new NotFoundException('Some items not found');
    }

    // Check if already sold
    const alreadySold = items.find((i) => i.status === 'sold');
    if (alreadySold) {
      throw new BadRequestException('Item already sold');
    }

    //  Create order
    const order = new this.orderModel({
      customerId: new Types.ObjectId(dto.customerId),
      items: dto.items,
      totalAmount: dto.totalAmount,
      discount: dto.discount,
      finalAmount: dto.finalAmount,
      paymentMethod: dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
      status: 'confirmed',
      paymentStatus: 'paid',
    });

    const savedOrder = await order.save();

    // Update items
    await this.itemModel.updateMany(
      { _id: { $in: dto.items } },
      {
        status: 'sold',
        ownerId: dto.customerId,
        orderId: savedOrder._id,
      },
    );

    return savedOrder;
  }

  // GET ALL
  async findAll() {
    return this.orderModel.find().populate('customerId').populate('items');
  }

  //  GET ONE
  async findOne(id: string) {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId')
      .populate('items');

    if (!order) throw new NotFoundException('Order not found');

    return order;
  }

  async findByCustomer(customerId: string) {
    return this.orderModel
      .find({ customerId: new Types.ObjectId(customerId) })
      .populate('customerId')
      .populate('items');
  }
}
