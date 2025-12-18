from flask import Flask, render_template, send_from_directory
import json
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

if __name__ == '__main__':
    # Создаем папки если их нет
    os.makedirs('static', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    print("Сервер запускается на http://localhost:5001")
    print("Откройте в браузере: http://localhost:5001")
    app.run(debug=True, port=5001)