# 08 — SECURITY AND COMPLIANCE RULES
## Güvenlik ve Uyum Kuralları: OWASP, KVKK/GDPR, CSRF, XSS, Rate Limiting

> **Bu kural dosyası güvenlik açıklarına karşı sıfır tolerans politikasını tanımlar.**

---

## 1. OWASP TOP 10 KORUMA MATRİSİ (2023)

| # | Zaafiyet | Önlem | Durum |
|---|---------|-------|-------|
| A01 | Broken Access Control | RBAC + Resource ownership check | Zorunlu |
| A02 | Cryptographic Failures | bcrypt(cost=12) + AES-256 | Zorunlu |
| A03 | Injection (SQL/NoSQL/LDAP) | Prisma ORM (parameterized) + Zod | Zorunlu |
| A04 | Insecure Design | Threat modeling per module | Review |
| A05 | Security Misconfiguration | Helmet.js + CSP headers | Zorunlu |
| A06 | Vulnerable Components | `npm audit` CI pipeline | Otomatik |
| A07 | Auth Failures | JWT RS256 + HttpOnly cookie | Zorunlu |
| A08 | Software Integrity Failures | Webhook HMAC-SHA256 + SRI | Zorunlu |
| A09 | Logging Failures | Structured audit log | Zorunlu |
| A10 | SSRF | URL allowlist validation | Zorunlu |

---

## 2. CSRF (CROSS-SITE REQUEST FORGERY) KORUMALARI

```typescript
// 1. SameSite cookie policy
res.cookie('session', token, {
  httpOnly: true,
  secure: true,                 // Sadece HTTPS
  sameSite: 'strict',          // CSRF'ye karşı en güçlü
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün
  path: '/',
});

// 2. Double Submit Cookie Pattern (SPA için)
// Server her request'te X-CSRF-Token header'ını kontrol eder
app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const headerToken = req.headers['x-csrf-token'];
    const cookieToken = req.cookies['csrf-token'];
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      throw new ForbiddenError('CSRF token mismatch');
    }
  }
  next();
});

// 3. Origin kontrol
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') ?? [];
  if (origin && !allowedOrigins.includes(origin)) {
    throw new ForbiddenError('Origin not allowed');
  }
  next();
});
```

---

## 3. XSS (CROSS-SITE SCRIPTING) KORUMALARI

### 3.1 Content Security Policy (CSP)

```typescript
// Helmet.js CSP konfigürasyonu
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'nonce-{RANDOM_NONCE}'",   // Her request'te yeni nonce
      "https://www.googletagmanager.com",
    ],
    styleSrc: ["'self'", "'unsafe-inline'"],  // CSS-in-JS için — migrate to tokens
    imgSrc: ["'self'", "data:", "https://cdn.magaza.com", "https://*.google.com"],
    connectSrc: ["'self'", "https://api.magaza.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    frameSrc: ["'none'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    upgradeInsecureRequests: [],
  },
}));
```

### 3.2 Çıktı Sanitizasyon Kuralları

```typescript
import DOMPurify from 'isomorphic-dompurify';

// ❌ YASAK — Kullanıcı içeriği doğrudan render
<div dangerouslySetInnerHTML={{ __html: product.description }} />

// ✅ DOĞRU — Sanitize et
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(product.description, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'a', 'table'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    FORCE_BODY: true,
  })
}} />
```

---

## 4. SQL INJECTION KORUMALARI

```typescript
// ✅ Prisma ORM — tüm sorgular parameterized (otomatik korumalı)
const product = await db.product.findUnique({ where: { id: productId } });

// ✅ Ham SQL zorunluysa Prisma.$queryRaw kullan
const results = await db.$queryRaw<Product[]>`
  SELECT * FROM products
  WHERE title ILIKE ${'%' + sanitizedQuery + '%'}
  AND deleted_at IS NULL
  LIMIT ${limit}
`;

// ❌ YASAK — String interpolation ile SQL
const query = `SELECT * FROM products WHERE title = '${userInput}'`; // SQL Injection!
```

---

## 5. RATE LIMITING VE DDoS KORUMALARI

### 5.1 Katmanlı Rate Limiting

```typescript
export const RateLimitProfiles = {
  // Public API — genel
  public: { windowMs: 60_000, max: 100 },      // 100 req/dk

  // Arama — bot trafiğine karşı
  search: { windowMs: 60_000, max: 30 },        // 30 req/dk

  // Auth endpoint'leri — brute force'a karşı
  auth: { windowMs: 15 * 60_000, max: 5 },      // 5 req/15dk

  // Admin API — sadece authenticated staff
  admin: { windowMs: 60_000, max: 300 },         // 300 req/dk

  // Checkout — tek yönlü işlem
  checkout: { windowMs: 60_000, max: 10 },       // 10 req/dk

  // Webhook alımı
  webhook: { windowMs: 60_000, max: 500 },       // 500 req/dk
} as const;

// IP + UserID bazlı sliding window (Redis)
app.use('/api/auth', rateLimiter({
  ...RateLimitProfiles.auth,
  keyGenerator: (req) => `rl:auth:${req.ip}`,
  handler: (req, res) => {
    res.status(429).json({
      error: 'TOO_MANY_REQUESTS',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
}));
```

---

## 6. WEBHOOK HMAC-SHA256 İMZA DOĞRULAMASI

```typescript
// Gelen webhook'ların gerçekliğini doğrula
export function verifyWebhookSignature(
  payload: Buffer,
  receivedSignature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Timing-safe karşılaştırma — timing attack önleme
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature.replace('sha256=', ''), 'hex'),
  );
}

// Webhook handler
app.post('/webhooks/payment', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  if (!verifyWebhookSignature(req.body, signature, process.env.WEBHOOK_SECRET!)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  // İşleme devam et...
});
```

---

## 7. IDEMPOTENCY-KEY MEKANİZMASI

Ödeme ve sipariş gibi kritik işlemlerde çift ödeme/sipariş oluşumunu önler:

```typescript
// Client her POST isteğinde benzersiz key gönderir
// Header: Idempotency-Key: uuid-v4

export class IdempotencyService {
  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    ttlSeconds: number = 86400,
  ): Promise<T> {
    const cacheKey = `idempotency:${key}`;

    // Daha önce işlendiyse cache'ten döndür
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    // Kilitle ve çalıştır
    const lock = await this.redlock.acquire([`${cacheKey}:lock`], 10000);
    try {
      // Double-check after lock
      const cachedAfterLock = await this.redis.get(cacheKey);
      if (cachedAfterLock) return JSON.parse(cachedAfterLock) as T;

      const result = await operation();
      await this.redis.setex(cacheKey, ttlSeconds, JSON.stringify(result));
      return result;
    } finally {
      await lock.release();
    }
  }
}
```

---

## 8. KVKK / GDPR KİŞİSEL VERİ KORUMALARI

### 8.1 Veri Sınıflandırması

```typescript
export enum DataSensitivity {
  PUBLIC    = 'public',     // Ürün bilgileri, fiyatlar
  INTERNAL  = 'internal',   // Sipariş detayları, analytics
  SENSITIVE = 'sensitive',  // Ad, adres, telefon, e-posta
  CRITICAL  = 'critical',   // TC kimlik no, kart bilgileri, şifre hash
}
```

### 8.2 Kişisel Veri Maskeleme (Log'larda)

```typescript
export function maskPersonalData(data: Record<string, unknown>): Record<string, unknown> {
  const SENSITIVE_KEYS = ['email', 'phone', 'address', 'creditCard', 'password', 'tcKimlik'];
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [
      k,
      SENSITIVE_KEYS.some(sk => k.toLowerCase().includes(sk)) ? '***MASKED***' : v,
    ])
  );
}

// Logger middleware
logger.info('Customer updated', maskPersonalData({ customerId, email, phone }));
// Log: { customerId: "cst_123", email: "***MASKED***", phone: "***MASKED***" }
```

### 8.3 Veri Silme (Right to Be Forgotten)

```typescript
export class CustomerDataErasureService {
  async eraseCustomerData(customerId: CustomerId): Promise<void> {
    await this.unitOfWork.run(async (tx) => {
      // Siparişlerde kişisel veri anonimleştir (sil değil — muhasebe kaydı)
      await this.orderRepo.anonymizeCustomerData(customerId, tx);
      // Sepet ve oturum sil
      await this.cartRepo.deleteByCustomerId(customerId, tx);
      // Müşteri kaydını hard-delete
      await this.customerRepo.hardDelete(customerId, tx);
      // Audit log'a kaydet
      await this.auditLog.record({
        action: 'CUSTOMER_DATA_ERASED',
        actorId: 'GDPR_REQUEST',
        targetId: customerId,
        timestamp: new Date(),
      });
    });
  }
}
```

---

## 9. DENETİM İZİ (AUDIT LOG) — ZORUNLU

Tüm veri değişiklikleri audit log'a kaydedilir:

```typescript
export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  actorId: string;        // Staff ID veya 'SYSTEM' veya 'CUSTOMER:xxx'
  actorType: 'staff' | 'customer' | 'system' | 'webhook';
  action: string;         // 'ORDER_CREATED', 'PRODUCT_PRICE_UPDATED', vb.
  targetType: string;     // 'Order', 'Product', 'Customer'
  targetId: string;
  changes?: {
    field: string;
    before: unknown;
    after: unknown;
  }[];
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

// Her service metoduna decorator ile ekle
@AuditLog({ action: 'PRODUCT_PRICE_UPDATED', targetType: 'Product' })
async updateVariantPrice(cmd: UpdatePriceCommand): Promise<Result<void>> { ... }
```

---

## 10. HTTP GÜVENLİK BAŞLIKLARI

```typescript
app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}));

// Ek headerlar
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.removeHeader('X-Powered-By');
  next();
});
```

---

*Her güvenlik ihlali anında incident response protokolü başlatılır. Bu döküman değiştirilemez.*

