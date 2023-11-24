import express from 'express';
import { getDB } from '../db/memcached.js';

const router = express.Router();

router.get('/', async (req, res) => {
	const db = getDB();

	await db.set('key1', 'value1123');
	console.log(await db.get('key1'));

	res.render('index', { role: 'пользователь' });
});

router.get('/search-by-name', async (req, res) => {
	res.render('search', { role: 'пользователь' });
});

router.get('/extended-search', async (req, res) => {
	res.render('extendedSearch', { role: 'пользователь' });
});

export default router;
