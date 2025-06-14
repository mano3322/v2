document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('audioFile');
    const bitrate = document.getElementById('bitrate').value;

    if (fileInput.files.length === 0) {
        alert('من فضلك اختر ملف صوتي');
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('bitrate', bitrate); // إرسال البت ريت للباك اند

    fetch('https://mano3322.eu.pythonanywhere.com/convert', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert('حدث خطأ: ' + data.error);
        } else {
            const downloadLink = document.getElementById('downloadLink');
            downloadLink.href = data.converted_file;
            downloadLink.style.display = 'block';
            downloadLink.textContent = 'تحميل الملف المحول';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('حدث خطأ أثناء رفع الملف.');
    });
});
