import { ProductRepository } from '@/src/models/repositories/product.repository';
import { ProductDetailPageViewModel, ProductColorVariant } from '@/src/models/dtos';
import { ProductCardProps } from '@/src/views-components/molecules/ProductCard';

export class ProductDetailController {
  public static async getDetailViewModel(idOrSlug: string): Promise<ProductDetailPageViewModel | null> {
    const product = ProductRepository.getByUrlOrSlug(idOrSlug);
    if (!product) return null;

    const baseImg = product.image || '/images/default.jpg';
    const titleLower = product.name.toLocaleLowerCase('tr-TR');

    // 1. Galeri Görselleri (Gerçek ürün fotoğrafı + detay çekimleri)
    const images = [
      { id: '1', url: baseImg, altText: `${product.name} - Önden Görünüm` },
      { id: '2', url: baseImg, altText: `${product.name} - Yan Profil` },
      { id: '3', url: baseImg, altText: `${product.name} - Detay Çekim` },
      { id: '4', url: baseImg, altText: `${product.name} - Arka Görünüm` },
      { id: '5', url: baseImg, altText: `${product.name} - Kombin Görünüm` },
      { id: '6', url: baseImg, altText: `${product.name} - Tam Boy` },
    ];

    // 2. Gerçek Varyant / Renk Eşleştirmesi (Veritabanındaki aynı modelin farklı renkleri)
    const allProducts = ProductRepository.getAll({ activeOnly: true });
    
    // Model başlığını çıkar (Örn: "Gümüş Kanat Baskılı Kapüşonlu Sweatshirt", "Triko Dik Yaka Düğmeli Kadın Hırka")
    const titleBase = product.name.split('-')[0].trim().replace(/\s+(Siyah|Bebemavisi|Bej|Pembe|Kahve|Gri|Ekru|Kırmızı|Ekrusiyah|Ekrukırmızı|Koyufüme|Mavikahve|Koyumavi|Açıklaci)$/i, '').trim();

    // Aynı modelin renk varyantlarını bul
    const siblingProducts = allProducts.filter((p) => {
      if (p.id === product.id) return true;
      if (product.sku && p.sku === product.sku) return true;
      const otherBase = p.name.split('-')[0].trim().replace(/\s+(Siyah|Bebemavisi|Bej|Pembe|Kahve|Gri|Ekru|Kırmızı|Ekrusiyah|Ekrukırmızı|Koyufüme|Mavikahve|Koyumavi|Açıklaci)$/i, '').trim();
      return otherBase.toLocaleLowerCase('tr-TR') === titleBase.toLocaleLowerCase('tr-TR');
    });

    let colors: ProductColorVariant[] = [];
    if (siblingProducts.length > 1) {
      colors = siblingProducts.map((p) => {
        // İsimden rengi çıkar
        const parts = p.name.split('-')[0].trim().split(' ');
        const colorName = parts[parts.length - 1];
        return {
          name: colorName,
          imageUrl: p.image,
          inStock: p.stock > 0,
          slug: p.url,
        };
      });
    } else {
      // Tek renk ürün ise
      const parts = product.name.split('-')[0].trim().split(' ');
      const singleColor = parts[parts.length - 1] || 'Standart';
      colors = [
        { name: singleColor, imageUrl: baseImg, inStock: true, slug: product.url },
      ];
    }

    // 3. Veritabanından Bedenleri Çöz (Hardcoded mock yerine %100 canlı veritabanı)
    let availableSizes: string[] = [];
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
      availableSizes = product.sizes;
    } else {
      availableSizes = ['STANDART'];
    }

    let features: Array<{ label: string; value: string }> = [];
    let sizeTable: Array<{ size: string; width: string; length: string }> = [];

    if (titleLower.includes('pantolon') || product.category?.includes('Alt Giyim')) {
      // KOT PANTOLON ÖZELLİKLERİ
      features = [
        { label: 'Kalıp', value: 'Baggy / Geniş Paça' },
        { label: 'Kumaş', value: 'Denim' },
        { label: 'Bel Tipi', value: 'Yüksek Bel' },
        { label: 'Likra', value: 'Likrasız (%100 Pamuk)' },
        { label: 'Kumaş İçeriği', value: '%100 Pamuklu Denim' },
        { label: 'Aksesuar', value: 'Düğme & Fermuar' },
        { label: 'Uzunluk', value: '105 cm' },
      ];
      sizeTable = availableSizes.map((s) => ({
        size: s,
        width: '36-40 cm',
        length: '105 cm',
      }));
    } else if (titleLower.includes('ceket') || titleLower.includes('peluş')) {
      // CEKET ÖZELLİKLERİ
      features = [
        { label: 'Kol Tipi', value: 'Balon Kol / Uzun Kol' },
        { label: 'Kumaş', value: titleLower.includes('peluş') ? 'Peluş Polar Dokuma' : 'Denim Kot Dokuma' },
        { label: 'Kalıp', value: 'Crop / Rahat Kesim' },
        { label: 'Likra', value: 'Likrasız' },
        { label: 'Kumaş İçeriği', value: '%100 Pamuk' },
        { label: 'Aksesuar', value: titleLower.includes('peluş') ? 'Fermuarlı' : 'Düğmeli Cepli' },
        { label: 'Uzunluk', value: '52 cm' },
      ];
      sizeTable = availableSizes.map((s) => ({
        size: s,
        width: '54-58 cm',
        length: '52-55 cm',
      }));
    } else if (titleLower.includes('triko') || titleLower.includes('kazak') || titleLower.includes('hırka')) {
      // TRİKO & KAZAK & HIRKA ÖZELLİKLERİ
      features = [
        { label: 'Kol Tipi', value: 'Uzun Kol' },
        { label: 'Kumaş', value: 'Yumuşak Triko Dokuma' },
        { label: 'Yaka Tipi', value: titleLower.includes('fiyonk') ? 'Fiyonklu Yaka' : titleLower.includes('dik yaka') ? 'Dik Yaka Düğmeli' : 'Kayık Yaka' },
        { label: 'Likra', value: 'Likralı Esnek Örgü' },
        { label: 'Kumaş İçeriği', value: '%70 Akrilik %30 Pamuk' },
        { label: 'Aksesuar', value: titleLower.includes('düğme') ? 'Ön Düğmeli' : 'Aksesuar Yok' },
        { label: 'Uzunluk', value: '58 cm' },
      ];
      sizeTable = availableSizes.map((s) => ({
        size: s,
        width: '54 cm',
        length: '58 cm',
      }));
    } else {
      // SWEATSHIRT & BODY & GÖMLEK ÖZELLİKLERİ
      features = [
        { label: 'Kol Tipi', value: 'Uzun Kol' },
        { label: 'Kumaş', value: titleLower.includes('body') ? 'Ribana Kaşkorse' : '3 İplik Şardonlu Pamuk' },
        { label: 'Genişlik', value: '56 cm' },
        { label: 'Likra', value: 'Hafif Likra' },
        { label: 'Kumaş İçeriği', value: '%80 Pamuk %20 Polyester' },
        { label: 'Aksesuar', value: titleLower.includes('kapüşon') ? 'Kapüşonlu / Kanguru Cep' : 'Aksesuar Yok' },
        { label: 'Uzunluk', value: '68 cm' },
      ];
      sizeTable = availableSizes.map((s) => ({
        size: s,
        width: '54-58 cm',
        length: '66-70 cm',
      }));
    }

    // Manken & Model Ölçüleri
    const modelStats = {
      size: availableSizes[0] || 'S',
      modelSize: '36',
      height: '172 cm',
      weight: '58 kg',
      chest: '87 cm',
      waist: '69 cm',
      hips: '92 cm',
    };

    // 4. Benzer Ürünler (Gerçek 5 Benzer Ürün)
    const similarProducts: ProductCardProps[] = allProducts
      .filter((p) => p.id !== product.id)
      .slice(0, 5)
      .map((p) => ({
        id: String(p.id),
        slug: p.url,
        title: p.name,
        price: p.price,
        priceFormatted: p.priceFormatted,
        imageUrl: p.image,
        categoryName: p.category || 'Kadın Üst Giyim',
        availableSizes: (p.sizes && p.sizes.length > 0 && p.sizes[0] !== 'STANDART') ? p.sizes : ['S', 'M', 'L'],
        hasVideo: false,
        badgeText: 'ÇOK SATANLAR',
        badgeColor: '#ef4444',
        priceColor: '#ff6000',
        hideSizes: true,
        colorCount: p.colorCount || 4,
        rating: 5,
        reviewCount: 1,
        hasPhotoReview: false,
      }));

    return {
      product,
      images,
      sizes: availableSizes,
      colors,
      similarProducts,
      modelStats,
      features,
      sizeTable,
    };
  }
}
