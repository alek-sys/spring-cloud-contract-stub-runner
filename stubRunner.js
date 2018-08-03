const processRunner = require('./processRunner');
const os = require('os');
const fs = require('fs');
const path = require('path');
const https = require('https');

const EXPECTED_STUBRUNNER_OUTPUT = 'Started StubRunnerBoot in';
const MAVEN_STUBRUNNER_DOWNLOAD_URL = 'https://repo1.maven.org/maven2/org/springframework/cloud/spring-cloud-contract-stub-runner-boot/2.0.0.RELEASE/spring-cloud-contract-stub-runner-boot-2.0.0.RELEASE.jar';

function getDefaultOptions() {
    return {
        pathToStubRunnerJar: getPathToStubRunnerJarInTmpdir(),
        stubRunnerJarDownloadUrl: MAVEN_STUBRUNNER_DOWNLOAD_URL
    };
}

function getPathToStubRunnerJarInTmpdir() {
    return path.join(os.tmpdir(), 'stub-runner.jar');
}

function jarExists(targetPath) {
    return fs.existsSync(targetPath);
}

async function downloadJar(downloadUrl, targetPath) {
    console.log(`
Stub Runner jar file not found at ${targetPath}, downloading now...
It might take a while, so test can time-out. Subsequent runs will be much faster.
You can also download it manually from ${downloadUrl}`);

    return new Promise((resolve) => {
        const file = fs.createWriteStream(targetPath);
        https.get(downloadUrl, function(response) {
            response.pipe(file);
            response.on('end', resolve);
        });
    });
}

async function runStubs(stubIds, options = getDefaultOptions()) {
    if (!jarExists(options.pathToStubRunnerJar)) {
        await downloadJar(options.stubRunnerJarDownloadUrl, options.pathToStubRunnerJar);
    }

    const cmd = `java -DstubRunner.ids=${stubIds} -DstubRunner.stubsMode=LOCAL -jar ${options.pathToStubRunnerJar}`;
    return processRunner.runAndWaitForOutput(cmd, EXPECTED_STUBRUNNER_OUTPUT);
}

module.exports = {
    runStubs
};