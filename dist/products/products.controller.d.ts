import { ProductsService } from './products.service';
export declare class ProductsController {
    private products;
    constructor(products: ProductsService);
    findAll(tenantId: string, req: any): Promise<any[]>;
    getCategories(tenantId: string, req: any): Promise<any[]>;
    createCategory(tenantId: string, dto: {
        name: string;
    }, req: any): Promise<any>;
    findOne(id: string, req: any): Promise<any>;
    create(tenantId: string, dto: any, req: any): Promise<any>;
    update(id: string, dto: any, req: any): Promise<any>;
    remove(id: string, req: any): Promise<{
        message: string;
    }>;
}
