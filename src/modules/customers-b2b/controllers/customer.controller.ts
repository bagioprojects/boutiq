import { BaseController } from '../../../core/http/base.controller';
import type { ApiResponse } from '../../../core/http/base.controller';
import type { SegmentDslParserService } from '../services/segment-dsl-parser.service';
import type { B2BPricingResolverService } from '../services/b2b-pricing-resolver.service';
import type { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../../core/types/errors';

export class CustomerController extends BaseController {
  constructor(
    private readonly db: PrismaClient,
    private readonly segmentService: SegmentDslParserService,
  ) {
    super();
  }

  async getCustomerProfile(id: string): Promise<ApiResponse<any>> {
    const customer = await this.db.customer.findUnique({
      where: { id, deletedAt: null },
      include: { addresses: true, orders: { take: 5, orderBy: { createdAt: 'desc' } } },
    });

    if (!customer) {
      return this.handleError(new NotFoundError('Müşteri', id));
    }

    const rfm = await this.segmentService.computeRFM(id);
    return this.ok({ ...customer, rfm });
  }
}

export class B2BCompanyController extends BaseController {
  constructor(
    private readonly db: PrismaClient,
    private readonly pricingResolver: B2BPricingResolverService,
  ) {
    super();
  }

  async getCompany(id: string): Promise<ApiResponse<any>> {
    const company = await this.db.company.findUnique({
      where: { id },
      include: { priceList: { include: { entries: true } } },
    });

    if (!company) {
      return this.handleError(new NotFoundError('Şirket', id));
    }

    const netTerms = await this.pricingResolver.getNetTerms(id);
    return this.ok({ ...company, netTerms });
  }
}

