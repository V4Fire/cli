const sortInput = `## (2021-05-12) @foo

#### :rocket: New Feature

* bar

## (2000-05-12) @unknown

#### :rocket: New Feature

* bar

## (2021-06-11) @baz

#### :boom: Breaking Change

* boom

#### :rocket: New Feature

* rocket
`;

const sortOutput = `## (2021-06-11) @baz

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

const sortDupsInput = `## (2021-05-12) @foo

#### :rocket: New Feature

* bar

## (2021-05-12) @foo

#### :rocket: New Feature

* bar

## (2021-06-11) @baz

#### :boom: Breaking Change

* boom

#### :rocket: New Feature

* rocket
`;

const sortDupsOutput = `## (2021-06-11) @baz

#### :boom: Breaking Change

* boom

#### :rocket: New Feature

* rocket

## (2021-05-12) @foo

#### :rocket: New Feature

* bar
`;

module.exports = {
	cases: [
		{
			description: 'Sort of records',
			input: sortInput,
			output: sortOutput
		},
		{
			description: 'Remove dups',
			input: sortDupsInput,
			output: sortDupsOutput
		}
	]
};
