import { db } from '@/lib/db';
import { UserEntity, SafeUser } from '../entities/user.entity';

export class UserRepository {
  public static toSafeUser(user: UserEntity): SafeUser {
    const { password_hash, ...safe } = user;
    return safe;
  }

  public static findById(id: number): UserEntity | null {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return null;
    return { ...row };
  }

  public static findByEmail(email: string): UserEntity | null {
    const normalized = email.trim().toLowerCase();
    const row = db.prepare('SELECT * FROM users WHERE LOWER(TRIM(email)) = ?').get(normalized) as any;
    if (!row) return null;
    return { ...row };
  }

  public static findByPhone(phone: string): UserEntity | null {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return null;
    const last10 = cleanPhone.length >= 10 ? cleanPhone.slice(-10) : cleanPhone;
    
    // SQLite can search by exact phone or normalized digits
    const rows = db.prepare('SELECT * FROM users WHERE phone IS NOT NULL').all() as any[];
    for (const r of rows) {
      if (r.phone) {
        const rowDigits = r.phone.replace(/[^0-9]/g, '');
        const rowLast10 = rowDigits.length >= 10 ? rowDigits.slice(-10) : rowDigits;
        if (rowDigits === cleanPhone || (last10.length === 10 && rowLast10 === last10)) {
          return { ...r };
        }
      }
    }
    return null;
  }

  public static findByIdentifier(identifier: string): UserEntity | null {
    const trimmed = identifier.trim();
    if (trimmed.includes('@')) {
      return this.findByEmail(trimmed);
    }
    // Check if phone or email
    const userByEmail = this.findByEmail(trimmed);
    if (userByEmail) return userByEmail;
    return this.findByPhone(trimmed);
  }

  public static create(data: {
    email: string;
    password_hash?: string | null;
    full_name: string;
    phone?: string | null;
    role?: string;
    auth_provider?: string;
    google_id?: string | null;
  }): UserEntity {
    const email = data.email.trim().toLowerCase();
    const full_name = data.full_name.trim();
    const phone = data.phone?.trim() || null;
    const role = data.role || 'customer';
    const auth_provider = data.auth_provider || 'local';
    const google_id = data.google_id || null;
    const password_hash = data.password_hash || null;

    const stmt = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, phone, role, auth_provider, google_id, is_verified, created_at, last_login_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    const result = stmt.run(email, password_hash, full_name, phone, role, auth_provider, google_id);
    const newId = Number(result.lastInsertRowid);

    return this.findById(newId)!;
  }

  public static updateLastLogin(id: number): void {
    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }

  public static updatePassword(id: number, passwordHash: string): void {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
  }
}

