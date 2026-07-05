const blessed = require("blessed");

const createHeader = require("./header");
const createTable = require("./table");
const createLogs = require("./logs");
const createCommand = require("./command");

module.exports = function(manager, logger) {

    const screen = blessed.screen({

        smartCSR: true,

        title: "Mineflayer Dashboard"

    });

    screen.key(["escape", "q", "C-c"], () => process.exit(0));

    const header = createHeader(screen);

    const table = createTable(screen);

    const logs = createLogs(screen);

    const command = createCommand(screen, manager);

    manager.on("update", () => {

        header.update(manager.stats());

        table.update(manager.stats());

        screen.render();

    });

    logger.on("log", log => {

        logs.add(log);

        screen.render();

    });

    header.update(manager.stats());

    table.update(manager.stats());

    screen.render();

};
