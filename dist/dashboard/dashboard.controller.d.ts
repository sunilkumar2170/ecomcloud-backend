export declare class DashboardController {
    overview(req: any): Promise<{
        total_tenants: number;
        total_orders: number;
        total_revenue: any;
        total_users: number;
        total_products: number;
        paid_orders?: undefined;
        low_stock_alerts?: undefined;
    } | {
        total_orders: number;
        paid_orders: number;
        total_revenue: any;
        total_products: number;
        low_stock_alerts: number;
        total_tenants?: undefined;
        total_users?: undefined;
    }>;
    revenueChart(req: any): Promise<{
        date: string;
        revenue: any;
    }[]>;
    recentOrders(req: any): Promise<{
        id: any;
        customer_email: any;
        total: any;
        status: any;
        created_at: any;
        tenant_id: any;
    }[]>;
}
