const childProcess = require('child_process');
const { runAndWaitForOutput }  = require('./processRunner');
const { Readable } = require('stream');

describe('ProcessRunner', () => {

    const cmd = 'echo "hello world"';
    const expectedOutput = 'expected output';

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
        runAndWaitForOutput(cmd, expectedOutput);
        expect(childProcess.exec).toHaveBeenCalledWith(cmd);
    });

    it('should resolve with a stared process instance', (done) => {
        runAndWaitForOutput(cmd, expectedOutput).then((process) => {
            expect(process).toBe(mockProcess);
            done();
        });

        mockStdout.emit('data', expectedOutput);
    });

    it('should resolve when output includes an expected string', (done) => {
        runAndWaitForOutput(cmd, expectedOutput).then(() => {
            done();
        });

        mockStdout.emit('data', expectedOutput);
    });

    it('should not resolve when output does not include an expected string', (done) => {
        runAndWaitForOutput(cmd, expectedOutput).then(() => {
            fail('Expected output is not provided, but promise resolved!');
            done();
        });

        mockStdout.emit('data', 'foo');
        done();
    });

    it('should output stderr into console.error', () => {
        console.error = jest.fn();

        runAndWaitForOutput(cmd, expectedOutput);
        mockStderr.emit('data', 'Error in the called process');

        expect(console.error).toHaveBeenCalledWith('Error in the called process');
    });

    it('should reject when stderr output is complete', (done) => {
        const expectedStderrOutput = 'Error in the called process';
        console.error = jest.fn();

        runAndWaitForOutput(cmd, expectedOutput).catch((err) => {
            expect(err).toEqual(expectedStderrOutput);
            done();
        });

        mockStderr.emit('end', expectedStderrOutput);
    });

    it('should output stdout into console.log if showOutput is enabled', () => {
        console.log = jest.fn();

        runAndWaitForOutput(cmd, expectedOutput, true);

        const expectedStdoutOutput = 'foo';
        mockStdout.emit('data', expectedStdoutOutput);

        expect(console.log).toHaveBeenCalledWith(expectedStdoutOutput);
    });

    it('should not output stdout into console.log if showOutput is disabled', () => {
        console.log = jest.fn();

        runAndWaitForOutput(cmd, expectedOutput);

        const expectedStdoutOutput = 'foo';
        mockStdout.emit('data', expectedStdoutOutput);

        expect(console.log).not.toHaveBeenCalledWith(expectedStdoutOutput);
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