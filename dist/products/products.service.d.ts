export declare class ProductsService {
    private checkTenant;
    findAll(tenantId: string, user: any): Promise<any[]>;
    findOne(id: string, user: any): Promise<any>;
    create(tenantId: string, dto: any, user: any): Promise<any>;
    update(id: string, dto: any, user: any): Promise<any>;
    remove(id: string, user: any): Promise<{
        message: string;
    }>;
    getCategories(tenantId: string, user: any): Promise<any[]>;
    createCategory(tenantId: string, dto: {
        name: string;
    }, user: any): Promise<any>;
}
