const contrib = require("blessed-contrib");

module.exports = function (screen) {
    const table = contrib.table({
        parent: screen,

        top: 3,
        left: 0,

        width: "100%",
        height: "60%",

        keys: true,
        interactive: true,

        fg: "white",
        selectedFg: "black",
        selectedBg: "green",

        border: {
            type: "line"
        },

        columnSpacing: 2,

        columnWidth: [22, 18, 8, 8, 12, 12],

        label: " Bots "
    });

    function icon(status) {
        const normalized = status.toLowerCase();

        if (normalized === "online" || normalized === "idle")
            return "🟢 Online";

        if (normalized === "connecting")
            return "🟡 Connecting";

        if (normalized === "reconnecting" || normalized.startsWith("reconnect"))
            return "🟣 Reconnecting";

        return "🔴 Offline";
    }

    function format(ms) {

        if (!ms)
            return "--";

        const sec = Math.floor(ms / 1000);

        const h = String(Math.floor(sec / 3600)).padStart(2, "0");

        const m = String(Math.floor(sec % 3600 / 60)).padStart(2, "0");

        const s = String(sec % 60).padStart(2, "0");

        return `${h}:${m}:${s}`;

    }

    function update(stats) {

        const rows = stats.bots.map(bot => [

            bot.username,

            icon(bot.state),

            bot.ping ? bot.ping + " ms" : "--",

            bot.health ?? "--",

            bot.reconnects,

            format(bot.uptime)

        ]);

        table.setData({

            headers: [
                "Username",
                "Status",
                "Ping",
                "HP",
                "Reconnects",
                "Uptime"
            ],

            data: rows

        });

    }

    return {

        update,

        widget: table

    };

};
