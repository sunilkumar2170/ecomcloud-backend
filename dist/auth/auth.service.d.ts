import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private jwt;
    constructor(jwt: JwtService);
    register(dto: {
        email: string;
        password: string;
        name: string;
        role?: string;
        store_name?: string;
    }): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            tenant_id: any;
        };
    }>;
    login(email: string, password: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            tenant_id: any;
        };
    }>;
    private signToken;
}
