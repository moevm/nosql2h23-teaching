import express from 'express';
import jwt from 'jsonwebtoken';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/authorize', auth, async (req, res) => {
	const { name, password } = req.body;

	if (!(name && password)) return res.json({ error: 'Not all the fields filled' });

	if (name !== process.env.ADMIN_NAME || password !== process.env.ADMIN_PASSWORD)
		return res.json({ error: 'Wrong name or password' });

	const token = jwt.sign({ name }, process.env.JWT_SECRET, {
		expiresIn: '1d',
	});
	if (!token) return res.json({ error: 'Error while generating a token' });

	res.cookie('token', token);
	res.json({ authorized: true });
});

router.get('/logout', auth, (req, res) => {
	res.clearCookie('token');
	res.json({ logout: true });
});

export default router;
