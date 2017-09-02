const exec    = require("child_process").exec;
const blessed = require("blessed");
const table   = require("text-table");
const obj     = require("./src/util/object");
const gui     = require("./src/gui");
const feed    = require("./src/feed");
const feeds   = require("./config/feeds.json");
const config  = require("./config/config.json");

let bla;

const feedList     = gui.list(obj.prop(config, "layout.feeds",    {}));
const articlesList = gui.list(obj.prop(config, "layout.articles", {}));
const articleView  = gui.box (obj.prop(config, "layout.article",  {}));
const highlights   = obj.prop(config, "list.style.highlights", []);

const getSelectedArticle = () => bla.items[articlesList.selected];
const getSelectedFeed    = () => feeds[feedList.selected];


gui.select(feedList);

const getHighlightedItem = (item, highlight) =>
	item.replace(new RegExp(highlight.match, "g"), match => blessed.generateTags(highlight.style, match));

// const getRow = (data, template) =>
	// template.forEach(col)

const items = table(feeds
	.map((x, i) => [i, x.name || x.url]), {align:["r", "l"]}).split(/\r?\n/);

feedList.setItems(items
	.map(x => highlights.reduce(getHighlightedItem, x)));


//----------------------------------------------------
gui.setKeys(feedList, action => {

	gui.listMove(action, feedList);

	switch (action){

		case "back":
			gui.select(feedList);
			break;

		case "open": {
			const sel = getSelectedFeed();
			exec("opera " + sel.url || sel);
			break;
		}
		case "select":
			feed.get(feeds[feedList.selected].url).then(result => {

				bla = result;

				articlesList.setItems(result.items
					.map(x => x.title)
					.map(x => highlights.reduce(getHighlightedItem, x)));

				articleView.setContent(gui.getContent(getSelectedArticle(), articleView.width));

				gui.select(articlesList);
			});
			break;
	}

	gui.render();
});


//----------------------------------------------------
gui.setKeys(articlesList, action => {

	gui.listMove(action, articlesList);

	switch (action){

		case "back":
			gui.select(feedList);
			break;

		case "open":
			exec("opera " + bla.items[articlesList.selected].link);
			break;

		case "select":
			articleView.setContent(gui.getContent(getSelectedArticle(), articleView.width));
			gui.select(articleView);
			break;

		default:
			articleView.setContent(gui.getContent(getSelectedArticle(), articleView.width));
			break;
	}

	gui.render();
});


//----------------------------------------------------
gui.setKeys(articleView, action => {

	switch (action){

		case "back":
			gui.select(articlesList);
			break;

		case "open":
			exec("opera " + bla.items[articlesList.selected].link);
			break;
	}
});


gui.render();
