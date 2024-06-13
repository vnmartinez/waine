from flask import Flask, render_template, request, jsonify, redirect, url_for
import os
import time
import uuid
import google.generativeai as generativeai
from PIL import Image
import requests

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'Nenhuma imagem foi enviada.'}), 400
        
        image_file = request.files['image']
        if image_file.filename == '':
            return jsonify({'error': 'Nenhum arquivo selecionado para upload.'}), 400

        text = " Esta imagem contem a foto de um rótulo de vinho. Dada a imagem, descreva qual vinho é, qual uva, quais as características do vinho e quais as harmonizações possíveis do vinho. Caso a imagem não seja um rótulo de vinho, informe que não pode reconhecer um rótulo de vinho na imagem. Retorne tudo em formato JSON"

        timestamp = int(time.time())
        unique_id = str(uuid.uuid4())[:8]
        image_filename = f'captured_image_{timestamp}_{unique_id}.png'
        image_path = os.path.join('uploads', image_filename)

        image_file.save(image_path)

        image = Image.open(image_path)

        GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
        if not GOOGLE_API_KEY:
            return jsonify({'error': 'A chave da API do Google não foi configurada.'}), 500

        generativeai.configure(api_key=GOOGLE_API_KEY)
        model = generativeai.GenerativeModel('gemini-1.5-flash')

        response = model.generate_content([text, image])

        if not response:
            return jsonify({'error': 'Erro ao chamar a API.'}), 500
        else:
            response_text = response.text
            if os.path.exists(image_path):
                try:
                    os.remove(image_path)
                except Exception as e:
                    print(f'Erro ao remover {image_path}: {str(e)}')
                finally:
                    return jsonify({'result_text': response_text})
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    finally:
        if os.path.exists(image_path):
            try:
                os.remove(image_path)
            except Exception as e:
                print(f'Erro ao remover {image_path}: {str(e)}')

@app.route('/result')
def show_result():
    result_text = request.args.get('result', '')
    return render_template('result.html', result_text=result_text)

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    app.run( port=os.getenv("PORT", default=5000))