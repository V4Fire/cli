# Changelog

> **Tags:**
>
> - :boom: [Breaking Change]
> - :rocket: [New Feature]
> - :bug: [Bug Fix]
> - :memo: [Documentation]
> - :house: [Internal]
> - :nail_care: [Polish]

_Note: Gaps between patch versions are faulty, broken or test releases._

## v2.1.0 (2023-08-10)

#### :rocket: [New Feature]

* `ai-buddy` - Command allowing the use of `intelli-buddy` through the v4fire-cli

## v2.0.0 (2023-08-10)

#### :boom: [Breaking Change]

* `make-test` - the command interface has been changed
* `make` - support for the `make app` has been removed

#### :rocket: [New Feature]

* `create-app` - the function has been added for the easy creation of v4fire app

#### :house: Internal

* Moved to using Handlebars templates

#### :memo: [Documentation]

* `help` - documentation has been updated
* README.md has been updated

## v1.5.2 (2023-04-14)

#### :bug: Bug Fix

* Downgrade of the "chalk" package

## v1.5.1 (2023-04-14)

#### :bug: Bug Fix

* Fixed regex for matching the package version

## v1.5.0 (2023-04-14)

#### :house: Internal

* Moved on `yarn` package manager
* Updated all dependencies
* Removed `prettier`

## v1.4.2 (2022-12-20)

#### :rocket: New Feature

* Added more information to output about install process in up-git command

## v1.4.1 (2022-09-13)

#### :rocket: New Feature

* Added a new script to update Git dependencies via Yarn

## v1.4.0 (2022-03-30)

#### :house: Internal

* Rewritten work with workspaces on `yarn`

## v1.3.1 (2022-03-05)

#### :house: Internal

* Freezing versions of all dependencies from package.json

## v1.3.0 (2022-01-14)

#### :rocket: New Feature

* Added a new command to remove the `npm` workspace

### :bug: Bug Fix

* Added regExp escaping in initializing workspace

#### :house: Internal

* Removed `npm` from dependencies

###### :boom: Breaking Change

* Removed make app script

## v1.2.0 (2021-12-09)

#### :rocket: New Feature

* Added a new command to initialize the `npm` workspace

#### :house: Internal

* Migration to `npm@8`

## v1.1.1 (2021-07-09)

#### :rocket: New Feature

* `resolve-changelog` - remove duplicates from changelog

#### :nail_care: Polish

* `resolve-changelog` - delete trailing spaces from empty lines

## v1.1.0 (2021-07-05)

#### :rocket: New Feature

* Added new command `resolve-changelog`

## v1.0.23 (2021-04-18)

#### :nail_care: Polish

* Added `New Feature` section in `CHANGELOG.md` template

## v1.0.22 (2020-09-21)

#### :rocket: New Feature

* Added `CHANGELOG` file and `assest/img` example

