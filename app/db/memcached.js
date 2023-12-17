import Memcached from 'memcached';

let instance = null;

function set(key, value) {
	return new Promise((resolve, reject) => {
		this.memcached.set(key.toString(), value ? value.toString() : '', 0, (err) => {
			if (err) reject(err);
			resolve();
		});
	});
}

function setMany(keys, values) {
	return Promise.all(keys.map((key, i) => this.set(key, values[i])));
}

function setOrganization(org) {
	return this.setMany(
		[
			`number:${org.ogrn}`,
			`name:${org.ogrn}`,
			`short_name:${org.ogrn}`,
			`address:${org.ogrn}`,
			`fias:${org.ogrn}`,
			`mngr_pos:${org.ogrn}`,
			`mngr_name:${org.ogrn}`,
			`type:${org.ogrn}`,
			`subtype:${org.ogrn}`,
			`category:${org.ogrn}`,
			`tel:${org.ogrn}`,
			`location:${org.ogrn}`,
			`ogrn:${org.ogrn}`,
			`e_diary:${org.ogrn}`,
			`website:${org.ogrn}`,
			`email:${org.ogrn}`,
		],
		[
			org.number,
			org.name,
			org.short_name,
			org.address,
			org.fias,
			org.mngr_pos,
			org.mngr_name,
			org.type.toString(),
			org.subtype.toString(),
			org.category.toString(),
			org.tel,
			org.location.toString(),
			org.ogrn,
			org.e_diary,
			org.website,
			org.email,
		]
	);
}

function removeOrganization(ogrn) {
	return this.removeMany([
		`number:${ogrn}`,
		`name:${ogrn}`,
		`short_name:${ogrn}`,
		`address:${ogrn}`,
		`fias:${ogrn}`,
		`mngr_pos:${ogrn}`,
		`mngr_name:${ogrn}`,
		`type:${ogrn}`,
		`subtype:${ogrn}`,
		`category:${ogrn}`,
		`tel:${ogrn}`,
		`location:${ogrn}`,
		`ogrn:${ogrn}`,
		`e_diary:${ogrn}`,
		`website:${ogrn}`,
		`email:${ogrn}`,
	]);
}

function addStatistics(org) {
	return Promise.all([
		this.appendArray('ids', org.ogrn),
		this.appendArray(`org_type:${org.type}`, org.ogrn),
		this.appendArray(`org_sub_type:${org.subtype}`, org.ogrn),
		this.appendArray(`org_category:${org.category}`, org.ogrn),
		this.appendArray(`org_location:${org.location}`, org.ogrn),
	]);
}

function removeStatistics(org) {
	console.log(org);
	return Promise.all([
		this.removeFromArray('ids', org.ogrn),
		this.removeFromArray(`org_type:${org.type}`, org.ogrn),
		this.removeFromArray(`org_sub_type:${org.subtype}`, org.ogrn),
		this.removeFromArray(`org_category:${org.category}`, org.ogrn),
		this.removeFromArray(`org_location:${org.location}`, org.ogrn),
	]);
}

function get(key) {
	return new Promise((resolve, reject) => {
		this.memcached.get(key.toString(), (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	});
}

function getMany(keys) {
	return Promise.all(keys.map((key) => this.get(key)));
}

function remove(key) {
	return new Promise((resolve, reject) => {
		this.memcached.del(key.toString(), (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	});
}

function removeMany(keys) {
	return Promise.all(keys.map((key) => this.remove(key)));
}

async function getOrganization(ogrn) {
	const keys = [
		'number',
		'name',
		'short_name',
		'address',
		'fias',
		'mngr_pos',
		'mngr_name',
		'type',
		'subtype',
		'category',
		'tel',
		'location',
		'ogrn',
		'e_diary',
		'website',
		'email',
	];
	const values = await this.getMany([
		`number:${ogrn}`,
		`name:${ogrn}`,
		`short_name:${ogrn}`,
		`address:${ogrn}`,
		`fias:${ogrn}`,
		`mngr_pos:${ogrn}`,
		`mngr_name:${ogrn}`,
		`type:${ogrn}`,
		`subtype:${ogrn}`,
		`category:${ogrn}`,
		`tel:${ogrn}`,
		`location:${ogrn}`,
		`ogrn:${ogrn}`,
		`e_diary:${ogrn}`,
		`website:${ogrn}`,
		`email:${ogrn}`,
	]);

	const org = {};
	keys.forEach((key, i) => (org[key] = values[i]));
	return org;
}

async function getArray(key) {
	return JSON.parse(await this.get(key));
}

async function setArray(key, value) {
	await this.set(key, JSON.stringify(value));
}

async function appendArray(key, value) {
	const arr = await this.getArray(key);
	arr.push(value);
	await this.setArray(key, arr);
}

async function removeFromArray(key, value) {
	let arr = await this.getArray(key);
	console.log(key + ' ' + value + ' ' + arr);
	arr = arr.filter((el) => el !== value);
	await this.setArray(key, arr);
}

function close() {
	this.memcached.end();
}

export const dbConnect = (addr) => {
	if (instance) return instance;

	instance = {
		memcached: new Memcached(addr),
		set,
		get,
		remove,
		getMany,
		setMany,
		removeMany,
		getOrganization,
		setOrganization,
		removeOrganization,
		setArray,
		getArray,
		appendArray,
		removeFromArray,
		close,
		addStatistics,
		removeStatistics,
	};
	return instance;
};

export const getDB = () => {
	if (!instance) console.log('No DB instance created');
	return instance;
};
