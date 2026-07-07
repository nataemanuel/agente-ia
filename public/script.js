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
