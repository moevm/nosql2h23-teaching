import express from 'express';
import { getDB } from '../db/memcached.js';
import { enums } from '../db/enums_db.js';
import { importData, exportData } from '../db/importExportData.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
	const db = getDB();

	const selected = req.query.selected || 'type';
	let needed_enum = null;
	let prefix = '';
	switch (selected) {
		case 'type':
			needed_enum = enums.types;
			prefix = 'org_type:';
			break;
		case 'subtype':
			needed_enum = enums.subtypes;
			prefix = 'org_sub_type:';
			break;
		case 'category':
			needed_enum = enums.categories;
			prefix = 'org_category:';
			break;
		case 'location':
			needed_enum = enums.locations;
			prefix = 'org_location:';
			break;
		default:
			break;
	}
	let stats = [];
	for (let index in needed_enum) {
		let array = await db.getArray(prefix + index);
		stats.push({ name: needed_enum[index], count: array.length });
	}
	res.render('index', { admin: req.admin, selected_field: selected, stats });
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

router.get('/editOrganization', auth, async (req, res) => {
	const db = getDB();
	const id = req.query.id;
	const info = await db.getOrganization(id);
	info.id = id;
	res.render('editOrganization', {
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
	if (
		req.query.name === '' ||
		req.query.address === '' ||
		req.query.short_name === '' ||
		req.query.id === '' ||
		ids.includes(req.query.id)
	) {
		return res.render('addOrganization', {
			msg: 'Введены не все обязательные поля / Организация с введённым ОГРН уже существует',
			admin: req.admin,
			locations: enums.locations,
			types: enums.types,
			subtypes: enums.subtypes,
			categories: enums.categories,
		});
	}
	req.query.ogrn = req.query.id;
	await db.setOrganization(req.query);
	await db.addStatistics(req.query);
	const info = await db.getOrganization(req.query.id);
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

router.get('/edit', auth, async (req, res) => {
	const db = getDB();
	req.query.ogrn = req.query.id;

	const org = await db.getOrganization(req.query.id);
	await db.setOrganization(req.query);
	await db.changeStatistics(org, req.query);
	const info = await db.getOrganization(req.query.id);
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

router.get('/delete', auth, async (req, res) => {
	const db = getDB();
	const org = await db.getOrganization(req.query.id);
	await db.removeStatistics(org);
	await db.removeOrganization(req.query.id);
	res.json({ msg: 'Deleted' });
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
