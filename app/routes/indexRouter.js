import express from 'express'
import { getDB } from '../db/memcached.js'
import { enums } from '../db/enums_db.js'

const router = express.Router()

router.get('/', async (req, res) => {
	const db = getDB()
	await db.set('key1', 'value1123')
	console.log(await db.get('key1'))

	await db.setArray('arr', [1, 2])
	console.log(await db.getArray('arr'))

	await db.appendArray('arr', 12)
	console.log(await db.getArray('arr'))

	res.render('index', { role: 'пользователь' })
})

router.get('/search-by-name', async (req, res) => {
	const db = getDB()

	const ids = await db.getArray('ids')

	const limit = 3
	let page = parseInt(req.query.page) || 1

	const names = await Promise.all(ids.map((id) => db.get(`name:${id}`)))

	const searchQuery = req.query.search || ''

	const filteredNames = names.filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()))

	const totalPages = Math.ceil(filteredNames.length / limit)
	page = Math.min(Math.max(page, 1), totalPages)
	const startIndex = (page - 1) * limit
	const endIndex = page * limit

	const namesOnPage = filteredNames.slice(startIndex, endIndex)

	res.render('search', { role: 'пользователь', names: namesOnPage, page, totalPages, searchQuery })
})

router.get('/extended-search', async (req, res) => {
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

	let orgInfo = [];
	ids.forEach((id, index) => {
		orgInfo.push({id, type_name: enums.types[+types[index]], address: addresses[index], short_name: short_names[index], name: names[index], type: types[index], subtype: subtypes[index], category: categories[index], location: locations[index]})
	});

	const queryParams = {}
	queryParams.search = req.query.search || ''
	queryParams.type = req.query.type || "-1"
	queryParams.subtype = req.query.subtype || "-1"
	queryParams.category = req.query.category || "-1"
	queryParams.location = req.query.location || "-1"

	orgInfo = orgInfo.filter((info) => info.name.toLowerCase().includes(queryParams.search.toLowerCase()));
	if (req.query.type != "-1") orgInfo = orgInfo.filter((info) => info.type == req.query.type);
	if (req.query.subtype != "-1") orgInfo = orgInfo.filter((info) => info.subtype == req.query.subtype);
	if (req.query.category != "-1") orgInfo = orgInfo.filter((info) => info.category == req.query.category);
	if (req.query.location != "-1") orgInfo = orgInfo.filter((info) => info.location == req.query.location);

	const totalPages = Math.ceil(orgInfo.length / limit)
	page = Math.min(Math.max(page, 1), totalPages)
	const startIndex = (page - 1) * limit
	const endIndex = page * limit

	const orgsOnPage = orgInfo.slice(startIndex, endIndex)

	res.render('extendedSearch', { 
		role: 'пользователь' ,
		orgsOnPage, 
		locations: enums.locations, 
		types: enums.types, 
		subtypes: enums.subtypes, 
		categories: enums.categories,
		page,
		totalPages, 
		queryParams
	})
})

export default router
