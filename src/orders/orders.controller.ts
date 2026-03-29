import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants/:tenantId/orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  getOrders(@Param('tenantId') tenantId: string, @Request() req) {
    return this.orders.getOrders(tenantId, req.user);
  }

  @Get(':id')
  getOrder(@Param('id') id: string) {
    return this.orders.getOrder(id);
  }

  @Post()
  createOrder(@Param('tenantId') tenantId: string, @Body() dto: any, @Request() req) {
    return this.orders.createOrder(tenantId, dto, req.user);
  }

  @Post(':id/confirm')
  confirmPayment(@Param('id') id: string) {
    return this.orders.confirmPayment(id);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.orders.updateStatus(id, body.status);
  }
}
