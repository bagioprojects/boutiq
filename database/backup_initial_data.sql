-- ========================================================
-- FK BUTIK E-COMMERCE DATABASE BACKUP
-- Generated: 2026-11-07T17:25:55.150Z
-- ========================================================

PRAGMA foreign_keys = OFF;

-- Table: products
DROP TABLE IF EXISTS products;
CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            sku TEXT,
            category TEXT NOT NULL,
            price TEXT NOT NULL,
            price_num REAL NOT NULL,
            stock INTEGER DEFAULT 50,
            sizes TEXT,
            color_count INTEGER DEFAULT 1,
            has_video INTEGER DEFAULT 0,
            has_back_inset INTEGER DEFAULT 0,
            image TEXT NOT NULL,
            url TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        , badge TEXT DEFAULT NULL);

INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (1, 'Yaka Fiyonklu Çizgili Triko Kazak Ekrusiyah - 72547.2302.', '725472302', 'Kadın Üst Giyim', '419,99 TL', 399.99, 44, '["STANDART"]', 2, 1, 0, '/images/products/yeni-gelenler/prod_1_725472302.webp', '/urun/yaka-fiyonklu-cizgili-triko-kazak-ekrusiyah-725472302-104587', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (2, 'Yaka Fiyonklu Çizgili Triko Kazak Ekrukırmızı - 72547.2302.', '725472302', 'Kadın Üst Giyim', '399.99 ₺', 399.99, 48, '["STANDART"]', 2, 1, 0, '/images/products/yeni-gelenler/prod_2_725472302.webp', '/urun/yaka-fiyonklu-cizgili-triko-kazak-ekrukirmizi-725472302-104588', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (3, 'Gümüş Kanat Baskılı Kapüşonlu Sweatshirt Siyah - 76520.2286.', '765202286', 'Kadın Üst Giyim', '499,99 TL', 499.99, 48, '["S", "M", "L", "XL"]', 7, 1, 1, '/images/products/yeni-gelenler/prod_3_765202286.webp', '/urun/gumus-kanat-baskili-kapusonlu-sweatshirt-siyah-765202286-104589', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (4, 'Gümüş Kanat Baskılı Kapüşonlu Sweatshirt Bebemavisi - 76520.2286.', '765202286', 'Kadın Üst Giyim', '499,99 TL', 499.99, 48, '["S", "M", "L", "XL"]', 7, 1, 1, '/images/products/yeni-gelenler/prod_4_765202286.webp', '/urun/gumus-kanat-baskili-kapusonlu-sweatshirt-bebemavisi-765202286-104590', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (5, 'Gümüş Kanat Baskılı Kapüşonlu Sweatshirt Bej - 76520.2286.', '765202286', 'Kadın Üst Giyim', '499,99 TL', 499.99, 48, '["S", "M", "L", "XL"]', 7, 1, 1, '/images/products/yeni-gelenler/prod_5_765202286.webp', '/urun/gumus-kanat-baskili-kapusonlu-sweatshirt-bej-765202286-104591', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (6, 'Gümüş Kanat Baskılı Kapüşonlu Sweatshirt Pembe - 76520.2286.', '765202286', 'Kadın Üst Giyim', '499,99 TL', 499.99, 48, '["S", "M", "L", "XL"]', 7, 1, 1, '/images/products/yeni-gelenler/prod_6_765202286.webp', '/urun/gumus-kanat-baskili-kapusonlu-sweatshirt-pembe-765202286-104592', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (7, 'Gümüş Kanat Baskılı Kapüşonlu Sweatshirt Kahve - 76520.2286.', '765202286', 'Kadın Üst Giyim', '499,99 TL', 499.99, 48, '["S", "M", "L", "XL"]', 7, 1, 1, '/images/products/yeni-gelenler/prod_7_765202286.webp', '/urun/gumus-kanat-baskili-kapusonlu-sweatshirt-kahve-765202286-104593', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (8, 'Gümüş Kanat Baskılı Kapüşonlu Sweatshirt Gri - 76520.2286.', '765202286', 'Kadın Üst Giyim', '499,99 TL', 499.99, 48, '["S", "M", "L", "XL"]', 7, 1, 1, '/images/products/yeni-gelenler/prod_8_765202286.webp', '/urun/gumus-kanat-baskili-kapusonlu-sweatshirt-gri-765202286-104594', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (9, 'Gümüş Kanat Baskılı Kapüşonlu Sweatshirt Ekru - 76520.2286.', '765202286', 'Kadın Üst Giyim', '499,99 TL', 499.99, 48, '["S", "M", "L", "XL"]', 7, 1, 1, '/images/products/yeni-gelenler/prod_9_765202286.webp', '/urun/gumus-kanat-baskili-kapusonlu-sweatshirt-ekru-765202286-104595', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (10, 'Triko Dik Yaka Düğmeli Kadın Hırka Siyah - 76510.1411.', '765101411', 'Kadın Üst Giyim', '399,99 TL', 399.99, 48, '["STANDART"]', 1, 0, 0, '/images/products/yeni-gelenler/prod_10_765101411.webp', '/urun/triko-dik-yaka-dugmeli-kadin-hirka-siyah-765101411-104599', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (11, 'Triko Dik Yaka Düğmeli Kadın Hırka Bej - 76510.1411.', '765101411', 'Kadın Üst Giyim', '399,99 TL', 399.99, 48, '["STANDART"]', 1, 0, 0, '/images/products/yeni-gelenler/prod_11_765101411.webp', '/urun/triko-dik-yaka-dugmeli-kadin-hirka-bej-765101411-104600', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (12, 'Triko Dik Yaka Düğmeli Kadın Hırka Kahve - 76510.1411.', '765101411', 'Kadın Üst Giyim', '399,99 TL', 399.99, 48, '["STANDART"]', 1, 0, 0, '/images/products/yeni-gelenler/prod_12_765101411.webp', '/urun/triko-dik-yaka-dugmeli-kadin-hirka-kahve-765101411-104601', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (13, 'Dokuma Desenli Polo Yaka Gömlek Bej - 76128.2284.', '761282284', 'Kadın Üst Giyim', '399,99 TL', 399.99, 48, '["STANDART"]', 1, 0, 0, '/images/products/yeni-gelenler/prod_13_761282284.webp', '/urun/dokuma-desenli-polo-yaka-gomlek-bej-761282284-104602', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (14, 'Denim Gömlek Yaka Balon Kol Crop Ceket Koyufüme - 76282.392.', '76282392', 'Kadın Üst Giyim', '599,99 TL', 599.99, 48, '["S", "M", "L", "XL"]', 1, 1, 1, '/images/products/yeni-gelenler/prod_14_76282392.webp', '/urun/denim-gomlek-yaka-balon-kol-crop-ceket-koyufume-76282392-104604', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (15, 'Dik Yaka Fermuarlı Peluş Ceket Bejkahve - 76449.360.', '76449360', 'Kadın Üst Giyim', '599,99 TL', 599.99, 48, '["S", "M", "L", "XL"]', 1, 1, 1, '/images/products/yeni-gelenler/prod_15_76449360.webp', '/urun/dik-yaka-fermuarli-pelus-ceket-bejkahve-76449360-104608', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (16, 'Denim Fitilli Yaka Kargo Cepli Crop Ceket Mavikahve - 76283.392.', '76283392', 'Kadın Üst Giyim', '599,99 TL', 599.99, 48, '["S", "M", "L", "XL"]', 1, 1, 1, '/images/products/yeni-gelenler/prod_16_76283392.webp', '/urun/denim-fitilli-yaka-kargo-cepli-crop-ceket-mavikahve-76283392-104609', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (17, 'Buzy Ribana Parmak Geçmeli Çıtçıtlı Body  Siyah - 76522.2153.', '765222153', 'Kadın Üst Giyim', '219,99 TL', 219.99, 48, '["STANDART"]', 1, 0, 0, '/images/products/yeni-gelenler/prod_17_765222153.webp', '/urun/buzy-ribana-parmak-gecmeli-citcitli-body-siyah-765222153-104612', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (18, 'Triko Yarasa Kol Kazak Kırmızı - 76454.2317.', '764542317', 'Kadın Üst Giyim', '399,99 TL', 399.99, 48, '["STANDART"]', 2, 0, 0, '/images/products/yeni-gelenler/prod_18_764542317.webp', '/urun/triko-yarasa-kol-kazak-kirmizi-764542317-104618', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (19, 'Palazzo Kot Pantolon Koyumavi - 34005.1904.', '340051904', 'Kadın Alt Giyim', '479,99 TL', 479.99, 46, '["26", "28", "30", "32"]', 1, 0, 0, '/images/products/yeni-gelenler/prod_19_340051904.webp', '/urun/palazzo-kot-pantolon-koyumavi-340051904-104678', 1, '2026-11-06 00:24:03', NULL);
INSERT INTO products ("id", "name", "sku", "category", "price", "price_num", "stock", "sizes", "color_count", "has_video", "has_back_inset", "image", "url", "is_active", "created_at", "badge") VALUES (20, 'Baggy Kot Pantolon Açıklaci - 76141.1904.', '761411904', 'Kadın Alt Giyim', '479,99 TL', 479.99, 48, '["26", "28", "30", "32"]', 1, 0, 0, '/images/products/yeni-gelenler/prod_20_761411904.webp', '/urun/baggy-kot-pantolon-aciklaci-761411904-104683', 1, '2026-11-06 00:24:03', NULL);

-- Table: orders
DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_number TEXT UNIQUE NOT NULL,
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_city TEXT NOT NULL,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'Hazırlanıyor',
            payment_method TEXT DEFAULT 'Kredi Kartı',
            items_json TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        , tracking_code TEXT, user_id INTEGER, cargo_company TEXT DEFAULT 'Yurtiçi Kargo');

INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (1, 'FK-2026-8901', 'Ayşe Yılmaz', '0532 111 22 33', 'İstanbul', 799.98, 'Kargoya Verildi', 'Kredi Kartı', '[{"name": "Yaka Fiyonklu Triko Kazak", "qty": 1, "price": 399.99}, {"name": "Bal\u0131k\u00e7\u0131 Yaka D\u00fcz Triko Kazak", "qty": 1, "price": 399.99}]', '2026-11-06 00:24:03', 'YURT-998877', NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (2, 'FK-2026-8902', 'Zeynep Kaya', '0544 555 66 77', 'Ankara', 399.99, 'Hazırlanıyor', 'Kapıda Ödeme', '[{"name": "\u00d6n\u00fc \u00c7ift Cepli Triko H\u0131rka", "qty": 1, "price": 399.99}]', '2026-11-06 00:24:03', '', NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (3, 'FK-2026-8903', 'Elif Demir', '0555 777 88 99', 'İzmir', 1199.97, 'Teslim Edildi', 'Kredi Kartı', '[{"name": "G\u00fcm\u00fc\u015f Kanat Bask\u0131l\u0131 Sweatshirt", "qty": 2, "price": 499.99}, {"name": "Yaka Fiyonklu Kazak", "qty": 1, "price": 199.99}]', '2026-11-06 00:24:03', NULL, NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (4, 'FK-2026-8904', 'Büşra Çelik', '0533 222 44 66', 'Bursa', 499.99, 'Hazırlanıyor', 'Kredi Kartı', '[{"name": "Bisiklet Yaka \u015eeritli Triko Kazak", "qty": 1, "price": 499.99}]', '2026-11-06 00:24:03', NULL, NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (5, 'FK-2026-8905', 'Merve Aydın', '0505 888 99 00', 'Antalya', 899.98, 'Onaylandı', 'Havale / EFT', '[{"name": "Yumu\u015fak Dokulu Triko Kazak", "qty": 2, "price": 449.99}]', '2026-11-06 00:24:03', NULL, NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (6, 'FK-2026-9231', 'Selin Yıldız', '0533 111 22 33', 'İzmir', 850, 'Kargoya Verildi', 'Kredi Kartı', '[{"product_id":1,"product_name":"Test Keten Blazer","price":850,"quantity":1,"size":"M"}]', '2026-11-07 01:56:32', 'YK-99887766', NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (7, 'FK-2026-3417', 'Merve Demir', '0535 999 88 77', 'Antalya', 1250, 'Kargoya Verildi', 'Kapıda Ödeme', '[{"product_id":1,"product_name":"Keten Oversize Blazer Ceket","price":1250,"quantity":1,"size":"L"}]', '2026-11-07 02:05:34', 'YK-11223344', NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (8, 'FK-2026-4380', 'Ayşe Test', '05321112233', 'İstanbul / Kadıköy - Moda Cad. No: 12 D: 4', 1599.9, 'Hazırlanıyor', 'Kredi Kartı (3D Secure)', '[{"product_id":1,"name":"Yaka Fiyonklu Triko","sku":"72547","price":1599.9,"quantity":1,"size":"S","color":"Siyah","image_url":"/images/default.jpg"}]', '2026-11-07 07:27:01', NULL, NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (9, 'FK-TEST-1', 'Name', 'Phone', 'City', 100, 'Status', 'Method', '[]', '2026-11-07 07:27:40', NULL, NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (10, 'FK-2026-5009', 'Ayşe Test', '05321112233', 'İstanbul / Kadıköy - Moda Cad. No: 12 D: 4', 1599.9, 'Hazırlanıyor', 'Kredi Kartı (3D Secure)', '[{"product_id":1,"name":"Yaka Fiyonklu Triko","sku":"72547","price":1599.9,"quantity":1,"size":"S","color":"Siyah","image_url":"/images/default.jpg"}]', '2026-11-07 07:29:45', NULL, NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (11, 'FK-2026-4805', 'Oğuz Akgün', '+905387857060', 'İstanbul - sadasdsadasdasdas', 1009.88, 'Hazırlanıyor', 'Havale / EFT', '[{"product_id":19,"product_name":"Palazzo Kot Pantolon Koyumavi - 34005.1904.","sku":"urun","price":479.99,"quantity":2,"size":"26","color":"Koyumavi","image_url":"/images/products/yeni-gelenler/prod_19_340051904.webp"}]', '2026-11-07 12:28:11', NULL, NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (12, 'FK-2026-2449', 'Test Sipariş', '05551234567', 'İstanbul', 500, 'Hazırlanıyor', 'Kapıda Ödeme', '[{"product_id":1,"product_name":"Palazzo Kot Pantolon","price":500,"quantity":1,"size":"36","color":"Mavi"}]', '2026-11-07 13:03:11', NULL, NULL, 'Yurtiçi Kargo');
INSERT INTO orders ("id", "order_number", "customer_name", "customer_phone", "customer_city", "total_amount", "status", "payment_method", "items_json", "created_at", "tracking_code", "user_id", "cargo_company") VALUES (13, 'FK-2026-6018', 'Test Google', '5321112233', 'İstanbul - Kadıköy', 959.98, 'Hazırlanıyor', 'Kredi Kartı', '[{"product_id":1,"product_name":"Yaka Fiyonklu Triko","price":959.98,"quantity":1}]', '2026-11-07 14:57:37', NULL, 2, 'Yurtiçi Kargo');

-- Table: banners
DROP TABLE IF EXISTS banners;
CREATE TABLE banners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subtitle TEXT,
            image_url TEXT NOT NULL,
            link_url TEXT NOT NULL,
            cta_text TEXT DEFAULT 'HEMEN KEŞFET',
            sort_order INTEGER DEFAULT 1,
            is_active INTEGER DEFAULT 1
        );

INSERT INTO banners ("id", "title", "subtitle", "image_url", "link_url", "cta_text", "sort_order", "is_active") VALUES (1, 'ÇOK SATANLAR', '2026 İtalyan Moda Triko & Ceket Koleksiyonu', '/images/banner_hero_coksatanlar_clean.webp', '/koleksiyon/one-cikanlar', 'HEMEN KEŞFET', 1, 1);
INSERT INTO banners ("id", "title", "subtitle", "image_url", "link_url", "cta_text", "sort_order", "is_active") VALUES (2, 'YENİ SEZON', 'Trend İkili Takımlar ve Sıcak Renkler', '/images/banner_hero_yenisezon_clean.webp', '/koleksiyon/yeni-gelenler', 'HEMEN KEŞFET', 2, 1);

-- Table: users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            full_name TEXT NOT NULL,
            phone TEXT,
            role TEXT DEFAULT 'customer',
            auth_provider TEXT DEFAULT 'local',
            google_id TEXT,
            is_verified INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (1, 'demo@fkbutik.com', '$2b$10$/cNY6LjAqx0FNMWCgUfMvOCnBLtBBlo8lvzvVBvJ0AZ7DdG8uxzwS', 'Fatma Akgün', '+90 532 780 51 00', 'admin', 'local', NULL, 1, '2026-11-06 00:54:58', '2026-11-07 15:45:13');
INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (2, 'test.google@gmail.com', '$2b$10$kajCQprmGaMRN8PQDy3jVegJUjhDvmp7dbebWYuw3RkeSbpP8jLZy', 'Test Google', NULL, 'customer', 'google', NULL, 1, '2026-11-06 01:08:03', '2026-11-07 15:09:27');
INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (3, 'ayse.yilmaz@test.com', '$2b$12$.n75pAd6CQOQGytzvihTeuZzziYuFbAvdU8mV3PaBpMD1zqPmdW0m', 'Ayşe Yılmaz', '5551234567', 'customer', 'local', NULL, 1, '2026-11-06 14:02:45', '2026-11-06 14:02:45');
INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (4, 'testuser_1794028046791@example.com', '$2b$10$4lIknAPpz3FxcA3OUb102.2X18qJ.D38G7wYa5AfwQ/xSrwUOOkia', 'Zeynep Kaya', '05331112233', 'customer', 'local', NULL, 1, '2026-11-07 05:07:26', '2026-11-07 05:07:27');
INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (5, 'user_phone_1794034680057@fkbutik.local', '$2b$10$dqi1PU4aC/WqNSTlnQSgae3TqPBnA1bmbroQDyw0dRYjQwr1cHU7u', 'Telefonlu Üye', '+905321833818', 'customer', 'local', NULL, 1, '2026-11-07 06:58:00', '2026-11-07 06:58:00');
INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (6, 'tesst@gmail.com', '$2b$10$1OjNXnmWc/PE63sIGNg5h.75nBhU58ZNUhBUBuozDX4kzziGqbLVG', 'Oğuz Akgün', '+905387857060', 'customer', 'local', NULL, 1, '2026-11-07 07:01:18', '2026-11-07 07:01:18');
INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (7, 'test_err@example.com', '$2b$10$CzBygQuky7qv2iBg7KnOfOGtnw1I72627KaTyMg7ERSLu8OAIh0UC', 'Test Error', '05551234567', 'customer', 'local', NULL, 1, '2026-11-07 07:02:13', '2026-11-07 07:02:13');
INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (8, 'yeni_kullanici_1794035458728@fkbutik.com', '$2b$10$KI3W3Qgvlqt60/OQozrBl.A9A50N9dAUqfbuzWpQrp60XMS2X4EWe', 'Ayşe Yılmaz', '05321112233', 'customer', 'local', NULL, 1, '2026-11-07 07:10:59', '2026-11-07 07:10:59');
INSERT INTO users ("id", "email", "password_hash", "full_name", "phone", "role", "auth_provider", "google_id", "is_verified", "created_at", "last_login_at") VALUES (9, 'dogrulama_1794035587650@fkbutik.com', '$2b$10$ZpPPgCiejSWdP1d9to6qfOS5S2IleFhxZBi8myhN1WoWfJ1TjMtT2', 'Zeynep Kaya', '05449998877', 'customer', 'local', NULL, 1, '2026-11-07 07:13:07', '2026-11-07 07:13:07');

-- Table: user_addresses
DROP TABLE IF EXISTS user_addresses;
CREATE TABLE user_addresses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT DEFAULT 'Ev',
            full_name TEXT NOT NULL,
            phone TEXT NOT NULL,
            city TEXT NOT NULL,
            district TEXT,
            full_address TEXT NOT NULL,
            zip_code TEXT,
            is_default INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

INSERT INTO user_addresses ("id", "user_id", "title", "full_name", "phone", "city", "district", "full_address", "zip_code", "is_default", "created_at") VALUES (1, 6, 'Ev', 'Oğuz Akgün', '+905387857060', 'İstanbul', '', 'sadasdsadasdasdas', '', 1, '2026-11-07 12:28:11');

-- Table: order_items
DROP TABLE IF EXISTS order_items;
CREATE TABLE order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            product_name TEXT NOT NULL,
            sku TEXT,
            price REAL NOT NULL,
            quantity INTEGER DEFAULT 1,
            size TEXT,
            color TEXT,
            image_url TEXT,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
        );

INSERT INTO order_items ("id", "order_id", "product_id", "product_name", "sku", "price", "quantity", "size", "color", "image_url") VALUES (1, 6, 1, 'Test Keten Blazer', '', 850, 1, 'M', '', '');
INSERT INTO order_items ("id", "order_id", "product_id", "product_name", "sku", "price", "quantity", "size", "color", "image_url") VALUES (2, 7, 1, 'Keten Oversize Blazer Ceket', '', 1250, 1, 'L', '', '');
INSERT INTO order_items ("id", "order_id", "product_id", "product_name", "sku", "price", "quantity", "size", "color", "image_url") VALUES (3, 10, 1, 'Yaka Fiyonklu Triko', '72547', 1599.9, 1, 'S', 'Siyah', '/images/default.jpg');
INSERT INTO order_items ("id", "order_id", "product_id", "product_name", "sku", "price", "quantity", "size", "color", "image_url") VALUES (4, 11, 19, 'Palazzo Kot Pantolon Koyumavi - 34005.1904.', 'urun', 479.99, 2, '26', 'Koyumavi', '/images/products/yeni-gelenler/prod_19_340051904.webp');
INSERT INTO order_items ("id", "order_id", "product_id", "product_name", "sku", "price", "quantity", "size", "color", "image_url") VALUES (5, 12, 1, 'Palazzo Kot Pantolon', '', 500, 1, '36', 'Mavi', '');
INSERT INTO order_items ("id", "order_id", "product_id", "product_name", "sku", "price", "quantity", "size", "color", "image_url") VALUES (6, 13, 1, 'Yaka Fiyonklu Triko', '', 959.98, 1, '', '', '');

-- Table: returns
DROP TABLE IF EXISTS returns;
CREATE TABLE returns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            return_number TEXT UNIQUE NOT NULL,
            order_id INTEGER,
            customer_name TEXT NOT NULL,
            customer_phone TEXT,
            reason TEXT NOT NULL,
            status TEXT DEFAULT 'Talep Alındı',
            refund_amount REAL NOT NULL,
            bank_iban TEXT,
            tracking_code TEXT,
            notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP
        );

INSERT INTO returns ("id", "return_number", "order_id", "customer_name", "customer_phone", "reason", "status", "refund_amount", "bank_iban", "tracking_code", "notes", "created_at", "resolved_at") VALUES (1, 'IAD-2026-0042', 1, 'Ayşe Yılmaz', '0532 111 22 33', 'Beden Uymadı (S yerine M talebi)', 'approved', 399.99, 'TR12 0006 1005 1234 5678 9012 34', 'YK-98471239', NULL, '2026-11-06 00:54:58', NULL);

-- Table: coupons
DROP TABLE IF EXISTS coupons;
CREATE TABLE coupons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL,
            discount_type TEXT DEFAULT 'percent',
            discount_value REAL NOT NULL,
            min_order_amount REAL DEFAULT 0.0,
            is_active INTEGER DEFAULT 1,
            usage_limit INTEGER DEFAULT 1000,
            usage_count INTEGER DEFAULT 0,
            expires_at TIMESTAMP
        );

INSERT INTO coupons ("id", "code", "discount_type", "discount_value", "min_order_amount", "is_active", "usage_limit", "usage_count", "expires_at") VALUES (1, 'FK10', 'percent', 10, 500, 1, 1000, 0, NULL);
INSERT INTO coupons ("id", "code", "discount_type", "discount_value", "min_order_amount", "is_active", "usage_limit", "usage_count", "expires_at") VALUES (2, 'HOSGELDIN20', 'percent', 20, 750, 1, 1000, 0, NULL);
INSERT INTO coupons ("id", "code", "discount_type", "discount_value", "min_order_amount", "is_active", "usage_limit", "usage_count", "expires_at") VALUES (3, 'KARGO100', 'fixed', 100, 1000, 1, 1000, 0, NULL);

-- Table: shop_settings
DROP TABLE IF EXISTS shop_settings;
CREATE TABLE shop_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('shop_access', 'Açık (Herkese Erişilebilir)', '2026-11-07 14:57:36');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('cart_enabled', 'Aktif', '2026-11-07 14:57:36');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('mobile_grid', 'Çift sütunlu dizilim', '2026-11-07 14:57:36');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('filter_enabled', 'Filtreleme seçeneği olmasın', '2026-11-06 00:54:58');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('out_of_stock_display', 'Dükkanımda gösterilmesin', '2026-11-06 00:54:58');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('last_item_badge', 'Ürünlerimin üzerinde gösterilsin', '2026-11-06 00:54:58');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('new_item_badge', 'Ürünlerimin üzerinde gösterilsin', '2026-11-06 00:54:58');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('shop_language', 'Türkçe (TR)', '2026-11-07 14:57:36');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('free_shipping_limit', '1500', '2026-11-07 07:26:52');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('order_confirmation_message', 'FK Butik Siparişiniz Alındı!', '2026-11-06 01:22:04');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('flat_rate', '49.90', '2026-11-07 07:26:52');
INSERT INTO shop_settings ("key", "value", "updated_at") VALUES ('carrier', 'Yurtiçi Kargo / MNG', '2026-11-07 07:26:52');

-- Table: tags
DROP TABLE IF EXISTS tags;
CREATE TABLE tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            sort_order INTEGER DEFAULT 1,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

INSERT INTO tags ("id", "name", "slug", "description", "sort_order", "is_active", "created_at") VALUES (1, 'Yeni Gelenler', 'yeni-gelenler', '2026 Sezonu En Yeni Kadın Giyim Ürünleri', 1, 1, '2026-11-06 01:23:22');
INSERT INTO tags ("id", "name", "slug", "description", "sort_order", "is_active", "created_at") VALUES (2, 'Öne Çıkanlar', 'one-cikanlar', 'En Çok Tercih Edilen Trend Modeller', 2, 1, '2026-11-06 01:23:22');
INSERT INTO tags ("id", "name", "slug", "description", "sort_order", "is_active", "created_at") VALUES (3, 'İndirimli Ürünler', 'indirimli-urunler', 'Sezon Fırsatları ve Avantajlı Fiyatlar', 3, 1, '2026-11-06 01:23:22');
INSERT INTO tags ("id", "name", "slug", "description", "sort_order", "is_active", "created_at") VALUES (4, 'Çok Satanlar', 'cok-satanlar', 'FK Butik En Çok Satan İtalyan Moda Parçaları', 4, 1, '2026-11-06 01:23:22');
INSERT INTO tags ("id", "name", "slug", "description", "sort_order", "is_active", "created_at") VALUES (5, 'Kışlık Ürünler', 'kislik-urunler', 'Sıcak Tutan Şık Triko ve Dış Giyim', 5, 1, '2026-11-06 01:23:22');
INSERT INTO tags ("id", "name", "slug", "description", "sort_order", "is_active", "created_at") VALUES (6, 'Özel Koleksiyonlar', 'ozel-koleksiyonlar', 'Exclusive Limited Edition Parçalar', 6, 1, '2026-11-06 01:23:22');

-- Table: product_tags
DROP TABLE IF EXISTS product_tags;
CREATE TABLE product_tags (
            product_id INTEGER NOT NULL,
            tag_id INTEGER NOT NULL,
            sort_order INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (product_id, tag_id),
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        );

INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (19, 1, 1, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (1, 1, 2, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (2, 1, 3, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (13, 1, 4, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (20, 1, 5, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (14, 1, 6, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (16, 1, 7, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (15, 1, 8, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (18, 1, 9, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (10, 1, 10, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (11, 1, 11, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (12, 1, 12, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (3, 1, 13, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (4, 1, 14, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (5, 1, 15, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (6, 1, 16, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (7, 1, 17, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (8, 1, 18, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (9, 1, 19, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (17, 1, 20, '2026-11-06 01:23:22');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (1, 2, 1, '2026-11-06 13:28:36');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (2, 2, 2, '2026-11-06 13:28:36');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (3, 2, 3, '2026-11-06 13:28:36');
INSERT INTO product_tags ("product_id", "tag_id", "sort_order", "created_at") VALUES (4, 2, 4, '2026-11-06 13:28:36');

-- Table: payments
DROP TABLE IF EXISTS payments;
CREATE TABLE payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id TEXT UNIQUE NOT NULL,
            order_number TEXT NOT NULL,
            customer_name TEXT NOT NULL,
            payment_method TEXT NOT NULL,
            gross_amount REAL NOT NULL,
            commission_rate REAL DEFAULT 2.99,
            commission_amount REAL NOT NULL,
            net_amount REAL NOT NULL,
            payout_status TEXT DEFAULT 'Hesaba Aktarıldı',
            payout_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

INSERT INTO payments ("id", "transaction_id", "order_number", "customer_name", "payment_method", "gross_amount", "commission_rate", "commission_amount", "net_amount", "payout_status", "payout_date", "created_at") VALUES (1, 'TX-2026-9011', 'FK-2026-8901', 'Ayşe Yılmaz', 'Kredi Kartı (Shopier)', 899.98, 2.99, 26.91, 873.07, 'Hesaba Aktarıldı', '2026-11-04', '2026-11-06 20:39:47');
INSERT INTO payments ("id", "transaction_id", "order_number", "customer_name", "payment_method", "gross_amount", "commission_rate", "commission_amount", "net_amount", "payout_status", "payout_date", "created_at") VALUES (2, 'TX-2026-9012', 'FK-2026-8902', 'Zeynep Kaya', 'Kredi Kartı (Shopier)', 399.99, 2.99, 11.96, 388.03, 'Hesaba Aktarıldı', '2026-11-05', '2026-11-06 20:39:47');
INSERT INTO payments ("id", "transaction_id", "order_number", "customer_name", "payment_method", "gross_amount", "commission_rate", "commission_amount", "net_amount", "payout_status", "payout_date", "created_at") VALUES (3, 'TX-2026-9013', 'FK-2026-8903', 'Elif Demir', 'Kredi Kartı (Shopier)', 1199.97, 2.99, 35.88, 1164.09, 'Hesaba Aktarıldı', '2026-11-05', '2026-11-06 20:39:47');
INSERT INTO payments ("id", "transaction_id", "order_number", "customer_name", "payment_method", "gross_amount", "commission_rate", "commission_amount", "net_amount", "payout_status", "payout_date", "created_at") VALUES (4, 'TX-2026-9014', 'FK-2026-8904', 'Büşra Çelik', 'Kredi Kartı (Shopier)', 499.99, 2.99, 14.95, 485.04, 'Beklemede (Cuma Günü Payout)', '2026-11-07', '2026-11-06 20:39:47');
INSERT INTO payments ("id", "transaction_id", "order_number", "customer_name", "payment_method", "gross_amount", "commission_rate", "commission_amount", "net_amount", "payout_status", "payout_date", "created_at") VALUES (5, 'TX-2026-9015', 'FK-2026-8905', 'Merve Aydın', 'Havale / EFT', 899.98, 0, 0, 899.98, 'Hesaba Aktarıldı', '2026-11-06', '2026-11-06 20:39:47');

-- Table: variations
DROP TABLE IF EXISTS variations;
CREATE TABLE variations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_name TEXT NOT NULL,
            value TEXT NOT NULL,
            color_hex TEXT,
            sort_order INTEGER DEFAULT 1,
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (1, 'Beden', 'XS', NULL, 1, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (2, 'Beden', 'S', NULL, 2, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (3, 'Beden', 'M', NULL, 3, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (4, 'Beden', 'L', NULL, 4, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (5, 'Beden', 'XL', NULL, 5, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (6, 'Beden', 'XXL', NULL, 6, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (7, 'Beden', 'STANDART', NULL, 7, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (8, 'Renk', 'Siyah', '#111827', 1, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (9, 'Renk', 'Beyaz', '#ffffff', 2, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (10, 'Renk', 'Ekru / Bej', '#f5f5dc', 3, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (11, 'Renk', 'Haki Yeşili', '#556b2f', 4, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (12, 'Renk', 'Taş Rengi', '#d2b48c', 5, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (13, 'Renk', 'Taba / Kahve', '#8b4513', 6, 1, '2026-11-06 20:39:47');
INSERT INTO variations ("id", "group_name", "value", "color_hex", "sort_order", "is_active", "created_at") VALUES (14, 'Renk', 'Antrasit', '#374151', 7, 1, '2026-11-06 20:39:47');

-- Table: integrations
DROP TABLE IF EXISTS integrations;
CREATE TABLE integrations (
            key TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            config_json TEXT NOT NULL,
            is_enabled INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

INSERT INTO integrations ("key", "name", "category", "description", "config_json", "is_enabled", "updated_at") VALUES ('shopier_api', 'Shopier Ödeme Altyapısı', 'payment', 'Kredi kartı ve banka kartı ile güvenli 3D Secure tahsilat.', '{"api_key": "sp_live_****************", "api_secret": "****************", "test_mode": 0}', 1, '2026-11-06 20:39:47');
INSERT INTO integrations ("key", "name", "category", "description", "config_json", "is_enabled", "updated_at") VALUES ('iyzico_api', 'İyzico Checkout Form', 'payment', 'Alternatif iyzico sanal POS ve tek tıkla ödeme altyapısı.', '{"api_key": "", "secret_key": "", "test_mode": 1}', 0, '2026-11-06 20:39:47');
INSERT INTO integrations ("key", "name", "category", "description", "config_json", "is_enabled", "updated_at") VALUES ('yurtici_kargo', 'Yurtiçi Kargo API', 'shipping', 'Otomatik barkod oluşturma ve SMS kargo takip entegrasyonu.', '{"customer_no": "984210", "username": "fkbutik", "password": "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}', 1, '2026-11-06 20:39:47');
INSERT INTO integrations ("key", "name", "category", "description", "config_json", "is_enabled", "updated_at") VALUES ('aras_kargo', 'Aras Kargo Entegrasyonu', 'shipping', 'Kapıda ödeme ve kargo entegrasyon servisi.', '{"account_id": "", "api_key": ""}', 0, '2026-11-06 20:39:47');
INSERT INTO integrations ("key", "name", "category", "description", "config_json", "is_enabled", "updated_at") VALUES ('ga4_merchant', 'Google Merchant & GA4', 'analytics', 'Google Alışveriş reklamları, katalog akışı ve e-ticaret dönüşüm takibi.', '{"measurement_id": "G-FK908421", "merchant_id": "5829104"}', 1, '2026-11-06 20:39:47');
INSERT INTO integrations ("key", "name", "category", "description", "config_json", "is_enabled", "updated_at") VALUES ('meta_pixel', 'Meta Pixel & Instagram Shop', 'analytics', 'Instagram mağazası ürün senkronizasyonu ve Facebook Pixel takibi.', '{"pixel_id": "184920492819", "catalog_id": "492019481"}', 1, '2026-11-06 20:39:47');

-- Table: store_profile
DROP TABLE IF EXISTS store_profile;
CREATE TABLE store_profile (
            id INTEGER PRIMARY KEY,
            store_name TEXT DEFAULT 'FK BUTİK',
            legal_title TEXT DEFAULT 'FK Butik Tekstil ve Moda San. Tic. Ltd. Şti.',
            tax_office TEXT DEFAULT 'Kadıköy V.D.',
            tax_number TEXT DEFAULT '3849201948',
            support_email TEXT DEFAULT 'destek@fkbutik.com',
            support_phone TEXT DEFAULT '+90 (216) 550 44 33',
            store_address TEXT DEFAULT 'Bağdat Caddesi No: 242/A Erenköy, Kadıköy, İstanbul',
            instagram_handle TEXT DEFAULT '@fkbutik',
            maintenance_mode INTEGER DEFAULT 0,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

INSERT INTO store_profile ("id", "store_name", "legal_title", "tax_office", "tax_number", "support_email", "support_phone", "store_address", "instagram_handle", "maintenance_mode", "updated_at") VALUES (1, 'FK Butik Tekstil Ltd. Şti.', 'FK Butik Tekstil Ltd. Şti.', 'Kadıköy V.D.', '3849201948', 'demo@fkbutik.com', '+90 532 780 51 00', 'Bağdat Caddesi No: 242/A Erenköy, Kadıköy, İstanbul', '@fkbutik', 0, '2026-11-07 14:57:36');

-- Table: categories
DROP TABLE IF EXISTS categories;
CREATE TABLE "categories" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      parent_id INTEGER NULL REFERENCES "categories"(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (1, NULL, 'YENİ ÜRÜNLER', 'yeni-urunler', 1, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (2, NULL, 'ELBİSE', 'elbise', 2, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (3, NULL, 'ÜST GİYİM', 'ust-giyim', 3, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (4, NULL, 'ALT GİYİM', 'alt-giyim', 4, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (5, NULL, 'AKSESUAR', 'aksesuar', 5, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (6, NULL, 'ÇOK SATANLAR', 'cok-satanlar', 6, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (7, 2, 'Günlük Elbise', 'gunluk-elbise', 1, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (8, 2, 'Triko Elbise', 'triko-elbise', 2, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (9, 2, 'Şık & Abiye Elbise', 'sik-abiye-elbise', 3, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (10, 2, 'İkili Takımlar', 'ikili-takimlar', 4, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (11, 3, 'Takım', 'takim', 1, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (12, 3, 'Bluz', 'bluz', 2, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (13, 3, 'Ceket / Mont', 'ceket-mont', 3, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (14, 3, 'Gömlek', 'gomlek', 4, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (15, 3, 'Triko', 'triko', 5, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (16, 3, 'Hırka', 'hirka', 6, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (17, 3, 'Yelek', 'yelek', 7, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (18, 3, 'Atlet', 'atlet', 9, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (19, 4, 'Pantolon', 'pantolon', 1, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (20, 4, 'Etek', 'etek', 2, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (21, 4, 'Şort', 'sort', 3, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (22, 4, 'Eşofman Altı', 'esofman-alti', 4, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (23, 5, 'Vip Tasarım Premium Kolye', 'vip-tasarim-premium-kolye', 1, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (24, 5, 'Kolye', 'kolye', 2, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (25, 5, 'Çanta', 'canta', 3, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (26, 5, 'Bileklik', 'bileklik', 4, 1, '2026-11-07 01:06:10');
INSERT INTO categories ("id", "parent_id", "name", "slug", "sort_order", "is_active", "created_at") VALUES (27, 5, 'Şal / Fular', 'sal-fular', 5, 1, '2026-11-07 01:06:10');

PRAGMA foreign_keys = ON;
