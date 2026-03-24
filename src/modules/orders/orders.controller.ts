import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('orders')
@UseGuards(AuthGuard('jwt')) //  LOGIN REQUIRED
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Place Order (only logged-in user)
  @Post()
  create(@Req() req, @Body() dto: CreateOrderDto) {
    const user = req.user;

    return this.ordersService.create({
      ...dto,
      customerId: user._id, //
    });
  }

  // Get my orders
  // orders.controller.ts

  @Get('my')
  getMyOrders(@Req() req) {
    return this.ordersService.findByCustomer(req.user._id); // eslint-disable-line
  }
}
