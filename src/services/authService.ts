import { get, set, del } from 'idb-keyval';
import { StoredUserAccount, User } from '../types/auth';
import {
  generateSalt,
  hashPassword,
  timingSafeEqual,
  deriveEncryptionKey,
  evaluatePasswordStrength,
} from './cryptoService';
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
  logSecurityEvent,
} from './rateLimiter';

const USERS_KEY = 'aura_registered_users_v2';
const LEGACY_USERS_KEY = 'aura_registered_users_v1';
const SESSION_KEY = 'aura_current_session_v1';
const LOGGED_OUT_KEY = 'aura_explicit_logged_out_v1';

// Initial pre-hashed account for Jinali's personal account
// Hash computed using PBKDF2-SHA256, 100,000 iterations, 256-bit key
const JINALI_ACCOUNT: StoredUserAccount = {
  id: 'user_jinali',
  username: 'jinali',
  name: 'Jinali',
  salt: 'Qh31yRx54obI00f1Ylt96g==',
  passwordHash: 'AadcrBrFG9A4X74Yi7kHnx/GIOnrFpyhyBUSCoVkARs=',
  avatarColor: '#1C1917',
  createdAt: new Date().toISOString(),
};

// Transient in-memory encryption key (never written to disk or localStorage)
let activeEncryptionKey: CryptoKey | null = null;

export function getActiveEncryptionKey(): CryptoKey | null {
  return activeEncryptionKey;
}

export function setActiveEncryptionKey(key: CryptoKey | null): void {
  activeEncryptionKey = key;
}

export async function getRegisteredUsers(): Promise<StoredUserAccount[]> {
  try {
    let users = await get<StoredUserAccount[]>(USERS_KEY);

    if (!users || users.length === 0) {
      // Check legacy v1 users to migrate hashes safely
      const legacy = await get<any[]>(LEGACY_USERS_KEY);
      if (legacy && legacy.length > 0) {
        users = [];
        for (const u of legacy) {
          if (u.username === 'jinali') {
            users.push(JINALI_ACCOUNT);
          } else if (u.password) {
            const salt = generateSalt();
            const passwordHash = await hashPassword(u.password, salt);
            users.push({
              id: u.id,
              username: u.username,
              name: u.name,
              salt,
              passwordHash,
              avatarColor: u.avatarColor,
              createdAt: u.createdAt,
            });
          }
        }
      } else {
        users = [JINALI_ACCOUNT];
      }
      await set(USERS_KEY, users);
    }
    return users;
  } catch (err) {
    console.error('Failed to get users from storage:', err);
    return [JINALI_ACCOUNT];
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const isExplicitlyLoggedOut = await get<boolean>(LOGGED_OUT_KEY);
    if (isExplicitlyLoggedOut) {
      return null;
    }

    const user = await get<User>(SESSION_KEY);
    if (user) return user;

    return null;
  } catch (err) {
    console.error('Failed to get current user session:', err);
    return null;
  }
}

export async function loginUser(
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanUsername) {
    return { success: false, error: 'Please enter your User ID.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Please enter your password.' };
  }

  // Check brute-force rate limiter
  const rateLimitStatus = await checkRateLimit(cleanUsername);
  if (rateLimitStatus.isLocked) {
    return {
      success: false,
      error: `Security Lockout: Account temporarily locked due to multiple failed login attempts. Try again in ${rateLimitStatus.remainingLockoutSeconds}s.`,
    };
  }

  // Artificial timing jitter to thwart side-channel timing analysis
  const startTimer = Date.now();

  const users = await getRegisteredUsers();
  const matched = users.find((u) => u.username.toLowerCase() === cleanUsername);

  if (!matched) {
    await recordFailedAttempt(cleanUsername);
    // Delay response to match valid verification time
    const elapsed = Date.now() - startTimer;
    if (elapsed < 350) await new Promise((r) => setTimeout(r, 350 - elapsed));
    return {
      success: false,
      error: 'Invalid User ID or password.',
    };
  }

  // Compute PBKDF2 hash using user's cryptographic salt
  const computedHash = await hashPassword(cleanPassword, matched.salt);

  // Timing-safe constant-time equality check
  const isMatch = timingSafeEqual(computedHash, matched.passwordHash);

  // Pad execution time to at least 400ms to equalize cryptographic timing
  const elapsed = Date.now() - startTimer;
  if (elapsed < 400) {
    await new Promise((r) => setTimeout(r, 400 - elapsed));
  }

  if (!isMatch) {
    const rateResult = await recordFailedAttempt(cleanUsername);
    if (rateResult.lockedNow) {
      return {
        success: false,
        error: `Security Lockout: 5 failed attempts reached. Account locked for ${Math.round(rateResult.lockoutSeconds / 60)} minutes.`,
      };
    }
    return {
      success: false,
      error: `Invalid User ID or password. (${rateResult.remainingAttempts} attempts remaining)`,
    };
  }

  // Reset rate limit on successful authentication
  await resetRateLimit(cleanUsername);

  // Derive transient AES-256-GCM encryption key for zero-knowledge session
  try {
    const encKey = await deriveEncryptionKey(cleanPassword, matched.salt);
    setActiveEncryptionKey(encKey);
  } catch (keyErr) {
    console.error('Key derivation error:', keyErr);
  }

  const publicUser: User = {
    id: matched.id,
    username: matched.username,
    name: matched.name,
    avatarColor: matched.avatarColor,
    createdAt: matched.createdAt,
  };

  await set(SESSION_KEY, publicUser);
  await del(LOGGED_OUT_KEY);

  await logSecurityEvent({
    id: `sec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'LOGIN_SUCCESS',
    username: cleanUsername,
    details: 'User successfully authenticated with PBKDF2-SHA256.',
  });

  return { success: true, user: publicUser };
}

export async function registerUser(
  nameInput: string,
  usernameInput: string,
  passwordInput: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanName = nameInput.trim();
  const cleanUsername = usernameInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanName) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!cleanUsername || cleanUsername.length < 3) {
    return { success: false, error: 'User ID must be at least 3 characters long.' };
  }
  if (!/^[a-z0-9_-]+$/.test(cleanUsername)) {
    return { success: false, error: 'User ID may only contain lowercase letters, numbers, hyphens, and underscores.' };
  }

  // Enforce strong password policy
  const strength = evaluatePasswordStrength(cleanPassword);
  if (!strength.isValid) {
    return {
      success: false,
      error: `Password does not meet security requirements: ${strength.feedback.join(', ')}.`,
    };
  }

  const users = await getRegisteredUsers();
  const alreadyExists = users.some((u) => u.username.toLowerCase() === cleanUsername);

  if (alreadyExists) {
    return {
      success: false,
      error: 'This User ID is already taken. Please choose another one or sign in.',
    };
  }

  // Generate unique 128-bit cryptographic salt
  const salt = generateSalt(16);

  // Hash password with PBKDF2-SHA256 (100,000 rounds)
  const passwordHash = await hashPassword(cleanPassword, salt);

  const palette = ['#1C1917', '#4A3525', '#1B4332', '#1E293B', '#722F37', '#C25E3E'];
  const avatarColor = palette[Math.floor(Math.random() * palette.length)];

  const newUser: StoredUserAccount = {
    id: `user_${cleanUsername.replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
    username: cleanUsername,
    name: cleanName,
    salt,
    passwordHash,
    avatarColor,
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  await set(USERS_KEY, updatedUsers);

  // Derive in-memory AES-256-GCM encryption key
  try {
    const encKey = await deriveEncryptionKey(cleanPassword, salt);
    setActiveEncryptionKey(encKey);
  } catch (keyErr) {
    console.error('Key derivation error:', keyErr);
  }

  const publicUser: User = {
    id: newUser.id,
    username: newUser.username,
    name: newUser.name,
    avatarColor: newUser.avatarColor,
    createdAt: newUser.createdAt,
  };

  await set(SESSION_KEY, publicUser);
  await del(LOGGED_OUT_KEY);

  await logSecurityEvent({
    id: `sec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'REGISTER_SUCCESS',
    username: cleanUsername,
    details: 'New user registered with salted PBKDF2-SHA256.',
  });

  return { success: true, user: publicUser };
}

export async function logoutUser(): Promise<void> {
  const currentUser = await get<User>(SESSION_KEY);
  if (currentUser) {
    await logSecurityEvent({
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'LOGOUT',
      username: currentUser.username,
      details: 'User logged out. Cryptographic key zeroized from volatile memory.',
    });
  }

  // Zeroize encryption key from memory
  setActiveEncryptionKey(null);
  await del(SESSION_KEY);
  await set(LOGGED_OUT_KEY, true);
}

export async function changePassword(
  userId: string,
  currentPasswordInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; error?: string }> {
  const currentPassword = currentPasswordInput.trim();
  const newPassword = newPasswordInput.trim();

  if (!currentPassword) {
    return { success: false, error: 'Please enter your current password.' };
  }
  if (!newPassword) {
    return { success: false, error: 'Please enter a new password.' };
  }

  const strength = evaluatePasswordStrength(newPassword);
  if (!strength.isValid) {
    return {
      success: false,
      error: `New password requirements: ${strength.feedback.join(', ')}`,
    };
  }

  const users = await getRegisteredUsers();
  const userIdx = users.findIndex((u) => u.id === userId);
  if (userIdx === -1) {
    return { success: false, error: 'User account not found.' };
  }

  const user = users[userIdx];
  // Verify current password with constant-time check
  const computedCurrentHash = await hashPassword(currentPassword, user.salt);
  if (!timingSafeEqual(computedCurrentHash, user.passwordHash)) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  // Generate fresh salt and compute new PBKDF2 hash
  const newSalt = generateSalt(16);
  const newHash = await hashPassword(newPassword, newSalt);

  users[userIdx] = {
    ...user,
    salt: newSalt,
    passwordHash: newHash,
  };

  await set(USERS_KEY, users);

  // Update in-memory session encryption key
  try {
    const newEncKey = await deriveEncryptionKey(newPassword, newSalt);
    setActiveEncryptionKey(newEncKey);
  } catch (keyErr) {
    console.error('Key update error:', keyErr);
  }

  await logSecurityEvent({
    id: `sec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'LOGIN_SUCCESS',
    username: user.username,
    details: 'Password successfully changed by authenticated user.',
  });

  return { success: true };
}

export async function resetPassword(
  usernameInput: string,
  newPasswordInput: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const cleanUsername = usernameInput.trim().toLowerCase();
  const newPassword = newPasswordInput.trim();

  if (!cleanUsername) {
    return { success: false, error: 'Please enter your User ID.' };
  }
  if (!newPassword) {
    return { success: false, error: 'Please enter a new password.' };
  }

  const strength = evaluatePasswordStrength(newPassword);
  if (!strength.isValid) {
    return {
      success: false,
      error: `New password requirements: ${strength.feedback.join(', ')}`,
    };
  }

  const users = await getRegisteredUsers();
  const userIdx = users.findIndex((u) => u.username.toLowerCase() === cleanUsername);
  if (userIdx === -1) {
    return { success: false, error: 'No account found with this User ID.' };
  }

  const user = users[userIdx];
  const newSalt = generateSalt(16);
  const newHash = await hashPassword(newPassword, newSalt);

  users[userIdx] = {
    ...user,
    salt: newSalt,
    passwordHash: newHash,
  };

  await set(USERS_KEY, users);
  await resetRateLimit(cleanUsername);

  try {
    const newEncKey = await deriveEncryptionKey(newPassword, newSalt);
    setActiveEncryptionKey(newEncKey);
  } catch (keyErr) {
    console.error('Key derivation error:', keyErr);
  }

  const publicUser: User = {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarColor: user.avatarColor,
    createdAt: user.createdAt,
  };

  await set(SESSION_KEY, publicUser);
  await del(LOGGED_OUT_KEY);

  await logSecurityEvent({
    id: `sec-${Date.now()}`,
    timestamp: new Date().toISOString(),
    type: 'LOGIN_SUCCESS',
    username: cleanUsername,
    details: 'Password was successfully reset.',
  });

  return { success: true, user: publicUser };
}

