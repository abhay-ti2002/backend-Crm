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
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
@UseGuards(AuthGuard('jwt')) // LOGIN REQUIRED
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  //  CREATE ORDER
  @Post()
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
  getAllOrders() {
    return this.ordersService.findAll();
  }

  //  GET ORDER BY ID
  @Get(':id')
  getOrderById(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  //  GET MY ORDERS (User specific)
  @Get('my')
  getMyOrders(@Req() req) {
    return this.ordersService.findByCustomer(req.user._id);
  }
}
