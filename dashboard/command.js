const blessed = require("blessed");

module.exports = function (screen, manager) {

    const input = blessed.textbox({
        parent: screen,
        bottom: 0,
        left: 0,
        width: "100%",
        height: 3,

        label: " Command ",

        border: "line",

        inputOnFocus: true,
        mouse: true,
        keys: true
    });

    function execute(command) {

        const parts = command.trim().split(/\s+/);

        const cmd = parts.shift();

        switch (cmd) {

            case "say":
                manager.broadcast(parts.join(" "));
                break;

            case "cmd":
                manager.broadcast(parts.join(" "));
                break;

            case "restart":
                if (parts[0] === "all")
                    manager.restartAll();
                else
                    manager.restartBot(parts[0]);
                break;

            case "connect":
                if (parts[0] === "all")
                    manager.connectAll();
                else
                    manager.connectBot(parts[0]);
                break;

            case "disconnect":
                if (parts[0] === "all")
                    manager.disconnectAll();
                else
                    manager.disconnectBot(parts[0]);
                break;
        }
    }

    screen.key(":", () => {
        input.focus();

        input.readInput((err, value) => {

            if (!err && value)
                execute(value);

            input.clearValue();

            screen.render();
        });
    });

    return {
        widget: input
    };
};
