const manager = require("./botManager");
const dashboard = require("./dashboard");
const logger = require("./logger");

dashboard(manager, logger);

(async () => {
    await manager.connectAll();
})();
