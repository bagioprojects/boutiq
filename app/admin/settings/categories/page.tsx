import { CategoryRepository } from '@/src/models/repositories/category.repository';
import { CategoryTreeManager } from '@/src/views-components/admin/CategoryTreeManager';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const tree = JSON.parse(JSON.stringify(CategoryRepository.getTree()));
  const allCategories = JSON.parse(JSON.stringify(CategoryRepository.getAll()));

  return <CategoryTreeManager initialTree={tree} allCategories={allCategories} />;
}
