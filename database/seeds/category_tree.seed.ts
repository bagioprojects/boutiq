/**
 * FK Butik - Ladyspecial.com.tr Referans Alınarak Oluşturulan
 * Tam Kategori Ağacı ve Navigasyon Tohumlama (Seeds)
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const CATEGORY_TREE_DATA = [
  {
    "href": "/yaz-indirimi",
    "label": "İNDİRİM",
    "subLinks": []
  },
  {
    "href": "/yeni-sezon",
    "label": "YENİ SEZON",
    "subLinks": []
  },
  {
    "href": "/dogaya-dokun",
    "label": "Doğa'ya Dokun Kreasyonu",
    "subLinks": []
  },
  {
    "href": "/kombin-al",
    "label": "KOMBİN AL",
    "subLinks": []
  },
  {
    "href": "/alt-giyim",
    "label": "Alt Giyim ",
    "subLinks": [
      {
        "href": "/etek",
        "label": "Etek",
        "subLinks": [
          {
            "href": "/kot-etek",
            "label": "Kot Etek",
            "subLinks": []
          },
          {
            "href": "/uzun-etek",
            "label": "Uzun Etek",
            "subLinks": []
          }
        ]
      },
      {
        "href": "/kadin-esofman-alti",
        "label": "Eşofman Altı",
        "subLinks": []
      },
      {
        "href": "/kadin-pantolon",
        "label": "Pantolon",
        "subLinks": [
          {
            "href": "/palazzo-pantolon",
            "label": "Palazzo Pantolon",
            "subLinks": []
          },
          {
            "href": "/balon-pantolon",
            "label": "Balon Pantolon",
            "subLinks": []
          },
          {
            "href": "/salvar-pantolon",
            "label": "Şalvar Pantolon",
            "subLinks": []
          },
          {
            "href": "/dar-paca-pantolon",
            "label": "Dar Paça Pantolon",
            "subLinks": []
          }
        ]
      },
      {
        "href": "/tayt",
        "label": "Tayt",
        "subLinks": []
      },
      {
        "href": "/sort-bermuda",
        "label": "Şort & Şort Etek ",
        "subLinks": []
      },
      {
        "href": "/kadin-jean",
        "label": "Jeans",
        "subLinks": []
      },
      {
        "href": "/alt-giyim",
        "label": "Tümünü Gör",
        "subLinks": []
      }
    ]
  },
  {
    "href": "/ust-giyim",
    "label": "Üst Giyim ",
    "subLinks": [
      {
        "href": "/kadin-tisort",
        "label": "T-Shirt",
        "subLinks": []
      },
      {
        "href": "/atlet",
        "label": "Atlet",
        "subLinks": []
      },
      {
        "href": "/crop",
        "label": "Crop",
        "subLinks": []
      },
      {
        "href": "/body",
        "label": "Body",
        "subLinks": []
      },
      {
        "href": "/bluz",
        "label": "Bluz",
        "subLinks": []
      },
      {
        "href": "/kadin-gomlek",
        "label": "Gömlek",
        "subLinks": []
      },
      {
        "href": "/kadin-sweatshirt",
        "label": "Sweatshirt",
        "subLinks": []
      },
      {
        "href": "/hirka",
        "label": "Hırka",
        "subLinks": []
      },
      {
        "href": "/kazak",
        "label": "Kazak",
        "subLinks": []
      },
      {
        "href": "/esofman-ustu",
        "label": "Eşofman Üstü",
        "subLinks": []
      },
      {
        "href": "/kadin-yelek",
        "label": "Yelek",
        "subLinks": []
      },
      {
        "href": "/ust-giyim",
        "label": "Tümünü Gör",
        "subLinks": []
      }
    ]
  },
  {
    "href": "/dis-giyim",
    "label": "Dış Giyim ",
    "subLinks": [
      {
        "href": "/kadin-ceket",
        "label": "Ceket",
        "subLinks": []
      },
      {
        "href": "/kaban",
        "label": "Kaban",
        "subLinks": []
      },
      {
        "href": "/trenckot",
        "label": "Trençkot",
        "subLinks": []
      },
      {
        "href": "/dis-giyim",
        "label": "Tümünü Gör",
        "subLinks": []
      }
    ]
  },
  {
    "href": "/elbise",
    "label": "Elbise",
    "subLinks": []
  },
  {
    "href": "/alt-ust-takim",
    "label": "Alt-Üst Takım",
    "subLinks": []
  },
  {
    "href": "/denim",
    "label": "Denim Kolleksiyonu",
    "subLinks": []
  },
  {
    "href": "/kadin-canta",
    "label": "Çanta",
    "subLinks": []
  },
  {
    "href": "/blog",
    "label": "Lady Special Blog",
    "subLinks": []
  }
];

export async function seedCategoryTree() {
  console.log('🌱 Kategori ağacı ve navigasyon tohumlanıyor...');

  // 1. Ana Koleksiyonlar ve Alt Kırılımlar
  for (let i = 0; i < CATEGORY_TREE_DATA.length; i++) {
    const root = CATEGORY_TREE_DATA[i];
    const rootSlug = root.href.replace(/^\//, '').replace(/\//g, '-');
    
    const rootCollection = await prisma.collection.upsert({
      where: { slug: rootSlug },
      update: {
        title: root.label.trim(),
        sortKey: i + 1,
      },
      create: {
        title: root.label.trim(),
        slug: rootSlug,
        sortKey: i + 1,
        publishedAt: new Date(),
      },
    });

    const subLinks = root.subLinks || [];
    for (let j = 0; j < subLinks.length; j++) {
      const sub = subLinks[j];
      const subSlug = sub.href.replace(/^\//, '').replace(/\//g, '-');
      
      const subCollection = await prisma.collection.upsert({
        where: { slug: subSlug },
        update: {
          title: sub.label.trim(),
          parentId: rootCollection.id,
          sortKey: j + 1,
        },
        create: {
          title: sub.label.trim(),
          slug: subSlug,
          parentId: rootCollection.id,
          sortKey: j + 1,
          publishedAt: new Date(),
        },
      });

      const subSubLinks = sub.subLinks || [];
      for (let k = 0; k < subSubLinks.length; k++) {
        const subSub = subSubLinks[k];
        const subSubSlug = subSub.href.replace(/^\//, '').replace(/\//g, '-');
        
        await prisma.collection.upsert({
          where: { slug: subSubSlug },
          update: {
            title: subSub.label.trim(),
            parentId: subCollection.id,
            sortKey: k + 1,
          },
          create: {
            title: subSub.label.trim(),
            slug: subSubSlug,
            parentId: subCollection.id,
            sortKey: k + 1,
            publishedAt: new Date(),
          },
        });
      }
    }
  }

  console.log('✅ Kategori ağacı (3 Seviye) başarıyla Prisma veritabanına tohumlandı.');
}

if (require.main === module) {
  seedCategoryTree()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
}
