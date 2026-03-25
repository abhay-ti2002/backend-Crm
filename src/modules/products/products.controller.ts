import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './productdto/createProduct.dto';
import { UpdateProductDto } from './productdto/updateProduct.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productService: ProductsService) {}

  //  CREATE
  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  // GET ALL PRODUCTS
  @Get()
  async findAll() {
    return this.productService.getAllProducts();
  }

  //  GET SINGLE PRODUCT BY ID
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productService.getProductById(id);
  }

  // UPDATE PRODUCT
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.updateProduct(id, dto);
  }
}
