import dotenv from 'dotenv';
import path from 'path';
import { dbConnect } from './memcached.js';
import { fileURLToPath } from 'url';
import { enumLengths } from './enums_db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: __dirname + '\\..\\.env' });

const db = dbConnect(`${process.env.MADDR}:${process.env.MPORT}`);

export const exportData = async () => {
	const globalStartTime = new Date();

	try {
		const ids = JSON.parse(await db.get('ids'));
		const len = ids.length;

		const organizations = [];
		for (const [i, ogrn] of ids.entries()) {
			organizations.push(await db.getOrganization(ogrn));
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
			orgLocation
		};

		return JSON.stringify(exported, null, 4);
	} finally {
		const globalEndTime = new Date();
		console.log(`Data exported - ${(globalEndTime - globalStartTime) / 1000}s`);
		db.close();
	}
};

// Тест
exportData()
	.then((dataString) => {
		console.log(dataString);
	})
	.catch((error) => {
		console.error('Error exporting data:', error);
	});
