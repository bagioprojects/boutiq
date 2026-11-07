# 03 — COMPONENT ENGINEERING RULES
## Atomic Design ve Performans Odaklı Bileşen Mühendisliği Kuralları

---

## 1. ATOMIC DESIGN HİYERARŞİSİ

```
ATOMS          → En küçük yeniden kullanılabilir birimler (HTML elementleri + CSS tokenlar)
   ↓
MOLECULES      → 2-5 atom bir araya gelir, bağımsız işlev kazanır
   ↓
ORGANISMS      → Bağımsız sayfa bölümleri, kendi state'ini yönetebilir
   ↓
TEMPLATES      → Sayfa iskeletleri, organisms'leri layout'a yerleştirir
   ↓
PAGES          → Template + gerçek veri = render edilebilir sayfa
```

### 1.1 Atom Örnekleri (`/views-components/atoms/`)
`Button`, `Input`, `Checkbox`, `RadioButton`, `Badge`, `PriceTag`, `RatingStars`, `Icon`, `Spinner`, `Skeleton`, `Tag`, `Avatar`, `Tooltip`

### 1.2 Molecule Örnekleri (`/views-components/molecules/`)
`ProductCard`, `VariantSelector`, `SearchAutocomplete`, `FilterChip`, `Breadcrumb`, `PriceRange`, `QuantitySelector`, `AddToCartButton`, `WishlistToggle`

### 1.3 Organism Örnekleri (`/views-components/organisms/`)
`MegaMenu`, `SiteHeader`, `SiteFooter`, `ProductGallery`, `FacetedSidebar`, `SlideCart`, `CheckoutForm`, `ProductReviewList`, `PromoBanner`, `NewsletterBlock`

---

## 2. BILEŞEN ŞABLONU (ZORUNLU YAPI)

Her bileşen aşağıdaki yapıya sahip olmalıdır:

```typescript
// /views-components/atoms/Button/Button.tsx
import type { FC, ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

// 1. Props Interface — her prop zorunlu açıklama
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Butonun görsel varyantı */
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Boyut skalası */
  size: 'sm' | 'md' | 'lg';
  /** Yükleme durumu — tıklama engellenir, spinner gösterilir */
  isLoading?: boolean;
  /** Tam genişlik */
  fullWidth?: boolean;
}

// 2. Ana Bileşen
export const Button: FC<ButtonProps> = ({
  variant,
  size,
  isLoading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...rest
}) => {
  return (
    <button
      className={[
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        fullWidth && styles.fullWidth,
        className,
      ].filter(Boolean).join(' ')}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" aria-label="Yükleniyor..." /> : children}
    </button>
  );
};

// 3. Skeleton (Yükleme Durumu)
export const ButtonSkeleton: FC<{ size?: ButtonProps['size'] }> = ({ size = 'md' }) => (
  <div
    className={[styles.button, styles.skeleton, styles[`size-${size}`]].join(' ')}
    aria-hidden="true"
  />
);

// 4. Display Name (React DevTools için)
Button.displayName = 'Button';
ButtonSkeleton.displayName = 'ButtonSkeleton';
```

---

## 3. CSS DESIGN TOKEN SİSTEMİ (ZORUNLU)

Tüm stil değerleri CSS Custom Properties (tokens) ile tanımlanır. Magic number yasaktır.

```css
/* /views-components/tokens/colors.css */
:root {
  /* Brand */
  --color-brand-50:  #f0f9ff;
  --color-brand-100: #e0f2fe;
  --color-brand-500: #0ea5e9;
  --color-brand-600: #0284c7;
  --color-brand-700: #0369a1;
  --color-brand-900: #0c4a6e;

  /* Semantic */
  --color-bg-primary:   var(--color-neutral-0);
  --color-bg-secondary: var(--color-neutral-50);
  --color-text-primary:   var(--color-neutral-900);
  --color-text-secondary: var(--color-neutral-600);
  --color-text-disabled:  var(--color-neutral-400);
  --color-border:         var(--color-neutral-200);
  --color-border-focus:   var(--color-brand-500);

  /* Feedback */
  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-error:   #dc2626;
  --color-info:    #2563eb;
}

/* /views-components/tokens/spacing.css */
:root {
  --space-0:  0px;
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}

/* /views-components/tokens/typography.css */
:root {
  --font-sans: 'Inter Variable', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Cascadia Code', monospace;

  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px */
  --text-2xl:  1.5rem;    /* 24px */
  --text-3xl:  1.875rem;  /* 30px */
  --text-4xl:  2.25rem;   /* 36px */

  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  --leading-tight:  1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;
}

/* /views-components/tokens/shadows.css */
:root {
  --shadow-xs: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}
```

---

## 4. ERİŞİLEBİLİRLİK (ACCESSIBILITY) KURALLARI — WCAG AAA

| Kural | Açıklama | Kontrol |
|-------|----------|---------|
| `aria-label` | Her icon-only buton anlamlı label içermeli | `axe-core` |
| `aria-live` | Dinamik içerik güncellemeleri (toast, hata) | `polite` veya `assertive` |
| `aria-expanded` | Dropdown, accordion, megamenu | boolean zorunlu |
| `role` | Semantik HTML yoksa (div'den kart) | `role="article"` vb. |
| `aria-current` | Aktif breadcrumb, nav linki | `page` / `step` |
| `tabIndex` | Odaklanabilir özel elementler | -1 veya 0 |
| Kontrast | Metin/arkaplan minimum 4.5:1 (AA), ideal 7:1 (AAA) | Otomatik token kontrolü |
| `alt` | Her img zorunlu, dekoratif ise `alt=""` | Lint kuralı |
| `focus-visible` | Klavye odak halkası her zaman görünür | CSS `outline` asla kaldırılmaz |

```typescript
// Erişilebilir Modal Örneği
<dialog
  ref={dialogRef}
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  onClose={onClose}
>
  <h2 id="modal-title">{title}</h2>
  <p id="modal-description">{description}</p>
  <button autoFocus onClick={onClose} aria-label="Modalı kapat">×</button>
</dialog>
```

---

## 5. SIFIR CLS (CUMULATIVE LAYOUT SHIFT) KURALLARI

```typescript
// ✅ DOĞRU — SmartImage her zaman boyut belirtir
<SmartImage
  src="/product.avif"
  alt="Organik Keten Gömlek"
  width={800}
  height={1000}
  style={{ aspectRatio: '4/5' }}  // CLS = 0, alan önceden rezerve edilir
  priority={isAboveFold}
/>

// ❌ YANLIŞ — Boyutsuz resim, layout shift'e neden olur
<img src="/product.jpg" alt="Ürün" />

// ✅ DOĞRU — Skeleton yükleme aynı boyutlarda
<Skeleton width={300} height={400} className={styles.productCardSkeleton} />
```

### 5.1 Zorunlu aspect-ratio Kullanımı

```css
/* Her görsel container'da aspect-ratio şarttır */
.productCard__image {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  background-color: var(--color-bg-secondary); /* LQIP arka planı */
}

.heroBanner {
  aspect-ratio: 16 / 7;
}

.collectionThumbnail {
  aspect-ratio: 1;
}
```

---

## 6. SIFIR RUNTIME CSS

Tüm stiller:
1. CSS Modules (`.module.css`) — scope'lu, production'da bundle'lanır
2. CSS Custom Properties (token'lar) — runtime performans maliyeti sıfır
3. PostCSS + LightningCSS — minify, autoprefixer

**Yasaklar:**
- ❌ `styled-components` / `emotion` — runtime CSS-in-JS maliyeti
- ❌ `style={{ color: isDark ? 'white' : 'black' }}` — Token kullan, `data-theme` attribute değiştir
- ❌ `!important` — Spesifiklik savaşı yerine BEM/module scope
- ❌ `@media` media query inline — Token sistemi ile kontrol

---

## 7. BILEŞEN KATALOGLANDIRma (Storybook Zorunlu)

```typescript
// Button.stories.tsx
export default {
  title: 'Atoms/Button',
  component: Button,
  parameters: { a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } } },
} satisfies Meta<typeof Button>;

export const Primary: Story = { args: { variant: 'primary', size: 'md', children: 'Sepete Ekle' } };
export const Loading: Story = { args: { ...Primary.args, isLoading: true } };
export const Disabled: Story = { args: { ...Primary.args, disabled: true } };
```

---

*Her bileşen Storybook'ta dokümante edilmeden production'a alınamaz.*

