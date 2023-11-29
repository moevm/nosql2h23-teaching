import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
	req.admin = false;

	const token = req.cookies.token;
	if (!token) return next();

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (decoded) req.admin = true;
	} catch (e) {
	} finally {
		next();
	}
};
