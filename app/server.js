import express from 'express';
import Memcached from 'memcached';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
// const memcached = new Memcached(`${process.env.MADDR}:${process.env.MPORT}`);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
	res.render('index', {role: "пользователь"});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server started'));
