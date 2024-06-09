from flask import Flask, render_template, request, jsonify
import requests

AI_STUDIO_API_KEY = 'AIzaSyD8AfZZkTNsXntJ0zfIUpGLLRQgOf8gZI4'

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    image_data = request.files['image']
    text = 'Seu texto fixo aqui'  

    
    files = {'image': image_data.read()}
    headers = {'x-api-key': AI_STUDIO_API_KEY, 'Content-Type': 'application/json'}
    data = {'text': text}
    response = requests.post('https://api.aistudio.ai/your_model_endpoint', files=files, headers=headers, data=data)

    if response.status_code == 200:
        result = response.json()
        
        return jsonify(result)
    else:
        return 'Erro ao enviar imagem para o AI Studio', 500

if __name__ == '__main__':
    app.run(debug=True)
