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
            const process = childProcess.exec(this.cmd);

            process.stdout.on('data', (data) => {
                if (this.showOutput) {
                    console.log(data);
                }

                if (data.includes(this.expectedOutput)) {
                    resolve();
                }
            });

            process.stderr.on('data', console.error);
            process.stderr.on('end', reject);
        });
    }
}

module.exports = {
    ProcessRunner
};