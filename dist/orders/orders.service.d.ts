export declare class OrdersService {
    private stripe;
    createOrder(tenantId: string, dto: {
        items: {
            product_id: string;
            quantity: number;
        }[];
        customer_email: string;
    }, user: any): Promise<{
        order: any;
        client_secret: string;
    }>;
    confirmPayment(orderId: string): Promise<any>;
    getOrders(tenantId: string, user: any): Promise<any[]>;
    getOrder(orderId: string): Promise<any>;
    updateStatus(orderId: string, status: string): Promise<any>;
}
