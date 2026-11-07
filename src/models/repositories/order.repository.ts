import { db } from '@/lib/db';
import { OrderEntity, ReturnEntity } from '../entities/order.entity';

export interface CreateOrderInput {
  user_id?: number | null;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  total_amount: number;
  payment_method?: string;
  cargo_company?: string;
  status?: string;
  items: Array<{
    product_id: number;
    product_name: string;
    sku?: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image_url?: string;
  }>;
}

export class OrderRepository {
  public static getAll(statusFilter?: string): OrderEntity[] {
    let query = 'SELECT * FROM orders';
    const params: any[] = [];
    if (statusFilter) {
      query += ' WHERE status = ?';
      params.push(statusFilter);
    }
    query += ' ORDER BY id DESC';
    const rows = db.prepare(query).all(...params) as any[];
    return rows.map((r) => ({
      id: Number(r.id),
      order_number: String(r.order_number),
      user_id: r.user_id !== null && r.user_id !== undefined ? Number(r.user_id) : null,
      customer_name: String(r.customer_name),
      customer_phone: String(r.customer_phone),
      customer_city: String(r.customer_city),
      total_amount: Number(r.total_amount),
      status: String(r.status),
      payment_method: String(r.payment_method),
      cargo_company: r.cargo_company ? String(r.cargo_company) : 'Yurtiçi Kargo',
      items_json: String(r.items_json || '[]'),
      created_at: String(r.created_at || ''),
      tracking_code: r.tracking_code ? String(r.tracking_code) : undefined,
    }));
  }

  public static getById(id: number): OrderEntity | null {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: Number(row.id),
      order_number: String(row.order_number),
      customer_name: String(row.customer_name),
      customer_phone: String(row.customer_phone),
      customer_city: String(row.customer_city),
      total_amount: Number(row.total_amount),
      status: String(row.status),
      payment_method: String(row.payment_method),
      cargo_company: row.cargo_company ? String(row.cargo_company) : 'Yurtiçi Kargo',
      items_json: String(row.items_json || '[]'),
      created_at: String(row.created_at || ''),
      tracking_code: row.tracking_code ? String(row.tracking_code) : undefined,
    };
  }

  public static getRecent(limit: number = 5): OrderEntity[] {
    const rows = db
      .prepare('SELECT * FROM orders ORDER BY id DESC LIMIT ?')
      .all(limit) as any[];
    return rows.map((r) => ({
      id: Number(r.id),
      order_number: String(r.order_number),
      user_id: r.user_id !== null && r.user_id !== undefined ? Number(r.user_id) : null,
      customer_name: String(r.customer_name),
      customer_phone: String(r.customer_phone),
      customer_city: String(r.customer_city),
      total_amount: Number(r.total_amount),
      status: String(r.status),
      payment_method: String(r.payment_method),
      cargo_company: r.cargo_company ? String(r.cargo_company) : 'Yurtiçi Kargo',
      items_json: String(r.items_json || '[]'),
      created_at: String(r.created_at || ''),
      tracking_code: r.tracking_code ? String(r.tracking_code) : undefined,
    }));
  }

  public static getByOrderNumber(orderNumber: string): OrderEntity | null {
    const row = db.prepare('SELECT * FROM orders WHERE order_number = ?').get(orderNumber) as any;
    if (!row) return null;
    return {
      id: Number(row.id),
      order_number: String(row.order_number),
      customer_name: String(row.customer_name),
      customer_phone: String(row.customer_phone),
      customer_city: String(row.customer_city),
      total_amount: Number(row.total_amount),
      status: String(row.status),
      payment_method: String(row.payment_method),
      cargo_company: row.cargo_company ? String(row.cargo_company) : 'Yurtiçi Kargo',
      items_json: String(row.items_json || '[]'),
      created_at: String(row.created_at || ''),
      tracking_code: row.tracking_code ? String(row.tracking_code) : undefined,
    };
  }

  public static getRevenueTotal(): number {
    const row = db.prepare('SELECT SUM(total_amount) as total FROM orders').get() as { total: number | null };
    return row?.total || 0;
  }

  public static getCount(): number {
    const row = db.prepare('SELECT COUNT(*) as count FROM orders').get() as { count: number };
    return row?.count || 0;
  }

  public static getAllReturns(): ReturnEntity[] {
    return db.prepare('SELECT * FROM returns ORDER BY id DESC').all() as ReturnEntity[];
  }

  public static getPendingReturnsCount(): number {
    const row = db.prepare("SELECT COUNT(*) as count FROM returns WHERE status != 'Tamamlandı'").get() as { count: number };
    return row?.count || 0;
  }

  public static createOrder(input: CreateOrderInput): { id: number; order_number: string } {
    // Generate order number FK-2026-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `FK-2026-${randomSuffix}`;
    const itemsJson = JSON.stringify(input.items);
    const status = input.status || 'Hazırlanıyor';
    const paymentMethod = input.payment_method || 'Kredi Kartı';
    const cargoCompany = input.cargo_company || 'Yurtiçi Kargo';

    // Insert order
    const insertStmt = db.prepare(`
      INSERT INTO orders (order_number, user_id, customer_name, customer_phone, customer_city, total_amount, status, payment_method, cargo_company, items_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(
      orderNumber,
      input.user_id !== undefined ? input.user_id : null,
      input.customer_name,
      input.customer_phone,
      input.customer_city,
      input.total_amount,
      status,
      paymentMethod,
      cargoCompany,
      itemsJson
    );

    // Fetch generated ID
    const inserted = db.prepare('SELECT id FROM orders WHERE order_number = ?').get(orderNumber) as { id: number };
    const orderId = inserted.id;

    // Insert items into order_items
    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_name, sku, price, quantity, size, color, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Stock decrement statement
    const stockStmt = db.prepare(`
      UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?
    `);

    for (const item of input.items) {
      const prodName = (item.product_name || (item as any).name || 'Ürün').trim();
      const skuVal = (item.sku || '').trim();
      const sizeVal = (item.size || '').trim();
      const colorVal = (item.color || '').trim();
      const imgVal = (item.image_url || (item as any).imageUrl || '').trim();
      const itemPrice = Number(item.price) || 0;
      const itemQty = Number(item.quantity) || 1;

      itemStmt.run(
        orderId,
        Number(item.product_id) || 1,
        prodName,
        skuVal,
        itemPrice,
        itemQty,
        sizeVal,
        colorVal,
        imgVal
      );

      // Decrement stock
      try {
        stockStmt.run(itemQty, Number(item.product_id) || 1);
      } catch (e) {
        // Safe fallback
      }
    }

    return { id: orderId, order_number: orderNumber };
  }

  public static updateStatus(id: number, status: string, trackingCode?: string): boolean {
    if (trackingCode !== undefined && trackingCode !== null) {
      db.prepare(`
        UPDATE orders SET status = ?, tracking_code = ? WHERE id = ?
      `).run(status, trackingCode, id);
    } else {
      db.prepare(`
        UPDATE orders SET status = ? WHERE id = ?
      `).run(status, id);
    }
    return true;
  }
}
