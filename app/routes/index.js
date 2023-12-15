import express from 'express';
import { getDB } from '../db/memcached.js';
import { enums } from '../db/enums_db.js';
import { importData, exportData } from '../db/importExportData.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
	const db = getDB();
	// await db.set('key1', 'value1123')
	// console.log(await db.get('key1'))

	// await db.setArray('arr', [1, 2])
	// console.log(await db.getArray('arr'))

	// await db.appendArray('arr', 12)
	// console.log(await db.getArray('arr'))

	res.render('index', { admin: req.admin });
});

router.get('/search-by-name', auth, async (req, res) => {
	const db = getDB();

	const ids = await db.getArray('ids');
	const short_names = await Promise.all(ids.map((id) => db.get(`short_name:${id}`)));
	const addresses = await Promise.all(ids.map((id) => db.get(`address:${id}`)));
	const names = await Promise.all(ids.map((id) => db.get(`name:${id}`)));
	const types = await Promise.all(ids.map((id) => db.get(`type:${id}`)));
	let orgInfo = [];
	ids.forEach((id, index) => {
		orgInfo.push({
			id,
			name: names[index],
			type_name: enums.types[+types[index]],
			address: addresses[index],
			short_name: short_names[index],
		});
	});

	const limit = 3;
	let page = parseInt(req.query.page) || 1;
	const searchQuery = req.query.search || '';

	orgInfo = orgInfo.filter(
		(info) =>
			info.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			info.short_name.toLowerCase().includes(searchQuery.toLowerCase())
	);

	const totalPages = Math.ceil(orgInfo.length / limit);
	page = Math.min(Math.max(page, 1), totalPages);
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	const orgsOnPage = orgInfo.slice(startIndex, endIndex);

	res.render('search', {
		admin: req.admin,
		orgsOnPage,
		page,
		totalPages,
		totalItems: orgInfo.length,
		searchQuery,
	});
});

router.get('/extended-search', auth, async (req, res) => {
	const db = getDB();
	const ids = await db.getArray('ids');

	const limit = 3;
	let page = parseInt(req.query.page) || 1;

	const names = await Promise.all(ids.map((id) => db.get(`name:${id}`)));
	const short_names = await Promise.all(ids.map((id) => db.get(`short_name:${id}`)));
	const addresses = await Promise.all(ids.map((id) => db.get(`address:${id}`)));
	const types = await Promise.all(ids.map((id) => db.get(`type:${id}`)));
	const subtypes = await Promise.all(ids.map((id) => db.get(`subtype:${id}`)));
	const categories = await Promise.all(ids.map((id) => db.get(`category:${id}`)));
	const locations = await Promise.all(ids.map((id) => db.get(`location:${id}`)));
	const fiases = await Promise.all(ids.map((id) => db.get(`fias:${id}`)));
	const mngr_poses = await Promise.all(ids.map((id) => db.get(`mngr_pos:${id}`)));
	const mngr_names = await Promise.all(ids.map((id) => db.get(`mngr_name:${id}`)));
	const tels = await Promise.all(ids.map((id) => db.get(`tel:${id}`)));
	const websites = await Promise.all(ids.map((id) => db.get(`website:${id}`)));
	const emails = await Promise.all(ids.map((id) => db.get(`email:${id}`)));

	let orgInfo = [];
	ids.forEach((id, index) => {
		orgInfo.push({
			id,
			type_name: enums.types[+types[index]],
			short_name: short_names[index],
			name: names[index],
			type: types[index],
			subtype: subtypes[index],
			category: categories[index],
			location: locations[index],
			fias: fiases[index],
			address: addresses[index],
			mngr_pos: mngr_poses[index],
			mngr_name: mngr_names[index],
			tel: tels[index],
			website: websites[index],
			email: emails[index],
		});
	});

	const queryParams = {};
	queryParams.search = req.query.search || '';
	queryParams.address = req.query.address || '';
	queryParams.fias = req.query.fias || '';
	queryParams.mngr_pos = req.query.mngr_pos || '';
	queryParams.mngr_name = req.query.mngr_name || '';
	queryParams.id = req.query.id || '';
	queryParams.tel = req.query.tel || '';
	queryParams.website = req.query.website || '';
	queryParams.email = req.query.email || '';
	queryParams.type = req.query.type || '-1';
	queryParams.subtype = req.query.subtype || '-1';
	queryParams.category = req.query.category || '-1';
	queryParams.location = req.query.location || '-1';

	orgInfo = orgInfo.filter(
		(info) =>
			info.name.toLowerCase().includes(queryParams.search.toLowerCase()) ||
			info.short_name.toLowerCase().includes(queryParams.search.toLowerCase())
	);

	for (let field of [
		'address',
		'fias',
		'mngr_pos',
		'mngr_name',
		'id',
		'tel',
		'website',
		'email',
	]) {
		orgInfo = orgInfo.filter((info) =>
			info[field].toLowerCase().includes(queryParams[field].toLowerCase())
		);
	}

	if (queryParams.type != '-1') orgInfo = orgInfo.filter((info) => info.type == queryParams.type);
	if (queryParams.subtype != '-1')
		orgInfo = orgInfo.filter((info) => info.subtype == queryParams.subtype);
	if (queryParams.category != '-1')
		orgInfo = orgInfo.filter((info) => info.category == queryParams.category);
	if (queryParams.location != '-1')
		orgInfo = orgInfo.filter((info) => info.location == queryParams.location);

	const totalPages = Math.ceil(orgInfo.length / limit);
	page = Math.min(Math.max(page, 1), totalPages);
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	const orgsOnPage = orgInfo.slice(startIndex, endIndex);

	res.render('extendedSearch', {
		admin: req.admin,
		orgsOnPage,
		locations: enums.locations,
		types: enums.types,
		subtypes: enums.subtypes,
		categories: enums.categories,
		page,
		totalPages,
		totalItems: orgInfo.length,
		queryParams,
	});
});

router.get('/organization-page', auth, async (req, res) => {
	const db = getDB();
	const id = req.query.id;
	let info = await db.getOrganization(id);
	info.id = id;
	res.render('organizationPage', {
		admin: req.admin,
		info,
		locations: enums.locations,
		types: enums.types,
		subtypes: enums.subtypes,
		categories: enums.categories,
	});
});

router.get('/add-organization', auth, async (req, res) => {
	res.render('addOrganization', {
		msg: '',
		admin: req.admin,
		locations: enums.locations,
		types: enums.types,
		subtypes: enums.subtypes,
		categories: enums.categories,
	});
});

router.get('/add', auth, async (req, res) => {
	const db = getDB();
	let ids = await db.getArray('ids');
	if (req.query.id === '' || ids.includes(req.query.id)) {
		return res.render('addOrganization', {
			msg: 'Организация с введённым ОГРН уже существует / не введён ОГРН',
			admin: req.admin,
			locations: enums.locations,
			types: enums.types,
			subtypes: enums.subtypes,
			categories: enums.categories,
		});
	}
	req.query.ogrn = req.query.id;
	await db.setOrganization(req.query);
	await db.appendArray('ids', req.query.id);
	await db.appendArray(`org_type:${req.query.type}`, req.query.id);
	await db.appendArray(`org_sub_type:${req.query.subtype}`, req.query.id);
	await db.appendArray(`org_category:${req.query.category}`, req.query.id);
	await db.appendArray(`org_location:${req.query.location}`, req.query.id);
	let info = await db.getOrganization(req.query.id);
	info.id = req.query.id;
	res.render('organizationPage', {
		admin: req.admin,
		info,
		locations: enums.locations,
		types: enums.types,
		subtypes: enums.subtypes,
		categories: enums.categories,
	});
});

router.post('/import', auth, async (req, res) => {
	try {
		const db = getDB();
		const { data } = req.body;
		await importData(data, db);
		res.status(200).json({ message: 'Import successful', count: data.ids.length });
	} catch (error) {
		console.error('Import error:', error);
		res.status(500).json({ error: 'Import failed' });
	}
});

router.get('/export', auth, async (req, res) => {
	try {
		const db = getDB();
		const exportedData = await exportData(db);
		res.status(200).json({ data: exportedData });
	} catch (error) {
		console.error('Export error:', error);
		res.status(500).json({ error: 'Export failed' });
	}
});

export default router;
