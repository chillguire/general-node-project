window.addEventListener("load", function () {
	let xhr = new XMLHttpRequest();
	xhr.open("GET", `/api/posts?createdBy=${profileUserID}`);
	xhr.onreadystatechange = function () {
		if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
			//alert(JSON.parse(xhr.response).length);
			prepareHTML(JSON.parse(xhr.response));
		}
	}

	xhr.send();
});


function prepareHTML(data) {
	let postContainer = document.getElementById('posts-container');

	for (let i = 0; i < data.length; i++) {
		let div = document.createElement('div');
		div.classList.add("card-block");

		div.innerHTML = `
				<h6 class="m-b-20 p-b-5 b-b-default f-w-600">${data[i].content}</h6>
	<div class="row">
		<div class="col-sm-6">
			<p class="text-muted f-w-400">${data[i].createdAt}</p>
		</div>
	</div>
			`;
		postContainer.insertBefore(div, postContainer.firstChild);
	}
}

let cropper;
document.getElementById('userPhotoFile').addEventListener('change', function (event) {
	if (event.target.files && event.target.files[0]) {
		const reader = new FileReader();
		reader.onload = function (e) {
			const imgPreview = document.getElementById('imagePreview');
			imgPreview.setAttribute('src', e.target.result);

			cropper = new Cropper(imgPreview, {
				aspectRatio: 1 / 1,
				viewMode: 1,
			});
		}
		reader.readAsDataURL(event.target.files[0]);
	}
});

document.getElementById('btn-submit-image').addEventListener('click', function (event) {
	const canvas = cropper.getCroppedCanvas();

	if (!canvas) {
		alert('Could not upload image.');
	}

	canvas.toBlob(function (blob) {
		const formData = new FormData();
		formData.append('avatar', blob);

		let xhr = new XMLHttpRequest();
		xhr.open("POST", '/api/profile/avatar', true);
		xhr.onreadystatechange = function () {
			if (this.readyState === XMLHttpRequest.DONE && this.status === 204) {
				location.reload();
			}
		}

		xhr.send(formData);
	});
});
