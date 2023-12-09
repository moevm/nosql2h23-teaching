import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { dbConnect } from './memcached.js';
import { fileURLToPath } from 'url';
import { exportData } from '../db/importExportData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: __dirname + '\\..\\.env' });

const filePath = 'db/db_export.json';

const db = dbConnect(`${process.env.MADDR}:${process.env.MPORT}`);

console.log(`Starting export to file '${filePath}'`);

exportData(db)
	.then((data) => {
		fs.writeFile(filePath, JSON.stringify(data, null, 4), (err) => {});
	})
	.catch((error) => {
		console.error('Error exporting data:', error);
	})
	.finally(() => {
		db.close();
	});
