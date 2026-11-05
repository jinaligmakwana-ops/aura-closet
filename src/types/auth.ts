export interface User {
  id: string;
  username: string; // ID used to log in
  name: string;
  avatarColor?: string;
  createdAt: string;
}

export interface StoredUserAccount extends User {
  passwordHash: string; // PBKDF2-SHA256 derived hash
  salt: string;         // Cryptographically secure random 128-bit salt
  failedAttempts?: number;
  lockoutUntil?: number;
  lastLogin?: string;
}
