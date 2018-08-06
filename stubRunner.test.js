const { runStubs  } = require('./stubRunner');
const processRunner = require('./processRunner');
const os = require('os');
const fs = require('fs');
const nock = require('nock');
const path = require('path');

describe('StubRunner', () => {

    const stubIds = 'com.example:demo:+:stubs';
    const expectedOutput = 'Started StubRunnerBoot in';
    const fakeDownloadUrl = 'https://example.com';
    const fakeProcess = 'arbitrary value of type Process';

    let jarPath;

    beforeEach(() => {
        nock(fakeDownloadUrl).get('/').reply(200, 'fake jar content');
        processRunner.runAndWaitForOutput = jest.fn(() => fakeProcess);

        const randomFileName = Math.floor(Math.random() * 100000).toString();
        jarPath = path.join(os.tmpdir(), randomFileName);
    });

    it('should run stubs using specified location for jar', async () => {
        const jarPath = '/tmp/stub-runner.jar';
        const expectedCmd = `java -DstubRunner.ids=${stubIds} -DstubRunner.stubsMode=LOCAL -jar ${jarPath}`;

        await runStubs(stubIds, {
            pathToStubRunnerJar: jarPath,
            stubRunnerJarDownloadUrl: fakeDownloadUrl
        });

        expect(processRunner.runAndWaitForOutput).toHaveBeenCalledWith(expectedCmd, expectedOutput, false);
    });

    it('should download stub runner jar if not present', async (done) => {
        await runStubs(stubIds, { pathToStubRunnerJar: jarPath, stubRunnerJarDownloadUrl: fakeDownloadUrl });

        expect(fs.existsSync(jarPath)).toBeTruthy();

        fs.unlink(jarPath, done);
    });

    it('should return instance of started process', async () => {
        const process = await runStubs(stubIds);

        expect(process).toEqual(fakeProcess);
    });

    it('should pass showOutput option to process runner', async () => {
        const jarPath = '/tmp/stub-runner.jar';
        const expectedCmd = `java -DstubRunner.ids=${stubIds} -DstubRunner.stubsMode=LOCAL -jar ${jarPath}`;

        await runStubs(stubIds, {
            pathToStubRunnerJar: jarPath,
            stubRunnerJarDownloadUrl: fakeDownloadUrl,
            showOutput: true
        });

        expect(processRunner.runAndWaitForOutput).toHaveBeenCalledWith(expectedCmd, expectedOutput, true);
    });
});