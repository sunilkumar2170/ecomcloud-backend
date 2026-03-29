import { OrdersService } from './orders.service';
export declare class OrdersController {
    private orders;
    constructor(orders: OrdersService);
    getOrders(tenantId: string, req: any): Promise<any[]>;
    getOrder(id: string): Promise<any>;
    createOrder(tenantId: string, dto: any, req: any): Promise<{
        order: any;
        client_secret: string;
    }>;
    confirmPayment(id: string): Promise<any>;
    updateStatus(id: string, body: {
        status: string;
    }): Promise<any>;
}
