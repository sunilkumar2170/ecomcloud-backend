import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { supabase } from '../common/supabase';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  @Get('overview')
  async overview(@Request() req) {
    const user = req.user;
    if (user.role === 'admin') {
      const [tenants, orders, users, products] = await Promise.all([
        supabase.from('tenants').select('id', { count: 'exact' }),
        supabase.from('orders').select('total, status'),
        supabase.from('users').select('id', { count: 'exact' }),
        supabase.from('products').select('id', { count: 'exact' }),
      ]);
      const orderData = orders.data || [];
      const totalRevenue = orderData.filter(o => o.status === 'paid').reduce((s, o) => s + (o.total || 0), 0);
      return {
        total_tenants: tenants.count ?? 0,
        total_orders: orderData.length,
        total_revenue: totalRevenue,
        total_users: users.count ?? 0,
        total_products: products.count ?? 0,
      };
    } else {
      const tenantId = user.tenant_id;
      const [orders, products] = await Promise.all([
        supabase.from('orders').select('total, status, created_at').eq('tenant_id', tenantId),
        supabase.from('products').select('id, stock').eq('tenant_id', tenantId),
      ]);
      const orderData = orders.data || [];
      const totalRevenue = orderData.filter(o => o.status === 'paid').reduce((s, o) => s + (o.total || 0), 0);
      const lowStock = (products.data || []).filter(p => p.stock < 5).length;
      return {
        total_orders: orderData.length,
        paid_orders: orderData.filter(o => o.status === 'paid').length,
        total_revenue: totalRevenue,
        total_products: products.data?.length ?? 0,
        low_stock_alerts: lowStock,
      };
    }
  }

  @Get('revenue-chart')
  async revenueChart(@Request() req) {
    const user = req.user;
    let query = supabase.from('orders').select('total, status, created_at').eq('status', 'paid');
    if (user.role === 'store_owner') query = query.eq('tenant_id', user.tenant_id);
    const { data } = await query;
    const orders = data || [];
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const date = d.toISOString().slice(0, 10);
      const revenue = orders.filter(o => o.created_at?.slice(0, 10) === date).reduce((s, o) => s + (o.total || 0), 0);
      return { date, revenue };
    });
    return days;
  }

  @Get('recent-orders')
  async recentOrders(@Request() req) {
    const user = req.user;
    let query = supabase.from('orders').select('id, customer_email, total, status, created_at, tenant_id').order('created_at', { ascending: false }).limit(10);
    if (user.role === 'store_owner') query = query.eq('tenant_id', user.tenant_id);
    const { data } = await query;
    return data || [];
  }
}
