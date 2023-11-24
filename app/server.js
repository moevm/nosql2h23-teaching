import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConnect } from './db/memcached.js';
import router from './routes/indexRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const db = dbConnect(`${process.env.MADDR}:${process.env.MPORT}`);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/', router);
app.get('*', (req, res) => res.status(404).end('Page not found'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server started'));
