(function ($) {
    "use strict";


    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.validate-form').on('submit', function () {
        var check = true;

        for (var i = 0; i < input.length; i++) {
            if (validate(input[i]) == false) {
                showValidate(input[i]);
                check = false;
            }
        }

        return check;
    });


    $('.validate-form .input100').each(function () {
        $(this).focus(function () {
            hideValidate(this);
        });
    });

    function validate(input) {
        if ($(input).attr('type') == 'email' || $(input).attr('name') == 'email') {
            if ($(input).val().trim().match(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{1,5}|[0-9]{1,3})(\]?)$/) == null) {
                return false;
            }
        }
        else {
            if ($(input).val().trim() == '') {
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }



})(jQuery);

let connected = false;
let socket = io('/');

socket.emit('setup', userID);

socket.on('connected', () => {
    connected = true;
});

socket.on('message received', (message) => {
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {

        for (let i = 0; i < message.length; i++) {
            const div = document.createElement('div');
            const messageBelongsToUser = message[i].sender._id === userID;

            if (messageBelongsToUser) {
                div.classList.add('media', 'w-50', 'ml-auto', 'mb-3');
                div.innerHTML = `
			<div class="media-body">
				<div class="bg-primary rounded py-2 px-3 mb-2">
					<p class="text-small mb-0 text-white" style="word-wrap: anywhere;">${message[i].content}</p>
				</div>
				<p class="small text-muted">${message[i].createdAt}</p>
			</div>
		`;
            } else {
                div.classList.add('media', 'w-50', 'mb-3');
                div.innerHTML = `
			<a href="/profile/${message[i].sender.username}">
			<img src="${message[i].sender.avatar || 'https://thumbs.dreamstime.com/b/default-avatar-profile-icon-vector-social-media-user-portrait-176256935.jpg'}" alt="user"
					width="50" class="rounded-circle">
					</a>
			<div class="media-body ml-3">
				<a href="/profile/${message[i].sender.username}" class="small text-muted">${message[i].sender.username}</a>
				<div class="bg-light rounded py-2 px-3 mb-2">
					<p class="text-small mb-0 text-muted" style="word-wrap: anywhere;">${message[i].content}</p>
				</div>
				<p class="small text-muted">${message[i].createdAt}</p>
			</div>
		`;
            }

            messagesContainer.append(div);
        }
        scrollToBottom();
    } else {
        showMessagePopup(message);
    }
});

function showMessagePopup(message) {
    const div = document.createElement("div");
    div.setAttribute('id', 'message-alert-container');
    div.innerHTML = `
        <a id='message-alert' href="/chats/${message[0].chat._id}" class="alert-fixed alert alert-info alert-dismissible fade show" role="alert">
            <h4 class="alert-heading">${message[0].sender.username}</h4>
            <p>${message[0].content}</p>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
        </a>
    `
    document.body.appendChild(div);
    setTimeout(() => {
        $("#message-alert").alert('close');
        document.getElementById('message-alert-container').remove();
    }, 3000);
}

socket.on('notification received', (notification) => {
    getMessages();
});

// function emitNotification(users) {
//     socket.emit('notification', users);
// }

function scrollToBottom() {
    const div = document.getElementById('messages');
    div.scrollTo(0, div.scrollHeight);
}

function getMessages() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", '/api/notifications');
    xhr.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
            refreshMessageBadge(JSON.parse(xhr.response));
        }
    }

    xhr.send();
}

function refreshMessageBadge(notifications) {
    if (notifications.length !== 0) {
        return document.getElementById('message-badge').innerText = notifications.length;
    }
}

