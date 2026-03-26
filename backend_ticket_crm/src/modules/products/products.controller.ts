import { Controller, Post, Get, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './productdto/createProduct.dto';
import { UpdateProductDto } from './productdto/updateProduct.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CaslGuard } from '../casl/casl.guard';
import { CheckAbility } from '../casl/check-ability.decorator';
import { Product } from '../../schemas/productSchema/product.schema';

@Controller('products')
@UseGuards(JwtAuthGuard, CaslGuard)
export class ProductsController {
  constructor(private readonly productService: ProductsService) { }

  //  CREATE
  @Post()
  @CheckAbility({ action: 'add', subject: Product })
  async create(@Body() dto: CreateProductDto) {
    return this.productService.createProduct(dto);
  }

  // GET ALL PRODUCTS
  @Get()
  @CheckAbility({ action: 'browse', subject: Product })
  async findAll() {
    return this.productService.getAllProducts();
  }

  //  GET SINGLE PRODUCT BY ID
  @Get(':id')
  @CheckAbility({ action: 'read', subject: Product })
  async findOne(@Param('id') id: string, @Req() req) {
    const product = await this.productService.getProductById(id);
    req.subject = product; // 🔥 attach here
    return product;
  }

  // UPDATE PRODUCT
  @Put(':id')
  @CheckAbility({ action: 'edit', subject: Product })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto, @Req() req) {
    const product = await this.productService.getProductById(id);
    req.subject = product; // 🔥 attach here
    return this.productService.updateProduct(id, dto);
  }
}
