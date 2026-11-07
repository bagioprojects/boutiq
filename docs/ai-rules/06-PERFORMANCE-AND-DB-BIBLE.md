# 06 — PERFORMANCE AND DB BIBLE
## Veritabanı ve Önbellek Performansı Kutsal Kitabı

> **Bu kural dosyasındaki her madde üretim ortamında ölçülür ve denetlenir.**

---

## 1. N+1 SORGU YASAĞI — SIFIR TOLERANS

### 1.1 N+1 Nedir?

```typescript
// ❌ N+1 — Felaket
const products = await db.product.findMany(); // 1 sorgu
for (const product of products) {
  const variants = await db.variant.findMany({ where: { productId: product.id } }); // N sorgu!
}
// 1 (product) + N (variant) = N+1 sorgu

// ✅ DOĞRU — Tek sorguda JOIN
const products = await db.product.findMany({
  include: { variants: { where: { deletedAt: null } } }
});
```

### 1.2 DataLoader Pattern (Resolver'larda)

```typescript
// Birden fazla servis aynı entity'yi tekrar tekrar sorguluyorsa
export class ProductDataLoader {
  private loader = new DataLoader<ProductId, Product>(async (ids) => {
    const products = await this.productRepo.findByIds([...ids]);
    return ids.map(id => products.find(p => p.id === id) ?? new ProductNotFoundError(id));
  });

  async load(id: ProductId): Promise<Product> {
    return this.loader.load(id);
  }
}
```

---

## 2. CURSOR-BASED PAGINATION (ZORUNLU) — OFFSET YASAK

### 2.1 Neden Offset Yasak?

```sql
-- ❌ OFFSET pagination — 10.000. sayfada korkunç yavaş
SELECT * FROM products ORDER BY id LIMIT 20 OFFSET 199980;
-- 199.980 satır taranır, sadece 20 döner

-- ✅ CURSOR pagination — her zaman hızlı
SELECT * FROM products WHERE id > :cursor ORDER BY id LIMIT 20;
-- Sadece gerekli 20 satır taranır
```

### 2.2 Cursor Şeması

```typescript
export interface CursorPage {
  limit: number;      // Maks 100
  cursor?: string;    // Base64 encoded cursor (id + sort değeri)
  direction?: 'forward' | 'backward';
}

export interface PaginatedList<T> {
  items: T[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string | null;
    endCursor: string | null;
    totalCount: number; // Sadece gerektiğinde — count sorgusu pahalı
  };
}

// Cursor encode/decode
export function encodeCursor(id: string, sortValue?: unknown): string {
  return Buffer.from(JSON.stringify({ id, sortValue })).toString('base64url');
}

export function decodeCursor(cursor: string): { id: string; sortValue?: unknown } {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString());
}
```

---

## 3. COMPOSITE INDEX KURALLARI

### 3.1 Index Oluşturma Prensipleri

```sql
-- Kural: WHERE + ORDER BY kolonları birlikte index'lenir
-- Kural: Kardinalitesi yüksek kolon (ID, UUID) sola, düşük olanlar sağa

-- ✅ Doğru composite index — koleksiyon ürün listesi
CREATE INDEX idx_products_collection_status_created
  ON products (collection_id, status, created_at DESC)
  WHERE deleted_at IS NULL;

-- ✅ Doğru — müşteri sipariş listesi (sık sorgu)
CREATE INDEX idx_orders_customer_status_updated
  ON orders (customer_id, status, updated_at DESC);

-- ✅ Doğru — stok sorgusu
CREATE INDEX idx_inventory_levels_product_location
  ON inventory_levels (product_variant_id, location_id)
  INCLUDE (available_quantity, committed_quantity);

-- ✅ JSONB GIN index — metafield araması
CREATE INDEX idx_metafields_jsonb
  ON metafields USING GIN (value jsonb_path_ops);

-- ✅ Full text search
CREATE INDEX idx_products_fts
  ON products USING GIN (
    to_tsvector('turkish', title || ' ' || COALESCE(body_html, ''))
  );
```

### 3.2 Index Anti-Patterns

- ❌ Her kolona ayrı ayrı index — fazla index = write yavaşlar
- ❌ Index'siz `ORDER BY` — tablonun tamamı taranır
- ❌ `LIKE '%term%'` ile index — Full-text search veya Meilisearch kullan
- ❌ Nullable kolona index — `WHERE IS NULL` için partial index yap

---

## 4. L1/L2/L3 ÖNBELLEK KATMANLARI

### 4.1 Önbellek Hiyerarşisi

```
L1: In-process LRU (Node.js heap'te)
    TTL: 30 saniye | Boyut: Maks 500 entry
    Kullanım: Sık erişilen konfigürasyon, döviz kurları, vergi oranları

L2: Redis (Shared, Dağıtık)
    TTL: Değişken (1 dakika - 24 saat)
    Kullanım: Ürün detayları, koleksiyon listeleri, kullanıcı sepeti, oturum

L3: Edge CDN (Cloudflare / Vercel Edge)
    TTL: 60 saniye (stale-while-revalidate: 300 saniye)
    Kullanım: SSR HTML sayfaları, API responses, görsel sunumu
```

### 4.2 Redis Tag-Based Cache Invalidation

```typescript
// Cache service arayüzü
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options: { ttl: number; tags?: string[] }): Promise<void>;
  delete(key: string): Promise<void>;
  invalidateByTag(tag: string): Promise<void>;        // Toplu geçersizleştirme
  invalidateByTags(tags: string[]): Promise<void>;
}

// Kullanım örneği
class ProductQueryService {
  async getProduct(id: ProductId): Promise<Result<ProductDetailDTO>> {
    const cacheKey = `product:${id}:detail`;
    const cached = await this.cache.get<ProductDetailDTO>(cacheKey);
    if (cached) return ok(cached);

    const product = await this.productRepo.findById(id);
    if (!product) return err(new ProductNotFoundError(id));

    const dto = ProductDetailDTO.fromEntity(product);
    await this.cache.set(cacheKey, dto, {
      ttl: 3600, // 1 saat
      tags: [`product:${id}`, `collection:${product.collectionId}`, 'products'],
    });
    return ok(dto);
  }
}

// Ürün güncellendiğinde — tüm ilgili cache otomatik geçersiz
class ProductCommandService {
  async updateProduct(id: ProductId, data: UpdateProductDTO): Promise<Result<void>> {
    await this.productRepo.update(id, data);
    // Sadece bu ürünle ilgili tüm cache'leri temizle
    await this.cache.invalidateByTags([`product:${id}`, 'sitemap:products']);
    await this.searchIndexer.scheduleReindex(id);
    return ok(undefined);
  }
}
```

### 4.3 Cache Key Şemaları

```typescript
export const CacheKeys = {
  product: (id: string) => `product:${id}:detail`,
  productVariants: (id: string) => `product:${id}:variants`,
  collection: (slug: string, page: number) => `collection:${slug}:page:${page}`,
  searchResults: (query: string, filters: string) => `search:${hashString(query + filters)}`,
  cart: (cartId: string) => `cart:${cartId}`,
  currencyRates: (base: string) => `currency:rates:${base}`,
  taxRates: (zoneId: string) => `tax:zone:${zoneId}`,
  sitemap: (type: string, shard: number) => `sitemap:${type}:${shard}`,
} as const;
```

---

## 5. REDLOCK — ATOMIK STOK KİLİDİ

### 5.1 Flash Sale Race Condition Önleme

```typescript
// Flash sale veya yüksek trafikli anlarda stok yarış durumunu önle
export class AtomicStockLockService {
  private readonly LOCK_TTL_MS = 5000; // 5 saniye kilit

  async reserveStock(
    variantId: VariantId,
    quantity: number,
    cartId: CartId,
  ): Promise<Result<StockReservation>> {
    const lockKey = `stock:lock:${variantId}`;

    // Redlock ile dağıtık kilit al
    const lock = await this.redlock.acquire([lockKey], this.LOCK_TTL_MS);
    try {
      // Atomik kontrol ve güncelleme
      const available = await this.inventoryRepo.getAvailableQuantity(variantId);
      if (available < quantity) {
        return err(new InsufficientStockError(variantId, available, quantity));
      }

      const reservation = await this.inventoryRepo.createReservation({
        variantId, quantity, cartId,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 dk
      });

      return ok(reservation);
    } finally {
      await lock.release();
    }
  }
}
```

---

## 6. VERİTABANI BAĞLANTI YÖNETİMİ

### 6.1 PgBouncer Connection Pooling

```typescript
// Yazma işlemleri primary'e, okuma işlemleri read-replica'ya
export class DatabaseRouter {
  private write: PrismaClient;    // Primary
  private read: PrismaClient;     // Read Replica (round-robin)

  getClient(mode: 'read' | 'write'): PrismaClient {
    return mode === 'write' ? this.write : this.read;
  }

  // Transaction her zaman primary'de
  async transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return this.write.$transaction(fn, {
      maxWait: 5000,  // 5 saniye bekleme
      timeout: 10000, // 10 saniye transaction
      isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
    });
  }
}
```

### 6.2 Connection Pool Parametreleri

```env
# .env.production
DATABASE_URL="postgresql://user:pass@pgbouncer:5432/ecommerce?connection_limit=20&pool_timeout=10"
DATABASE_READ_URL="postgresql://user:pass@replica:5432/ecommerce?connection_limit=50"

# PgBouncer config
max_client_conn = 500
default_pool_size = 20
min_pool_size = 5
reserve_pool_size = 5
pool_mode = transaction  # Önerilen mod
```

---

## 7. SORGU PERFORMANS BÜTÇESİ

| Sorgu Tipi | Maks Süre | Aksiyon |
|------------|-----------|---------|
| Basit okuma (ID ile) | 5ms | — |
| Listeleme (100 kayıt) | 20ms | Redis cache |
| Arama sorgusu | 15ms | Meilisearch'e taşı |
| Sepet hesaplama | 50ms | Önbellek + optimize |
| Rapor sorgusu | 2000ms | ClickHouse'a taşı |
| Sitemap üretimi | 5000ms | BullMQ queue + cache |

**Yavaş Sorgu Alarmı:**
```sql
-- PostgreSQL log_min_duration_statement
log_min_duration_statement = 100  -- 100ms üstü loglanır
```

---

## 8. SOFT DELETE STRATEJİSİ

```sql
-- Her entity tablosunda deleted_at kolonu zorunlu
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMPTZ NULL;

-- Partial index — sadece aktif kayıtlar
CREATE INDEX idx_products_active ON products (id) WHERE deleted_at IS NULL;

-- Her sorguda WHERE deleted_at IS NULL şartı zorunlu
-- Prisma middleware ile otomatik eklenir
```

```typescript
// Prisma middleware — tüm sorgulara soft delete filtresi ekle
prisma.$use(async (params, next) => {
  const models = ['Product', 'Variant', 'Order', 'Customer'];
  if (models.includes(params.model ?? '') && params.action === 'findMany') {
    params.args.where = { ...params.args.where, deletedAt: null };
  }
  return next(params);
});
```

---

*Bu kuralları ihlal eden sorgular DBA review olmadan production'a alınamaz.*

