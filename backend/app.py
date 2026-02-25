import os
import time
from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'drone-secret-88')
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

# AI Drone System Status
system_status = {
    "armed": False,
    "mode": "STABILIZE",
    "battery": 100,
    "gps": {"lat": 0.0, "lon": 0.0, "alt": 0.0},
    "vision_targets": []
}

@app.route('/api/status', methods=['GET'])
def get_status():
    return jsonify(system_status)

@socketio.on('connect')
def handle_connect():
    print('Client connected to Drone Platform')
    emit('status_update', system_status)

@socketio.on('mission_start')
def handle_mission_start(data):
    print(f"Starting mission: {data}")
    emit('notification', {'message': 'Mission execution started', 'type': 'info'})

def telemetry_stream():
    """Background task to simulate or fetch telemetry data."""
    while True:
        # This will be updated by mavlink_manager later
        socketio.emit('telemetry', system_status)
        socketio.sleep(1)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
