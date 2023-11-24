import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { dbConnect } from './memcached.js';
import { fileURLToPath } from 'url';
import { enumLengths } from './enums_db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: __dirname + '\\..\\.env' });

const globalStartTime = new Date();

const filePath = 'db/db_export.json';

const db = dbConnect(`${process.env.MADDR}:${process.env.MPORT}`);

console.log(`Starting export to file '${filePath}'`);

(async () => {
	const ids = JSON.parse(await db.get('ids'));
	const len = ids.length;

	const organizations = [];
	for (const [i, ogrn] of ids.entries()) {
		organizations.push({
			number: await db.get(`number:${ogrn}`),
			name: await db.get(`name:${ogrn}`),
			short_name: await db.get(`short_name:${ogrn}`),
			address: await db.get(`address:${ogrn}`),
			fias: await db.get(`fias:${ogrn}`),
			mngr_pos: await db.get(`mngr_pos:${ogrn}`),
			mngr_name: await db.get(`mngr_name:${ogrn}`),
			type: await db.get(`type:${ogrn}`),
			subtype: await db.get(`subtype:${ogrn}`),
			category: await db.get(`category:${ogrn}`),
			tel: await db.get(`tel:${ogrn}`),
			location: await db.get(`location:${ogrn}`),
			ogrn: await db.get(`ogrn:${ogrn}`),
			e_diary: await db.get(`e_diary:${ogrn}`),
			website: await db.get(`website:${ogrn}`),
			email: await db.get(`email:${ogrn}`),
		});
		console.log(`Organization read ${i + 1}/${len}`);
	}

	const orgType = [];
	const orgSubtype = [];
	const orgCategory = [];
	const orgLocation = [];

	const enumLen = enumLengths();
	for (let i = 0; i < enumLen.types; i++) {
		orgType[i] = JSON.parse(await db.get(`org_type:${i}`));
	}
	for (let i = 0; i < enumLen.subtypes; i++) {
		orgSubtype[i] = JSON.parse(await db.get(`org_sub_type:${i}`));
	}
	for (let i = 0; i < enumLen.categories; i++) {
		orgCategory[i] = JSON.parse(await db.get(`org_category:${i}`));
	}
	for (let i = 0; i < enumLen.locations; i++) {
		orgLocation[i] = JSON.parse(await db.get(`org_location:${i}`));
	}

	const exported = {
		organizations,
		ids,
		orgType,
		orgSubtype,
		orgCategory,
		orgLocation,
	};

	fs.writeFile(filePath, JSON.stringify(exported, null, 4), (err) => {});

	const globalEndTime = new Date();
	console.log(`Data exported - ${(globalEndTime - globalStartTime) / 1000}s`);
	db.close();
})();
