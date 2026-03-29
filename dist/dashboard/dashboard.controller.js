"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/jwt-auth.guard");
const supabase_1 = require("../common/supabase");
let DashboardController = class DashboardController {
    async overview(req) {
        const user = req.user;
        if (user.role === 'admin') {
            const [tenants, orders, users, products] = await Promise.all([
                supabase_1.supabase.from('tenants').select('id', { count: 'exact' }),
                supabase_1.supabase.from('orders').select('total, status'),
                supabase_1.supabase.from('users').select('id', { count: 'exact' }),
                supabase_1.supabase.from('products').select('id', { count: 'exact' }),
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
        }
        else {
            const tenantId = user.tenant_id;
            const [orders, products] = await Promise.all([
                supabase_1.supabase.from('orders').select('total, status, created_at').eq('tenant_id', tenantId),
                supabase_1.supabase.from('products').select('id, stock').eq('tenant_id', tenantId),
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
    async revenueChart(req) {
        const user = req.user;
        let query = supabase_1.supabase.from('orders').select('total, status, created_at').eq('status', 'paid');
        if (user.role === 'store_owner')
            query = query.eq('tenant_id', user.tenant_id);
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
    async recentOrders(req) {
        const user = req.user;
        let query = supabase_1.supabase.from('orders').select('id, customer_email, total, status, created_at, tenant_id').order('created_at', { ascending: false }).limit(10);
        if (user.role === 'store_owner')
            query = query.eq('tenant_id', user.tenant_id);
        const { data } = await query;
        return data || [];
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)('overview'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('revenue-chart'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "revenueChart", null);
__decorate([
    (0, common_1.Get)('recent-orders'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "recentOrders", null);
exports.DashboardController = DashboardController = __decorate([
    (0, swagger_1.ApiTags)('Dashboard'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('dashboard')
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map