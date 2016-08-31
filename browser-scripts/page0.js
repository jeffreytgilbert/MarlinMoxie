function submitGoogleSearchQuery (searchQuery) {
	'use strict';
	/* globals $:false */

	console.log('The search script has loaded and been passed the value: ', searchQuery);

	// Create a polling function that calls itself every 20ms until the page has updated.
	var isGoogleFinishedSearching = function () {
		console.log('The search script is checking for results.');

		// I just randomly found that google has some div tag with the id of "easter-egg" on it, but only when results are ready.
		// <div data-jibp="" data-jiis="uc" id="easter-egg"></div>
		// So we just keep checking and checking until that appears.
		if ($('#resultStats') && $('#resultStats').length >= 1) {
			// When it's there, we tell phantomjs that the page is ready to read.
			if (typeof window.callPhantom === 'function') {
				window.callPhantom({ searchStatus: 'Google Search Completed' });
			} else {
				// if it's not there, we have an issue.
				console.error('Could not find a callPhantom function.');
			}
			// Purposefully don't register another setTimeout because we're done and we don't want to loop anymore.
		} else {
			// If there is no easter egg, keep checking.
			setTimeout(isGoogleFinishedSearching, 100); // 20 milliseconds is roughly 1 animation frame.
		}

	};

	var values = [];

	$('.bot-question span').each(function () {
		var val = $(this).html();
		values.push(val);
		console.log('Added ', val);
	});

	$('input[name=bot_anser_0]').val(values[0]+values[1]);

	$('input[type=submit]').submit();

	if (typeof window.callPhantom === 'function') {
		window.callPhantom({ page0result: 'page0done' });
	} else {
		// if it's not there, we have an issue.
		console.error('Could not find a callPhantom function.');
	}

}
