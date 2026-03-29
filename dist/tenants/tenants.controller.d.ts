import { TenantsService } from './tenants.service';
export declare class TenantsController {
    private tenants;
    constructor(tenants: TenantsService);
    findAll(req: any): Promise<any>;
    findOne(id: string): Promise<any>;
    getStats(id: string, req: any): Promise<{
        total_revenue: any;
        order_count: number;
        paid_orders: number;
        product_count: number;
        user_count: number;
        revenue_by_day: {
            date: string;
            revenue: any;
        }[];
    }>;
}
