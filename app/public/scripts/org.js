const deleteOrg = (id) => {
	if (confirm(`Вы точно хотите удалить организацию с ОГРН ${id}?`)) {
		fetch(`/delete?id=${id}`, {
			method: 'GET',
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					alert(data.err);
				} else window.location.replace('/');
			});
	}
};
