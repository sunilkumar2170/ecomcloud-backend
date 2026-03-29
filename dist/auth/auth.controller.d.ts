import { AuthService } from './auth.service';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    role?: string;
    store_name?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            tenant_id: any;
        };
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            name: any;
            role: any;
            tenant_id: any;
        };
    }>;
}
