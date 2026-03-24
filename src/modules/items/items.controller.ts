// items.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/assign-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

import { AuthGuard } from '@nestjs/passport';
import { CaslGuard } from './casl/casl.guard';
import { CheckAbility } from './casl/check-ability.decorator';
import { Item } from '../../schemas/itemsSchema/item.schema';

@Controller('items')
@UseGuards(AuthGuard('jwt'), CaslGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @CheckAbility({ action: 'create', subject: Item })
  create(@Body() dto: CreateItemDto) {
    return this.itemsService.create(dto);
  }

  @Get()
  @CheckAbility({ action: 'read', subject: Item })
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  @CheckAbility({ action: 'read', subject: Item })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  @CheckAbility({ action: 'update', subject: Item })
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.itemsService.update(id, dto);
  }

  @Delete(':id')
  @CheckAbility({ action: 'delete', subject: Item })
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
