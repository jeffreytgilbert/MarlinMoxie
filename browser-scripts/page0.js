function page0js (searchQuery) {
	'use strict';
	/* globals $:false */

	console.log('The search script has loaded and been passed the value: ', searchQuery);

	var values = [];

	console.log($('.bot-timer').html());

	var botTime = $('.bot-timer span').html();

	botTime = botTime > 3 ? botTime - 1 : 0;

	console.log(botTime);

	var maths = {
		subOperators: function(string){
			if(string.includes('x')) {
				var newString = string.replace('x', '*');
			}
			if (string.includes('÷')) {
				newString = string.replace('÷', '/');
			}
			return newString;
		},
		getResult: function(text) {
			var firstPart = text.split('What is ')[1],
				secondPart = firstPart.split(' ?')[0],
				result = mathjs.eval(subOperators(secondPart));
			return result;
		}
	};
	
	setTimeout(function () {

		$('.bot-question span').each(function () {
			var val = $(this).html();
			values.push(val);
			console.log('Added ', val);
		});

		$('input[name=bot_answer_0]').val(
			maths.getResult(
				maths.subOperators(
					$('.bot-question').text()
				)
			)
		);

		//$('input[name=bot_answer_0]').val((+values[0])+(+values[1]));

		$('input[type=submit]').click();

		if (typeof window.callPhantom === 'function') {
			window.callPhantom({ page0result: 'page0done' });
		} else {
			// if it's not there, we have an issue.
			console.error('Could not find a callPhantom function.');
		}

	}, botTime * 1000);

}
