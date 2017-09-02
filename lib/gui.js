
const blessed   = require("blessed");
const merge     = require("deepmerge");
const html      = require("html-to-text");
// const config = require("../config/article.json");
const obj       = require("./util/object");
const config    = require("../config/config.json");
const art       = require("../config/article.json");


const screen = blessed.screen({
	dockBorders : true,
	smartCSR    : true,
	title       : "rssr",
});


const options = {
	base : {
		parent       : screen,
		mouse        : true,
		alwaysScroll : true,
		scrollable   : true,
		tags         : true,
		parseTags    : true,
		grabKeys     : true,
	},
	vi : {
		keys : true,
		vi   : true
	}
};


//----------------------------------------------------
screen.key(config.keys.quit, () => {

	// if (!list.focused) {
	// return;
	// }

	process.exit(0);
});


//----------------------------------------------------
exports.render = () => screen.render();


//----------------------------------------------------
exports.select = (item) => {

	item.focus();
	item.setFront();
	screen.render();
};


//----------------------------------------------------
exports.list = (opts = {}) => {

	return blessed.list(merge.all([{
		style     : {
			selected : obj.copy(obj.prop(config, "list.style.selected", {})),
			item     : obj.copy(obj.prop(config, "list.style.normal",   {}))
		}
	}, options.base, opts]));
};


//----------------------------------------------------
exports.listMove = (action, list) => {

	const actions = {
		top    : () => list.select(0),
		bottom : () => list.select(list.items.length - 1),
		up     : () => list.up(1),
		down   : () => list.down(1)
	};

	actions[action] && actions[action]();
};


//----------------------------------------------------
exports.box = (opts = {}) => blessed.box(merge.all([options.base, options.vi, opts]));


//----------------------------------------------------
exports.setKeys = (item, callback) => {

	Object.keys(config.keys).forEach(x => {
		item.key(config.keys[x], () => callback(x));
	});
};


//----------------------------------------------------
exports.getContent = (data, width) => {

	const nl      = "\n";
	const links   = [];
	let   article = "";

	const opts = {
		noLinkBrackets : false,
		wordwrap: width,
		format: {
			anchor: function (node, fn, options) {
				links.push(node.attribs.href);
				const text = fn(node.children.filter(x => x.type == "text"), options);
				return `{underline}${text}{/underline}[${links.length}]`;
			}
		}
	};

	art.parts.filter(x => x.visible && data[x.field])
	            .map(x => x.type === "header" ? `{0-fg}{2-bg}${x.label}{/}{213-bg} ${data[x.field]}${nl}{/}` :
	                                            `${nl}${nl}${html.fromString(data[x.field], opts)}`)
	            .forEach(x => article += x);

	if (links.length){

		article += `${nl}${nl}Links:${nl}`;

		links.forEach((x, i) => article += `[${i+1}] ${x}${nl}`);
	}

	return article;
};

