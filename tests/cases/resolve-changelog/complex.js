// Save from IDE highlight
const startOfConflict = '<<<<<<< HEAD';

const changelogWithConflict = `# Changelog

> **Tags:**
>
> - :boom: [Breaking Change]
> - :rocket: [New Feature]
> - :bug: [Bug Fix]
> - :memo: [Documentation]
> - :house: [Internal]
> - :nail_care: [Polish]

_Note: Gaps between patch versions are faulty, broken or test releases._

${startOfConflict}
## (2021-05-12) @foo

#### :rocket: New Feature

* bar
=======
## (2000-05-12) @unknown

#### :rocket: New Feature

* bar
>>>>>>> master

## (2021-06-11) @baz

#### :boom: Breaking Change

* boom

#### :rocket: New Feature

* rocket
`;

const correctChangelog = `# Changelog

> **Tags:**
>
> - :boom: [Breaking Change]
> - :rocket: [New Feature]
> - :bug: [Bug Fix]
> - :memo: [Documentation]
> - :house: [Internal]
> - :nail_care: [Polish]

_Note: Gaps between patch versions are faulty, broken or test releases._

## (2021-06-11) @baz

#### :boom: Breaking Change

* boom

#### :rocket: New Feature

* rocket

## (2021-05-12) @foo

#### :rocket: New Feature

* bar

## (2000-05-12) @unknown

#### :rocket: New Feature

* bar
`;

module.exports = {
	cases: [
		{
			description: 'Complex test with changelog',
			input: changelogWithConflict,
			output: correctChangelog
		}
	]
};
