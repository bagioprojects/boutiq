import { ProductRepository } from '@/src/models/repositories/product.repository';
import { CategoryRepository } from '@/src/models/repositories/category.repository';
import { HomePageViewModel } from '@/src/models/dtos';
import { ProductCardProps } from '@/src/views-components/molecules/ProductCard';

export class HomeController {
  public static async getHomePageViewModel(): Promise<HomePageViewModel> {
    const products = ProductRepository.getActiveProducts(24);
    const categories = CategoryRepository.getTree();

    const featuredProducts: ProductCardProps[] = products.map((p) => ({
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
      heroTitle: 'FK Butik Özel Koleksiyonu',
      heroSubtitle: 'Yeni sezon trendleri, en seçkin kadın giyim modelleri ve indirimli fırsatlarla stilinizi yenileyin.',
      featuredProducts,
      categories,
    };
  }
}
