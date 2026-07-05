const EventEmitter = require("events");

class Logger extends EventEmitter {

    constructor() {
        super();
        this.logs = [];
    }

    push(type, message) {

        const log = {
            type,
            message,
            time: new Date()
        };

        this.logs.push(log);

        if (this.logs.length > 500)
            this.logs.shift();

        this.emit("log", log);
    }

    info(msg) {
        this.push("info", msg);
    }

    success(msg) {
        this.push("success", msg);
    }

    warning(msg) {
        this.push("warning", msg);
    }

    error(msg) {
        this.push("error", msg);
    }

}

module.exports = new Logger();
