import svelte from 'rollup-plugin-svelte';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import json from 'rollup-plugin-json';
import { terser } from 'rollup-plugin-terser';
import { scss } from '@kazzkiq/svelte-preprocess-scss';
import builtins from 'rollup-plugin-node-builtins';
import replace from 'rollup-plugin-replace';
import packagejson from './package.json';
import dayjs from 'dayjs';
import fs from 'fs';

const production = !process.env.ROLLUP_WATCH;

// Replace Local Host with whatever the domain is
let manifestFile = fs.readFileSync('./public/manifest.json', 'UTF-8');
if (process.env.URL) {
	manifestFile = manifestFile.replace(/http\:\/\/localhost\:5000/gi, process.env.URL);
	fs.writeFileSync('./public/manifest.json', manifestFile, 'UTF-8');
}
let manifest = JSON.parse(manifestFile);

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'nomie',
		file: 'public/bundle.js',
		globals: {},
	},
	plugins: [
		builtins(),
		//
		replace({
			APP_VERSION: packagejson.version,
			APP_BRANCH: process.env.BRANCH,
			APP_URL: manifest.start_url,
			APP_CONTEXT: process.env.CONTEXT,
			APP_BUILD_DATE: dayjs().format('ddd MMM D YYYY h:mma'),
		}),
		scss({
			input: './scss/main.scss',
			output: function(styles, styleNodes) {
				writeFileSync('./public/main.css', styles);
			},
		}),
		svelte({
			// enable run-time checks when not in production
			dev: !production,
			preprocess: {
				style: scss({ all: true }),
			},
			// we'll extract any component CSS out into
			// a separate file — better for performance
			css: css => {
				css.write('public/bundle.css');
			},
		}),

		json(),
		resolve(),
		commonjs(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser(),
	],
	watch: {
		clearScreen: true,
	},
};

// copy({
// 	targets: [
// 		{ src: 'node_modules/leaflet/dist/**/*', dest: 'public/vendors/leaflet' },
// 		{
// 			src: 'node_modules/esri-leaflet/dist/esri-leaflet.js',
// 			dest: 'public/vendors/leaflet',
// 		},
// 		{
// 			src: 'node_modules/esri-leaflet-geocoder/dist/esri-leaflet-geocoder.js',
// 			dest: 'public/vendors/leaflet',
// 		},
// 		{
// 			src: 'node_modules/esri-leaflet-geocoder/dist/esri-leaflet-geocoder.css',
// 			dest: 'public/vendors/leaflet',
// 		},
// 		{
// 			src: 'node_modules/material-design-iconic-font/dist/**/*',
// 			dest: 'public/vendors/material-design-iconic-font',
// 		},
// 		{ src: 'node_modules/blockstack/dist/**/*', dest: 'public/vendors/blockstack' },
// 	],
// }),
