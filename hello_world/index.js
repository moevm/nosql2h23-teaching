import express from "express";
import Memcached from "memcached";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const memcached = new Memcached(`${process.env.MADDR}:${process.env.MPORT}`);

app.set('views', __dirname);
app.set('view engine', 'pug');

app.get('/', async (req, res) => {
    memcached.set('key1', 'value1', 0, (err) => {
        memcached.get('key1', (err, data) => console.log(data));

        memcached.set('key1', 'value2', 0, (err) => {
            memcached.get('key1', (err, data) => console.log(data));

            memcached.set('key2', 'value3', 0, (err) => {
                memcached.get('key2', (err, data) => console.log(data));
            });
        });
    });

    res.render('index');
});

app.listen(3000, () => console.log('Server started'));
