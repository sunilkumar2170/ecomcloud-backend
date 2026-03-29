export declare class TenantsService {
    findAll(): Promise<any[]>;
    findOne(id: string): Promise<any>;
    getStats(tenantId: string): Promise<{
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
