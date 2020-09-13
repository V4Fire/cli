# WIP V4Fire-cli
Tools for creating V4Fire blocks and pages from CLI

```bash
v4fire -h
```

## Usage

### Make block

TBD

### Rename block

TBD

### Make test

```bash
v4fire make-test src/base/b-slider
```

You can generate test files for both component and module.
The tool also will take care of updating [demo-page](https://github.com/V4Fire/Client/blob/master/src/pages/p-v4-components-demo/index.js)
dependencies and adding new test cases to [test cases file](https://github.com/V4Fire/Client/blob/master/tests/cases.js).

For both component and module the tool generates `test/index.js` [file](src/templates/test/module/simple/index.js)
that performs basic test setup and executes simple test.

In case of _module_ test, the tool relies on `b-dummy` [component](https://github.com/V4Fire/Client/tree/master/src/base/b-dummy)
designed specifically for testing purposes.

#### Runners

You can specify which runners you want to be included in test directory. By default, there are no runners
and all test code locates in the `test/index.js` file. So if you'd like to have different runners for your test cases,
you can specify them just after the path to module or component being tested.

```bash
v4fire make-test src/base/b-slider analytics render events
```

For each specified runner the tool will create `test/runner/runner-name` file. [Here is the example](src/templates/test/module/with-runners/runners/runner.js)
of runner template for a module.

In this case generated `test/index.js` file will include only test setup and all test evaluation code will be moved to runners.
