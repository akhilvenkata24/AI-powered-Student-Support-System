const AdminUser = require('../models/AdminUser');
const { verifyAdminToken } = require('../utils/adminAuth');

const requireAdminAuth = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization || '';
        const [scheme, token] = authorization.split(' ');

        if (scheme !== 'Bearer' || !token) {
            return res.status(401).json({ success: false, error: 'Admin authentication required.' });
        }

        const payload = verifyAdminToken(token);
        if (!payload?.sub) {
            return res.status(401).json({ success: false, error: 'Invalid or expired admin session.' });
        }

        const adminUser = await AdminUser.findById(payload.sub).select('_id username name role');
        if (!adminUser) {
            return res.status(401).json({ success: false, error: 'Admin account not found.' });
        }

        req.adminUser = adminUser;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { requireAdminAuth };
