const childProcess = require('child_process');

class ProcessRunner {
    constructor(cmd, expectedOutput) {
        this.cmd = cmd;
        this.expectedOutput = expectedOutput;
    }

    run() {
        return new Promise(resolve => {
            const process = childProcess.exec(this.cmd);

            process.stdout.on('data', (data) => {
                if (data.includes(this.expectedOutput)) {
                    resolve();
                }
            });
        });
    }
}

module.exports = {
    ProcessRunner
};