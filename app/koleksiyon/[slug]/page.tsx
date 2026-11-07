import { CollectionController } from '@/src/controllers/storefront/collection.controller';
import { CollectionTemplate } from '@/src/views-components/templates/CollectionTemplate';

export const revalidate = 0;

interface Props {
  params: { slug: string };
  searchParams?: { search?: string };
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const vm = await CollectionController.getCollectionViewModel(params.slug, searchParams?.search);

  return (
    <CollectionTemplate
      collectionTitle={vm.title}
      slug={params.slug}
      categories={vm.categories}
      breadcrumbs={[
        { label: 'Ana Sayfa', url: '/' },
        { label: 'Koleksiyonlar', url: '/koleksiyon/yeni-gelenler' },
        { label: vm.title },
      ]}
      products={vm.products}
    />
  );
}
