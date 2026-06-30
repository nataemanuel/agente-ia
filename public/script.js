const sessionId =
  localStorage.getItem("sessionId") ||
  crypto.randomUUID();

localStorage.setItem("sessionId", sessionId);

async function sendMessage() {

  const msg = document.getElementById("msg").value;

  const response = await fetch(
    "http://localhost:3000/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: msg,
        sessionId
      })
    }
  );

  const data = await response.json();

  document.getElementById("chat").innerHTML += `
    <p><b>Você:</b> ${msg}</p>
    <p><b>Bot:</b> ${data.reply}</p>
  `;

}
/* Botão de Nova Conversa estilo ChatGPT */
.btn-new-chat {
    background-color: #a8c7fa;
    color: #043055;
    border: none;
    padding: 12px;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
    text-align: center;
    width: 100%;
}

.btn-new-chat:hover {
    background-color: #c2e7ff;
}

/* Modificações na estrutura do header da sidebar */
.sidebar-header-container {
    padding: 15px;
    border-bottom: 1px solid #303134;
    display: flex;
    flex-direction: column;
    gap: 10px;
}