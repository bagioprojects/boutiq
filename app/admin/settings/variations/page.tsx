import { AdminSettingsController } from '@/src/controllers/admin/settings.controller';
import { VariationsManagerClient } from './VariationsManagerClient';

export const revalidate = 0;

export default async function VariationsPage() {
  const { variations } = await AdminSettingsController.getVariationsViewModel();

  return <VariationsManagerClient initialVariations={variations} />;
}
