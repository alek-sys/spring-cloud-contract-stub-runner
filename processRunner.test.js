const childProcess = require('child_process');
const { runAndWaitForOutput } = require('./processRunner');
const os = require('os');
const fs = require('fs');
const path = require('path');

describe('ProcessRunner', () => {
    const expectedOutput = 'expected';
    const cmdWithExpectedOutput = `echo ${expectedOutput}`;
    const cmdWithUnexpectedOutput = `echo foobar`;
    const cmdWithErrOutput = `echo error > /dev/stderr`;

    it('should start a process when invoked', async () => {
        const randomFileName = Math.floor(Math.random() * 10000).toString();
        const outputFilename = path.join(os.tmpdir(), randomFileName);

        const cmd = `echo '${expectedOutput}' | tee ${outputFilename}`;

        await runAndWaitForOutput(cmd, expectedOutput);
        expect(fs.existsSync(outputFilename)).toBe(true);

        fs.unlinkSync(outputFilename);
    });

    it('should resolve with a stared process instance', async () => {
        const process = await runAndWaitForOutput(cmdWithExpectedOutput, expectedOutput);
        expect(process).toBeDefined();
        expect(process).toBeInstanceOf(childProcess.ChildProcess)
    });

    it('should not resolve when output does not include an expected string', (done) => {
        runAndWaitForOutput(cmdWithUnexpectedOutput, expectedOutput).then(() => {
            done.fail("No expected output is provided, but the promise is resolved");
        }).catch(done);
    });

    it('should output errors into stderr', (done) => {
        console.error = jest.fn();

        runAndWaitForOutput(cmdWithErrOutput, expectedOutput).catch((err) => {
            expect(err).toEqual('error\n');
            done();
        });
    });

    it('should output stdout into console.log if showOutput is enabled', async () => {
        console.log = jest.fn();

        await runAndWaitForOutput(cmdWithExpectedOutput, expectedOutput, true);

        expect(console.log).toHaveBeenCalledWith(expectedOutput + '\n');
    });

    it('should not output stdout into console.log if showOutput is disabled', async () => {
        console.log = jest.fn();

        await runAndWaitForOutput(cmdWithExpectedOutput, expectedOutput);

        expect(console.log).not.toHaveBeenCalled();
    });
});