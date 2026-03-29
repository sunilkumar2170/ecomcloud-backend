import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { supabase } from '../common/supabase';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductsService {
  private checkTenant(user: any, tenantId: string) {
    if (user.role === 'admin') return;
    if (!user.tenant_id || user.tenant_id !== tenantId) throw new ForbiddenException();
  }

  async findAll(tenantId: string, user: any) {
    this.checkTenant(user, tenantId);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string, user: any) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException('Product not found');
    this.checkTenant(user, data.tenant_id);
    return data;
  }

  async create(tenantId: string, dto: any, user: any) {
    this.checkTenant(user, tenantId);

    if (!tenantId || tenantId.trim() === '') {
      throw new ForbiddenException('tenant_id is required');
    }

    const { data, error } = await supabase.from('products').insert({
      id: uuidv4(),
      tenant_id: tenantId,
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price,
      stock: dto.stock ?? 0,
      category_id: dto.category_id ?? null,
      image_url: dto.image_url ?? null,
      created_at: new Date().toISOString(),
    }).select().single();

    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: any, user: any) {
    const product = await this.findOne(id, user);
    this.checkTenant(user, product.tenant_id);
    const { data, error } = await supabase
      .from('products')
      .update({ ...dto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string, user: any) {
    const product = await this.findOne(id, user);
    this.checkTenant(user, product.tenant_id);
    await supabase.from('products').delete().eq('id', id);
    return { message: 'Deleted' };
  }

  async getCategories(tenantId: string, user: any) {
    this.checkTenant(user, tenantId);
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tenantId);
    return data;
  }

  async createCategory(tenantId: string, dto: { name: string }, user: any) {
    this.checkTenant(user, tenantId);
    const { data, error } = await supabase
      .from('categories')
      .insert({
        id: uuidv4(),
        tenant_id: tenantId,
        name: dto.name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
}