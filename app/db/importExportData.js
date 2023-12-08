import { enumLengths } from './enums_db.js';

export const importData = async (fileContent, db) => {
	try {
		const globalStartTime = new Date();
		const data = JSON.parse(fileContent);

		for (const [i, org] of data.organizations.entries()) {
			db.setOrganization(org);
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
	} catch (error) {
		console.error('Error importing data:', error);
		throw error;
	}
};

export const exportData = async (db) => {
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
	}
};
