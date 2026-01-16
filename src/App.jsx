import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para converter arquivo em GenerativePart (formato que a IA aceita)
  async function fileToGenerativePart(file) {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(''); // Limpa resultado anterior
    }
  };

  const identifyPlant = async () => {
    if (!apiKey) {
      alert("Por favor, insira sua API Key do Gemini.");
      return;
    }
    if (!image) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

      const prompt = "Analise a imagem dessa planta e gere uma tabela com 3 colunas: 'Nome da Planta', 'Características Principais' e 'Plantas Parecidas' (onde você coloca nomes de plantas que têm características semelhantes). Se a imagem não for de uma planta, avise.";

      const imagePart = await fileToGenerativePart(image);
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      setResult(text);
    } catch (error) {
      console.error(error);
      setResult("Erro ao identificar a planta. Verifique sua API Key ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🌿 Planta Aqui</h1>
        <p>Descubra o mundo botânico com IA</p>
      </header>

      <div className="card">
        <div className="input-group">
          <label>Sua API Key do Gemini:</label>
          <input
            type="password"
            placeholder="Cole sua chave aqui..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        <div className="upload-area">
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg"
            id="file-upload"
            onChange={handleImageChange}
            hidden
          />
          <label htmlFor="file-upload" className="upload-btn">
            {preview ? "Trocar Imagem" : "Escolher Foto da Planta"}
          </label>
        </div>

        {preview && (
          <div className="preview-container">
            <img src={preview} alt="Prévia" className="preview-img" />
            <button
              onClick={identifyPlant}
              disabled={loading}
              className="analyze-btn"
            >
              {loading ? "Consultando a natureza..." : "Identificar Planta 🌱"}
            </button>
          </div>
        )}

        {result && (
          <div className="result-area">
            {/* Renderiza a tabela Markdown de forma bonita */}
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;