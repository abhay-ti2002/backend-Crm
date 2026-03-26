import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  BadRequestException,
} from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CaslGuard } from '../casl/casl.guard';
import { CheckAbility } from '../casl/check-ability.decorator';
import { Order } from '../../schemas/order/order.schema';

@Controller('orders')
@UseGuards(JwtAuthGuard, CaslGuard) // LOGIN REQUIRED
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  //  CREATE ORDER
  @Post()
  @CheckAbility({ action: 'add', subject: Order })
  create(@Req() req, @Body() dto: CreateOrderDto) {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      throw new BadRequestException('User not found in request');
    }

    return this.ordersService.create({
      ...dto,
      customerId: userId,
    });
  }

  //  GET ALL ORDERS (Admin use)
  @Get()
  @CheckAbility({ action: 'browse', subject: Order })
  getAllOrders() {
    return this.ordersService.findAll();
  }

  //  GET ORDER BY ID
  @Get(':id')
  @CheckAbility({ action: 'read', subject: Order })
  async getOrderById(@Param('id') id: string, @Req() req) {
    const order = await this.ordersService.findOne(id);
    req.subject = order; // 🔥 attach here
    return order;
  }

  //  GET MY ORDERS (User specific)
  @Get('my')
  @CheckAbility({ action: 'browse', subject: Order })
  getMyOrders(@Req() req) {
    return this.ordersService.findByCustomer(req.user._id);
  }
}
