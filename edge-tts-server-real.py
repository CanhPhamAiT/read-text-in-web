"""
Edge-TTS Server - Vietnamese TTS using Microsoft Edge TTS
This is the real edge-tts implementation (not gTTS fallback)
"""

import os
import asyncio
import io
from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import edge_tts

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

# Available voices
VOICES = {
    'vi-VN-HoaiMyNeural': {'name': 'Hoài My (Nữ)', 'lang': 'vi', 'gender': 'female'},
    'vi-VN-NamMinhNeural': {'name': 'Nam Minh (Nam)', 'lang': 'vi', 'gender': 'male'},
    'en-US-JennyNeural': {'name': 'Jenny (English)', 'lang': 'en', 'gender': 'female'},
}

DEFAULT_VOICE = os.environ.get('DEFAULT_VOICE', 'vi-VN-HoaiMyNeural')


async def generate_audio_async(text: str, voice: str = DEFAULT_VOICE):
    """Generate audio using edge-tts"""
    communicate = edge_tts.Communicate(text, voice)
    audio_data = io.BytesIO()
    
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.write(chunk["data"])
    
    audio_data.seek(0)
    return audio_data.getvalue()


def generate_audio(text: str, voice: str = DEFAULT_VOICE):
    """Synchronous wrapper for async function"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    return loop.run_until_complete(generate_audio_async(text, voice))


@app.route('/api/tts', methods=['GET', 'POST'])
def tts():
    """TTS endpoint"""
    if request.method == 'GET':
        text = request.args.get('text', '')
        voice = request.args.get('voice', DEFAULT_VOICE)
        rate = request.args.get('rate', '1.0')
    else:
        data = request.get_json(silent=True) or {}
        text = data.get('text', request.form.get('text', ''))
        voice = data.get('voice', DEFAULT_VOICE)
        rate = data.get('rate', '1.0')
    
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
        # Edge-TTS supports rate parameter
        # Format: +50% (faster) or -50% (slower)
        rate_percent = f"+{(float(rate) - 1.0) * 100:.0f}%"
        
        # Generate audio with rate
        communicate = edge_tts.Communicate(text, voice, rate=rate_percent)
        audio_data = io.BytesIO()
        
        loop = asyncio.get_event_loop()
        async def stream_audio():
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_data.write(chunk["data"])
            audio_data.seek(0)
        
        loop.run_until_complete(stream_audio())
        
        if not audio_data.getvalue():
            return jsonify({'error': 'No audio generated'}), 500
        
        return Response(audio_data.getvalue(), mimetype='audio/mpeg')
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
    response = jsonify({'status': 'ok', 'engine': 'edge-tts'})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))
    print(f"Starting Edge-TTS Server...")
    print(f"Default voice: {DEFAULT_VOICE}")
    print(f"Available voices: {list(VOICES.keys())}")
    print(f"Port: {port}")
    app.run(host='0.0.0.0', port=port, threaded=True)

