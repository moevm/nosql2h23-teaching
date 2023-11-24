import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { dbConnect } from './memcached.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: __dirname + '\\..\\.env' });

const importPath = 'db/db_import.json';
const parsedPath = 'db/db_parsed.json';
const filePath = process.argv.some((val, index, array) => val === '-P') ? parsedPath : importPath;

const globalStartTime = new Date();

const db = dbConnect(`${process.env.MADDR}:${process.env.MPORT}`);

console.log(`Starting import from file '${filePath}'`);

fs.readFile(filePath, async (err, content) => {
	if (!content || err) return;

	const data = JSON.parse(content);

	for (const [i, org] of data.organizations.entries()) {
		await db.set(`number:${org.ogrn}`, org.number);
		await db.set(`name:${org.ogrn}`, org.name);
		await db.set(`short_name:${org.ogrn}`, org.short_name);
		await db.set(`address:${org.ogrn}`, org.address);
		await db.set(`fias:${org.ogrn}`, org.fias);
		await db.set(`mngr_pos:${org.ogrn}`, org.mngr_pos);
		await db.set(`mngr_name:${org.ogrn}`, org.mngr_name);
		await db.set(`type:${org.ogrn}`, org.type);
		await db.set(`subtype:${org.ogrn}`, org.subtype);
		await db.set(`category:${org.ogrn}`, org.category);
		await db.set(`tel:${org.ogrn}`, org.tel);
		await db.set(`location:${org.ogrn}`, org.location);
		await db.set(`ogrn:${org.ogrn}`, org.ogrn);
		await db.set(`e_diary:${org.ogrn}`, org.e_diary);
		await db.set(`website:${org.ogrn}`, org.website);
		await db.set(`email:${org.ogrn}`, org.email);

		console.log(`Imported ${i + 1}/${data.organizations.length}`);
	}

	await db.set('ids', JSON.stringify(data.ids));

	for (const [i, arr] of data.orgType.entries()) {
		await db.set(`org_type:${i}`, JSON.stringify(arr));
	}

	for (const [i, arr] of data.orgSubtype.entries()) {
		await db.set(`org_sub_type:${i}`, JSON.stringify(arr));
	}

	for (const [i, arr] of data.orgCategory.entries()) {
		await db.set(`org_category:${i}`, JSON.stringify(arr));
	}

	for (const [i, arr] of data.orgLocation.entries()) {
		await db.set(`org_location:${i}`, JSON.stringify(arr));
	}

	const globalEndTime = new Date();
	console.log(`Data stored - ${(globalEndTime - globalStartTime) / 1000}s`);
	db.close();
});
