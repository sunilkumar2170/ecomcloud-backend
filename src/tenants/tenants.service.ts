import { Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../common/supabase';

@Injectable()
export class TenantsService {
  async findAll() {
    const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await supabase.from('tenants').select('*').eq('id', id).single();
    if (error || !data) throw new NotFoundException('Tenant not found');
    return data;
  }

  async getStats(tenantId: string) {
    const [orders, products, users] = await Promise.all([
      supabase.from('orders').select('total, status, created_at').eq('tenant_id', tenantId),
      supabase.from('products').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
      supabase.from('users').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
    ]);

    const orderData = orders.data || [];
    const totalRevenue = orderData.filter(o => o.status === 'paid').reduce((s, o) => s + o.total, 0);

    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const date = d.toISOString().slice(0, 10);
      const revenue = orderData.filter(o => o.status === 'paid' && o.created_at?.slice(0, 10) === date).reduce((s, o) => s + o.total, 0);
      return { date, revenue };
    });

    return {
      total_revenue: totalRevenue,
      order_count: orderData.length,
      paid_orders: orderData.filter(o => o.status === 'paid').length,
      product_count: products.count ?? 0,
      user_count: users.count ?? 0,
      revenue_by_day: days,
    };
  }
}
