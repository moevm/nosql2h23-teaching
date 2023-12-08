import dotenv from 'dotenv';
import path from 'path';
import { dbConnect } from './memcached.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Принимаем содержимое файла из аргументов
const fileContent = process.argv[2]; // Предполагаем, что содержимое файла передается в качестве первого аргумента

const globalStartTime = new Date();

const db = dbConnect(`${process.env.MADDR}:${process.env.MPORT}`);

if (!fileContent) {
	console.error('Error: File content not provided.');
	process.exit(1);
}

console.log('Starting import from file content');
(async () => {
	try {
		await importData(fileContent, db);
	} finally {
		db.close();
	}
})();

const importData = async (fileContent) => {
	try {
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
		throw error; // Пробросить ошибку для обработки в вызывающем коде
	}
};
