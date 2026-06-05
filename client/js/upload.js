// frontend/js/upload.js
document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('imageFile');
    const uploadMessage = document.getElementById('uploadMessage');
    const previewImage = document.getElementById('previewImage');

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const token = localStorage.getItem('token');
            if (!token) {
                alert('You must be logged in to upload photos.');
                window.location.href = 'sign-in.html';
                return;
            }

            if (!fileInput.files.length) {
                alert('Please select an image to upload.');
                return;
            }

            const formData = new FormData();
            formData.append('image', fileInput.files[0]); // 'image' must match the field name in multer

            uploadMessage.textContent = 'Uploading and processing...';
            uploadMessage.style.color = 'blue';

            try {
                const response = await fetch('http://localhost:5000/api/photos/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Send token for authentication
                    },
                    body: formData, // Multer handles multipart/form-data, no 'Content-Type' header needed here
                });

                const data = await response.json();

                if (response.ok) {
                    uploadMessage.textContent = `Upload initiated: ${data.message}`;
                    uploadMessage.style.color = 'green';
                    alert('Photo uploaded successfully! Check your points later.');
                    // Clear form
                    uploadForm.reset();
                    previewImage.src = '';
                    previewImage.style.display = 'none';
                } else {
                    uploadMessage.textContent = data.message || 'Photo upload failed.';
                    uploadMessage.style.color = 'red';
                    if (response.status === 401 || response.status === 403) {
                        alert('Session expired or unauthorized. Please log in again.');
                        localStorage.clear();
                        window.location.href = 'sign-in.html';
                    }
                }
            } catch (error) {
                console.error('Error during photo upload:', error);
                uploadMessage.textContent = 'An error occurred during upload. Please try again.';
                uploadMessage.style.color = 'red';
            }
        });

        // Event listener for file input change to show preview
        fileInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewImage.src = e.target.result;
                    previewImage.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                previewImage.src = '';
                previewImage.style.display = 'none';
            }
        });
    }
});