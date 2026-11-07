import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { ProductCommandService, CreateProductDTO, UpdateProductDTO } from '../services/product-command.service';
import type { ProductQueryService } from '../services/product-query.service';
import type { Product } from '../models/product.entity';
import type { ProductId } from '../../../core/types/branded';
import { toProductId } from '../../../core/types/branded';
import { CreateProductSchema, UpdateProductSchema } from '../validators/product.schema';
import { ValidationError } from '../../../core/types/errors';

export class AdminProductController extends BaseController {
  constructor(
    private readonly commandService: ProductCommandService,
    private readonly queryService: ProductQueryService,
  ) {
    super();
  }

  async create(body: unknown, actorId: string): Promise<ApiResponse<Product>> {
    const parseResult = CreateProductSchema.safeParse(body);
    if (!parseResult.success) {
      return this.handleError(new ValidationError('Doğrulama hatası', parseResult.error.flatten().fieldErrors));
    }

    const result = await this.commandService.createProduct(parseResult.data as CreateProductDTO, actorId);
    return this.handleResult(result);
  }

  async update(id: string, body: unknown, actorId: string): Promise<ApiResponse<Product>> {
    const parseResult = UpdateProductSchema.safeParse(body);
    if (!parseResult.success) {
      return this.handleError(new ValidationError('Doğrulama hatası', parseResult.error.flatten().fieldErrors));
    }

    const result = await this.commandService.updateProduct(toProductId(id), parseResult.data as UpdateProductDTO, actorId);
    return this.handleResult(result);
  }

  async getById(id: string): Promise<ApiResponse<Product>> {
    const result = await this.queryService.getProductById(toProductId(id));
    return this.handleResult(result);
  }

  async archive(id: string, actorId: string): Promise<ApiResponse<void>> {
    const result = await this.commandService.archiveProduct(toProductId(id), actorId);
    return this.handleResult(result);
  }

  async delete(id: string, actorId: string): Promise<ApiResponse<void>> {
    const result = await this.commandService.deleteProduct(toProductId(id), actorId);
    return this.handleResult(result);
  }
}

