import { ProductRepository } from '@/src/models/repositories/product.repository';
import { CategoryRepository } from '@/src/models/repositories/category.repository';
import { CollectionPageViewModel } from '@/src/models/dtos';
import { ProductCardProps } from '@/src/views-components/molecules/ProductCard';

export class CollectionController {
  public static async getCollectionViewModel(slug: string, search?: string): Promise<CollectionPageViewModel> {
    const allCategories = CategoryRepository.getAll();
    const categoriesTree = CategoryRepository.getTree();

    let displayProducts: any[] = [];
    let title = '';

    if (search && search.trim()) {
      const cleanSearch = search.trim();
      displayProducts = ProductRepository.getAll({ search: cleanSearch, activeOnly: true });
      title = `"${cleanSearch}" İÇİN ARAMA SONUÇLARI`;
    } else {
      const allProducts = ProductRepository.getAll({ activeOnly: true });

      // Veritabanındaki kategori ağacından dinamik arama
      const dbCategory = allCategories.find(
        (c) => c.slug === slug || c.slug.toLowerCase() === slug.toLowerCase()
      );

      const titleMap: Record<string, string> = {
        'yeni-gelenler': 'YENİ GELENLER',
        'yeni-urunler': 'YENİ ÜRÜNLER',
        '3-iplikler': '3 İPLİKLER',
        'beden-indirimli': 'BEDEN İNDİRİMLİ ÜRÜNLER',
        'kadin-alt-giyim': 'KADIN ALT GİYİM',
        'kadin-ayakkabi': 'KADIN AYAKKABI',
        'ceket-yelek': 'KADIN DIŞ GİYİM',
        'elbise': 'ELBİSE MODELLERİ',
        'takim': 'İKİLİ TAKIMLAR',
        'esofman': 'KADIN EŞOFMAN-PİJAMA',
        'gomlek-bluz': 'GÖMLEK & BLUZ',
        'sweat-tunik': 'SWEATSHIRT & HOODIE',
        'triko-kazak': 'TRİKO & KAZAK',
        'kadin-ust-giyim': 'KADIN ÜST GİYİM',
        'pantolon-jean': 'PANTOLON & JEAN',
        'buyuk-beden': 'KADIN BÜYÜK BEDEN',
        'indirim': 'İNDİRİMLİ ÜRÜNLER',
        'kislik-urunler': 'KIŞLIK ÜRÜNLER',
        'one-cikanlar': 'ÖNE ÇIKANLAR',
        'seri-sonu': 'SERİ SONU FIRSATLAR',
        'sezon-sonu': 'SEZON SONU ÜRÜNLER',
        'sezon-sonu-urunler': 'SEZON SONU ÜRÜNLER',
        'ozel-koleksiyon': 'ÖZEL KOLEKSİYONLAR',
      };

      // Dinamik isim: Eğer veritabanında varsa veritabanındaki isim önceliklidir!
      title = dbCategory ? dbCategory.name : (titleMap[slug] || slug.replace(/-/g, ' ').toUpperCase());

      // Ürünleri kategori ve slug içeriğine göre akıllıca filtrele
      const filteredProducts = allProducts.filter((p) => {
        if (slug === 'yeni-gelenler' || slug === 'yeni-urunler' || slug === 'cok-satanlar') return true;

        const pTitle = p.name.toLocaleLowerCase('tr-TR');
        const pCat = p.category.toLocaleLowerCase('tr-TR');
        const s = slug.toLowerCase();

        if (s === 'alt-giyim' || s === 'pantolon' || s === 'pantolon-jean' || s === 'etek' || s === 'sort' || s === 'esofman-alti') {
          return pCat.includes('alt') || pTitle.includes('pantolon') || pTitle.includes('jean') || pTitle.includes('kot') || pTitle.includes('etek');
        }

        if (s === 'ust-giyim' || s === 'bluz' || s === 'gomlek' || s === 'triko' || s === 'hirka' || s === 'yelek' || s === 'sweat') {
          return pCat.includes('üst') || pTitle.includes('sweat') || pTitle.includes('triko') || pTitle.includes('kazak') || pTitle.includes('hırka') || pTitle.includes('bluz');
        }

        if (s === 'elbise' || s === 'gunluk-elbise' || s === 'triko-elbise' || s === 'sik-abiye-elbise') {
          return pTitle.includes('elbise') || pTitle.includes('takım');
        }

        return true;
      });

      displayProducts = filteredProducts.length > 0 ? filteredProducts : allProducts;
    }

    const productCards: ProductCardProps[] = displayProducts.map((p) => ({
      id: String(p.id),
      slug: p.url,
      title: p.name,
      price: p.price,
      priceFormatted: p.priceFormatted,
      imageUrl: p.image,
      categoryName: p.category || 'Kadın Üst Giyim',
      availableSizes: (p.sizes && p.sizes.length > 0) ? p.sizes : ['STANDART'],
      hasVideo: p.hasVideo ?? true,
      colorCount: p.colorCount || 4,
      badgeText: p.badge || undefined,
      rating: 5,
      reviewCount: 0,
      hasPhotoReview: true,
    }));

    return {
      title,
      slug: slug || 'yeni-gelenler',
      products: productCards,
      totalCount: productCards.length,
      categories: CategoryRepository.getTree(),
    };
  }
}
