import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { supabase } from '../common/supabase';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrdersService {
  private stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

  async createOrder(tenantId: string, dto: { items: { product_id: string; quantity: number }[]; customer_email: string }, user: any) {
    const productIds = dto.items.map(i => i.product_id);
    const { data: products } = await supabase.from('products').select('*').in('id', productIds).eq('tenant_id', tenantId);
    if (!products || products.length !== productIds.length) throw new BadRequestException('Products not found');

    let total = 0;
    const lineItems = dto.items.map(item => {
      const product = products.find(p => p.id === item.product_id);
      if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}`);
      const subtotal = product.price * item.quantity;
      total += subtotal;
      return { product_id: item.product_id, name: product.name, price: product.price, quantity: item.quantity, subtotal };
    });

    const orderId = uuidv4();
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'usd',
      metadata: { order_id: orderId, tenant_id: tenantId },
      receipt_email: dto.customer_email,
    });

    const { data: order, error } = await supabase.from('orders').insert({
      id: orderId, tenant_id: tenantId, customer_email: dto.customer_email, user_id: user.id,
      status: 'pending', total, stripe_payment_intent_id: paymentIntent.id,
      line_items: lineItems, created_at: new Date().toISOString(),
    }).select().single();

    if (error) throw new Error(error.message);
    return { order, client_secret: paymentIntent.client_secret };
  }

  async confirmPayment(orderId: string) {
    const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (!order) throw new NotFoundException('Order not found');

    const pi = await this.stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
    if (pi.status !== 'succeeded') throw new BadRequestException(`Payment not completed: ${pi.status}`);

    for (const item of order.line_items) {
      await supabase.rpc('decrement_stock', { p_product_id: item.product_id, p_qty: item.quantity });
    }

    const { data } = await supabase.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', orderId).select().single();
    return data;
  }

  async getOrders(tenantId: string, user: any) {
    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (user.role === 'store_owner') query = query.eq('tenant_id', user.tenant_id);
    else if (tenantId !== 'all') query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }

  async getOrder(orderId: string) {
    const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (error || !data) throw new NotFoundException('Order not found');
    return data;
  }

  async updateStatus(orderId: string, status: string) {
    const { data, error } = await supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).select().single();
    if (error) throw new Error(error.message);
    return data;
  }
}
