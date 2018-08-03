const childProcess = require('child_process');
const { ProcessRunner }  = require('./ProcessRunner');
const { Readable } = require('stream');

describe('ProcessRunner', () => {

    const expectedCmd = 'echo "hello world"';
    const expectedOutput = 'expected output';
    const stubRunner = new ProcessRunner(expectedCmd, expectedOutput);

    it('should start a process when invoked', () => {
        childProcess.exec = jest.fn(() => createMockProcess());

        stubRunner.run();

        expect(childProcess.exec).toHaveBeenCalledWith(expectedCmd);
    });

    it('should resolve when output includes an expected string', (done) => {
        const mockStdout = createMockedStream();
        childProcess.exec = () => createMockProcess(mockStdout);

        stubRunner.run().then(() => {
            done();
        });

        mockStdout.emit('data', expectedOutput);
    });

    it('should not resolve when output does not include an expected string', (done) => {
        const mockStdout = createMockedStream();
        childProcess.exec = () => createMockProcess(mockStdout);

        stubRunner.run().then(() => {
            fail('Expected output is not provided, but promise resolved!');
            done();
        });

        mockStdout.emit('data', 'foo');
        done();
    });

    it('should output stderr into console.error', () => {
        const mockStderr = createMockedStream();
        childProcess.exec = () => createMockProcess(createMockedStream(), mockStderr);
        console.error = jest.fn();

        stubRunner.run();

        mockStderr.emit('data', 'Error in the called process');

        expect(console.error).toHaveBeenCalledWith('Error in the called process');
    });

    it('should reject when stderr output is complete', (done) => {
        const expectedStderrOutput = 'Error in the called process';
        const mockStderr = createMockedStream();
        childProcess.exec = () => createMockProcess(createMockedStream(), mockStderr);
        console.error = jest.fn();

        stubRunner.run().catch((err) => {
            expect(err).toEqual(expectedStderrOutput);
            done();
        });

        mockStderr.emit('end', expectedStderrOutput);
    });

    function createMockedStream() {
        const mockedStream = new Readable();
        mockedStream._read = () => {};
        return mockedStream;
    }

    function createMockProcess(mockStdout = createMockedStream(), stderr = createMockedStream()) {
        return {
            stdout: mockStdout,
            stderr: stderr
        };
    }
});