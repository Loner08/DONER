from flask import Flask, render_template, send_from_directory
import json
import os

app = Flask(__name__)

DATA_FILE = 'data.json'

def load_data():
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
    except:
        pass
    return {'total': 0, 'table1': [0]*8, 'table2': [0]*8}

def save_data(data):
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f)
    except:
        pass

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Добавьте этот маршрут
@app.route('/service-worker.js')
def serve_service_worker():
    return send_from_directory('static', 'service-worker.js', mimetype='application/javascript')

if __name__ == '__main__':
    os.makedirs('static', exist_ok=True)
    os.makedirs('templates', exist_ok=True)
    
    print("Сервер запускается на http://localhost:5000")
    print("Откройте в браузере: http://localhost:5000")
    app.run(debug=True, port=5000)