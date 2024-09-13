function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) { 
	return res.sendStatus(401).json({ message: 'You are not authorized' });
    }

    if (!verify_jwt(token, publicKey)) {
	return res.sendStatus(403).json({ message: 'Error while verifying the token' });
    }

    next();
}

module.exports = { authenticateToken };
