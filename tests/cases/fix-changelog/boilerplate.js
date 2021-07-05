const boilerplateCase1Input = `# Changelog

> **Tags:**
>
> - :boom: [Breaking Change]
> - :rocket: [New Feature]
> - :bug: [Bug Fix]
> - :memo: [Documentation]
> - :house: [Internal]
> - :nail_care: [Polish]

_Note: Gaps between patch versions are faulty, broken or test releases._

## (2021-04-18)`;

const boilerplateCase2Input = `
> **Tags:**
>
> - :boom: [Breaking Change]
> - :rocket: [New Feature]

## (2021-04-18)`;

const boilerplateOutput = '## (2021-04-18)';

module.exports = {
	cases: [
		{
			description: 'Full description',
			input: boilerplateCase1Input,
			output: boilerplateOutput
		},
		{
			description: 'Cut description',
			input: boilerplateCase2Input,
			output: boilerplateOutput
		}
	]
};
