document.getElementById('imageUpload').addEventListener('change', function (event) {
    if (this.files && this.files[0]) {
        var imgBlob = this.files[0]; // Get the image as Blob
        console.log(imgBlob);

        // Create a FormData object
        var formData = new FormData();
        // Append the image blob to the FormData object
        formData.append('image', imgBlob);

        // Fetch API to send the image blob to the server
        // fetch('http://localhost:5002/verification', {
        fetch('http://localhost:5002/verification', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
});
