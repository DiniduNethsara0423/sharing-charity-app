const blacklist = new Map();

const blacklistToken = (token, ttlSeconds) => {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  blacklist.set(token, expiresAt);
};

const isBlacklisted = (token) => {
  const exp = blacklist.get(token);
  if (!exp) return false;
  if (Date.now() > exp) {
    blacklist.delete(token);
    return false;
  }
  return true;
};

// periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [token, exp] of blacklist) {
    if (now > exp) blacklist.delete(token);
  }
}, 60 * 1000);

module.exports = { blacklistToken, isBlacklisted };
