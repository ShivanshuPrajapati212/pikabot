const blessed = require("blessed");

function parseArgs(parts) {
    return parts.map(part => {
        if (/^-?\d+(\.\d+)?$/.test(part))
            return Number(part);

        if (part === "true")
            return true;

        if (part === "false")
            return false;

        if ((part.startsWith('"') && part.endsWith('"'))
            || (part.startsWith("'") && part.endsWith("'")))
            return part.slice(1, -1);

        return part;
    });
}

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

        content: " (press : — run setQuickBarSlot 4, run activateItem)"
    });

    function renderLine() {
        if (active)
            input.setContent(` ${buffer}_`);
        else
            input.setContent(" (press : — run setQuickBarSlot 4, run activateItem)");
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

            case "run": {
                const target = parts[0] === "all" || manager.get(parts[0])
                    ? parts.shift()
                    : "all";

                const method = parts.shift();

                if (!method)
                    break;

                manager.run(target, method, parseArgs(parts));
                break;
            }
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
