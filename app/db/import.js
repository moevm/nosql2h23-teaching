import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { dbConnect } from './memcached.js';
import { fileURLToPath } from 'url';
import { importData } from '../db/importExportData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: __dirname + '\\..\\.env' });

const importPath = 'db/db_import.json';
const parsedPath = 'db/db_parsed.json';
const filePath = process.argv.some((val, index, array) => val === '-P') ? parsedPath : importPath;

const db = dbConnect(`${process.env.MADDR}:${process.env.MPORT}`);

console.log(`Starting import from file '${filePath}'`);

fs.readFile(filePath, async (err, content) => {
	try {
		await importData(content, db);
	} finally {
		db.close();
	}
});
