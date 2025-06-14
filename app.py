from flask import Flask, request, jsonify
from flask_cors import CORS
from pydub import AudioSegment
import os
import time

app = Flask(__name__)
CORS(app, origins=["https://mano3322.github.io"])

UPLOAD_FOLDER = '/home/mano3322/mysite/uploads'
STATIC_FOLDER = '/home/mano3322/mysite/static/converted'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(STATIC_FOLDER, exist_ok=True)

# Dictionary لتتبع تقدم كل طلب تحويل
progress = {}

@app.route('/')
def home():
    return 'Flask backend is running!'

@app.route('/convert', methods=['POST'])
def convert():
    global progress
    task_id = str(time.time())  # task ID فريد
    progress[task_id] = 0       # بداية النسبة 0%

    files = request.files.getlist('files')
    bitrate = request.form.get('bitrate', '192k')

    if len(files) > 20:
        return jsonify({'error': 'Maximum 20 files allowed'}), 400

    output_urls = []

    for idx, file in enumerate(files):
        filename = file.filename
        input_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(input_path)

        output_filename = f'output_{idx}.mp3'
        output_path = os.path.join(STATIC_FOLDER, output_filename)

        try:
            audio = AudioSegment.from_file(input_path)
            audio.export(output_path, format='mp3', bitrate=bitrate)
        except Exception as e:
            return jsonify({'error': str(e)}), 500

        # تحديث التقدم
        progress[task_id] = int(((idx + 1) / len(files)) * 100)

        output_urls.append(f'https://mano3322.eu.pythonanywhere.com/static/converted/{output_filename}')

    progress[task_id] = 100  # عند الانتهاء 100%
    return jsonify({'task_id': task_id, 'converted_files': output_urls})

@app.route('/progress/<task_id>', methods=['GET'])
def get_progress(task_id):
    percent = progress.get(task_id, 0)
    return jsonify({'progress': percent})
