const blessed = require("blessed");

module.exports = function (screen) {
    const logs = blessed.log({
        parent: screen,

        label: " Logs ",

        top: "60%",
        left: 0,

        width: "100%",
        height: "35%",

        border: "line",

        tags: true,

        mouse: true,
        keys: true,

        scrollable: true,
        alwaysScroll: true,

        scrollbar: {
            ch: " ",
            inverse: true
        }
    });

    function color(type) {
        switch (type) {
            case "success":
                return "green";
            case "warning":
                return "yellow";
            case "error":
                return "red";
            default:
                return "cyan";
        }
    }

    function add(log) {

        const time = log.time.toLocaleTimeString();

        logs.log(
            `{${color(log.type)}-fg}[${time}] ${log.message}{/${color(log.type)}-fg}`
        );
    }

    return {
        add,
        widget: logs
    };
};
