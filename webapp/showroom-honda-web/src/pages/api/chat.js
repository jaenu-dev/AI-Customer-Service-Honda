export default async function handler(req, res) {
  const { message } = req.body;

  try {
    const response = await fetch(process.env.N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.reply || "Terjadi kesalahan" });

  } catch (error) {
    res.status(500).json({ reply: "Server error" });
  }
}
