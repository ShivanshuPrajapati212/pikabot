const blessed = require("blessed");

module.exports = function (screen, manager) {

    let active = false;
    let buffer = "";

    const input = blessed.box({
        parent: screen,
        bottom: 0,
        left: 0,
        width: "100%",
        height: 3,

        label: " Command (:) ",

        border: "line",

        input: true,
        keyable: true,
        mouse: true,

        content: " (press : to type)"
    });

    function renderLine() {
        if (active)
            input.setContent(` ${buffer}_`);
        else
            input.setContent(" (press : to type)");
    }

    function deactivate() {
        if (!active)
            return;

        active = false;
        buffer = "";
        screen.grabKeys = false;
        screen.restoreFocus();
        renderLine();
        screen.render();
    }

    function activate() {
        if (active)
            return;

        active = true;
        buffer = "";
        screen.saveFocus();
        input.focus();
        screen.grabKeys = true;
        renderLine();
        screen.render();
    }

    function execute(command) {

        const parts = command.trim().split(/\s+/);

        const cmd = parts.shift();

        if (!cmd)
            return;

        switch (cmd) {

            case "say":
                manager.broadcast(parts.join(" "));
                break;

            case "cmd": {
                let text = parts.join(" ");
                if (text && !text.startsWith("/"))
                    text = "/" + text;
                manager.broadcast(text);
                break;
            }

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

    input.on("keypress", (ch, key) => {

        if (!active)
            return;

        if (key.name === "enter" || key.name === "return") {
            if (buffer.trim())
                execute(buffer.trim());
            deactivate();
            return;
        }

        if (key.name === "escape") {
            deactivate();
            return;
        }

        if (key.name === "backspace") {
            buffer = buffer.slice(0, -1);
            renderLine();
            screen.render();
            return;
        }

        if (ch && ch.length === 1 && ch >= " " && !key.ctrl && !key.meta) {
            buffer += ch;
            renderLine();
            screen.render();
        }
    });

    screen.on("keypress", (ch, key) => {

        if (active)
            return;

        if (ch === ":") {
            activate();
            return;
        }

        if (key.full === "C-c")
            return;

        if (key.name === "escape" || key.name === "q")
            return;
    });

    input.on("click", () => {
        if (!active)
            activate();
    });

    return {
        widget: input,
        open: activate
    };
};
