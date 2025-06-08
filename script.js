document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('file');
    const bitrateSelect = document.getElementById('bitrate');
    const status = document.getElementById('status');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const file = fileInput.files[0];
        const bitrate = bitrateSelect.value;

        if (!file) {
            status.innerHTML = '<span style="color:red;">❌ لم يتم اختيار ملف.</span>';
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('bitrate', bitrate);

        try {
            const response = await fetch('https://mano3322.eu.pythonanywhere.com/convert', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                status.innerHTML = `<span style="color:red;">❌ ${data.error}</span>`;
                return;
            }

            status.innerHTML = '';

            if (data.files) {
                data.files.forEach(url => {
                    const link = document.createElement('a');
                    link.href = 'https://mano3322.eu.pythonanywhere.com/' + url;
                    link.innerText = '🔉 تحميل الملف';
                    link.target = '_blank';
                    status.appendChild(link);
                });
            }

            if (data.zip) {
                const zipLink = document.createElement('a');
                zipLink.href = 'https://mano3322.eu.pythonanywhere.com/' + data.zip;
                zipLink.innerText = '📦 تحميل جميع الملفات';
                zipLink.target = '_blank';
                status.appendChild(zipLink);
            }

        } catch (error) {
            console.error(error);
            status.innerHTML = '<span style="color:red;">❌ فشل الاتصال بالسيرفر.</span>';
        }
    });
});
