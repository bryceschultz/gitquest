import jwt from 'jsonwebtoken';

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {any}
 */
export default function requireAuth(req, res, next) {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ error: 'Unauthorized — no token' });
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.agentId = decoded.id;
        next();
    } catch {
        return res.status(401).json({ error: 'Unauthorized — invalid token' });
    }
}