import type { Metadata } from 'next';
import { ProductDetailController } from '@/src/controllers/storefront/product-detail.controller';
import { ProductDetailTemplate } from '@/src/views-components/templates/ProductDetailTemplate';
import { CategoryRepository } from '@/src/models/repositories/category.repository';
import { notFound } from 'next/navigation';

export const revalidate = 0;

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const vm = await ProductDetailController.getDetailViewModel(params.id);
  if (!vm || !vm.product) {
    return {
      title: 'Ürün Bulunamadı | FK Butik',
    };
  }

  const { product, images } = vm;
  const title = `${product.name} | FK Butik`;
  const description = `${product.name} en uygun fiyat ve hızlı teslimat avantajıyla FK Butik'te! ${product.category || 'Kadın Giyim'} modellerini hemen keşfedin.`;
  const mainImage = images && images.length > 0 ? images[0] : '/images/logo.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/urun/${product.id}`,
      siteName: 'FK Butik',
      images: [mainImage],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mainImage],
    },
    alternates: {
      canonical: `/urun/${product.id}`,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const vm = await ProductDetailController.getDetailViewModel(params.id);

  if (!vm) {
    notFound();
  }

  const { product, images, sizes, colors, similarProducts, modelStats, features, sizeTable } = vm;
  const categories = CategoryRepository.getTree();

  let catSlug = 'yeni-urunler';
  const catName = product.category || 'Üst Giyim';

  for (const root of categories) {
    if (root.name.toLowerCase() === catName.toLowerCase()) {
      catSlug = root.slug;
      break;
    }
    if (root.children) {
      for (const sub of root.children) {
        if (sub.name.toLowerCase() === catName.toLowerCase()) {
          catSlug = sub.slug;
          break;
        }
      }
    }
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Ana Sayfa',
        item: 'https://fkbutik.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: catName,
        item: `https://fkbutik.com/koleksiyon/${catSlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `https://fkbutik.com/urun/${product.id}`,
      },
    ],
  };

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: images,
    description: `${product.name} - FK Butik kadın giyim koleksiyonu.`,
    sku: product.sku || `SKU-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: 'FK Butik',
    },
    offers: {
      '@type': 'Offer',
      url: `https://fkbutik.com/urun/${product.id}`,
      priceCurrency: 'TRY',
      price: product.price ? String(product.price) : '0',
      availability: (product.stock ?? 1) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailTemplate
        id={String(product.id)}
        sku={product.sku || '76449.1567.'}
        title={product.name}
        category={catName}
        priceFormatted={product.priceFormatted}
        images={images}
        sizes={sizes}
        colors={colors}
        similarProducts={similarProducts}
        modelStats={modelStats}
        features={features}
        sizeTable={sizeTable}
        stock={product.stock}
        categories={categories}
        badge={product.badge || null}
        breadcrumbs={[
          { label: 'Ana Sayfa', url: '/' },
          { label: catName, url: `/koleksiyon/${catSlug}` },
          { label: product.name },
        ]}
      />
    </>
  );
}
