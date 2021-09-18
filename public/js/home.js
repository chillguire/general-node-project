document.getElementById('btn-logout').addEventListener('click', function (event) {
	event.preventDefault();

	let xhr = new XMLHttpRequest();
	xhr.open("POST", '/logout', true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			window.location.replace(xhr.response);
		}
	}

	xhr.send();
});

document.getElementById('btn-add').addEventListener('click', function (event) {
	event.preventDefault();

	let frmHidden = document.getElementById("frm-add");
	frmHidden.hidden = !(frmHidden.hidden);

});

document.getElementById('frm-add').addEventListener('submit', function (event) {
	event.preventDefault();

	let value = document.getElementById('input-text').value.trim();
	document.getElementById('input-text').value = '';

	if (value === '') return alert('no text');
	const data = {
		content: value,
	}

	let xhr = new XMLHttpRequest();
	xhr.open("POST", '/api/posts', true);
	//xhr.setRequestHeader("Content-Type", "multipart/form-data");
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
			//let row = document.createElement('tr');
			prepareHTML(JSON.parse(xhr.response));
			// row.innerHTML = response;
			// let table = document.getElementById('tableee');
			// table.insertBefore(row, table.firstChild);
		}
	}

	xhr.send(JSON.stringify(data));

});

function prepareHTML(data) {
	let table = document.getElementById('tableee');
	for (let i = 0; i < data.length; i++) {
		let row = document.createElement('tr');
		row.innerHTML = `
				<td><a href="/profile/${data[i].createdBy.username}"><img src="${data[i].createdBy.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg'}" class="avatar" alt="Avatar">
		${data[i].createdBy.username}</a></td>
		<td>${timeSince(data[i].createdAt)}</td>
		<td>Admin</td>
		<td><span>${data[i].content}</td>
			<td>
				<a href="#" class="settings" title="Settings" data-toggle="tooltip"><i
					class="material-icons">&#xE8B8;</i></a>
				<a href="#" data-id='${data[i]._id}' class="delete" title="Delete" data-toggle="tooltip"><i
					class="material-icons">&#xE5C9;</i></a>
			</td>
			`;
		table.insertBefore(row, table.firstChild);
	}
}

function timeSince(date) {
	var seconds = Math.floor((new Date() - new Date(date)) / 1000);
	var interval = seconds / 31536000;
	if (interval > 1) {
		return `Hace ${Math.floor(interval)} ${(Math.floor(interval) > 1) ? 'años' : 'año'}`;
	}
	interval = seconds / 2592000;
	if (interval > 1) {
		return `Hace ${Math.floor(interval)} ${(Math.floor(interval) > 1) ? 'meses' : 'mes'}`;
	}
	interval = seconds / 86400;
	if (interval > 1) {
		return `Hace ${Math.floor(interval)} ${(Math.floor(interval) > 1) ? 'días' : 'día'}`;
	}
	interval = seconds / 3600;
	if (interval > 1) {
		return `Hace ${Math.floor(interval)} ${(Math.floor(interval) > 1) ? 'horas' : 'hora'}`;
	}
	interval = seconds / 60;
	if (interval > 1) {
		return `Hace ${Math.floor(interval)} ${(Math.floor(interval) > 1) ? 'minutos' : 'minuto'}`;
	}
	return `Hace ${Math.floor(seconds)} ${(Math.floor(seconds) > 1) ? 'segundos' : 'segundo'}`;
}

window.addEventListener("load", function () {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", '/api/posts');
	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			//alert(JSON.parse(xhr.response).length);
			prepareHTML(JSON.parse(xhr.response));
		}
	}

	xhr.send();
});

document.addEventListener('click', function (event) {
	if (event.target.className === 'material-icons') {
		event.preventDefault();
		const row = event.target.parentElement.parentElement.parentElement;
		const id = event.target.parentElement.getAttribute('data-id');

		let xhr = new XMLHttpRequest();
		xhr.open("DELETE", `/api/posts/${id}`, true);
		//xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

		xhr.onreadystatechange = function () {
			if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
				row.remove();
			}
		}

		xhr.send();
	}
});
