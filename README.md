# FK BUTİK - E-Ticaret Platformu (v2.0.0)

Modern, yüksek performanslı, mobil öncelikli ve SEO optimize edilmiş lüks e-ticaret web platformu.

---

## 🏗️ Mimari & Teknolojiler

- **Framework:** Next.js 14 (App Router) & React 18
- **Programlama Dili:** TypeScript
- **Veritabanı:** SQLite (Node.js 22+ yerleşik `node:sqlite` DatabaseSync motoru, WAL modu ile yüksek performans ve eşzamanlılık)
- **Kimlik Doğrulama:** JWT (JSON Web Token) tabanlı güvenli oturum yönetimi & HTTP-only çerezler
- **Stil & Arayüz:** Modern CSS3, responsive fluid layout, mobil tam ekran kategori gezintisi ve dokunmatik optimize kontroller
- **Süreç Yöneticisi:** PM2 & Docker desteği

---

## 📋 Sistem Gereksinimleri

- **Node.js:** `>= 22.5.0 LTS` (Yerleşik `node:sqlite` desteği için zorunludur)
- **npm:** `>= 10.0.0`
- **İşletim Sistemi:** Linux (Ubuntu / Debian / CentOS vb.), Windows veya macOS

---

## ⚡ Hızlı Başlangıç (Geliştirme Ortamı)

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Geliştirme sunucusunu başlatın
npm run dev

# Tarayıcıda açın: http://localhost:3000
```

---

## 🚀 Üretim (Production) Derleme & Çalıştırma

```bash
# 1. Next.js üretim derlemesini alın
npm run build

# 2. Üretim sunucusunu başlatın (Varsayılan port 3000 veya process.env.PORT)
npm run start
```

---

## 🗄️ Veritabanı Yönetimi

Veritabanı dosyası `public/data/fkbutik.db` konumunda yer alır ve tüm kategoriler, ürünler, siparişler ve kullanıcı verilerini barındırır.

```bash
# Veritabanını SQL dökümü olarak yedekleyin (database/backup_initial_data.sql)
npm run db:backup

# SQL dökümünden veritabanını geri yükleyin
npm run db:restore
```

---

## 📦 GitHub'a Yükleme Adımları

Projeyi ilk kez GitHub'a yüklemek için proje dizininde şu komutları uygulayınız:

```bash
# 1. Git deposunu başlatın
git init

# 2. Varsayılan dalı main yapın
git branch -M main

# 3. Tüm dosyaları sahneye ekleyin (.gitignore gereksiz dosyaları otomatik dışlar)
git add .

# 4. İlk commit'inizi oluşturun
git commit -m "feat: FK Butik production-ready e-commerce platform"

# 5. GitHub deponuzun adresini bağlayın
git remote add origin https://github.com/KULLANICI_ADINIZ/fkbutik.git

# 6. Projeyi GitHub'a gönderin
git push -u origin main
```

---

## 🖥️ Sunucuya (VPS / Ubuntu) Dağıtım Kılavuzu

### 1. Sunucuya Node.js 22 LTS Kurulumu
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v # v22.x.x veya v24.x.x olduğunu doğrulayın
```

### 2. Projeyi Sunucuya Çekin
```bash
cd /var/www
git clone https://github.com/KULLANICI_ADINIZ/fkbutik.git
cd fkbutik
npm install
npm run build
```

### 3. PM2 ile 7/24 Kesintisiz Arka Planda Çalıştırma
```bash
sudo npm install -g pm2

# ecosystem.config.js ile uygulamayı başlatın
pm2 start ecosystem.config.js

# Sunucu yeniden başladığında otomatik çalışması için kaydedin
pm2 save
pm2 startup
```

### 4. Nginx Reverse Proxy & SSL (Certbot)
Projeyle birlikte gelen `nginx.conf.example` dosyasını sunucunuzun Nginx yapılandırmasına ekleyin:
```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/fkbutik.conf
sudo ln -s /etc/nginx/sites-available/fkbutik.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Ücretsiz Let's Encrypt SSL sertifikası alın
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d fkbutik.com -d www.fkbutik.com
```

---

## 🐳 Docker ile Dağıtım (Alternatif)

```bash
# Tek komutla imajı derleyip konteyneri başlatın
docker compose up -d

# Logları takip etmek için:
docker compose logs -f
```

---

## 🔐 Güvenlik Notları
- Sunucuda üretim ortamında çalıştırırken `.env.example` dosyasını `.env` olarak kopyalayabilir ve `JWT_SECRET` değerini güvenli, rastgele bir karakter dizisiyle güncelleyebilirsiniz.
