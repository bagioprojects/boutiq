'use client';

export interface FavoriteItem {
  id: string;
  name: string;
  priceFormatted?: string;
  price?: number;
  imageUrl?: string;
  category?: string;
  slug?: string;
}

const STORAGE_KEY = 'fk_boutique_favorites';
const EVENT_NAME = 'fk_favorites_sync';

export class FavoriteStore {
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public static getItems(): FavoriteItem[] {
    if (!this.isClient()) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private static saveItems(items: FavoriteItem[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
    } catch (e) {
      console.error('Failed to save favorites to localStorage', e);
    }
  }

  public static isFavorite(id: string): boolean {
    const items = this.getItems();
    return items.some((i) => String(i.id) === String(id));
  }

  public static toggleFavorite(item: FavoriteItem): boolean {
    const items = this.getItems();
    const existingIndex = items.findIndex((i) => String(i.id) === String(item.id));

    if (existingIndex > -1) {
      // Çıkar
      items.splice(existingIndex, 1);
      this.saveItems(items);
      return false; // artık favori değil
    } else {
      // Ekle
      items.unshift({
        id: String(item.id),
        name: item.name,
        priceFormatted: item.priceFormatted || (item.price ? `${item.price.toFixed(2)} ₺` : '319,99 TL'),
        price: item.price,
        imageUrl: item.imageUrl || '/images/default.jpg',
        category: item.category || 'Koleksiyon',
        slug: item.slug || `/urun/${item.id}`,
      });
      this.saveItems(items);
      return true; // artık favori
    }
  }

  public static removeFavorite(id: string): void {
    const items = this.getItems();
    const filtered = items.filter((i) => String(i.id) !== String(id));
    this.saveItems(filtered);
  }

  public static getCount(): number {
    return this.getItems().length;
  }

  public static subscribe(callback: (items: FavoriteItem[]) => void): () => void {
    if (!this.isClient()) return () => {};

    const handler = () => {
      callback(this.getItems());
    };

    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }
}

