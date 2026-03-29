import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants/:tenantId/products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get()
  findAll(@Param('tenantId') tenantId: string, @Request() req) {
    return this.products.findAll(tenantId, req.user);
  }

  @Get('categories/list')
  getCategories(@Param('tenantId') tenantId: string, @Request() req) {
    return this.products.getCategories(tenantId, req.user);
  }

  @Post('categories')
  createCategory(@Param('tenantId') tenantId: string, @Body() dto: { name: string }, @Request() req) {
    return this.products.createCategory(tenantId, dto, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.products.findOne(id, req.user);
  }

  @Post()
  create(@Param('tenantId') tenantId: string, @Body() dto: any, @Request() req) {
    return this.products.create(tenantId, dto, req.user);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any, @Request() req) {
    return this.products.update(id, dto, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.products.remove(id, req.user);
  }
}
