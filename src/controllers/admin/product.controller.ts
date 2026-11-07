import { ProductRepository } from '@/src/models/repositories/product.repository';
import { AdminProductsViewModel } from '@/src/models/dtos';

export class AdminProductController {
  public static async getProductsViewModel(filters?: { category?: string; search?: string }): Promise<AdminProductsViewModel> {
    const products = ProductRepository.getAll(filters);
    return {
      products,
      totalCount: products.length,
    };
  }
}

