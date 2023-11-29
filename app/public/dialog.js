const openDialog = () => {
	document.getElementById('overlay').toggleAttribute('open', true);
	document.getElementById('admin-dialog').toggleAttribute('open', true);
	document.getElementById('admin-dialog').scrollTop = 0;
};

const closeDialog = () => {
	document.getElementById('overlay').removeAttribute('open');
	document.getElementById('admin-dialog').removeAttribute('open');
	document.getElementById('name-inp').value = '';
	document.getElementById('password-inp').value = '';
	document.getElementById('auth-err').toggleAttribute('open', false);
};

const authorize = (e) => {
	e.preventDefault();

	const err = document.getElementById('auth-err');
	err.toggleAttribute('open', false);

	const name = document.getElementById('name-inp').value.trim();
	const password = document.getElementById('password-inp').value.trim();

	if (name === '' || password === '') {
		err.toggleAttribute('open', true);
		err.innerText = 'Not all the fields are filled';
		return;
	}

	fetch('/auth/authorize', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ name, password }),
		redirect: 'follow',
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.error) {
				err.toggleAttribute('open', true);
				err.innerText = data.error;
			}
			if (data.authorized) window.location.replace('/');
		});
};

const logout = () => {
	fetch('/auth/logout', {
		method: 'GET',
	})
		.then((res) => res.json())
		.then((data) => {
			if (data.logout) window.location.replace('/');
		});
};
