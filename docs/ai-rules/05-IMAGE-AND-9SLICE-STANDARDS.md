# 05 — IMAGE AND 9-SLICE STANDARDS
## Görsel Format, Responsive, 9-Slice ve Retina Standartları

---

## 1. GÖRSEL FORMAT HİYERARŞİSİ

```
AVIF  (birincil)   → %40-50 daha küçük JPG'den, %20-30 WebP'den küçük
WebP  (ikincil)    → Safari 14+ ve eski Chrome için fallback
MozJPEG (yedek)   → Eski tarayıcılar için son fallback
```

### 1.1 `<picture>` Elementi Zorunlu Şablonu

```html
<picture>
  <source srcset="urun.avif 1x, urun-2x.avif 2x" type="image/avif" />
  <source srcset="urun.webp 1x, urun-2x.webp 2x" type="image/webp" />
  <img
    src="urun.jpg"
    alt="Organik Keten Gömlek - Bej, M Beden"
    width="800"
    height="1000"
    loading="lazy"
    decoding="async"
    fetchpriority="auto"
    style="aspect-ratio: 4/5; background-color: #f5f5f5; background-image: url('data:image/jpeg;base64,{{blurhash_lqip}}')"
  />
</picture>
```

**Above-the-fold (ekran üstü) görseller için:**
```html
<img fetchpriority="high" loading="eager" ... />
<!-- preload link head'de zorunlu -->
<link rel="preload" as="image" href="/hero.avif" type="image/avif" fetchpriority="high" />
```

---

## 2. RESPONSIVE SRCSET KIRILIM NOKTALARI

```typescript
export const IMAGE_BREAKPOINTS = [320, 480, 640, 768, 1024, 1280, 1536, 1920, 2560] as const;

// Kullanım bağlamına göre sizes attribute
export const IMAGE_SIZES = {
  productCard:    '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px',
  productHero:    '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 800px',
  collectionHero: '100vw',
  thumbnail:      '(max-width: 640px) 25vw, 100px',
  avatar:         '48px',
} as const;

// srcset üretici
export function generateSrcSet(basePath: string, format: 'avif' | 'webp' | 'jpg'): string {
  return IMAGE_BREAKPOINTS
    .map(w => `${basePath}-${w}w.${format} ${w}w`)
    .join(', ');
}
```

---

## 3. BLURHASH / THUMBHASH LQIP (LOW QUALITY IMAGE PLACEHOLDER)

### 3.1 Neden Zorunlu?
- Görsel yüklenene kadar kullanıcı boş beyaz alan görmez → UX iyileşir
- CLS = 0 → Görsel yeri önceden ayrılmış, layout shift yok
- LCP iyileşir → Tarayıcı boyutu biliyor, hemen yer tahsis eder

### 3.2 Üretim Süreci
```python
# multi_format_optimizer.py içinde
import blurhash
from PIL import Image

def generate_lqip(image_path: str) -> dict:
    img = Image.open(image_path).convert('RGB')
    img.thumbnail((32, 32))  # 32px thumbnail
    bh = blurhash.encode(np.array(img), x_components=4, y_components=3)
    # 20px Base64 JPEG de üret
    img_tiny = img.resize((20, 25), Image.LANCZOS)
    buffer = io.BytesIO()
    img_tiny.save(buffer, format='JPEG', quality=20, optimize=True)
    b64 = base64.b64encode(buffer.getvalue()).decode()
    return { 'blurhash': bh, 'lqip_b64': f'data:image/jpeg;base64,{b64}' }
```

### 3.3 Client-side Kullanım

```typescript
// SmartImage.tsx
export const SmartImage: FC<SmartImageProps> = ({ src, alt, width, height, lqip, priority }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={styles.wrapper}
      style={{
        aspectRatio: `${width}/${height}`,
        backgroundImage: lqip ? `url('${lqip}')` : undefined,
        backgroundSize: 'cover',
      }}
    >
      <picture>
        <source srcSet={generateSrcSet(src, 'avif')} type="image/avif" sizes={sizes} />
        <source srcSet={generateSrcSet(src, 'webp')} type="image/webp" sizes={sizes} />
        <img
          src={`${src}-640w.jpg`}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={[styles.image, loaded && styles.loaded].filter(Boolean).join(' ')}
        />
      </picture>
    </div>
  );
};
```

---

## 4. 9-SLICE (9-PATCH) ÖLÇEKLENEBİLİR UI ÇERÇEVE STANDARTLARI

### 4.1 9-Slice Nedir?

```
┌──────┬──────────────────┬──────┐
│  1   │        2         │  3   │  ← Sabit köşeler (asla uzamaz)
│ NW   │   N (yatay uzar) │  NE  │
├──────┼──────────────────┼──────┤
│  4   │        5         │  6   │  ← Sol/Sağ dikey uzar, Merkez her yönde uzar
│  W   │  Merkez (uzar)   │  E   │
│(vert)│                  │(vert)│
├──────┼──────────────────┼──────┤
│  7   │        8         │  9   │  ← Sabit köşeler
│ SW   │   S (yatay uzar) │  SE  │
└──────┴──────────────────┴──────┘
```

### 4.2 Kullanım Alanları
- Kampanya rozeti (farklı uzunlukta metin içerebilir)
- Özel tasarımlı buton çerçevesi
- Dekoratif kart kenarlığı (köşe süsü bozulmamalı)
- Fiyat etiketi / ribbon
- Bildirim balonu (notification bubble)

### 4.3 CSS `border-image` ile Uygulama

```css
/* 9-slice_generator.py çıktısı örneği */
.campaignBadge {
  border-image-source: url('/ui/badge-frame.png');
  border-image-slice: 12 15 12 15 fill;  /* top right bottom left */
  border-image-width: 12px 15px 12px 15px;
  border-image-repeat: stretch;
  /* İçerik padding'i slice değerleri kadar */
  padding: 8px 16px;
}
```

### 4.4 `NineSliceBox.tsx` Bileşeni

```typescript
export interface NineSliceBoxProps {
  /** 9-slice görsel URL'i */
  sliceImage: string;
  /** Piksel cinsinden kesim değerleri */
  slice: { top: number; right: number; bottom: number; left: number };
  /** İçerik */
  children: React.ReactNode;
  className?: string;
}

export const NineSliceBox: FC<NineSliceBoxProps> = ({
  sliceImage, slice, children, className
}) => {
  const style: CSSProperties = {
    borderImageSource: `url('${sliceImage}')`,
    borderImageSlice: `${slice.top} ${slice.right} ${slice.bottom} ${slice.left} fill`,
    borderImageWidth: `${slice.top}px ${slice.right}px ${slice.bottom}px ${slice.left}px`,
    borderImageRepeat: 'stretch',
    padding: `${slice.top}px ${slice.right}px ${slice.bottom}px ${slice.left}px`,
  };
  return <div className={className} style={style}>{children}</div>;
};
```

---

## 5. RETINA / HD GÖRSEL STANDARTLARI

### 5.1 DPI Hedefleri

| Hedef | DPR | Kullanım |
|-------|-----|---------|
| Standard | 1x | Masaüstü standard monitör |
| Retina | 2x | MacBook, iPhone, modern Android |
| Super Retina | 3x | iPhone Pro serileri |
| Poster/Print | 4x | Büyük ekran TV, baskı kalitesi |

### 5.2 Görsel Boyut Hesabı

```typescript
// 280px genişliğinde product card → 2x Retina için 560px görsel gerekir
export function calculateRequiredImageWidth(
  displayWidthPx: number,
  devicePixelRatio: number = 2
): number {
  return Math.ceil(displayWidthPx * devicePixelRatio);
}
```

---

## 6. GÖRSEL DOSYA ADLANDIRMA STANDARDI (SEO)

```
Format: [marka]-[urun-adi]-[renk-varyant]-[sira]-[genislik]w.[format]

Örnekler:
  ecowear-keten-gomlek-bej-1-800w.avif
  ecowear-keten-gomlek-bej-1-800w.webp
  ecowear-keten-gomlek-bej-1-800w.jpg
  ecowear-keten-gomlek-bej-1-1600w.avif   (2x Retina)
  ecowear-keten-gomlek-detay-2-800w.avif  (ürünün 2. görseli)
```

**Kurallar:**
- Türkçe karakter yasak (slug kuralı geçerli)
- Marka adı zorunlu (image search için)
- Renk/varyant bilgisi zorunlu
- Sıra numarası zorunlu (çoklu görsel)
- Genişlik suffix'i zorunlu (CDN cache busting)

---

## 7. IMAGE CDN VE ÖNBELLEK STRATEJİSİ

```typescript
// CDN transform URL şablonu (Cloudflare Images, imgix, Bunny.net)
export function cdnImageUrl(
  path: string,
  opts: { w: number; h?: number; f?: 'avif' | 'webp' | 'auto'; q?: number; fit?: 'crop' | 'contain' }
): string {
  const params = new URLSearchParams({
    w: String(opts.w),
    ...(opts.h && { h: String(opts.h) }),
    f: opts.f ?? 'auto',
    q: String(opts.q ?? 85),
    fit: opts.fit ?? 'cover',
  });
  return `https://cdn.magaza.com/cdn-cgi/image/${params}/${path}`;
}
```

**Cache-Control Headers:**
```
İşlenmiş görseller: Cache-Control: public, max-age=31536000, immutable
Ham görseller:      Cache-Control: public, max-age=86400
Responsive varyant: Cache-Control: public, max-age=31536000, immutable
```

---

*Her görsel bu standartta işlenmeden production'a alınmaz.*

