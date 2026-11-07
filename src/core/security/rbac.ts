/**
 * RBAC (Rol Tabanlı Erişim Kontrolü) Yetki ve İzin Tanımları
 */
export const PERMISSIONS = {
  // Katalog
  'catalog:products:read': 'Ürünleri görüntüle',
  'catalog:products:create': 'Ürün oluştur',
  'catalog:products:update': 'Ürün güncelle',
  'catalog:products:delete': 'Ürün sil',
  'catalog:collections:manage': 'Koleksiyonları yönet',

  // Stok / Envanter
  'inventory:read': 'Stok görüntüle',
  'inventory:adjust': 'Stok seviyelerini ayarla',
  'inventory:transfer': 'Depolar arası stok transferi',

  // Siparişler
  'orders:read': 'Siparişleri görüntüle',
  'orders:create': 'Sipariş oluştur',
  'orders:fulfill': 'Sipariş gönderim / paketleme yap',
  'orders:refund': 'İade ve geri ödeme yap',
  'orders:cancel': 'Sipariş iptal et',

  // Müşteriler
  'customers:read': 'Müşteri profillerini görüntüle',
  'customers:manage': 'Müşteri profillerini ve segmentlerini yönet',

  // İndirimler
  'discounts:manage': 'Kupon ve indirim kurallarını yönet',

  // Analitik & Raporlar
  'analytics:read': 'Canlı gösterge ve raporları görüntüle',
  'analytics:export': 'Raporları dışa aktar',

  // Ayarlar & Personel
  'settings:manage': 'Mağaza ayarlarını yönet',
  'staff:manage': 'Personel ve rol izinlerini yönet',
} as const;

export type Permission = keyof typeof PERMISSIONS;

export const ROLES: Record<string, Permission[]> = {
  owner: Object.keys(PERMISSIONS) as Permission[],
  admin: [
    'catalog:products:read',
    'catalog:products:create',
    'catalog:products:update',
    'catalog:products:delete',
    'catalog:collections:manage',
    'inventory:read',
    'inventory:adjust',
    'inventory:transfer',
    'orders:read',
    'orders:create',
    'orders:fulfill',
    'orders:refund',
    'orders:cancel',
    'customers:read',
    'customers:manage',
    'discounts:manage',
    'analytics:read',
    'analytics:export',
  ],
  fulfillment: ['inventory:read', 'orders:read', 'orders:fulfill'],
  support: ['orders:read', 'customers:read', 'inventory:read'],
  analyst: ['analytics:read', 'analytics:export', 'orders:read', 'catalog:products:read'],
};

export function hasPermission(staffPermissions: string[], required: Permission): boolean {
  return staffPermissions.includes(required);
}

export function hasAllPermissions(staffPermissions: string[], required: Permission[]): boolean {
  return required.every((perm) => staffPermissions.includes(perm));
}

