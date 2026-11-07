# 02 — MVC ARCHITECTURE LAWS
## Katı MVC Mimari Kanunları ve Katman Sınırları

> **Bu döküman ihlal edilemez.** Katman sınırını kıran her PR otomatik reddedilir.

---

## 1. KATMANLARın TANIMLANMASI

```
┌─────────────────────────────────────────────────────────────────┐
│  REQUEST (HTTP / RPC / Queue Event)                             │
│                           ↓                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  CONTROLLER (HTTP Adaptör Katmanı)                         │ │
│  │  - Request parse et, validate et (Zod)                     │ │
│  │  - Auth/RBAC kontrolü yap                                  │ │
│  │  - Service/Use-Case çağır                                   │ │
│  │  - Result'ı serialize edip döndür                          │ │
│  │  ❌ İş mantığı içeremez                                    │ │
│  │  ❌ Repository doğrudan çağıramaz                          │ │
│  │  ❌ Veritabanı bağlantısı tutamaz                         │ │
│  └───────────────────────────┬────────────────────────────────┘ │
│                               ↓                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SERVICE / USE-CASE (İş Mantığı Katmanı)                   │ │
│  │  - Tüm iş kuralları burada                                 │ │
│  │  - Domain Event'leri tetikler                              │ │
│  │  - Transaction sınırını yönetir                            │ │
│  │  - Birden fazla Repository orchestrate edebilir            │ │
│  │  ❌ HTTP Request/Response nesnesine dokunamaz              │ │
│  │  ❌ Doğrudan HTTP status kodu üretemez                     │ │
│  └───────────────────────────┬────────────────────────────────┘ │
│                               ↓                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  REPOSITORY (Veri Erişim Katmanı)                          │ │
│  │  - Yalnızca CRUD ve sorgu operasyonları                    │ │
│  │  - ORM/SQL sorguları burada kapsüllenir                    │ │
│  │  - Sadece Domain Entity döndürür                           │ │
│  │  ❌ İş mantığı içeremez                                    │ │
│  │  ❌ HTTP konseptleri bilemez                               │ │
│  └───────────────────────────┬────────────────────────────────┘ │
│                               ↓                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  MODEL / DOMAIN ENTITY                                      │ │
│  │  - Veri şeması ve domain invariant'ları                    │ │
│  │  - Value Objects (Money, Address, Dimension)               │ │
│  │  - Domain kurallarını kıran durumda exception fırlatır     │ │
│  │  ❌ Hiçbir altyapı bağımlılığı (DB, HTTP, Queue) yok      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  RESPONSE (Serialized DTO → Client)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. CONTROLLER KURALLARI

### 2.1 Controller Yapısı (Zorunlu Template)

```typescript
// src/modules/catalog/controllers/admin-product.controller.ts
@Controller('/admin/products')
@UseGuards(AuthGuard, RbacGuard)
export class AdminProductController extends BaseController {

  constructor(
    private readonly productCommandService: ProductCommandService,
    private readonly productQueryService: ProductQueryService,
  ) {
    super();
  }

  @Post('/')
  @RequirePermission('catalog:products:create')
  async createProduct(
    @Body() body: unknown, // her zaman unknown ile başla
    @CurrentStaff() staff: StaffPrincipal,
  ): Promise<ApiResponse<ProductDTO>> {

    // 1. Validate (Zod şema ile)
    const dto = CreateProductSchema.parse(body);

    // 2. Service'e delege et
    const result = await this.productCommandService.createProduct(dto, staff);

    // 3. Result'ı handle et
    if (!result.ok) return this.handleError(result.error);

    // 4. Serialize et ve döndür
    return this.created(ProductDTO.fromEntity(result.value));
  }
}
```

### 2.2 Controller Yasakları
- ❌ `import { PrismaClient } from '@prisma/client'` — Repository kullanılır
- ❌ `if (product.price > 0 && product.stock > 0 && ...)` — İş mantığı
- ❌ 30 satırı geçen metod
- ❌ Birden fazla servis çağrısını `await` ile zincirleme — Use-Case'e taşı

---

## 3. SERVICE / USE-CASE KURALLARI

### 3.1 Command vs Query Ayrımı (CQRS Lite)

```typescript
// Command Service — veri değiştirir, void veya Result döner
export class ProductCommandService {
  async createProduct(dto: CreateProductDTO, actor: StaffPrincipal): Promise<Result<Product>> { ... }
  async updateVariantPrice(cmd: UpdatePriceCommand): Promise<Result<void>> { ... }
  async archiveProduct(id: ProductId): Promise<Result<void>> { ... }
}

// Query Service — salt okunur, asla state değiştirmez
export class ProductQueryService {
  async getProductById(id: ProductId): Promise<Result<ProductDetailDTO>> { ... }
  async listProducts(filters: ProductFilters, page: CursorPage): Promise<Result<PaginatedList<ProductSummaryDTO>>> { ... }
  async searchProducts(query: string, filters: SearchFilters): Promise<Result<SearchResult<ProductSummaryDTO>>> { ... }
}
```

### 3.2 Transaction Yönetimi

```typescript
// Birden fazla repository'yi etkileyen operasyonlarda Unit of Work pattern
async createProductWithVariants(dto: CreateProductWithVariantsDTO): Promise<Result<Product>> {
  return this.unitOfWork.run(async (tx) => {
    const product = await this.productRepo.create(dto.product, tx);
    const variants = await this.variantRepo.createMany(dto.variants.map(v => ({ ...v, productId: product.id })), tx);
    await this.searchIndexer.scheduleIndex(product.id); // async, transactiondan bağımsız
    return ok({ ...product, variants });
  });
}
```

---

## 4. REPOSITORY KURALLARI

### 4.1 Repository Interface (Domain Katmanında Tanımlanır)

```typescript
// src/modules/catalog/models/product.repository.ts
export interface IProductRepository {
  findById(id: ProductId, tx?: Transaction): Promise<Product | null>;
  findBySlug(slug: string): Promise<Product | null>;
  findMany(filters: ProductFilters, page: CursorPage): Promise<PaginatedList<Product>>;
  create(data: CreateProductData, tx?: Transaction): Promise<Product>;
  update(id: ProductId, data: Partial<ProductData>, tx?: Transaction): Promise<Product>;
  softDelete(id: ProductId, tx?: Transaction): Promise<void>;
}
```

### 4.2 Prisma Repository Implementasyonu (Altyapı Katmanında)

```typescript
// src/core/database/repositories/prisma-product.repository.ts
export class PrismaProductRepository implements IProductRepository {
  constructor(private readonly db: PrismaClient) {}

  async findById(id: ProductId, tx?: Transaction): Promise<Product | null> {
    const client = tx ?? this.db;
    const raw = await client.product.findUnique({
      where: { id, deletedAt: null },
      include: { variants: { where: { deletedAt: null } }, metafields: true },
    });
    return raw ? ProductMapper.toDomain(raw) : null;
  }
}
```

### 4.3 Repository Yasakları
- ❌ `if (product.isVip) { price *= 0.9 }` — İş mantığı
- ❌ Offset pagination: `skip: (page-1) * limit` — Cursor-based pagination zorunlu
- ❌ `SELECT *` — Sadece gerekli alanları seç
- ❌ N+1 sorgu — `include`/`join` ile önlen, `DataLoader` kullan

---

## 5. MODEL / DOMAIN ENTITY KURALLARI

### 5.1 Entity Şablonu

```typescript
// src/modules/catalog/models/product.entity.ts
export class Product {
  constructor(
    public readonly id: ProductId,
    public readonly title: string,
    public readonly slug: string,
    public readonly status: ProductStatus,
    public readonly variants: Variant[],
    public readonly metafields: Metafield[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validate();
  }

  private validate(): void {
    if (!this.title.trim()) throw new DomainError('Product title cannot be empty');
    if (this.variants.length === 0) throw new DomainError('Product must have at least one variant');
  }

  get isAvailable(): boolean {
    return this.status === ProductStatus.ACTIVE && this.variants.some(v => v.inventoryQuantity > 0);
  }

  get lowestPrice(): Money {
    return this.variants.reduce((min, v) => v.price.isLessThan(min) ? v.price : min, this.variants[0].price);
  }
}
```

### 5.2 Value Object Şablonu

```typescript
// src/core/domain/value-objects/money.vo.ts
export class Money {
  private constructor(
    public readonly amount: number, // Kuruş cinsinden (integer) — floating point hatası yok
    public readonly currency: CurrencyCode,
  ) {
    if (amount < 0) throw new DomainError('Money cannot be negative');
  }

  static of(amount: number, currency: CurrencyCode): Money {
    return new Money(Math.round(amount), currency);
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  isLessThan(other: Money): boolean {
    this.assertSameCurrency(other);
    return this.amount < other.amount;
  }

  toDecimal(): number { return this.amount / 100; }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(`Currency mismatch: ${this.currency} vs ${other.currency}`);
    }
  }
}
```

---

## 6. MODÜL BAĞIMLILIK KURALLARI (eslint-plugin-boundaries)

```
modules/catalog       → core/* (izinli)
modules/catalog       → modules/inventory (sadece interface aracılığıyla)
modules/catalog       ❌ modules/orders (doğrudan import yasak)

modules/orders        → modules/catalog (sadece interface)
modules/orders        → modules/inventory (sadece interface)
modules/orders        → modules/payments-shipping (sadece interface)

modules/seo-geo-engine → modules/catalog (read-only query)
modules/seo-geo-engine ❌ modules/orders (çapraz bağımlılık yasak)
```

Modüller arası iletişim Domain Event Bus üzerinden gerçekleşir:
```typescript
// Sipariş ödenince stok düşümü — doğrudan import DEĞİL, event üzerinden
eventBus.publish(new OrderPaidEvent({ orderId, lineItems }));
// inventory modülü bu eventi dinler ve stok düşer
```

---

## 7. VIEW / RESPONSE SERIALIZATION

```typescript
// DTO — Domain Entity'den ayrı, client'a ne gönderileceğini tanımlar
export class ProductDetailDTO {
  static fromEntity(product: Product, locale: Locale): ProductDetailDTO {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.lowestPrice.toDecimal(),
      currency: product.lowestPrice.currency,
      isAvailable: product.isAvailable,
      variants: product.variants.map(VariantDTO.fromEntity),
      // Hassas iç veriler (cost, margin) burada gizlenir
    };
  }
}
```

---

*Bu mimari kanunlar değiştirilemez. Mimari tartışmalar için RFC (Request for Comments) süreci izlenir.*

