# Spring Cloud Contracts for Javascript 

[Spring Cloud Contracts](https://cloud.spring.io/spring-cloud-contract/) is a library to automate contract testing and enable consumer driven contracts. SCC provides very nice integration with Spring Boot and allows to start and stop stubs as a part of test suite using `@AutoConfigureStubRunner` annotation. While being useful for testing service-to-service communication, it does not help when testing the most common client for pretty much any backend API - frontend Javascript apps. One possible option is to use [Stub Runner Fat Jar](http://cloud.spring.io/spring-cloud-static/spring-cloud-contract/2.0.1.RELEASE/single/spring-cloud-contract.html#_stub_runner_server_fat_jar) and run stubs from command line before running tests. 

# Automating stub runner for a frontend app

This library designed to help and automate running stubs for frontend apps and provide functionality similar to `@AutoConfigureStubRunner` annotation. 

## React and Jest

React apps widely use Jest testing framework with JSDOM environment. To run stubs as a part of Jest test suite configure it via `beforeAll` setup method:

```javascript
const SECONDS = 1000;
beforeAll(async () => {
    stubRunnerInstance = await runStubs(`com.example:cakefactor:+:${port}`);
}, 60 * SECONDS);
``` 

`runStubs` method will do few things for you:
1. Check if there is a `stub-runner.jar` in the temp folder already
2. Download it if necessary (this is quite slow as the JAR file is about ~60Mb)
3. Run the stubs passing specified stub ids

To gracefully shutdown stub-runner use `afterAll`:
```javascript
afterAll(() => {
    stubRunnerInstance.kill();
});
```

Note that `beforeAll` uses extended timeout of 60 seconds, this is to make sure test will not timeout on the first run, when downloading JAR file etc. Also based on the performance of your system you might want to adjust it to make sure there is enough time to run Spring Boot app, unpack stub and launch Wiremock. 

Also it is quite important to use `runStubs` as few time as possible, ideally once per the whole test suite. It might be a good idea to extract all integration tests into a dedicated integration tests `describe` block, run all required stubs once, run the tests, stop the stubs.

## Configuring fetch

By default, `create-react-app` uses combination of JSDOM and whatwg-fetch which automatically reject with `TypeError: Network request failed`. So to send a real network request to a stub-runner `fetch` need to be replaced with something that can actually make a network request, [isomorphic-fetch](https://www.npmjs.com/package/isomorphic-fetch) should do just fine. Hence full setup for Jest + JSDOM would look like this:

```javascript
beforeAll(async () => {
    global.fetch = require('isomorphic-fetch');
    stubRunnerInstance = await runStubs(`com.example:cakefactory:+:${port}`);
}, 60 * SECONDS);
``` 

## Displaying stub-runner output

By default, all output to stdout is hidden to avoid noise in the test output. However if you want to enable it for debug purpose pass `options` to `runStubs` function:

```javascript
stubRunnerInstance = await runStubs(`com.example:cakefactory:+:${port}`, { showOutput: true });
```

## Options

The second argument of `runStubs` is `options` object, accepting the following properties:

* **pathToStubRunnerJar** - path to Stub Runner Fat Jar, *default* = {os temp folder}/stub-runner.jar
* **stubRunnerJarDownloadUrl** - the url to download Stub Runner Fat Jar if not found, *default* = maven download URL
* **showOutput** - show / hide stdout output from stub-runner, *default* = false