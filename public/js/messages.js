let typing = false;
let lastTypingTime;
window.addEventListener("load", function () {

	socket.emit('join chat room', chatID);

	const typingIndicator = document.getElementById('typing-indicator');
	socket.on('user typing', () => {
		typingIndicator.hidden = false;
	});

	socket.on('user stopped typing', () => {
		typingIndicator.hidden = true;
	});

	let xhr = new XMLHttpRequest();
	xhr.open("GET", `/api/chat/${chatID}`);
	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			const response = JSON.parse(xhr.response);
			for (let i = 0; i < response.users.length; i++) {
				if (response.users[i]._id === userID) {
					response.users.splice(i, 1);
				}
			}
			showChatName(response);
			getMessagesOnLoad();
		}
	}

	xhr.send();

	markMessagesAsRead();
});

function markMessagesAsRead() {
	let xhr = new XMLHttpRequest();
	xhr.open("PUT", `/api/chat/${chatID}/markAsRead`);
	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
			getMessages();
		}
	}

	xhr.send();
}

function getMessagesOnLoad() {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", `/api/chat/${chatID}/messages`);
	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			const response = JSON.parse(xhr.response);
			outputMessageHTML(response);
		}
	}

	xhr.send();
}

function showChatName(chat) {
	const chatNameDisplay = document.getElementById('chatNameDisplay');
	const headerContainer = document.getElementById('header');

	if (chat.isGroupChat) {
		chatNameDisplay.textContent = chat.chatName || showChatUsersAsName(chat.users);
		const div = document.createElement('div');
		div.classList.add('float-right');
		div.innerHTML = `
			<input type="text" name="chatName" id="chatName" hidden>
			<i id='cancel-btn' class="btn material-icons" hidden>&#xe5c9;</i>
			<i id='done-btn' class="btn material-icons" hidden>&#xe876;</i>
		`;
		headerContainer.append(div);

		const chatName = document.getElementById('chatName');
		const cancelBtn = document.getElementById('cancel-btn');
		const doneBtn = document.getElementById('done-btn');

		chatNameDisplay.addEventListener('click', function (event) {
			event.preventDefault();

			chatName.value = chatNameDisplay.textContent.trim();
			chatNameDisplay.hidden = true;
			chatName.hidden = false;
			cancelBtn.hidden = false;
			doneBtn.hidden = false;
			chatName.focus();
		});

		cancelBtn.addEventListener('click', function (event) {
			event.preventDefault();

			chatNameDisplay.hidden = false;
			chatName.hidden = true;
			cancelBtn.hidden = true;
			doneBtn.hidden = true;
		});
		doneBtn.addEventListener('click', function (event) {
			event.preventDefault();
			const newChatName = chatName.value.trim();
			const data = {
				chatName: newChatName,
			}

			let xhr = new XMLHttpRequest();
			xhr.open("PUT", `/api/chat/${chatID}`, true);
			xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
			xhr.onreadystatechange = function () {
				if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
					location.reload();
				}
			}

			xhr.send(JSON.stringify(data));
		});

	} else {
		chatNameDisplay.textContent = showChatUsersAsName(chat.users);
	}
}

function showChatUsersAsName(users) {
	let chatUsersName = '';
	for (let i = 0; i < users.length; i++) {
		chatUsersName += `${users[i].username} `;
	}
	return chatUsersName;
}

document.getElementById('button-addon2').addEventListener('click', function (event) {
	event.preventDefault();

	submitMessage();
});

document.getElementById('input-addon2').addEventListener('keydown', function (event) {

	if (!typing) {
		typing = true;
		socket.emit('start typing', chatID);
	}
	lastTypingTime = new Date().getTime();
	setTimeout(() => {
		let currentTime = new Date().getTime();
		if ((currentTime - lastTypingTime) >= 3000) {
			typing = false;
			socket.emit('stop typing', chatID);
		}
	}, 3000);

	if (event.key === 'Enter') {
		submitMessage();
	}
});

function submitMessage() {
	const textField = document.getElementById('input-addon2');
	if (textField.value.trim() != '') {
		sendMessage(textField.value.trim());
		textField.value = '';
	}
}

function sendMessage(content) {
	typing = false;
	socket.emit('stop typing', chatID);

	const message = {
		content: content,
		chat: chatID,
	};

	let xhr = new XMLHttpRequest();
	xhr.open("POST", '/api/messages', true);
	xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 201) {
			const response = JSON.parse(xhr.response);
			outputMessageHTML(response);

			socket.emit('new message', response);
		}
	}

	xhr.send(JSON.stringify(message));
}

function outputMessageHTML(messages) {
	const messagesContainer = document.getElementById('messages');
	for (let i = 0; i < messages.length; i++) {
		const div = document.createElement('div');
		const messageBelongsToUser = messages[i].sender._id === userID;

		if (messageBelongsToUser) {
			div.classList.add('media', 'w-50', 'ml-auto', 'mb-3');
			div.innerHTML = `
			<div class="media-body">
				<div class="bg-primary rounded py-2 px-3 mb-2">
					<p class="text-small mb-0 text-white" style="word-wrap: anywhere;">${messages[i].content}</p>
				</div>
				<p class="small text-muted">${messages[i].createdAt}</p>
			</div>
		`;
		} else {
			div.classList.add('media', 'w-50', 'mb-3');
			div.innerHTML = `
			<a href="/profile/${messages[i].sender.username}">
			<img src="${messages[i].sender.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg'}" alt="user"
					width="50" class="rounded-circle">
					</a>
			<div class="media-body ml-3">
				<a href="/profile/${messages[i].sender.username}" class="small text-muted">${messages[i].sender.username}</a>
				<div class="bg-light rounded py-2 px-3 mb-2">
					<p class="text-small mb-0 text-muted" style="word-wrap: anywhere;">${messages[i].content}</p>
				</div>
				<p class="small text-muted">${messages[i].createdAt}</p>
			</div>
		`;
		}

		messagesContainer.append(div);
	}
	scrollToBottom();
}

function scrollToBottom() {
	const div = document.getElementById('messages');
	div.scrollTo(0, div.scrollHeight);
}
