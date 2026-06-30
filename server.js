require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const { GoogleGenAI } = require("@google/genai");

const Message = require("./models/Message");

const app = express();

app.use(cors());
app.use(express.json());

const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("MongoDB conectado"))
.catch(err => console.log(err));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});
app.post("/chat", async (req, res) => {

  try {

    const { message, sessionId } = req.body;

    await Message.create({
      sessionId,
      role: "user",
      text: message
    });

    const history = await Message.find({ sessionId })
      .sort({ createdAt: 1 });

    const contents = history.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents
    });

    const botReply = response.text;

    await Message.create({
      sessionId,
      role: "assistant",
      text: botReply
    });

    res.json({
      reply: botReply
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Erro ao gerar resposta"
    });
  }

});
app.listen(process.env.PORT, () => {
  console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
// Rota para buscar o histórico de uma sessão específica
app.get("/historico/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Busca todas as mensagens da sessão ordenadas pela mais antiga
    const historico = await Message.find({ sessionId }).sort({ createdAt: 1 });
    
    res.json(historico);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});
// Rota para apagar todo o histórico de uma sessão específica
app.delete("/historico/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Deleta todas as mensagens com o sessionId correspondente
    await Message.deleteMany({ sessionId });
    
    res.json({ message: "Histórico apagado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao apagar histórico" });
  }
});
// NOVA ROTA: Lista todas as sessões únicas criadas no banco de dados
app.get("/historico/lista/sessoes", async (req, res) => {
  try {
    // Usamos a agregação do MongoDB para agrupar por sessionId
    const sessoes = await Message.aggregate([
      {
        $sort: { createdAt: 1 } // Garante que vamos ler a ordem certa das mensagens
      },
      {
        $group: {
          _id: "$sessionId", // Agrupa pelo ID da sessão
          titulo: { $first: "$text" }, // Define o título como sendo o texto da PRIMEIRA mensagem enviada
          dataCriacao: { $first: "$createdAt" }
        }
      },
      {
        $sort: { dataCriacao: -1 } // Mostra os chats mais recentes no topo
      }
    ]);

    res.json(sessoes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao listar sessões de chat" });
  }
});