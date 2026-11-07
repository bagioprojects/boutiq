# 04 — SEO AND GEO PLAYBOOK
## Teknik SEO ve Yapay Zeka Arama Motoru Optimizasyonu (GEO) Kuralları

---

## 1. URL TAKSONOMİSİ VE YAPILANDIRMA

### 1.1 URL Şema Kuralları

```
Ürün Detayı:        /urun/[marka]-[urun-adi]-[renk]
Koleksiyon:         /koleksiyon/[kategori-slug]
Alt Koleksiyon:     /koleksiyon/[parent]/[child]
Marka Sayfası:      /marka/[marka-slug]
Blog Yazısı:        /blog/[kategori]/[makale-slug]
Statik Sayfa:       /[sayfa-slug]
Hesap:              /hesap/[alt-sayfa]
```

**Yasaklar:**
- ❌ `?id=123` — ID parametresi URL'de görünmez
- ❌ `/product/product-detail` — Tekrarlı kelimeler
- ❌ Büyük harf veya özel karakter (`ş→s`, `ğ→g`, `ç→c`, `ü→u`, `ö→o`, `ı→i`)
- ❌ 2'den fazla kısa çizgi art arda (`--`)
- ❌ 100 karakterden uzun URL slug
- ❌ Tarih bazlı URL (`/2024/01/15/urun-adi`) — SEO değeri zamanla düşer

### 1.2 Slug Üretim Algoritması

```typescript
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[şŞ]/g, 's').replace(/[ğĞ]/g, 'g')
    .replace(/[çÇ]/g, 'c').replace(/[üÜ]/g, 'u')
    .replace(/[öÖ]/g, 'o').replace(/[ıİ]/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
```

---

## 2. CANONICAL VE INDEX KARAR MATRİSİ

### 2.1 Faceted Navigation (Filtreleme) Kuralları

| Durum | Canonical | Robots | Title / H1 |
|-------|-----------|--------|------------|
| Koleksiyon ana sayfa | self | index, follow | Özel başlık |
| Tekli yüksek hacimli filtre (`/koleksiyon/kirmizi`) | self | index, follow | Özel başlık + filtre değeri |
| 2+ filtre kombinasyonu | Ana koleksiyona | noindex, follow | — |
| Sıralama parametresi (`?sirala=ucuz`) | self (sort hariç) | noindex, follow | — |
| Sayfalama ilk sayfa | self | index, follow | Özel başlık |
| Sayfalama 2+ sayfa | 1. sayfaya | index, follow | `Sayfa 2 | Koleksiyon Adı` |

### 2.2 Canonical Zorunlulukları

```html
<!-- Her sayfada self-referencing canonical şart -->
<link rel="canonical" href="https://magaza.com/koleksiyon/kadin-elbise" />

<!-- Paginated sayfalar -->
<link rel="canonical" href="https://magaza.com/koleksiyon/kadin-elbise" />
<!-- rel="prev" / rel="next" Google'ın iptal ettiğini varsaysa da uygulanır -->
```

---

## 3. META BAŞLIK VE AÇIKLAMA ŞABLONLARI

### 3.1 Sayfa Tipi Şablonları

```typescript
const META_TEMPLATES = {
  product: {
    title: '{title} | {brand} | {siteName}',
    description: '{brand} {title}. {shortDescription} {priceFormatted} fiyatıyla {siteName}\'de. {shippingPromo}',
    // Maks: title 60 karakter, description 155 karakter
  },
  collection: {
    title: '{collectionName} | {productCount}+ Ürün | {siteName}',
    description: '{collectionName} kategorisinde {productCount}\'den fazla ürün. {topBrands} ve daha fazlası. {sitePromo}',
  },
  brand: {
    title: '{brand} Ürünleri | {siteName}',
    description: 'Orijinal {brand} ürünleri. {productCount}\'dan fazla model, hızlı kargo, kolay iade.',
  },
  homepage: {
    title: '{siteName} | {tagline}',
    description: '{siteDescription}. {freeShippingThreshold} üzeri ücretsiz kargo. Hızlı teslimat.',
  },
};
```

---

## 4. JSON-LD SCHEMA GRAPH — TAM SPESİFİKASYON

### 4.1 Ürün Detay Sayfası Zorunlu Schema'ları

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      "@id": "https://magaza.com/urun/keten-gomlek#product",
      "name": "Organik Keten Gömlek",
      "description": "...",
      "sku": "KG-001-M-BEJ",
      "gtin13": "8681234567890",
      "mpn": "KG-001",
      "brand": {
        "@type": "Brand",
        "name": "EcoWear",
        "@id": "https://magaza.com/marka/ecowear#brand"
      },
      "material": "%100 Organik Keten",
      "color": "Bej",
      "pattern": "Düz",
      "image": ["https://cdn.magaza.com/keten-gomlek-1.avif"],
      "offers": {
        "@type": "AggregateOffer",
        "lowPrice": "299.90",
        "highPrice": "349.90",
        "priceCurrency": "TRY",
        "offerCount": 3,
        "offers": [{
          "@type": "Offer",
          "price": "299.90",
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "priceValidUntil": "2024-12-31",
          "url": "https://magaza.com/urun/keten-gomlek?beden=M",
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "TRY" },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 1, "unitCode": "DAY" },
              "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "DAY" }
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": 30,
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        }]
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.7",
        "reviewCount": "143",
        "bestRating": "5",
        "worstRating": "1"
      },
      "review": [...]
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Ana Sayfa", "item": "https://magaza.com" },
        { "@type": "ListItem", "position": 2, "name": "Gömlek", "item": "https://magaza.com/koleksiyon/gomlek" },
        { "@type": "ListItem", "position": 3, "name": "Organik Keten Gömlek" }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Bu gömlek yıkama makinasında yıkanabilir mi?", "acceptedAnswer": { "@type": "Answer", "text": "..." } }
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://magaza.com#website",
      "url": "https://magaza.com",
      "name": "Mağaza Adı",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://magaza.com/arama?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

---

## 5. XML SITEMAP MİMARİSİ

### 5.1 Sitemap İndeks Yapısı

```xml
<!-- /sitemap_index.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://magaza.com/sitemap_products_1.xml</loc><lastmod>2024-01-15</lastmod></sitemap>
  <sitemap><loc>https://magaza.com/sitemap_products_2.xml</loc></sitemap>
  <sitemap><loc>https://magaza.com/sitemap_collections.xml</loc></sitemap>
  <sitemap><loc>https://magaza.com/sitemap_brands.xml</loc></sitemap>
  <sitemap><loc>https://magaza.com/sitemap_pages.xml</loc></sitemap>
  <sitemap><loc>https://magaza.com/sitemap_blog.xml</loc></sitemap>
  <sitemap><loc>https://magaza.com/sitemap_images.xml</loc></sitemap>
  <sitemap><loc>https://magaza.com/sitemap_hreflang.xml</loc></sitemap>
</sitemapindex>
```

### 5.2 Sitemap Kuralları

- Maks. 50.000 URL veya 50MB per dosya — aşılırsa shard'a böl
- `changefreq`: products=`daily`, collections=`weekly`, pages=`monthly`
- `priority`: Homepage=`1.0`, Collections=`0.8`, Products=`0.6`, Blog=`0.4`
- Noindex sayfalar sitemap'e eklenmez
- Redis cache: 1 saat — ürün güncelleme event'inde temizlenir

---

## 6. GEO (GENERATIVE ENGINE OPTIMIZATION) KURALLARI

### 6.1 `/llms.txt` Yapısı (Zorunlu)

```markdown
# [Mağaza Adı] Hakkında

[Mağaza Adı], Türkiye'nin önde gelen e-ticaret platformlarından biridir.

## Kategoriler
- Kadın Giyim: 2.400+ ürün
- Erkek Giyim: 1.800+ ürün
- Çocuk Giyim: 900+ ürün

## İletişim ve Politikalar
- Ücretsiz Kargo: 300 TL ve üzeri siparişlerde
- İade: Teslimattan itibaren 30 gün içinde ücretsiz iade
- Müşteri Hizmetleri: 09:00-21:00 (Hafta içi)

## Öne Çıkan Markalar
[Marka listesi]

## Sitemap
- Ürünler: /sitemap_products_1.xml
- Koleksiyonlar: /sitemap_collections.xml
```

### 6.2 AI Bot User-Agent Algılama

```typescript
const AI_BOT_PATTERNS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'PerplexityBot', 'Perplexity-User',
  'ClaudeBot', 'Anthropic-ai', 'claude-web',
  'Google-Extended', 'Googlebot-Extended',
  'BingBot', 'bingbot',
  'ia_archiver', 'facebookexternalhit',
];

export function isAiBot(userAgent: string): boolean {
  return AI_BOT_PATTERNS.some(pattern =>
    userAgent.toLowerCase().includes(pattern.toLowerCase())
  );
}

// Edge middleware'de — AI bot algılandığında JS-free SSR döndür
if (isAiBot(request.headers.get('user-agent') ?? '')) {
  return fetchPureSsrPage(request.url);
}
```

### 6.3 Alıntılanabilirlik (Citability) Blokları

```html
<!-- Her ürün sayfasında zorunlu semantik bloklar -->
<section aria-label="Teknik Özellikler">
  <dl>
    <dt>Materyal</dt><dd>%100 Organik Keten</dd>
    <dt>Ağırlık</dt><dd>180 gram</dd>
    <dt>Menşei</dt><dd>Türkiye</dd>
  </dl>
</section>

<section aria-label="Kimler İçin Uygun">
  <p>Bu ürün; nefes alan kumaş arayan, günlük rahat giyim tercih eden ve çevre bilincine sahip tüketiciler için idealdir.</p>
</section>

<section aria-label="Artıları ve Eksileri">
  <ul data-pros>
    <li>Çevre dostu üretim</li>
    <li>Uzun ömürlü</li>
  </ul>
  <ul data-cons>
    <li>İlk yıkamada hafif çekme olabilir</li>
  </ul>
</section>
```

---

## 7. ULUSLARARASI SEO (HREFLANG)

```html
<!-- Her sayfanın head'inde — tüm dil/ülke varyasyonları çift yönlü -->
<link rel="alternate" hreflang="tr-tr" href="https://magaza.com/urun/keten-gomlek" />
<link rel="alternate" hreflang="en-us" href="https://magaza.com/en-us/product/linen-shirt" />
<link rel="alternate" hreflang="en-gb" href="https://magaza.com/en-gb/product/linen-shirt" />
<link rel="alternate" hreflang="de-de" href="https://magaza.com/de/produkt/leinen-hemd" />
<link rel="alternate" hreflang="x-default" href="https://magaza.com/urun/keten-gomlek" />
```

**Kritik Kurallar:**
- Googlebot'u asla otomatik 302 ile başka dile yönlendirme — indekslemeyi bozar
- Hreflang çift yönlü olmalı (A → B ise B → A da olmalı)
- x-default her zaman ana ülke/dil URL'sine işaret eder

---

## 8. ROBOTS.TXT ŞABLONU

```
User-agent: *
Disallow: /hesap/
Disallow: /api/
Disallow: /admin/
Disallow: /checkout/
Disallow: /*?*sirala=*
Disallow: /*?*sayfa=*&*sirala=*
Allow: /api/og-image/

User-agent: GPTBot
Allow: /
Disallow: /hesap/

User-agent: Googlebot
Allow: /

Sitemap: https://magaza.com/sitemap_index.xml
```

---

*Bu playbooktaki her kural SEO/GEO performansı için kritiktir. İhlal durumunda Google cezası riski mevcuttur.*

