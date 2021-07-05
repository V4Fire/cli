// Save from IDE highlight
const startOfConflict = '<<<<<<< HEAD';

const inputConflicts = `A text file.

${startOfConflict}
Baz.
=======
Bar.
>>>>>>> master`;

const outputConflicts = `A text file.

Baz.

Bar.`;

module.exports = {
	cases: [
		{
			description: 'Simple conflict',
			input: inputConflicts,
			output: outputConflicts
		}
	]
};
