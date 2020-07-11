const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
	entry: "./src/index.js",
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			},
			{
				test: /\.css$/,
				use: ["style-loader", "css-loader"]
			}
		]
	},
	resolve: {
		extensions: ['*', '.js', '.jsx']
	},

	output: {
		path: path.join(__dirname, "/dist"),
		publicPath: '/',
		filename: "index_bundle.js"
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: "./src/index.html"
		})
	]
};
