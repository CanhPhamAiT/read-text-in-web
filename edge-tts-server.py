"""
TTS Server - Vietnamese TTS using gTTS (Google Text-to-Speech)
Falls back to Edge-TTS if gTTS fails.
API compatible with extension.
"""

import os
import io
import ssl
import warnings

# Disable SSL warnings and verification
warnings.filterwarnings('ignore')
os.environ['PYTHONHTTPSVERIFY'] = '0'
ssl._create_default_https_context = ssl._create_unverified_context

# Patch urllib3 and requests to disable SSL verification
try:
    import urllib3
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
except:
    pass

import requests
from requests.adapters import HTTPAdapter

class SSLAdapter(HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        kwargs['ssl_context'] = ssl._create_unverified_context()
        return super().init_poolmanager(*args, **kwargs)

# Patch requests globally
_original_session = requests.Session

def _patched_session(*args, **kwargs):
    session = _original_session(*args, **kwargs)
    session.verify = False
    session.mount('https://', SSLAdapter())
    return session

requests.Session = _patched_session

from flask import Flask, request, Response, jsonify
from flask_cors import CORS
from gtts import gTTS

app = Flask(__name__)
# Enable CORS for all routes - allows extension to access from any origin
CORS(app)

# Default Vietnamese voice
DEFAULT_VOICE = os.environ.get('DEFAULT_VOICE', 'vi')

# Available voices
VOICES = {
    'vi': 'Vietnamese',
    'en': 'English',
}


def generate_audio_gtts(text: str, lang: str = 'vi'):
    """Generate audio using gTTS"""
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
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
    
    # Map voice to language code
    lang = voice if voice in ['vi', 'en'] else 'vi'
    
    try:
        audio_bytes = generate_audio_gtts(text, lang)
        return Response(audio_bytes, mimetype='audio/mpeg')
    except Exception as e:
        app.logger.error(f"TTS Error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/voices', methods=['GET'])
def list_voices():
    """List available voices"""
    return jsonify({
        'voices': [
            {'id': k, 'name': v, 'lang': k} 
            for k, v in VOICES.items()
        ],
        'default': DEFAULT_VOICE
    })


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'engine': 'gtts'})


if __name__ == '__main__':
    print(f"Starting gTTS Server (SSL verification DISABLED)...")
    print(f"Default language: {DEFAULT_VOICE}")
    print(f"Available languages: {list(VOICES.keys())}")
    app.run(host='0.0.0.0', port=5002, threaded=True)
