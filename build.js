const webpack = require("webpack");
const rewire = require("rewire");
const defaults = rewire("react-scripts/scripts/build.js");
let config = defaults.__get__("config");

// The solution was adapted from https://stackoverflow.com/a/66352697.
// Documented on https://webpack.js.org/plugins/limit-chunk-count-plugin/.
config.plugins.push(
	new webpack.optimize.LimitChunkCountPlugin({
		maxChunks: 1,
	})
);

// config.optimization.splitChunks = {
// 	minSize: Infinity,
// 	minChunks: Infinity,

// 	cacheGroups: {
// 		default: false,
// 	}
// };

config.optimization.runtimeChunk = false;

// Renames outputs to avoid hashes.
config.output.filename = "static/js/[name].js";
config.plugins[5].options.filename = "static/css/[name].css";
config.plugins[5].options.moduleFilename = () => "static/css/main.css";