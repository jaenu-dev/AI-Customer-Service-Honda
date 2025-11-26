import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  async function sendMessage() {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input })
    });

    const data = await res.json();
    setMessages([...messages, { from: "user", text: input }, { from: "bot", text: data.reply }]);
    setInput("");
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Honda AI Customer Service</h2>
      <div style={{ marginTop: 20 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b>{msg.from === "user" ? "You" : "Bot"}:</b> {msg.text}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ketik pesan..."
        style={{ padding: 8, width: "70%" }}
      />
      <button onClick={sendMessage} style={{ padding: 8, marginLeft: 10 }}>
        Send
      </button>
    </div>
  );
}


