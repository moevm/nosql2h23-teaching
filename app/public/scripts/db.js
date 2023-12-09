const importData = (data) => {
	fetch('/import', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ data }),
	}).then((res) => {
		if (res.status === 200) window.location.replace('/');
		else alert('Error occured while importing data');
	});
};

const exportData = () => {
	fetch('/export', { method: 'GET' })
		.then((res) => res.json())
		.then(({ data }) => {
			const dataStr =
				'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 4));
			const a = document.createElement('a');
			a.style.display = 'none';
			a.href = dataStr;
			a.download = 'db_exported.json';
			document.body.appendChild(a);
			a.click();
		});
};

const validateObj = (obj) => {
	const isArray = (o) => o && o.constructor === Array;

	return (
		obj &&
		isArray(obj.organizations) &&
		isArray(obj.ids) &&
		isArray(obj.orgType) &&
		isArray(obj.orgSubtype) &&
		isArray(obj.orgCategory) &&
		isArray(obj.orgLocation) &&
		obj.organizations.length === obj.ids.length
	);
};

const onReaderLoad = (event) => {
	try {
		const obj = JSON.parse(event.target.result);
		if (validateObj(obj)) importData(obj);
		else alert('Wrong data structure');
	} catch (err) {
		alert('Incorrect JSON file');
	}
};

const onFileChange = (event) => {
	const reader = new FileReader();
	reader.onload = onReaderLoad;
	reader.readAsText(event.target.files[0]);
};
