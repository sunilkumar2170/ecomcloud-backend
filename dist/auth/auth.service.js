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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const supabase_1 = require("../common/supabase");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(jwt) {
        this.jwt = jwt;
    }
    async register(dto) {
        const { data: existing } = await supabase_1.supabase.from('users').select('id').eq('email', dto.email).single();
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const hash = await bcrypt.hash(dto.password, 10);
        const userId = (0, uuid_1.v4)();
        const { data: user, error: userError } = await supabase_1.supabase
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
        if (userError)
            throw new Error(userError.message);
        if (dto.role === 'store_owner' && dto.store_name) {
            const tenantId = (0, uuid_1.v4)();
            const { error: tenantError } = await supabase_1.supabase.from('tenants').insert({
                id: tenantId,
                name: dto.store_name,
                owner_id: userId,
                created_at: new Date().toISOString(),
            });
            if (tenantError)
                throw new Error(tenantError.message);
            await supabase_1.supabase.from('users').update({ tenant_id: tenantId }).eq('id', userId);
            user.tenant_id = tenantId;
        }
        return this.signToken(user);
    }
    async login(email, password) {
        const { data: user, error } = await supabase_1.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        if (!user || error)
            throw new common_1.UnauthorizedException('Invalid credentials');
        let valid = false;
        if (user.password_hash.startsWith('$2')) {
            valid = await bcrypt.compare(password, user.password_hash);
        }
        else {
            valid = user.password_hash === password;
        }
        if (!valid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.password_hash.startsWith('$2')) {
            const hash = await bcrypt.hash(password, 10);
            await supabase_1.supabase.from('users').update({ password_hash: hash }).eq('id', user.id);
        }
        return this.signToken(user);
    }
    signToken(user) {
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map