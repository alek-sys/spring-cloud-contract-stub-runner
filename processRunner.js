const childProcess = require('child_process');

async function runAndWaitForOutput(cmd, expectedOutput, showOutput = false) {
    return new Promise((resolve, reject) => {
        const process = childProcess.exec(cmd);

        process.stdout.on('data', (data) => {
            if (showOutput) {
                console.log(data);
            }

            if (data.includes(expectedOutput)) {
                resolve(process);
            }
        });

        process.stderr.on('data', console.error);
        process.stderr.on('end', reject);
    });
}


module.exports = {
    runAndWaitForOutput
};