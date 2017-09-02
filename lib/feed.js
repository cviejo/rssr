const request = require("request");
const feedme  = require("feedme");
const Promise = require("bluebird");


//----------------------------------------------------
const getCorrectedItem = (item) => {


	return Object.keys(item).reduce((result, x) => {

		const target = ["title", "text", "link"].includes(x);

		// todo: reddit format
		// console.log(x);
		// console.log(item[x]);

		result[x] = target ? item[x].replace(/^\s+|\s+$/g, "") :
		                     item[x];
		return result;
	}, {});
};


//----------------------------------------------------
const get = url => {

	return new Promise((resolve, reject) => {

		const parser = new feedme(true);

		parser.on("end", () => {

			const result = getCorrectedItem(parser.done());

			result.items = result.items.map(getCorrectedItem);

			resolve(result);
		});

		request(url).pipe(parser);
	});
};


module.exports = { get };

// get(require("../config/feeds.json")[12].url).then(x => console.log(x));
