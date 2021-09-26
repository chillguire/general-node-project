const element = document.getElementById('inputUser');
if (element) {
	let timer;
	document.getElementById('submit').disabled = true;
	const selectedUsers = [];

	element.addEventListener('keydown', function (event) {
		clearTimeout(timer);
		let value = event.target.value;

		timer = setTimeout(function () {
			value = event.target.value.trim();
			if (!value) {
				let container = document.getElementById('results');
				container.innerHTML = '';
			} else {
				search(value);
			}
		}, 500);
	});

	function search(searchTerm) {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", `/api/users?searchTerm=${searchTerm}`);
		xhr.onreadystatechange = function () {
			if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
				outputData(JSON.parse(xhr.response));
			}
		}
		xhr.send();
	}

	function outputData(data) {
		let container = document.getElementById('results');
		container.innerHTML = '';

		if (data.length === 0) {
			let div = document.createElement('div');
			div.innerHTML = 'No results';
			return container.insertBefore(div, container.firstChild);
		}

		for (let i = 0; i < data.length; i++) {
			const userAlreadySelected = selectedUsers.some(item => item._id === data[i]._id);
			if ((data[i]._id === userID) || userAlreadySelected) {
				continue;
			}

			let div = document.createElement('div');
			div.innerHTML = `
				<p>${data[i].username}</p>
			`;
			div.onclick = function () {
				selectedUser(data[i]);
			}
			container.insertBefore(div, container.firstChild);
		}
	}

	function selectedUser(user) {
		selectedUsers.push(user);
		updateSelectedUsers();
		element.value = '';
		element.focus();
		document.getElementById('results').innerHTML = '';
		document.getElementById('submit').disabled = false;
	}

	function updateSelectedUsers() {
		let container = document.getElementById('selectedUsers');
		container.innerHTML = '';

		if (selectedUsers.length === 0) {
			document.getElementById('submit').disabled = true;
		}

		for (let i = 0; i < selectedUsers.length; i++) {
			let element = document.createElement('span');
			element.classList.add('mx-2', 'p-2', 'bg-dark', 'text-white', 'selected-user', 'btn');
			element.setAttribute('index', i);
			element.innerHTML = selectedUsers[i].username;
			container.insertBefore(element, container.firstChild);
		}
	}

	document.getElementById('selectedUsers').addEventListener('click', function (event) {
		if (event.target.classList.contains('selected-user')) {
			const index = event.target.getAttribute("index");
			selectedUsers.splice(index, 1);
			updateSelectedUsers();
		}
	});

	document.getElementById('submit').addEventListener('click', function (event) {
		event.preventDefault();

		if (selectedUsers.length === 0) return alert('Invalid chat users');

		const selectedUsersIds = [];
		for (let i = 0; i < selectedUsers.length; i++) {
			selectedUsersIds[i] = selectedUsers[i]._id;
		}

		const data = {
			users: selectedUsersIds,
		};
		let xhr = new XMLHttpRequest();
		xhr.open("POST", '/api/chat', true);
		xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		xhr.onreadystatechange = function () {
			if (this.readyState === XMLHttpRequest.DONE && (this.status === 201 || this.status === 200)) {
				const response = JSON.parse(xhr.response);
				window.location.href = `/chats/${response._id}`
			}
		}

		xhr.send(JSON.stringify(data));
	});
} else {
	window.addEventListener("load", function () {
		let xhr = new XMLHttpRequest();
		xhr.open("GET", '/api/chat');
		xhr.onreadystatechange = function () {
			if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
				prepareHTML(JSON.parse(xhr.response));
			}
		}

		xhr.send();
	});

	function prepareHTML(data) {

		if (data.length === 0) {
			return alert('no chats');
		}

		let container = document.getElementById('results');
		for (let i = 0; i < data.length; i++) {
			let child = document.createElement('a');
			child.href = `/chats/${data[i]._id}`;
			child.classList.add('list-group-item', 'list-group-item-action', 'rounded-0', 'btn');

			for (let j = 0; j < data[i].users.length; j++) {
				if (data[i].users[j]._id === userID) {
					data[i].users.splice(j, 1);
				}
			}
			const chatName = (data[i].isGroupChat) ? (data[i].chatName || `${data[i].users[0].username}, ${data[i].users[1].username}...`) : data[i].users[0].username;
			const image = (data[i].isGroupChat) ? 'https://www.shareicon.net/data/512x512/2015/11/01/665405_users_512x512.png' : data[i].users[0].avatar;
			const latestMessage = (data[i].latestMessage) ? `${data[i].latestMessage.sender.username}: ${data[i].latestMessage.content}` : '';

			child.innerHTML = `
				<div class="media"><img
						src="${image || 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg'}"
						alt="user" width="50" class="rounded-circle">
					<div class="media-body ml-4">
						<div class="d-flex align-items-center justify-content-between mb-1">
							<h6 class="mb-0">${chatName}</h6><small class="small font-weight-bold">${data[i].updatedAt}</small>
						</div>
						<p class="font-italic mb-0 text-small">${latestMessage}</p>
					</div>
				</div>
				`

			container.insertBefore(child, container.firstChild);
		}
	}
}
