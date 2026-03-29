import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { supabase } from '../common/supabase';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private jwt: JwtService) {}

  async register(dto: { email: string; password: string; name: string; role?: string; store_name?: string }) {
    const { data: existing } = await supabase.from('users').select('id').eq('email', dto.email).single();
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(dto.password, 10);
    const userId = uuidv4();

    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: dto.email,
        password_hash: hash,
        name: dto.name,
        role: dto.role || 'store_owner',
        tenant_id: null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) throw new Error(userError.message);

    if (dto.role === 'store_owner' && dto.store_name) {
      const tenantId = uuidv4();

      const { error: tenantError } = await supabase.from('tenants').insert({
        id: tenantId,
        name: dto.store_name,
        owner_id: userId,
        created_at: new Date().toISOString(),
      });

      if (tenantError) throw new Error(tenantError.message);

      await supabase.from('users').update({ tenant_id: tenantId }).eq('id', userId);
      user.tenant_id = tenantId;
    }

    return this.signToken(user);
  }

  async login(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (!user || error) throw new UnauthorizedException('Invalid credentials');

    let valid = false;

    if (user.password_hash.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.password_hash);
    } else {
      valid = user.password_hash === password;
    }

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    if (!user.password_hash.startsWith('$2')) {
      const hash = await bcrypt.hash(password, 10);
      await supabase.from('users').update({ password_hash: hash }).eq('id', user.id);
    }

    return this.signToken(user);
  }

  private signToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
      name: user.name,
    };
    return {
      access_token: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant_id: user.tenant_id,
      },
    };
  }
}