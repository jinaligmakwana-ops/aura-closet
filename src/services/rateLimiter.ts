import { get, set } from 'idb-keyval';

interface RateLimitRecord {
  failedAttempts: number;
  lockoutUntil: number; // timestamp in ms
  lastAttempt: number;
}

const RATE_LIMIT_PREFIX = 'aura_ratelimit_';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'ACCOUNT_LOCKED' | 'REGISTER_SUCCESS' | 'LOGOUT';
  username: string;
  details?: string;
}

const AUDIT_LOGS_KEY = 'aura_security_audit_logs_v1';

export async function checkRateLimit(username: string): Promise<{ isLocked: boolean; remainingLockoutSeconds: number }> {
  const key = `${RATE_LIMIT_PREFIX}${username.toLowerCase()}`;
  const record = await get<RateLimitRecord>(key);

  if (!record) {
    return { isLocked: false, remainingLockoutSeconds: 0 };
  }

  const now = Date.now();
  if (record.lockoutUntil && record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { isLocked: true, remainingLockoutSeconds: remainingSeconds };
  }

  // If lockout expired, reset
  if (record.lockoutUntil && record.lockoutUntil <= now) {
    await set(key, { failedAttempts: 0, lockoutUntil: 0, lastAttempt: now });
  }

  return { isLocked: false, remainingLockoutSeconds: 0 };
}

export async function recordFailedAttempt(username: string): Promise<{ lockedNow: boolean; remainingAttempts: number; lockoutSeconds: number }> {
  const key = `${RATE_LIMIT_PREFIX}${username.toLowerCase()}`;
  const record = (await get<RateLimitRecord>(key)) || {
    failedAttempts: 0,
    lockoutUntil: 0,
    lastAttempt: Date.now(),
  };

  const now = Date.now();
  record.failedAttempts += 1;
  record.lastAttempt = now;

  let lockedNow = false;
  let lockoutSeconds = 0;

  if (record.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    lockedNow = true;
    lockoutSeconds = LOCKOUT_DURATION_MS / 1000;
    await logSecurityEvent({
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'ACCOUNT_LOCKED',
      username,
      details: `Account temporarily locked due to ${MAX_FAILED_ATTEMPTS} failed attempts.`,
    });
  } else {
    await logSecurityEvent({
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'LOGIN_FAILED',
      username,
      details: `Failed attempt ${record.failedAttempts} of ${MAX_FAILED_ATTEMPTS}`,
    });
  }

  await set(key, record);
  return {
    lockedNow,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - record.failedAttempts),
    lockoutSeconds,
  };
}

export async function resetRateLimit(username: string): Promise<void> {
  const key = `${RATE_LIMIT_PREFIX}${username.toLowerCase()}`;
  await set(key, { failedAttempts: 0, lockoutUntil: 0, lastAttempt: Date.now() });
}

export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  try {
    const logs = (await get<SecurityEvent[]>(AUDIT_LOGS_KEY)) || [];
    // Keep last 50 events in circular log
    const updated = [event, ...logs].slice(0, 50);
    await set(AUDIT_LOGS_KEY, updated);
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}

export async function getSecurityAuditLogs(): Promise<SecurityEvent[]> {
  try {
    return (await get<SecurityEvent[]>(AUDIT_LOGS_KEY)) || [];
  } catch {
    return [];
  }
}

