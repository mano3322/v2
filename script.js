document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('audioFiles');
    const files = fileInput.files;
    const bitrate = document.getElementById('bitrate').value;
    const resultDiv = document.getElementById('result');
    const uploadBar = document.getElementById('uploadProgress');
    const uploadText = document.getElementById('uploadText');
    const convertBar = document.getElementById('convertProgress');
    const convertText = document.getElementById('convertText');

    if (files.length === 0) {
        alert('من فضلك اختر ملفات صوتية');
        return;
    }

    if (files.length > 20) {
        alert('يمكنك رفع 20 ملف كحد أقصى');
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }
    formData.append('bitrate', bitrate);

    uploadBar.style.display = 'block';
    uploadBar.value = 0;
    uploadText.textContent = 'جاري رفع الملفات...';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://mano3322.eu.pythonanywhere.com/convert', true);

    xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            uploadBar.value = percent;
            uploadText.textContent = `رفع الملفات: ${percent}%`;
        }
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
            uploadText.textContent = 'تم رفع الملفات! جاري التحويل...';
            const data = JSON.parse(xhr.responseText);
            const taskId = data.task_id;

            // اظهار progress للتحويل
            convertBar.style.display = 'block';
            convertBar.value = 0;
            convertText.textContent = 'جاري التحويل...';

            // check progress من السيرفر
            function checkProgress() {
                fetch(`https://mano3322.eu.pythonanywhere.com/progress/${taskId}`)
                .then(res => res.json())
                .then(progressData => {
                    const percent = progressData.progress;
                    convertBar.value = percent;
                    convertText.textContent = `تحويل الملفات: ${percent}%`;

                    if (percent < 100) {
                        setTimeout(checkProgress, 1000);
                    } else {
                        convertText.textContent = 'تم تحويل الملفات بنجاح!';
                        resultDiv.innerHTML = '';
                        data.converted_files.forEach((fileUrl, index) => {
                            const link = document.createElement('a');
                            link.href = fileUrl;
                            link.target = '_blank';
                            link.innerText = 'تحميل ملف ' + (index + 1);
                            resultDiv.appendChild(link);
                            resultDiv.appendChild(document.createElement('br'));
                        });
                    }
                });
            }

            checkProgress();
        } else {
            uploadText.textContent = 'حدث خطأ أثناء رفع الملفات.';
        }
    };

    xhr.send(formData);
});
