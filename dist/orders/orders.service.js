"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../common/supabase");
const stripe_1 = require("stripe");
const uuid_1 = require("uuid");
let OrdersService = class OrdersService {
    constructor() {
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });
    }
    async createOrder(tenantId, dto, user) {
        const productIds = dto.items.map(i => i.product_id);
        const { data: products } = await supabase_1.supabase.from('products').select('*').in('id', productIds).eq('tenant_id', tenantId);
        if (!products || products.length !== productIds.length)
            throw new common_1.BadRequestException('Products not found');
        let total = 0;
        const lineItems = dto.items.map(item => {
            const product = products.find(p => p.id === item.product_id);
            if (product.stock < item.quantity)
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
            const subtotal = product.price * item.quantity;
            total += subtotal;
            return { product_id: item.product_id, name: product.name, price: product.price, quantity: item.quantity, subtotal };
        });
        const orderId = (0, uuid_1.v4)();
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: { order_id: orderId, tenant_id: tenantId },
            receipt_email: dto.customer_email,
        });
        const { data: order, error } = await supabase_1.supabase.from('orders').insert({
            id: orderId, tenant_id: tenantId, customer_email: dto.customer_email, user_id: user.id,
            status: 'pending', total, stripe_payment_intent_id: paymentIntent.id,
            line_items: lineItems, created_at: new Date().toISOString(),
        }).select().single();
        if (error)
            throw new Error(error.message);
        return { order, client_secret: paymentIntent.client_secret };
    }
    async confirmPayment(orderId) {
        const { data: order } = await supabase_1.supabase.from('orders').select('*').eq('id', orderId).single();
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const pi = await this.stripe.paymentIntents.retrieve(order.stripe_payment_intent_id);
        if (pi.status !== 'succeeded')
            throw new common_1.BadRequestException(`Payment not completed: ${pi.status}`);
        for (const item of order.line_items) {
            await supabase_1.supabase.rpc('decrement_stock', { p_product_id: item.product_id, p_qty: item.quantity });
        }
        const { data } = await supabase_1.supabase.from('orders').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', orderId).select().single();
        return data;
    }
    async getOrders(tenantId, user) {
        let query = supabase_1.supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (user.role === 'store_owner')
            query = query.eq('tenant_id', user.tenant_id);
        else if (tenantId !== 'all')
            query = query.eq('tenant_id', tenantId);
        const { data, error } = await query;
        if (error)
            throw new Error(error.message);
        return data;
    }
    async getOrder(orderId) {
        const { data, error } = await supabase_1.supabase.from('orders').select('*').eq('id', orderId).single();
        if (error || !data)
            throw new common_1.NotFoundException('Order not found');
        return data;
    }
    async updateStatus(orderId, status) {
        const { data, error } = await supabase_1.supabase.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', orderId).select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)()
], OrdersService);
//# sourceMappingURL=orders.service.js.map