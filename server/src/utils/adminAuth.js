const crypto = require('crypto');

const TOKEN_TTL_SECONDS = 60 * 60 * 12;
const SECRET = process.env.ADMIN_AUTH_SECRET || process.env.JWT_SECRET || 'change-this-admin-secret';

const base64UrlEncode = (value) => Buffer.from(value).toString('base64url');
const base64UrlDecode = (value) => Buffer.from(value, 'base64url').toString('utf8');

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
    const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
    return { passwordHash, passwordSalt: salt };
};

const verifyPassword = (password, passwordHash, passwordSalt) => {
    const comparison = crypto.pbkdf2Sync(password, passwordSalt, 100000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(comparison, 'hex'), Buffer.from(passwordHash, 'hex'));
};

const signToken = (payload) => {
    return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
};

const createAdminToken = (adminUser) => {
    const payload = {
        sub: adminUser._id.toString(),
        username: adminUser.username,
        role: adminUser.role,
        exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    };

    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = signToken(encodedPayload);
    return `${encodedPayload}.${signature}`;
};

const verifyAdminToken = (token) => {
    if (!token || !token.includes('.')) return null;

    const [encodedPayload, signature] = token.split('.');
    const expectedSignature = signToken(encodedPayload);

    if (!signature || signature !== expectedSignature) {
        return null;
    }

    try {
        const payload = JSON.parse(base64UrlDecode(encodedPayload));
        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
            return null;
        }
        return payload;
    } catch {
        return null;
    }
};

module.exports = {
    TOKEN_TTL_SECONDS,
    hashPassword,
    verifyPassword,
    createAdminToken,
    verifyAdminToken,
};
