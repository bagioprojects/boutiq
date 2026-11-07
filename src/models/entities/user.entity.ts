export interface UserEntity {
  id: number;
  email: string;
  password_hash: string | null;
  full_name: string;
  phone: string | null;
  role: string;
  auth_provider: string;
  google_id: string | null;
  is_verified: number;
  created_at: string;
  last_login_at: string;
}

export type SafeUser = Omit<UserEntity, 'password_hash'>;

