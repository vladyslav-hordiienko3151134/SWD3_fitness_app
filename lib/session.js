//Ivan Spinko 3151675
import { randomBytes } from 'crypto';

//in memory session storage
const sessions = new Map();
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = 'session_id';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: SESSION_MAX_AGE_MS / 1000,
  path: '/',
};

//generate session ID
function generateSessionId() {
  return randomBytes(32).toString('hex');
}

//create and store a new session with expiration
export function createSession(user) {
  const sessionId = generateSessionId();
  sessions.set(sessionId, {
    ...user,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE_MS,
  });
  return sessionId;
}

//retrieve session and check if expired
export function getSession(sessionId) {
  if (!sessionId) return null;
  const session = sessions.get(sessionId);
  if (!session) return null;

  // Delete and return null if session has expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

//remove a session from storage
export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}

//utility to extract and validate session from request cookies
export function getSessionFromRequest(request) {
  const sessionId = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return { sessionId, session: getSession(sessionId) };
}