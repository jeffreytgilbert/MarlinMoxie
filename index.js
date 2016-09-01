
/* global phantom */

'use strict';

var page = require('webpage').create(),
	$ = require('jQuery'),
	fs = require('fs'), // jshint ignore:line
	utils = require('lodash');

page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36';

/*
var printCookies = function (page) {
	if (!page) { return console.log('I would print cookies out, but you didn\'t give me a page to do it on');}
	console.log('COOKIES!');
	Object.keys(page.cookies).forEach(function (key) {
		var cookie = page.cookies[key];
		console.log(key, ':',
			cookie.name, ':',
			cookie.value, ':',
			cookie.httponly, ':',
			cookie.secure, '!',
			cookie.domain, ':',
			cookie.path, ':'
		);
	});
};
*/

page.viewportSize = {
	width: 1229,
	height: 942
};

var i = 1;
var takeSnapshot = function (noteText) {
	var note = noteText || Date.now().toString();
	console.info(i + '. ' + note);
	page.render('/Users/jgilbert/Desktop/snapshots/' + i + '-' + note + '.png', {format: 'png', quality: '50'});
	i += 1;
};

page.onConsoleMessage 	= function (msg)	{ console.debug('console.log("' + msg + '");'); };
page.onUrlChanged 		= function () 		{ console.info('The Url Changed'); };
page.onLoadFinished 	= function () 		{ takeSnapshot('The Page Has Loaded'); };
page.onAlert 			= function () 		{ takeSnapshot('An Alert Popped Up'); };
page.onConfirm		 	= function () 		{ takeSnapshot('A Confirm Popped Up'); };
page.onPrompt 			= function () 		{ takeSnapshot('A Prompt Popped Up'); };


var step0go = function (callback) {
	page.open('https://10.0.1.44:5555/bot-challenge/step/0/go', function (status) {

		if (status === 'success') {

			console.log('First page loaded.');

			// If I don't care what the output is from the javascript I'm running, I can use injectJS
			if (page.injectJs('browser-scripts/mathjs.js')) {

				takeSnapshot('Injected jQuery At Start of page 0');

				//printCookies(page);

				// A callback is a function that is called by some other function later.
				// We're allowing phantom browser to call back to phantomjs with results so we can wait the right amount
				// of time for something to finish running before reading search results.

				// Set a callback function to capture events being kicked off by javascript in the phantom browser.
				page.onCallback = function (data) {
					if (data.page0result === 'page0done') {

						takeSnapshot('page0done');

						// pass in the callback function so it can be called when the results are read.
//						readGoogleSearchResults(callback);
					} else {
						console.log('Got a callback event, but it was not what we were waiting for.',
							JSON.stringify(data)
						);
					}
				};

				// If I do care what the output is, and I want to pass arguments to the javascript function, I use evaluate.
				// This is not documented correctly, but it does work. evaluateJavaScript does not work like this, but should.
				page.evaluateAsync(
					fs.read('browser-scripts/page0.js'),
					0, // no delay needed, but this is where you add one. not sure if this is a timeout or what.
					null
				);

				console.log('Waiting for page to finish submitting.');

			} else {
				return callback(
					new Error('Could not load jQuery.'),
					null
				);
			}

		} else {
			return callback(
				new Error('Could not load Page.'),
				null
			);
		}

	});
};

var start = function (callback) {
	page.open('https://10.0.1.44:5555/login', function (status) {
		phantom.addCookie({
			'name': 'connect.sid',
			'value': 's%3At5E3FexTX6-AnqFizJwRyLH3FX6GnXFo.11kyL8nbhm%2BvhpDlBGG37mpz4vZTTNpSPPpPZpp3jMI',
			'domain': '10.0.1.44'
		});
		step0go(callback);
	});
};

start(function (err, data) {
	if (err) {
		console.log('Encountered an error');
		return console.error(err.message, data);
	}

	/*
	// Keep track of possible aliases
	var probableAliases = [],
		mightBeAliases = [];

	data.results.forEach(function (result) {
		var alias = result.link.split('github.com/')[1];
		if (alias.split('/').length === 1) {
			probableAliases.push(alias.split('?')[0].toString());
		} else {
			mightBeAliases.push(alias.split('/')[0].toString());
		}
	});
	*/

	var debsResults = [];
	data.results.forEach(function (result) {
		debsResults.push(result.link);
//		console.log(result.link);
	});


	console.log('---------------------------- REPORT --------------------------------');
	console.log(utils.uniq(debsResults).join('\n'));
	//console.log('Possible aliases: ', utils.uniq(probableAliases).join(', '));
	//console.log('Might be aliases: ', utils.uniq(mightBeAliases).join(', '));

	phantom.exit();
});
