document.getElementById('uploadButton').addEventListener('click', function () {
    var fileInput = document.getElementById('fileInput');
    var file = fileInput.files[0];

    if (!file) {
        alert('Please select a file!');
        return;
    }

    var formData = new FormData();
    formData.append('image', file);

    fetch('http://localhost:5002/photo-edit', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('File uploaded successfully!');
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('An error occurred while uploading the file.');
        });
});
