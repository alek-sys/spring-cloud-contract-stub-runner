const childProcess = require('child_process');
const { ProcessRunner }  = require('./ProcessRunner');
const { Readable } = require('stream');

describe('ProcessRunner', () => {

    const expectedCmd = 'echo "hello world"';
    const expectedOutput = 'expected output';
    const processRunner = new ProcessRunner(expectedCmd, expectedOutput);

    let mockStdout;
    let mockStderr;
    let mockProcess;

    beforeEach(() => {
        mockStdout = createMockedStream();
        mockStderr = createMockedStream();
        mockProcess = createMockProcess(mockStdout, mockStderr);

        childProcess.exec = jest.fn(() => mockProcess);
    });

    it('should start a process when invoked', () => {
        processRunner.run();
        expect(childProcess.exec).toHaveBeenCalledWith(expectedCmd);
    });

    it('should resolve when output includes an expected string', (done) => {
        processRunner.run().then(() => {
            done();
        });

        mockStdout.emit('data', expectedOutput);
    });

    it('should not resolve when output does not include an expected string', (done) => {
        processRunner.run().then(() => {
            fail('Expected output is not provided, but promise resolved!');
            done();
        });

        mockStdout.emit('data', 'foo');
        done();
    });

    it('should output stderr into console.error', () => {
        console.error = jest.fn();

        processRunner.run();
        mockStderr.emit('data', 'Error in the called process');

        expect(console.error).toHaveBeenCalledWith('Error in the called process');
    });

    it('should reject when stderr output is complete', (done) => {
        const expectedStderrOutput = 'Error in the called process';
        console.error = jest.fn();

        processRunner.run().catch((err) => {
            expect(err).toEqual(expectedStderrOutput);
            done();
        });

        mockStderr.emit('end', expectedStderrOutput);
    });

    it('should output stdout into console.log if showOutput is enabled', () => {
        console.log = jest.fn();

        const processRunnerWithOutput = new ProcessRunner(expectedCmd, expectedOutput, { showOutput: true });
        processRunnerWithOutput.run();

        const expectedStdoutOutput = 'foo';
        mockStdout.emit('data', expectedStdoutOutput);

        expect(console.log).toHaveBeenCalledWith(expectedStdoutOutput);
    });

    it('should not output stdout into console.log if showOutput is disabled', () => {
        console.log = jest.fn();

        const processRunnerWithoutOutput = new ProcessRunner(expectedCmd, expectedOutput, { showOutput: false });
        processRunnerWithoutOutput.run();

        const expectedStdoutOutput = 'foo';
        mockStdout.emit('data', expectedStdoutOutput);

        expect(console.log).not.toHaveBeenCalledWith(expectedStdoutOutput);
    });

    it('should kill the process', () => {
        processRunner.run();
        processRunner.kill();
        expect(mockProcess.kill).toHaveBeenCalled();
    });

    function createMockedStream() {
        const mockedStream = new Readable();
        mockedStream._read = () => {};
        return mockedStream;
    }

    function createMockProcess(mockStdout, stderr) {
        return {
            stdout: mockStdout,
            stderr: stderr,
            kill: jest.fn()
        };
    }
});