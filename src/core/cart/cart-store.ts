'use client';

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  priceFormatted: string;
  size: string;
  color?: string;
  quantity: number;
  imageUrl?: string;
}

const STORAGE_KEY = 'fk_boutique_cart';
const EVENT_NAME = 'fk_cart_sync';

export class CartStore {
  private static isClient(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  public static getItems(): CartItem[] {
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

  private static saveItems(items: CartItem[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: items }));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }

  public static addItem(item: {
    productId: number;
    name: string;
    slug?: string;
    category?: string;
    price: number;
    size?: string;
    color?: string;
    quantity?: number;
    imageUrl?: string;
  }): void {
    const items = this.getItems();
    const size = item.size || 'Standart';
    const slug = item.slug || 'urun';
    const category = item.category || 'Koleksiyon';
    const quantity = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const cartItemId = `${item.productId}-${size}`;

    const existingIndex = items.findIndex((i) => i.id === cartItemId);
    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        id: cartItemId,
        productId: item.productId,
        name: item.name,
        slug,
        category,
        price: item.price,
        priceFormatted: `${item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺`,
        size,
        color: item.color || '',
        quantity,
        imageUrl: item.imageUrl || '/images/default-product.jpg',
      });
    }

    this.saveItems(items);
  }

  public static updateQuantity(id: string, delta: number): void {
    const items = this.getItems();
    const updated = items
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    this.saveItems(updated);
  }

  public static removeItem(id: string): void {
    const items = this.getItems();
    const filtered = items.filter((item) => item.id !== id);
    this.saveItems(filtered);
  }

  public static clearCart(): void {
    this.saveItems([]);
  }

  public static getCount(): number {
    const items = this.getItems();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }

  public static getSubtotal(): number {
    const items = this.getItems();
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  public static subscribe(callback: (items: CartItem[]) => void): () => void {
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

