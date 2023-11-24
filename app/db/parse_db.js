import axios from 'axios';
import { load } from 'cheerio';
import fs from 'fs';
import * as enums from './enums_db.js';

const url = 'https://petersburgedu.ru';
const url_page = (n) => url + `/institution/content/search/page/${n}`;
const url_org = (link) => url + link;
const page_limit = 1;

const globalStartTime = new Date();

axios
	.get(url_page(0))
	.then(async (response) => {
		if (response.status === 200) {
			const html = response.data;
			const $ = load(html);

			const page_count = +$('.ui-pagination .end a').first().text().trim();
			const links = [];
			let limit = Math.min(page_count, page_limit);

			let stepStartTime = new Date();

			for (let page = 1; page <= limit; page++) {
				let startTime = new Date();
				const response = await axios.get(url_page(page));
				const $ = load(response.data);

				const links_page = [];
				$('.pbdou-search-results li h5 a').each(
					(i, el) => (links_page[i] = $(el).attr('href'))
				);
				links.push(...links_page);

				let endTime = new Date();
				console.log(`Page parsed: ${page}/${limit} - ${(endTime - startTime) / 1000}s`);
			}

			let stepEndTime = new Date();
			console.log(
				`Retrieving organization URLs complete - ${(stepEndTime - stepStartTime) / 1000}s`
			);
			stepStartTime = stepEndTime;

			const organizations = [];

			limit = links.length;
			for (let i = 0; i < limit; i++) {
				let startTime = new Date();
				const response = await axios.get(url_org(links[i]));
				const $ = load(response.data);

				const organization = {};
				$('.row b').each((i, el) => {
					const attr = $(el).text().trim();
					const text = $(el).next().text().trim();

					switch (attr) {
						case 'ОГРН':
							organization.ogrn = text;
							break;
						case 'Номер ОО':
							organization.number = text;
							break;
						case 'Полное наименование ОО по Уставу':
						case 'Полное наименование ОУ по Уставу':
							organization.name = text;
							break;
						case 'Краткое наименование':
							organization.short_name = text;
							break;
						case 'Адрес ОО':
						case 'Адрес ОУ':
							organization.address = text;
							break;
						case 'Код здания ФИАС':
							organization.fias = text;
							break;
						case 'Должность руководителя':
							organization.mngr_pos = text;
							break;
						case 'ФИО руководителя':
							organization.mngr_name = text;
							break;
						case 'Организационно-правовая форма':
							organization.opf = text;
							break;
						case 'Тип ОО':
						case 'Тип ОУ':
							organization.subtype = text;
							break;
						case 'Вид ОО':
						case 'Вид ОУ':
							organization.category = text;
							break;
						case 'Телефон':
							organization.tel = text;
							break;
						case 'Район':
						case 'Расположение':
							organization.location = text;
							break;
						case 'Статус сервиса "Электронный дневник"':
							organization.e_diary = '1';
							break;
						case 'Адрес сайта в сети Интернет':
							organization.website = text;
							break;
						case 'Адрес электронной почты':
							organization.email = text;
							break;
						default:
							break;
					}
				});

				organization.type = enums.orgTypeToInd(organization.name);
				organization.subtype = Math.max(enums.orgSubtypeToInd(organization.subtype), 0);
				organization.category = Math.max(enums.orgCategoryToInd(organization.category), 0);
				organization.location = Math.max(enums.orgLocationToInd(organization.location), 0);
				organizations.push(organization);

				let endTime = new Date();
				console.log(
					`Organization parsed: ${i + 1}/${limit} - ${(endTime - startTime) / 1000}s`
				);
			}

			stepEndTime = new Date();
			console.log(
				`Retrieving organization info complete - ${(stepEndTime - stepStartTime) / 1000}s`
			);

			const ids = [];
			const orgType = [];
			const orgSubtype = [];
			const orgCategory = [];
			const orgLocation = [];

			const enumLen = enums.enumLengths();
			for (let i = 0; i < enumLen.locations; i++) orgLocation[i] = [];
			for (let i = 0; i < enumLen.types; i++) orgType[i] = [];
			for (let i = 0; i < enumLen.subtypes; i++) orgSubtype[i] = [];
			for (let i = 0; i < enumLen.categories; i++) orgCategory[i] = [];

			organizations.forEach((org) => {
				ids.push(org.ogrn);
				orgLocation[org.location].push(org.ogrn);
				orgType[org.type].push(org.ogrn);
				orgSubtype[org.subtype].push(org.ogrn);
				orgCategory[org.category].push(org.ogrn);
			});

			const db = {
				organizations,
				ids,
				orgType,
				orgSubtype,
				orgCategory,
				orgLocation,
			};

			fs.writeFile('db/db_parsed.json', JSON.stringify(db, null, 4), (err) => {
				const globalEndTime = new Date();
				console.log(`Parsing completed - ${(globalEndTime - globalStartTime) / 1000}s`);
			});
		}
	})
	.catch((error) => {
		console.log(error);
	});
