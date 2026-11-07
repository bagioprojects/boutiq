# 07 — DESIGN CLONING PROTOCOL
## Referans Tasarım Görselinden Pixel-Perfect Klonlama Protokolü

---

## 1. GENEL BAKIŞ: OTONOM TASARIM KLONLAMA DÖNGÜSÜ

```
Referans Görsel(ler)
        ↓
1. ANALYZE (Python Araçları)
   ├── design_token_extractor.py  → colors, typography, spacing tokens
   ├── layout_segmentation.py     → sayfa bölgelerini (Header, Hero, Grid, Footer)
   └── component_detector.py      → her bileşenin koordinat ve stil özelliklerini
        ↓
2. GENERATE (Kod Üretimi)
   ├── theme_manifest_builder.py  → tam tema konfigürasyonu
   └── component_code_generator.py → MVC View Component + CSS Token kodu
        ↓
3. RENDER (Tarayıcıda Çalıştır)
   └── Playwright → sayfa ekran görüntüsü al
        ↓
4. COMPARE (Kalite Kontrol)
   └── visual_regression_qa.py → SSIM + LPIPS karşılaştırma
        ↓
5. FEEDBACK LOOP (SSIM < %98 ise)
   └── Sapma raporu → CSS/Component güncelle → 3'e dön
        ↓
   SSIM ≥ %98
        ↓
6. DELIVER (Teslim)
   └── Production-ready kod + doğrulama raporu
```

---

## 2. FAZA 1: TASARIM ANALİZİ

### 2.1 `design_token_extractor.py` Çalışma Protokolü

```python
# Girdi: Referans screenshot(lar)
# Çıktı: design-tokens.json + tokens.css + typography-analysis.json

ANALYSIS_STEPS = [
    "1. K-Means Clustering (k=8-16) ile baskın renkleri çıkar",
    "2. Her rengin HEX / RGB / HSL / OKLCH dönüşümünü hesapla",
    "3. WCAG kontrast oranlarını hesapla (AA: 4.5:1, AAA: 7:1)",
    "4. Yatay projeksiyon profili → Grid sütun genişliklerini bul",
    "5. Dikey projeksiyon profili → Boşluk (gap/padding) ritmini bul",
    "6. Tespit edilen font boyutlarını tipografik ölçeğe eşle",
    "7. Border-radius değerlerini köşe piksel analizinden çıkar",
    "8. Box-shadow değerlerini gölge dağılımından tahmin et",
]
```

**Çıktı Şeması:**
```json
{
  "colors": {
    "brand": {
      "primary": "#1a1a2e",
      "secondary": "#16213e",
      "accent": "#e94560",
      "accent-light": "#f5a623"
    },
    "neutral": {
      "50": "#fafafa",
      "100": "#f4f4f5",
      "900": "#18181b"
    },
    "semantic": {
      "bg-primary": "#ffffff",
      "bg-secondary": "#fafafa",
      "text-primary": "#1a1a2e",
      "text-secondary": "#6b7280",
      "border": "#e5e7eb"
    }
  },
  "typography": {
    "fontFamily": { "primary": "Inter", "display": "Playfair Display" },
    "scale": { "xs": 12, "sm": 14, "base": 16, "lg": 18, "xl": 20, "2xl": 24, "3xl": 30, "4xl": 36 },
    "weights": { "normal": 400, "medium": 500, "semibold": 600, "bold": 700 },
    "lineHeights": { "tight": 1.25, "normal": 1.5, "relaxed": 1.75 }
  },
  "spacing": {
    "base": 4,
    "scale": [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96]
  },
  "borderRadius": {
    "sm": "4px", "md": "8px", "lg": "12px", "xl": "16px", "full": "9999px"
  },
  "shadows": {
    "card": "0 2px 8px rgba(0,0,0,0.08)",
    "dropdown": "0 8px 24px rgba(0,0,0,0.12)"
  },
  "grid": {
    "columns": 12,
    "containerMaxWidth": 1280,
    "gutter": 24
  }
}
```

### 2.2 `layout_segmentation.py` Bölge Tespiti

```python
SEMANTIC_REGIONS = {
    'TopBar':       { 'y_ratio': (0.00, 0.04), 'features': ['announcement', 'phone', 'links'] },
    'Header':       { 'y_ratio': (0.04, 0.12), 'features': ['logo', 'nav', 'search', 'cart'] },
    'MegaMenu':     { 'y_ratio': (0.10, 0.45), 'features': ['mega-columns', 'featured-image'] },
    'HeroBanner':   { 'y_ratio': (0.12, 0.45), 'features': ['full-width', 'cta-button', 'text-overlay'] },
    'TrustBadges':  { 'y_ratio': (0.45, 0.52), 'features': ['icons', 'short-text', 'horizontal-list'] },
    'ProductGrid':  { 'y_ratio': (0.52, 0.80), 'features': ['card-grid', '2-5-columns'] },
    'PromoBanner':  { 'y_ratio': (0.80, 0.88), 'features': ['colored-bg', 'text', 'cta'] },
    'Footer':       { 'y_ratio': (0.88, 1.00), 'features': ['links', 'social', 'newsletter'] },
}
```

---

## 3. FAZA 2: KOMPONENt TESPİT VE JSON ŞEMASI

### 3.1 `component_detector.py` Çıktı Şeması

```json
{
  "components": [
    {
      "id": "comp_001",
      "type": "ProductCard",
      "region": "ProductGrid",
      "bbox": { "x": 24, "y": 456, "w": 280, "h": 420 },
      "styles": {
        "borderRadius": "12px",
        "boxShadow": "0 2px 8px rgba(0,0,0,0.08)",
        "backgroundColor": "#ffffff",
        "padding": "0 0 16px 0",
        "gap": "12px"
      },
      "children": [
        {
          "type": "ProductImage",
          "bbox": { "x": 0, "y": 0, "w": 280, "h": 320 },
          "styles": { "aspectRatio": "7/8", "borderRadius": "12px 12px 0 0", "objectFit": "cover" },
          "overlays": [
            { "type": "Badge", "text": "YENİ", "position": "top-left", "styles": { "bg": "#e94560", "color": "white" } },
            { "type": "WishlistIcon", "position": "top-right" }
          ]
        },
        {
          "type": "ProductInfo",
          "children": [
            { "type": "BrandText", "styles": { "fontSize": "12px", "color": "#6b7280", "fontWeight": 500 } },
            { "type": "ProductTitle", "styles": { "fontSize": "14px", "color": "#1a1a2e", "fontWeight": 600, "lineClamp": 2 } },
            {
              "type": "PriceGroup",
              "children": [
                { "type": "CurrentPrice", "styles": { "fontSize": "16px", "fontWeight": 700, "color": "#e94560" } },
                { "type": "OriginalPrice", "styles": { "fontSize": "13px", "textDecoration": "line-through", "color": "#9ca3af" } }
              ]
            },
            { "type": "RatingStars", "styles": { "starColor": "#f5a623", "starSize": "14px" } },
            { "type": "AddToCartButton", "styles": { "variant": "primary", "fullWidth": true, "size": "sm" } }
          ]
        }
      ]
    }
  ]
}
```

---

## 4. FAZA 3: KOD ÜRETIMI

### 4.1 `component_code_generator.py` Çalışma Kuralları

Tespit edilen component JSON şemasını şu kurallara göre TypeScript/TSX koduna dönüştürür:

1. **Atomic Design Hiyerarşisi:** Her component bileşim hiyerarşisinde doğru seviyede üretilir
2. **CSS Token Uyumu:** Tespit edilen renkler/boşluklar doğrudan CSS token'larına eşlenir
3. **Erişilebilirlik:** Tüm gerekli `aria-*` nitelikleri otomatik eklenir
4. **Responsive:** `--space-*` ve media query token'ları kullanılır
5. **CLS = 0:** `aspect-ratio` ve boyut nitelikleri otomatik eklenir

---

## 5. FAZA 4: GÖRSEL DOĞRULAMA (SSIM ≥ %98)

### 5.1 `visual_regression_qa.py` Protokolü

```python
COMPARISON_STRATEGY = {
    "tool": "Playwright (Chromium, viewport=1440x900)",
    "metrics": {
        "SSIM": "Structural Similarity Index — genel benzerlik",
        "LPIPS": "Perceptual Image Patch Similarity — insan gözü benzerliği",
        "PixelDiff": "Piksel fark haritası — sapma bölgesi tespiti",
    },
    "threshold": {
        "SSIM_min": 0.98,     # %98 minimum
        "LPIPS_max": 0.02,    # 0.02 maksimum (düşük = iyi)
    },
    "feedback_loop": {
        "max_iterations": 10,  # Maksimum 10 otomatik düzeltme turu
        "diff_highlight": "Kırmızı highlight ile sapma bölgelerini göster",
        "auto_fix": True,      # Sapma < 5px ise otomatik CSS düzeltmesi
    }
}
```

### 5.2 Sapma Türleri ve Çözüm Stratejileri

| Sapma Türü | Tespit | Otomatik Çözüm |
|------------|--------|----------------|
| Renk farkı | Pixel mean color delta > 10 | CSS token güncelle |
| Boyut farkı | Bounding box farkı > 5px | padding/margin/width düzelt |
| Font boyutu | Text bounding height farkı | font-size token güncelle |
| Hizalama | Merkez konum farkı > 3px | flexbox/grid alignment düzelt |
| Border radius | Köşe eğrisi farkı | border-radius değeri güncelle |
| Gölge | Shadow region farkı | box-shadow değeri güncelle |

---

## 6. TASARIM TOKEN UYGULAMA HARİTASI

```css
/* Referans analizden üretilen tokens.css */
:root {
  /* Referans siteden çıkarılan gerçek değerler */
  --color-brand-primary:    #1a1a2e;
  --color-brand-accent:     #e94560;
  --color-bg-primary:       #ffffff;
  --color-text-primary:     #1a1a2e;
  --color-text-secondary:   #6b7280;
  --color-border:           #e5e7eb;

  --font-primary: 'Inter Variable', sans-serif;
  --font-display: 'Playfair Display', serif;

  --radius-card:    12px;
  --radius-button:  8px;
  --shadow-card:    0 2px 8px rgba(0,0,0,0.08);
  --shadow-hover:   0 8px 24px rgba(0,0,0,0.12);
}
```

---

## 7. TESLİMAT RAPORU ŞABLONU

Her klonlama operasyonu sonunda şu rapor üretilir:

```markdown
# Tasarım Klonlama Teslim Raporu

## Referans Analizi
- Kaynak: [URL veya dosya adı]
- Analiz tarihi: [tarih]
- Tespit edilen bileşen sayısı: [N]

## Token Çıktıları
- Renk paleti: [N] adet
- Tipografi skalası: [N] seviye
- Spacing sistemi: 8px grid

## SSIM Skorları
| Bileşen | SSIM | LPIPS | Durum |
|---------|------|-------|-------|
| Header | 0.991 | 0.009 | ✅ |
| ProductCard | 0.986 | 0.014 | ✅ |
| Footer | 0.979 | 0.021 | ✅ |
| **Ortalama** | **0.985** | **0.015** | **✅ GEÇTI** |

## Üretilen Dosyalar
- [Liste]

## Sapma Notları
- [Varsa önemli farklar ve açıklamalar]
```

---

*Bu protokolü izlemeden hiçbir tasarım klonlama görevi tamamlanmış sayılmaz.*

