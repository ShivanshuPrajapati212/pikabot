const blessed = require("blessed");
const os = require("os");

module.exports = function(screen){

    const box = blessed.box({

        parent: screen,

        top: 0,

        left: 0,

        width: "100%",

        height: 3,

        border: "line",

        tags: true

    });

    function update(stats){

        const mem = process.memoryUsage().rss/1024/1024;

        box.setContent(

`{bold}Mineflayer Dashboard{/bold}

Connected: {green-fg}${stats.connected}/${stats.total}{/green-fg}   Memory: ${mem.toFixed(1)} MB   Avg Ping: ${stats.averagePing} ms`
);

    }

    return {

        update

    };

};
