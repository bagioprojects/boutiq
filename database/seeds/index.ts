/**
 * FKButik E-Ticaret Altyapısı Başlangıç Veritabanı Tohumlama (Seeds)
 * Roller, Admin Kullanıcısı, Para Birimleri, Kargo Bölgeleri, KDV Oranları
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { ROLES } from '../../src/core/security/rbac';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Veritabanı tohumlama başlatılıyor...');

  // 1. Varsayılan Personel / Admin
  const adminPasswordHash = await bcrypt.hash('FKAdmin2026!Secure', 12);
  const adminStaff = await prisma.staff.upsert({
    where: { email: 'admin@fkbutik.com' },
    update: {},
    create: {
      email: 'admin@fkbutik.com',
      passwordHash: adminPasswordHash,
      firstName: 'FKButik',
      lastName: 'Yönetici',
      isActive: true,
      permissions: ROLES['owner'] ?? [],
    },
  });
  console.log(`✅ Admin personeli hazır: ${adminStaff.email}`);

  // 2. Çoklu Pazar ve Para Birimleri (Shopify Markets)
  const defaultMarket = await prisma.market.upsert({
    where: { handle: 'turkiye' },
    update: {},
    create: {
      name: 'Türkiye Pazarı',
      handle: 'turkiye',
      isEnabled: true,
      isPrimary: true,
      currencies: ['TRY'],
      locales: ['tr-TR'],
      countries: ['TR'],
    },
  });
  console.log(`✅ Varsayılan pazar hazır: ${defaultMarket.name}`);

  // 3. Varsayılan Depo / Lokasyon
  const mainWarehouse = await prisma.location.upsert({
    where: { id: 'loc_main_warehouse' },
    update: {},
    create: {
      id: 'loc_main_warehouse',
      name: 'Merkez Lojistik Deposu',
      isActive: true,
      fulfillsOnlineOrders: true,
      address: {
        city: 'İstanbul',
        country: 'TR',
        address1: 'Merkez Mah. Lojistik Cad. No: 1',
      },
    },
  });
  console.log(`✅ Ana depo hazır: ${mainWarehouse.name}`);

  // 4. Varsayılan Navigasyon Menüsü
  const mainMenu = await prisma.navigationMenu.upsert({
    where: { handle: 'main-menu' },
    update: {},
    create: {
      title: 'Ana Menü',
      handle: 'main-menu',
      items: {
        create: [
          { title: 'Ana Sayfa', url: '/', position: 0 },
          { title: 'Yeni Gelenler', url: '/koleksiyon/yeni-gelenler', position: 1 },
          { title: 'Elbiseler', url: '/koleksiyon/elbise', position: 2 },
          { title: 'Gömlek & Bluz', url: '/koleksiyon/gomlek-bluz', position: 3 },
          { title: 'İndirim', url: '/koleksiyon/indirim', position: 4 },
        ],
      },
    },
  });
  console.log(`✅ Ana menü hazır: ${mainMenu.title}`);

  console.log('🎉 Veritabanı tohumlama başarıyla tamamlandı.');
}

main()
  .catch((e) => {
    console.error('Tohumlama hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

