

//----------------------------------------------------
exports.copy = (obj) =>
	JSON.parse(JSON.stringify(obj));


//----------------------------------------------------
exports.prop = (obj, path, def) => 
	path.split(".").reduce(function(x, prop){
		return x ? x[prop] : false;
	}, obj) || def;
