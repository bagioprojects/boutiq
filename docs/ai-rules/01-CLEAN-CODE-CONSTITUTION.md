# 01 — CLEAN CODE CONSTITUTION
## AI Agent Temiz Kod Anayasası

> **DURUM:** Üretim ortamı aktif. Bu döküman her kod üretiminde referans alınır.

---

## 1. TEMEL PRENSİPLER

### 1.1 SOLID Prensipleri (Zorunlu)
- **S — Single Responsibility Principle:** Her sınıf, modül veya fonksiyon yalnızca tek bir sorumluluğa sahip olmalıdır. `ProductService` hem fiyat hem de stok hesaplaması yapamaz; `ProductPricingService` ve `InventoryService` ayrılır.
- **O — Open/Closed Principle:** Mevcut kodu değiştirmek yerine `interface` veya `abstract class` ile genişletilir. Yeni ödeme sağlayıcısı eklemek için `PaymentGateway` arayüzü implement edilir, `PaymentOrchestrator` değiştirilmez.
- **L — Liskov Substitution Principle:** Bir `DigitalProduct` sınıfı, `Product` sınıfının davranışını kırmadan tam yerine geçebilmelidir. Kalıtım hiyerarşisi bu kurala göre tasarlanır.
- **I — Interface Segregation Principle:** Büyük, her şeyi kapsayan arayüzler yasaktır. `IOrderRepository` asla `IAnalyticsRepository` metodlarını barındıramaz.
- **D — Dependency Inversion Principle:** Üst düzey modüller alt düzey modüllere bağımlı olamaz. Her ikisi de soyutlamalara (interface/abstract) bağımlı olmalıdır. Constructor injection zorunludur.

### 1.2 DRY (Don't Repeat Yourself)
- Aynı mantık 2'den fazla yerde tekrarlanıyorsa `shared/utils`, `core/helpers` veya ayrı bir `Service` sınıfına çıkarılır.
- Magic string/number yasaktır — tümü `constants/` veya `enums/` altında adlandırılır.
- SQL sorguları asla controller veya service içinde inline yazılmaz; Repository katmanında kapsüllenir.

### 1.3 KISS (Keep It Simple, Stupid)
- En basit çalışan çözüm tercih edilir. Over-engineering yasaktır.
- Eğer bir fonksiyonu okumak 30 saniyeden fazla sürecekse, parçalanmalıdır.

### 1.4 YAGNI (You Aren't Gonna Need It)
- Şu anda ihtiyaç duyulmayan özellikler kodlanmaz. `// TODO: Gelecekte eklenebilir` satırları üretim koduna giremez.

---

## 2. KOD METRİKLERİ VE SINIRLAR (ZORUNLU)

| Metrik | Sınır | İhlal Durumu |
|--------|-------|--------------|
| **Fonksiyon uzunluğu** | Maks. 30 satır | Parçala veya helper'a taşı |
| **Dosya uzunluğu** | Maks. 250 satır | Modüle böl |
| **Cyclomatic Complexity** | Maks. 5 | Erken return (early return) veya strategy pattern |
| **Parametre sayısı** | Maks. 3 (fazlası DTO/options nesnesi) | Options object pattern |
| **İç içe geçme derinliği** | Maks. 3 seviye | Guard clause + erken return |
| **Sınıf metod sayısı** | Maks. 10 public metod | Sorumluluğu böl |

---

## 3. TİP GÜVENLİĞİ (TYPESCRIPT STRICT MODE)

```typescript
// tsconfig.json — zorunlu ayarlar
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 3.1 Yasaklar
- ❌ `any` tipi — `unknown` kullanılır, tip daraltma (type narrowing) yapılır
- ❌ `as SomeType` tip zorlama (type assertion) — Zod/TypeBox şema doğrulaması kullanılır
- ❌ `!` non-null assertion — null kontrolü explicit yapılır
- ❌ `@ts-ignore` / `@ts-expect-error` — gerçek hata çözülür

### 3.2 Zorunlular
- ✅ Her API request/response için Zod veya TypeBox şeması
- ✅ Discriminated union tipler ile state yönetimi
- ✅ Template literal types ile tip güvenli URL/event name üretimi
- ✅ Branded types ile `ProductId`, `OrderId`, `CustomerId` ayrımı

---

## 4. HATA YÖNETİMİ: RESULT / EITHER PATTERN

`try-catch` spagettisi yasaktır. Tüm iş mantığı hataları `Result<T, E>` tipi ile yönetilir:

```typescript
// src/core/types/result.ts
export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = AppError> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ ok: true, value });
export const err = <E>(error: E): Err<E> => ({ ok: false, error });

// Kullanım:
async function getProduct(id: ProductId): Promise<Result<Product, ProductNotFoundError>> {
  const product = await this.productRepo.findById(id);
  if (!product) return err(new ProductNotFoundError(id));
  return ok(product);
}

// Controller'da:
const result = await this.productQueryService.getProduct(id);
if (!result.ok) return this.handleError(result.error);
return this.ok(result.value);
```

---

## 5. İSİMLENDİRME STANDARTLARI

| Öğe | Kural | Örnek |
|-----|-------|-------|
| Sınıf adı | PascalCase | `ProductRepository` |
| Arayüz adı | `I` prefix + PascalCase | `IProductRepository` |
| Enum | PascalCase, UPPER_SNAKE_CASE değerler | `OrderStatus.PARTIALLY_FULFILLED` |
| Fonksiyon | camelCase, fiil ile başlar | `calculateShippingCost()` |
| Boolean değişken | `is/has/can/should` prefix | `isAvailable`, `hasDiscount` |
| Sabit | UPPER_SNAKE_CASE | `MAX_CART_ITEMS = 100` |
| Dosya adı | kebab-case | `product-query.service.ts` |
| Test dosyası | `*.spec.ts` veya `*.test.ts` | `product.service.spec.ts` |

---

## 6. TEST STANDARTLARI

- **Unit Test Coverage:** Minimum %80 branch coverage (servisler için %95)
- **Test Yapısı:** `Arrange / Act / Assert` (AAA) pattern zorunlu
- **Mock Stratejisi:** Sadece external bağımlılıklar (DB, HTTP, Redis) mock'lanır — iç servisler gerçek kullanılır
- **Test Adları:** `should [beklenen davranış] when [koşul]` formatı

```typescript
describe('ProductPricingService', () => {
  it('should apply B2B discount when customer has price list', async () => {
    // Arrange
    const customer = buildTestCustomer({ priceListId: 'VIP' });
    // Act
    const price = await service.resolvePrice(productId, customer);
    // Assert
    expect(price.discountedAmount).toBeLessThan(price.originalAmount);
  });
});
```

---

## 7. GİT VE KOD İNCELEME KURALLARI

- **Commit mesajı:** `type(scope): kısa açıklama` — `feat(catalog): add variant matrix validation`
- **Branch adı:** `type/kısa-açıklama` — `feat/smart-collection-engine`
- Her PR en az 1 `// REVIEW:` yorum içeren satırı düzeltilmiş olarak kapanır
- Ölü kod (dead code), kullanılmayan import ve console.log yasaktır — ESLint kuralı zorunlu

---

## 8. LINTING VE FORMATLAMA

```json
// .eslintrc kuralları (kritikler)
{
  "rules": {
    "no-console": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "complexity": ["error", 5],
    "max-lines-per-function": ["error", 30],
    "max-params": ["error", 3],
    "no-unused-vars": "error",
    "import/no-cycle": "error"
  }
}
```

---

*Bu döküman değiştirilemez. Yeni kural eklemek için PR açılır ve takım lideri onaylar.*

