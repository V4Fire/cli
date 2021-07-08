const emptyLines = `
  foo
 
bar  
   

`;

const emptyLinesResult = `
  foo

bar  


`;

module.exports = {
	cases: [
		{
			description: 'Normalize empty lines',
			input: emptyLines,
			output: emptyLinesResult
		}
	]
};
