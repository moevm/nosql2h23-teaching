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

function get(key) {
	return new Promise((resolve, reject) => {
		this.memcached.get(key.toString(), (err, data) => {
			if (err) reject(err);
			resolve(data);
		});
	});
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
		close,
	};
	return instance;
};

export const getDB = () => {
	if (!instance) console.log('No DB instance created');
	return instance;
};
