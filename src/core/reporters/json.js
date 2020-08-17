exports.json = function (data) {
	let result = {
		status: false,
		data: {}
	};

	if (data instanceof Error) {
		result.data.message = data.message;
		result.data.code = data.code;
	} else {
		result.status = true;
		result.data = data;
	}

	console.log(JSON.stringify(result));
	process.exit();
};
