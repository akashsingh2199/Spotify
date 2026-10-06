const jwt = require("jsonwebtoken");

function authMiddleware(req, res, next) {
    let token = req.cookies && req.cookies.token;
    
    // Also support Authorization header (Bearer <token>)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: No token provided"
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: Invalid or expired token"
        });
    }
}

function requireRole(role) {
    return (req, res, next) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({
                success: false,
                message: `Forbidden: ${role} role required`
            });
        }
        next();
    };
}

module.exports = {
    authMiddleware,
    requireRole
};
