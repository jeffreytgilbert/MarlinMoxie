function getLinks(page) {
	'use strict';
	/* globals $:false */

	var Result = function (title, description, link, page) {
		this.title = title;
		this.description = description;
		this.link = link;
		this.page = page;
	};

	var searchResults = {
		results: [],
		pages: page
	};

	// create a function that can walk the page for results, then kick over to the next page.
	var readResultsFromPage = function () {
		$('cite[class=_Rm]').each(function(){
			if ($(this).text()) {
				console.info('Found a link: ' + $(this).text());

				var resultTag = $(this).parent('.rc');

				// Clean up the description by removing the date since it's useless
				$('span.st', resultTag).remove('span');

				searchResults.results.push(new Result(
					$('a', resultTag).text(), // title
					$('span.st', resultTag).text(), // description (without the date)
					$(this).text(), // link without the google clickthrough cruft
					searchResults.pages
				));
			} else {
				console.warn('Skipped a link. Might need to check why.');
			}
		});

		// Done reading links from this page. Are there more pages to read?
		if ($('#pnnext').length > 0) {
			// report results back
			window.callPhantom({
				searchResults: searchResults,
				status: 'searching'
			});

			// click the next page link
			location.href = $('#pnnext').attr('href');
		} else {
			window.callPhantom({
				searchResults: searchResults,
				status: 'finished'
			});
		}
	};

	// start trying to read results off of the page.
	readResultsFromPage();

}
