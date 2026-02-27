const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Step 1: Read the Authorization header
    const authHeader = req.headers['authorization'];

    // Step 2: Check if the header exists
    if (!authHeader) {
        return res.status(401).json({
            error: 'No token provided'
        });
    }

    // Step 3: Header format os "Bearer <token>" - extract just the token
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Invalid token format'
        })
    }

    // Step 4: Verify the token signature using JWT_SECRET
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 5: Attach user info to request so routes can use it
        req.user = decoded;

        // Step 6: Move on to the actual route handler
        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
};

module.exports = verifyToken;