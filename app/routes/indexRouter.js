import express from 'express'
import { getDB } from '../db/memcached.js'
import {locations, types, subtypes, categories} from '../db/enums_db.js'

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
	const db = getDB()
	res.render('extendedSearch', { role: 'пользователь' , locations, types, subtypes, categories})
})

export default router
