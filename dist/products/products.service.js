"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const supabase_1 = require("../common/supabase");
const uuid_1 = require("uuid");
let ProductsService = class ProductsService {
    checkTenant(user, tenantId) {
        if (user.role === 'admin')
            return;
        if (!user.tenant_id || user.tenant_id !== tenantId)
            throw new common_1.ForbiddenException();
    }
    async findAll(tenantId, user) {
        this.checkTenant(user, tenantId);
        const { data, error } = await supabase_1.supabase
            .from('products')
            .select('*, categories(name)')
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });
        if (error)
            throw new Error(error.message);
        return data;
    }
    async findOne(id, user) {
        const { data, error } = await supabase_1.supabase
            .from('products')
            .select('*, categories(name)')
            .eq('id', id)
            .single();
        if (error || !data)
            throw new common_1.NotFoundException('Product not found');
        this.checkTenant(user, data.tenant_id);
        return data;
    }
    async create(tenantId, dto, user) {
        this.checkTenant(user, tenantId);
        if (!tenantId || tenantId.trim() === '') {
            throw new common_1.ForbiddenException('tenant_id is required');
        }
        const { data, error } = await supabase_1.supabase.from('products').insert({
            id: (0, uuid_1.v4)(),
            tenant_id: tenantId,
            name: dto.name,
            description: dto.description ?? null,
            price: dto.price,
            stock: dto.stock ?? 0,
            category_id: dto.category_id ?? null,
            image_url: dto.image_url ?? null,
            created_at: new Date().toISOString(),
        }).select().single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async update(id, dto, user) {
        const product = await this.findOne(id, user);
        this.checkTenant(user, product.tenant_id);
        const { data, error } = await supabase_1.supabase
            .from('products')
            .update({ ...dto, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
    async remove(id, user) {
        const product = await this.findOne(id, user);
        this.checkTenant(user, product.tenant_id);
        await supabase_1.supabase.from('products').delete().eq('id', id);
        return { message: 'Deleted' };
    }
    async getCategories(tenantId, user) {
        this.checkTenant(user, tenantId);
        const { data } = await supabase_1.supabase
            .from('categories')
            .select('*')
            .eq('tenant_id', tenantId);
        return data;
    }
    async createCategory(tenantId, dto, user) {
        this.checkTenant(user, tenantId);
        const { data, error } = await supabase_1.supabase
            .from('categories')
            .insert({
            id: (0, uuid_1.v4)(),
            tenant_id: tenantId,
            name: dto.name,
            created_at: new Date().toISOString(),
        })
            .select()
            .single();
        if (error)
            throw new Error(error.message);
        return data;
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)()
], ProductsService);
//# sourceMappingURL=products.service.js.map