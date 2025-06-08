
from flask import Flask, request, send_from_directory, redirect, url_for
from flask import render_template_string
from pydub import AudioSegment
import os
import uuid
import zipfile

# إعداد ffmpeg
AudioSegment.converter = 'ffmpeg'

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
OUTPUT_FOLDER = os.path.join(BASE_DIR, 'converted')
ZIP_FOLDER = os.path.join(BASE_DIR, 'archives')

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs(ZIP_FOLDER, exist_ok=True)

def load_template(name):
    with open(os.path.join(BASE_DIR, name), encoding='utf-8') as f:
        return f.read()

@app.route('/')
def index():
    html = load_template('index.html')
    return render_template_string(html)

@app.route('/upload', methods=['POST'])
def upload_files():
    if 'audiofile' not in request.files:
        return "❌ لم يتم رفع أي ملف"

    files = request.files.getlist('audiofile')
    if not files or len(files) == 0:
        return "❌ لم يتم اختيار ملفات"

    if len(files) > 200:
        return "❌ الحد الأقصى هو 200 ملف"

    output_format = request.form.get('format', 'mp3')
    bitrate = request.form.get('bitrate', '192k')

    converted_files = []
    batch_id = str(uuid.uuid4())

    for file in files:
        if file.filename == '':
            continue

        input_ext = os.path.splitext(file.filename)[1]
        unique_id = str(uuid.uuid4())
        input_filename = f"{unique_id}{input_ext}"
        input_path = os.path.join(UPLOAD_FOLDER, input_filename)
        file.save(input_path)

        try:
            audio = AudioSegment.from_file(input_path)
            output_filename = f"{unique_id}.{output_format}"
            output_path = os.path.join(OUTPUT_FOLDER, output_filename)
            audio.export(output_path, format=output_format, bitrate=bitrate)
            converted_files.append(output_filename)
        except Exception as e:
            print(f"خطأ في الملف {file.filename}: {e}")

    # إنشاء أرشيف ZIP
    zip_name = f"{batch_id}.zip"
    zip_path = os.path.join(ZIP_FOLDER, zip_name)
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for fname in converted_files:
            fpath = os.path.join(OUTPUT_FOLDER, fname)
            zipf.write(fpath, arcname=fname)

    html = load_template('done_multi.html')
    return render_template_string(html, files=converted_files, zip_name=zip_name)

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(OUTPUT_FOLDER, filename, as_attachment=True)

@app.route('/download_zip/<zipname>')
def download_zip(zipname):
    return send_from_directory(ZIP_FOLDER, zipname, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
