import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Product,
  ProductDocument,
} from '../../schemas/productSchema/product.schema';
import { CreateProductDto } from './productdto/createProduct.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private productModel: Model<ProductDocument>,
  ) {}

  async createProduct(dto: CreateProductDto) {
    const existing = await this.productModel.findOne({ sku: dto.sku });

    if (existing) {
      throw new BadRequestException('SKU already exists');
    }

    const product = await this.productModel.create(dto);

    return product;
  }

  async getAllProducts() {
    return this.productModel.find();
  }

  async getProductById(id: string) {
    return this.productModel.findById(id);
  }

  async updateProduct(id: string, dto: any) {
    return this.productModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
  }
}
