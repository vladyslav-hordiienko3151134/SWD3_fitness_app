const sessions = new Map();

function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function createSession(user) {
  const sessionId = generateSessionId();
  
  sessions.set(sessionId, {
    user_id: user.user_id,
    email: user.email,
    role: user.role,
    expires: Date.now() + (7 * 24 * 60 * 60 * 1000)
  });
  
  return sessionId;
}

export function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (session.expires < Date.now()) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

export function deleteSession(sessionId) {
  sessions.delete(sessionId);
}