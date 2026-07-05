const EventEmitter = require("events");

const Bot = require("./bots/Bot");
const usernames = require("./data/usernames");
const { sleep, random } = require("./utils/delay");
const config = require("./config");

class BotManager extends EventEmitter {
    constructor() {
        super();

        this.bots = new Map();

        for (const username of usernames) {
            const bot = new Bot(username);

            this.bindBotEvents(bot);

            this.bots.set(username, bot);
        }
    }

    bindBotEvents(bot) {
        const forward = event => (...args) => {
            this.emit(event, bot, ...args);
            this.emit("update");
        };

        bot.on("spawn", forward("spawn"));
        bot.on("disconnect", forward("disconnect"));
        bot.on("chat", forward("chat"));
        bot.on("error", forward("error"));
        bot.on("kicked", forward("kicked"));
        bot.on("update", forward("botUpdate"));
    }

    async connectAll() {
        for (const bot of this.bots.values()) {

            bot.connect();

            await sleep(
                random(
                    config.reconnectDelay.min,
                    config.reconnectDelay.max
                )
            );
        }
    }

    disconnectAll() {
        for (const bot of this.bots.values()) {
            bot.disconnect();
        }
    }

    restartAll() {
        for (const bot of this.bots.values()) {
            bot.reconnect();
        }
    }

    broadcast(message) {
        for (const bot of this.onlineBots()) {
            bot.chat(message);
        }
    }

    execute(fn) {
        for (const bot of this.onlineBots()) {
            fn(bot);
        }
    }

    run(target, method, args = []) {
        const bots = target && target !== "all" && this.bots.has(target)
            ? [this.bots.get(target)]
            : this.onlineBots();

        for (const bot of bots) {
            if (bot.connected)
                bot.run(method, ...args);
        }
    }

    runScript(target, code) {
        const bots = target && target !== "all" && this.bots.has(target)
            ? [this.bots.get(target)]
            : this.onlineBots();

        for (const bot of bots) {
            if (bot.connected)
                bot.runScript(code);
        }
    }

    restartBot(username) {
        const bot = this.bots.get(username);

        if (bot)
            bot.reconnect();
    }

    connectBot(username) {
        const bot = this.bots.get(username);

        if (bot)
            bot.connect();
    }

    disconnectBot(username) {
        const bot = this.bots.get(username);

        if (bot)
            bot.disconnect();
    }

    get(username) {
        return this.bots.get(username);
    }

    allBots() {
        return [...this.bots.values()];
    }

    onlineBots() {
        return this.allBots().filter(bot => bot.connected);
    }

    offlineBots() {
        return this.allBots().filter(bot => !bot.connected);
    }

    connectedCount() {
        return this.onlineBots().length;
    }

    totalCount() {
        return this.bots.size;
    }

    averagePing() {
        const online = this.onlineBots();

        if (!online.length)
            return 0;

        const total = online.reduce((sum, bot) => sum + bot.ping, 0);

        return Math.round(total / online.length);
    }

    stats() {
        return {
            connected: this.connectedCount(),
            total: this.totalCount(),
            averagePing: this.averagePing(),
            bots: this.allBots().map(bot => bot.status)
        };
    }
}

module.exports = new BotManager();
