const AdminUser = require('../models/AdminUser');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { createAdminToken, verifyPassword } = require('../utils/adminAuth');

const loginAdmin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const normalizedUsername = username.trim().toLowerCase();
        const adminUser = await AdminUser.findOne({ username: normalizedUsername });

        if (!adminUser || !verifyPassword(password, adminUser.passwordHash, adminUser.passwordSalt)) {
            return sendError(res, 'Invalid admin credentials.', 401);
        }

        const token = createAdminToken(adminUser);
        sendSuccess(res, {
            token,
            admin: {
                id: adminUser._id,
                username: adminUser.username,
                name: adminUser.name,
                role: adminUser.role,
            }
        });
    } catch (error) {
        next(error);
    }
};

const getCurrentAdmin = async (req, res, next) => {
    try {
        sendSuccess(res, {
            id: req.adminUser._id,
            username: req.adminUser.username,
            name: req.adminUser.name,
            role: req.adminUser.role,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    loginAdmin,
    getCurrentAdmin,
};
