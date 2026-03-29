"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../common/supabase");
let TenantsService = class TenantsService {
    async findAll() {
        const { data, error } = await supabase_1.supabase.from('tenants').select('*').order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findOne(id) {
        const { data, error } = await supabase_1.supabase.from('tenants').select('*').eq('id', id).single();
        if (error || !data)
            throw new common_1.NotFoundException('Tenant not found');
        return data;
    }
    async getStats(tenantId) {
        const [orders, products, users] = await Promise.all([
            supabase_1.supabase.from('orders').select('total, status, created_at').eq('tenant_id', tenantId),
            supabase_1.supabase.from('products').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
            supabase_1.supabase.from('users').select('id', { count: 'exact' }).eq('tenant_id', tenantId),
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
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)()
], TenantsService);
//# sourceMappingURL=tenants.service.js.map