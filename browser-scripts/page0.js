function submitGoogleSearchQuery (searchQuery) {
	'use strict';
	/* globals $:false */

	console.log('The search script has loaded and been passed the value: ', searchQuery);

	var values = [];

	$('.bot-question span').each(function () {
		var val = $(this).html();
		values.push(val);
		console.log('Added ', val);
	});

	$('input[name=bot_answer_0]').val((+values[0])+(+values[1]));

	$('input[type=submit]').click();

	if (typeof window.callPhantom === 'function') {
		window.callPhantom({ page0result: 'page0done' });
	} else {
		// if it's not there, we have an issue.
		console.error('Could not find a callPhantom function.');
	}

}
