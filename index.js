
/* global phantom */

'use strict';

var page = require('webpage').create(),
	$ = require('jQuery'),
	fs = require('fs'),
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

var readGoogleSearchResults = function (callback) {

	var searchResults = {
		results: [],
		pages: 1
	};

	takeSnapshot('Google Search Results Returned');

	// First, set the handler so we are ready to catch the results when they come in
	page.onCallback = function (dataInWebPage) {

		console.log('crawl-google-results.js and the status is now:', dataInWebPage.status);
		console.log('On page', JSON.stringify(dataInWebPage.searchResults));
		dataInWebPage.searchResults.results.forEach(function (result) {
			searchResults.results.push(result);
		});

		if (dataInWebPage.status === 'searching') {
			searchResults.pages += 1;
			takeSnapshot('Captured A Page Of Results');
			setTimeout(function () {
				if (page.injectJs('browser-scripts/jquery.js')) {
					page.evaluateAsync(
						fs.read('browser-scripts/crawl-google-results.js'),
						0, // no delay needed, but this is where you add one. not sure if this is a timeout or what.
						searchResults.pages
					);
				} else {
					console.error('Could not continue. jQuery would not inject into the page.');
				}
			}, 3000);
		} else {
			console.log('All done', JSON.stringify(searchResults));
			return callback(null, searchResults);
		}

	};

	page.evaluateAsync(
		fs.read('browser-scripts/crawl-google-results.js'),
		0, // no delay needed, but this is where you add one. not sure if this is a timeout or what.
		1 // first page
	);

};

var searchGoogle = function (googleSearchQuery, callback) {
	page.open('http://www.google.com', function (status) {

		if (status === 'success') {

			console.log('Finished loading google search form.');

			// If I don't care what the output is from the javascript I'm running, I can use injectJS
			if (page.injectJs('browser-scripts/jquery.js')) {

				takeSnapshot('Injected jQuery At Startup');

				//printCookies(page);

				// A callback is a function that is called by some other function later.
				// We're allowing phantom browser to call back to phantomjs with results so we can wait the right amount
				// of time for something to finish running before reading search results.

				// Set a callback function to capture events being kicked off by javascript in the phantom browser.
				page.onCallback = function (data) {
					if (data.searchStatus === 'Google Search Completed') {

						takeSnapshot('Form Has Been Submitted');

						// pass in the callback function so it can be called when the results are read.
						readGoogleSearchResults(callback);
					} else {
						console.log('Got a callback event, but it was not what we were waiting for.',
							JSON.stringify(data)
						);
					}
				};

				// If I do care what the output is, and I want to pass arguments to the javascript function, I use evaluate.
				// This is not documented correctly, but it does work. evaluateJavaScript does not work like this, but should.
				page.evaluateAsync(
					fs.read('browser-scripts/submit-google-search-query.js'),
					0, // no delay needed, but this is where you add one. not sure if this is a timeout or what.
					googleSearchQuery
				);

				console.log('Waiting for Google to finish loading search results...');

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

// go search google. Find you some goodies.
searchGoogle('(intitle:resume or inurl:resume or intext:resume) (2014 or 2015 or 2016) (Denver or Colorado) Oracle Java -jobs', function (err, data) {
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
