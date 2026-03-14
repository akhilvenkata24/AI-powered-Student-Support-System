from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import os
import subprocess
import uuid

app = Flask(__name__)
CORS(app)

# Note: Update this path to where your SadTalker inference.py script actually is
SADTALKER_PATH = os.path.join(os.path.dirname(__file__), "SadTalker")
TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp_sadtalker")

os.makedirs(TEMP_DIR, exist_ok=True)

@app.route('/api/render', methods=['POST'])
def render_video():
    try:
        data = request.json
        image_base64 = data.get('image') # format: data:image/png;base64,...
        audio_base64 = data.get('audio') # format: data:audio/mp3;base64,...

        if not image_base64 or not audio_base64:
            return jsonify({"success": False, "error": "Missing image or audio"}), 400

        # Generate unique IDs for this request
        req_id = str(uuid.uuid4())
        
        # Strip header
        if "," in image_base64:
            image_base64 = image_base64.split(",")[1]
        if "," in audio_base64:
            audio_base64 = audio_base64.split(",")[1]

        image_path = os.path.join(TEMP_DIR, f"{req_id}.png")
        audio_path = os.path.join(TEMP_DIR, f"{req_id}.wav")

        with open(image_path, "wb") as fh:
            fh.write(base64.b64decode(image_base64))
        
        with open(audio_path, "wb") as fh:
            fh.write(base64.b64decode(audio_base64))

        # Output folder for SadTalker
        results_dir = os.path.join(TEMP_DIR, f"results_{req_id}")
        
        # SadTalker Command
        # Note: You may need to specify the full path to your conda python environment instead of just "python"
        command = [
            "python", os.path.join(SADTALKER_PATH, "inference.py"),
            "--driven_audio", audio_path,
            "--source_image", image_path,
            "--result_dir", results_dir,
            "--still",
            "--preprocess", "full",
            "--enhancer", "gfpgan"
        ]

        print(f"Running SadTalker for {req_id}...")
        
        # Execute SadTalker
        process = subprocess.run(command, capture_output=True, text=True)
        
        if process.returncode != 0:
            print("SadTalker Error:", process.stderr)
            return jsonify({"success": False, "error": f"SadTalker process failed: {process.stderr}"}), 500

        # Find the generated video file inside the results_dir
        # SadTalker outputs mp4 files
        generated_files = os.listdir(results_dir)
        video_files = [f for f in generated_files if f.endswith('.mp4')]
        
        if not video_files:
            return jsonify({"success": False, "error": "SadTalker succeeded but no video was generated"}), 500
            
        video_path = os.path.join(results_dir, video_files[0])
        
        # Read the video file and convert back to base64
        with open(video_path, "rb") as video_file:
            video_encoded = base64.b64encode(video_file.read()).decode('utf-8')
            
        video_data_uri = f"data:video/mp4;base64,{video_encoded}"
        
        # Cleanup temp files (optional but recommended)
        try:
            os.remove(image_path)
            os.remove(audio_path)
            # You might want to use shutil.rmtree(results_dir) later
        except Exception as e:
            pass

        return jsonify({"success": True, "videoUrl": video_data_uri})

    except Exception as e:
        print("API Error:", str(e))
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("Starting wrapper SadTalker Flask server on port 5001")
    app.run(port=5001, debug=True)
