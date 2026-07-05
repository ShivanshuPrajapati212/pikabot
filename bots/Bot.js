const mineflayer = require("mineflayer");
const EventEmitter = require("events");

const config = require("../config");
const logger = require("../logger");
const { random } = require("../utils/delay");

class Bot extends EventEmitter {
    constructor(username) {
        super();

        this.username = username;

        this.bot = null;

        this.connected = false;
        this.connecting = false;

        this.state = "Offline";

        this.ping = 0;
        this.health = 20;
        this.food = 20;

        this.position = null;

        this.reconnects = 0;

        this.connectedAt = null;

        this.shouldReconnect = true;
    }

    connect() {

        if (this.connected || this.connecting)
            return;

        this.connecting = true;
        this.state = "Connecting";

        logger.info(`${this.username} connecting...`);

        this.bot = mineflayer.createBot({
            host: config.host,
            port: config.port,
            username: this.username,
            version: config.version
        });

        this.registerEvents();
    }

    registerEvents() {

        this.bot.once("spawn", () => {

            this.connected = true;
            this.connecting = false;

            this.state = "Online";

            this.connectedAt = Date.now();

            logger.success(`${this.username} connected`);

            this.emit("spawn", this);

        });

        this.bot.on("end", () => {

            this.connected = false;
            this.connecting = false;

            this.state = "Offline";

            logger.warning(`${this.username} disconnected`);

            this.emit("disconnect", this);

            if (!this.shouldReconnect)
                return;

            const delay = random(
                config.reconnectDelay.min,
                config.reconnectDelay.max
            );

            this.reconnects++;

            this.state = "Reconnecting";

            setTimeout(() => {

                this.connect();

            }, delay);

        });

        this.bot.on("error", err => {

            this.connecting = false;

            logger.error(`${this.username}: ${err.message}`);

            this.emit("botError", err);

        });

        this.bot.on("chat", (username, message) => {

            this.emit("chat", {
                bot: this,
                username,
                message
            });

        });

        this.bot.on("health", () => {

            this.health = this.bot.health;
            this.food = this.bot.food;

            this.emit("update", this);

        });

        this.bot.on("move", () => {

            this.position = this.bot.entity.position.clone();

        });



        this.bot.on('messagestr', (message) => {
            if (message.includes('/register')) {
                this.bot.chat('/register abc123 abc123')
            }

            if (message.includes('/login')) {
                this.bot.chat('/login abc123')
            }
            if (message.includes('Right click the Server Selector to join a gamemode')){
                logger.success("Entered Main Lobby")
                this.bot.setQuickBarSlot(4)
                this.bot.activateItem()
            }
        })


        this.bot.on('windowOpen', async (window) => {
            if (window.title.value.includes('Server Selector')) {
                await this.bot.clickWindow(10, 0, 0);
                logger.success("Clicked on Op Factions")
            }
        })

        this.bot.on("kicked", reason => {

            logger.warning(`${this.username} kicked`);

            this.emit("kicked", reason);

        });

    }

    disconnect() {

        this.shouldReconnect = false;

        if (this.bot)
            this.bot.quit();

    }

    reconnect() {

        this.shouldReconnect = true;

        if (this.bot)
            this.bot.quit();
        else
            this.connect();

    }

    chat(message) {

        if (!this.connected)
            return;

        this.bot.chat(message);

    }

    command(command) {

        this.chat(command);

    }

    run(method, ...args) {

        if (!this.connected || !this.bot)
            return false;

        const fn = this.bot[method];

        if (typeof fn !== "function") {
            logger.error(`${this.username}: unknown method ${method}`);
            return false;
        }

        try {
            const result = fn.apply(this.bot, args);

            logger.success(`${this.username}: ${method}(${args.join(", ")})`);

            if (result && typeof result.then === "function") {
                result.catch(err => {
                    logger.error(`${this.username}: ${method} failed: ${err.message}`);
                });
            }

            return true;

        } catch (err) {
            logger.error(`${this.username}: ${method} failed: ${err.message}`);
            return false;
        }

    }

    async runScript(code) {

        if (!this.connected || !this.bot)
            return false;

        const bot = this.bot;

        try {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
            const fn = new AsyncFunction("bot", code);

            await fn(bot);

            logger.success(`${this.username}: script ok`);

            return true;

        } catch (err) {
            logger.error(`${this.username}: script failed: ${err.message}`);
            return false;
        }

    }

    get uptime() {

        if (!this.connectedAt)
            return 0;

        return Date.now() - this.connectedAt;

    }

    get status() {

        return {
            username: this.username,

            connected: this.connected,

            state: this.state,

            ping: this.ping,

            health: this.health,

            food: this.food,

            reconnects: this.reconnects,

            uptime: this.uptime,

            position: this.position
        };

    }

}

module.exports = Bot;
