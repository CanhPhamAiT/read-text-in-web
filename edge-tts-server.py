"""
TTS Server - Vietnamese TTS 
Uses gTTS (Google) as primary engine since edge-tts has SSL issues with corporate proxy.
API compatible with extension.
"""

import os
import io
import ssl
import warnings

# Disable SSL warnings
warnings.filterwarnings('ignore')
os.environ['PYTHONHTTPSVERIFY'] = '0'
ssl._create_default_https_context = ssl._create_unverified_context

try:
    import urllib3
    urllib3.disable_warnings()
except:
    pass

from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from gtts import gTTS

app = Flask(__name__)
# Allow all origins for extension and web access
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)

# Explicit OPTIONS handler for all routes (for Railway reverse proxy)
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = Response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Max-Age", "3600")
        return response

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response

# Available voices (names for UI, but using gTTS backend)
VOICES = {
    'vi-VN-HoaiMyNeural': {'name': 'Hoài My (Nữ)', 'lang': 'vi', 'gender': 'female'},
    'vi-VN-NamMinhNeural': {'name': 'Nam Minh (Nam)', 'lang': 'vi', 'gender': 'male'},
    'en-US-JennyNeural': {'name': 'Jenny (English)', 'lang': 'en', 'gender': 'female'},
}

DEFAULT_VOICE = os.environ.get('DEFAULT_VOICE', 'vi-VN-HoaiMyNeural')


def generate_audio(text: str, voice: str = DEFAULT_VOICE):
    """Generate audio using gTTS"""
    # Map voice to language
    voice_info = VOICES.get(voice, VOICES[DEFAULT_VOICE])
    lang = voice_info['lang']
    
    tts = gTTS(text=text, lang=lang, slow=False)
    audio_data = io.BytesIO()
    tts.write_to_fp(audio_data)
    audio_data.seek(0)
    return audio_data.getvalue()


@app.route('/api/tts', methods=['GET', 'POST'])
def tts():
    """TTS endpoint"""
    if request.method == 'GET':
        text = request.args.get('text', '')
        voice = request.args.get('voice', DEFAULT_VOICE)
    else:
        data = request.get_json(silent=True) or {}
        text = data.get('text', request.form.get('text', ''))
        voice = data.get('voice', DEFAULT_VOICE)
    
    if not text or not text.strip():
        return jsonify({'error': 'No text provided'}), 400
    
    # Map short voice codes to full names
    voice_map = {
        'vi': 'vi-VN-HoaiMyNeural',
        'vi-female': 'vi-VN-HoaiMyNeural',
        'vi-male': 'vi-VN-NamMinhNeural',
        'en': 'en-US-JennyNeural',
    }
    voice = voice_map.get(voice, voice)
    
    # Validate voice
    if voice not in VOICES:
        voice = DEFAULT_VOICE
    
    try:
        audio_bytes = generate_audio(text, voice)
        if not audio_bytes:
            return jsonify({'error': 'No audio generated'}), 500
        return Response(audio_bytes, mimetype='audio/mpeg')
    except Exception as e:
        app.logger.error(f"TTS Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/voices', methods=['GET'])
def list_voices():
    """List available voices"""
    return jsonify({
        'voices': [
            {'id': k, 'name': v['name'], 'lang': v['lang'], 'gender': v['gender']} 
            for k, v in VOICES.items()
        ],
        'default': DEFAULT_VOICE
    })


@app.route('/health', methods=['GET', 'OPTIONS'])
def health():
    """Health check endpoint"""
    if request.method == 'OPTIONS':
        response = Response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Max-Age", "3600")
        return response
    
    # GET request - return JSON with CORS headers
    response = jsonify({'status': 'ok', 'engine': 'gtts'})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response


if __name__ == '__main__':
    print(f"Starting TTS Server (gTTS backend)...")
    print(f"Default voice: {DEFAULT_VOICE}")
    print(f"Available voices: {list(VOICES.keys())}")
    print(f"Note: Using gTTS due to corporate proxy SSL issues with edge-tts")
    app.run(host='0.0.0.0', port=5002, threaded=True)
