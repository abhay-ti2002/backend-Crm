import { Controller, Post, Body } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './productdto/createProduct.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }
}
