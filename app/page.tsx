import { HomeController } from '@/src/controllers/storefront/home.controller';
import { HomeTemplate } from '@/src/views-components/templates/HomeTemplate';

export const revalidate = 0;

export default async function HomePage() {
  const vm = await HomeController.getHomePageViewModel();

  return (
    <HomeTemplate
      heroTitle={vm.heroTitle}
      heroSubtitle={vm.heroSubtitle}
      featuredProducts={vm.featuredProducts}
      categories={vm.categories}
    />
  );
}
