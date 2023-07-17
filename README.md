# WIP V4Fire-cli

Tools for creating V4Fire blocks and pages from CLI

```bash
v4fire -h
```

## Usage

### Make app

It is the easiest way to start use V4Fire

```bash
v4fire make app my-app && cd my-app && npm run build
```

It will create application ready for work.

### Create a workspace

```bash
v4fire create-workspace
```

It will clone all necessary dependencies from `.pzlrrc` and initialize the `npm` workspace.
Also, you can specify custom dependencies to install to the workspace or change a workspace directory.

```bash
v4fire create-workspace --package my-package --root my-workspace
```

### Remove a workspace

```bash
v4fire remove-workspace
```

It will remove workspace folder, clear package-lock.json and components-lock.json, reinstall dependencies

### Make block/page

```bash
v4fire make block hello-world
```

It will create `src/components/b-hello-world` component.

```bash
v4fire make block b-hello-world
```

Also, it will create `src/components/b-hello-world`.

```bash
v4fire make page hello-world
```

It will create `src/pages/p-hello-world` component.

If you want create component inside another folder, you can set `path`

```bash
v4fire make block hello-world ./src/pages/p-index
```

It will generate `src/pages/p-index/b-hello-world` component.
You can choose the type of component: `functional`, `mono` or `default`;

```bash
v4fire make block hello-world  --template functional
```

Also, you can change parent for component. Possible options: `default`, `i-block`, `i-data`, `i-dynamic-page`, `i-static-page`

```bash
v4fire make block hello-world  --template functional --extend i-data
```

### Rename component

```bash
v4fire rename hello-world app-loader
```

It will rename `src/components/b-hello-world` to `src/components/b-app-loader`.

### Resolve changelog

```bash
v4fire resolve-changelog
```

It will scan repo for all files with name `CHANGELOG.md`, resolve conflicts and sort records by date.
WARNING: Conflicts within the same record may not be resolved correctly!

### Make test

```bash
v4fire make-test block hello-world
```
It will generate simple tests for the `src/components/**/b-hello-world` component, if it exists.

```bash
v4fire make-test page slider
```
It will generate simple tests for the `src/pages/**/p-slider` page, if it exists.

```bash
v4fire make-test block src/foo/bar/componentName
```
It will generate simple `component` tests in the `src/foo/bar/componentName` folder

```bash
v4fire make-test page src/foo/bar/componentName
```
It will generate simple `page` tests in the `src/foo/bar/componentName` folder

The tool also will take care of updating [demo-page](https://github.com/V4Fire/Client/blob/master/src/pages/p-v4-components-demo/index.js)

The tool generates a `test` folder for both components and pages. The [template for component](src/templates/test/block) and the [template for page](src/templates/test/block) contain the basic test setup and can execute these simple tests.

#### Runners

You can specify which runners you want to be included in test directory. By default, there are no runners
and all test code locates in the `test/index.js` file. So if you'd like to have different runners for your test cases,
you can specify them just after the path to module or component being tested.

```bash
v4fire make-test src/components/b-slider analytics render events
```

For each specified runner the tool will create `test/runner/runner-name` file. [Here is the example](src/templates/test/module/with-runners/runners/runner.js)
of runner template for a module.

In this case generated `test/index.js` file will include only test setup and all test evaluation code will be moved to runners.
