const childProcess = require('child_process');

class ProcessRunner {
    constructor(cmd, expectedOutput, options) {
        this.cmd = cmd;
        this.expectedOutput = expectedOutput;

        if (options) {
            this.showOutput = options.showOutput;
        }
    }

    run() {
        return new Promise((resolve, reject) => {
            this.process = childProcess.exec(this.cmd);

            this.process.stdout.on('data', (data) => {
                if (this.showOutput) {
                    console.log(data);
                }

                if (data.includes(this.expectedOutput)) {
                    resolve();
                }
            });

            this.process.stderr.on('data', console.error);
            this.process.stderr.on('end', reject);
        });
    }

    kill() {
        if (this.process) {
            this.process.kill();
        }
    }
}

module.exports = {
    ProcessRunner
};