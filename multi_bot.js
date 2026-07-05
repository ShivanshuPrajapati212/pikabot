const mineflayer = require("mineflayer");

const usernames = [
    "silentmeadokw",
    "hiddenvalley27",
    "mistyharbor34",
    "frozenwillow83",
    "ancientgrove8",
    "goldenhodn14",
    "emeraldfsdorestd",
    "crystalstream92",
    "whispersdingoak",
    "midnightcanyon38"
];

const HOST = "pika.host";
const PORT = 25565;
const VERSION = false; // auto-detect

const randomDelay = (min = 3000, max = 6000) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

function createBot(username) {
    const bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username,
        version: VERSION,
    });

    bot.once("spawn", () => {
        console.log(`[${username}] Connected`);

        setupBehavior(bot);
    });

    bot.on("end", () => {
        console.log(`[${username}] Disconnected`);

        setTimeout(() => {
            console.log(`[${username}] Reconnecting...`);
            createBot(username);
        }, randomDelay());
    });

    bot.on("error", err => {
        console.log(`[${username}] ${err.message}`);
    });
}

function setupBehavior(bot) {
    bot.on('messagestr', (message) => {
        if (message.includes('/register')) {
            bot.chat('/register abc123 abc123')
        }

        if (message.includes('/login')) {
            bot.chat('/login abc123')
        }
        if (message.includes('Right click the Server Selector to join a gamemode')){
            console.log("Entered Main Lobby")
            bot.setQuickBarSlot(4)
            bot.activateItem()
        }
    })


    bot.on('windowOpen', async (window) => {
        if (window.title.value.includes('Server Selector')) {
            await bot.clickWindow(10, 0, 0);
            console.log("Clicked on Op factions")
        }
    })
}

(async () => {
    for (const username of usernames) {
        await new Promise(resolve => setTimeout(resolve, randomDelay()));

        console.log(`Starting ${username}...`);
        createBot(username);
    }
})();
