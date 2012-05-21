require.config({
	paths : {
		'jquery' : 'lib/require-jquery',
		'jquery-ui' : 'lib/jquery-ui.min',
		'transit' : 'lib/jquery.transit',
		'touchpunch' : 'lib/touchpunch',
		'mobile' : 'lib/mobile',
		'underscore' : 'lib/underscore',
		'kbone' : 'lib/backbone',
		'moment' : 'lib/moment',
		'less' : 'lib/less-1.3.0.min'
	}
});

require([ 'order!jquery', 'order!mobile', 'text!vocabulary/food.txt', 'order!jquery-ui', 'order!touchpunch', 'less',
		'transit' ], function($, mobile, foodVocabulary) {

	var vocabulary = {};

	init = function() {

		vocabulary = buildVocabulary({
			'food' : foodVocabulary
		});

		// wait until device is ready
		document.addEventListener("deviceready", function() {
		}, false);

		$('#welcomepage').live('pageshow', function(event, ui) {
			playWelcomepageSong();
		});

		$('#welcomepage').live('pagehide', function(event, ui) {
			welcomepageSong.release();
		});

		$('#settings').live('pageshow', function(event, ui) {
		});

		$('#settings').live('pagehide', function(event, ui) {

		});

		$('#alefbetsong').live('pageshow', function(event, ui) {
			playAlefSong();
		});

		$('#alefbetsong').live('pagehide', function(event, ui) {
			resetAlefSongPanel("", "", "", "");
			if (alefSong != null) {
				alefSong.release();
			}
		});

		$('#letter-detection').live('pageshow', function(event, ui) {
			detectionStatus = 'start';
			detectionExecute(detectionStatus);
			correctVoice = playAudio('welldone.mp3', false);
			mistakeVoice = playAudio('ding.mp3', false);
		});

		$('#letter-detection').live('pagehide', function(event, ui) {
			$("div[id^=detection-]").each(function(index, e) {
				if (e.style === undefined) {
					console.log(e);
				} else {
					e.style.visibility = "visible";
				}
			});
		});

		$('#alefbetsong').live('tap', function(event) {
			$('.alefsong-control').show();
			alefSongLastTap = new Date().getTime();
			setTimeout("hideAlefSongControl(" + alefSongLastTap + ")", 3000);
		});

		$('#alefsong-control-mute').click(function() {
			if (muteButton) {

				alefSong.getCurrentPosition(
				// success callback
				function(position) {
					if (position > -1) {
						mutedOn = position;
						mutedOnTime = new Date().getTime();
						console.log("mutedOn: " + mutedOn);
						console.log("mutedOnTime: " + mutedOnTime);
						alefSong.pause();
					}
				},
				// error callback
				function(e) {
					console.log("Error getting pos=" + e);
				});
			} else {
				var newPosition = mutedOn + (new Date().getTime() - mutedOnTime) / 1000;
				console.log("newPosition: " + newPosition);
				alefSong.seekTo(newPosition * 1000);
				alefSong.play();
			}
			setMute(!muteButton);
		});

		var sideRight = true;

		$("div[id^=writer-]").bind('tap', function() {
			var newLet = $('<div/>').appendTo('#main-writer-letter');

			newLet.transition({
				opacity : 0
			}, 0);
			var color = getColor(this.innerText);
			newLet.attr("class", color + "-letter-medium writer-location-top-0");
			newLet.html(this.innerText);
			newLet.transition({
				opacity : 100
			}, 800, function() {
				$(this).transition({
					y : -220,
					x : (sideRight ? 1 : -1) * Math.random() * 200,
					rotate : '30deg'
				}, 'slow', function() {
					$(this).transition({
						opacity : 0
					}, 'slow', function() {
						$(this).html('');
						$(this).attr('class', '');
						$(this).attr('style', '');
					});
				});
			});
			sideRight = !sideRight;
		});

		gameExecute('rand');

		dragDropExecute('start');

		$.mobile.hashListeningEnabled = false;

		// play the welcome page song
		playWelcomepageSong();

	};

	getColor = function(letter) {
		var ind = letters.indexOf(letter);
		return stylesColor[ind % 5];
	};

	revealLetter = function(element, letter, fn) {
		element.transition({
			rotateY : '90deg'
		}, 300, function() {
			var ind = letters.indexOf(letter);
			var color = stylesColor[ind % 5];
			element.removeClass("black-letter-medium");
			element.addClass(color + "-letter-medium");
			element.html(letter);
		}).transition({
			rotateY : '0deg'
		}, 300, function() {
			if (fn === undefined) {
			} else {
				fn();
			}
		});
	};

	hideLetter = function(element, fn) {
		element.transition({
			rotateY : '90deg',
			delay : 200

		}, 300, function() {
			var letter = element.html();
			var ind = letters.indexOf(letter);
			var color = stylesColor[ind % 5];
			element.removeClass(color + "-letter-medium");
			element.addClass("black-letter-medium");
			element.html("&nbsp;");
		}).transition({
			rotateY : '0deg'
		}, 300, function() {
			if (fn === undefined) {
			} else {
				fn();
			}
		});
	};

	buildVocabulary = function(dictionaries) {

		vocabulary = {};

		$.each(dictionaries, function(index, dictionary) {
			var lines = dictionary.split('\n');
			$.each(lines, function(index, content) {
				if ((index % 2 == 0) && (content.length > 0)) {
					letter = content[0];
					var arr = vocabulary[letter];
					var element = {
						'word' : $.trim(content),
						'image' : $.trim(lines[index + 1])
					};
					if (arr === undefined) {
						arr = [ element ];
					} else {
						arr.push(element);
					}
					vocabulary[letter] = arr;
				}
			});
		});
		return vocabulary;
	};

	onSuccess = function() {
		console.log("playAudio():Audio Success");
	};

	onError = function(error) {
		alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
	};

	setMute = function(status) {
		muteButton = status;
		$('#alefsong-control-mute .ui-btn-text').text(muteButton ? "Mute" : "Unmute");
	};

	resetAlefSongPanel = function(letter, letterClass, imageClass, imageSrc) {
		$('#alefsong-main-letter').text(letter);
		$('#alefsong-main-letter').attr("class", letterClass);
		$('#alefsong-image-img').attr("class", imageClass);
		$('#alefsong-image-img').attr("src", imageSrc);
	};

	playAudio = function(src, isPlay) {
		isPlay = isPlay === undefined ? true : isPlay;
		var prefix = '/android_asset/www/music/';
		if (src.indexOf(prefix) != 0) {
			src = prefix + src;
		}

		// play media object from src
		var my_media = new Media(src, onSuccess, onError);

		if (isPlay) {
			my_media.play();
		}
		return my_media;
	};

	playWelcomepageSong = function() {
		welcomepageSong = playAudio("welcome.mp3");
	};

	playAlefSong = function() {
		$('.alefsong-control').hide();
		setMute(true);
		if (typeof alefSong === "undefined") {
		} else {
			alefSong.release();
		}
		alefSong = playAudio("alefsong.mp3");
		playLetters(0);
	};

	var timing = [ 1500, 1000, 1000, 1500, 1500, 1500, 1500, 1500, 1500, 1500, 1000, 1500, 1500, 1600, 1400, 1500,
			1700, 1500, 1500, 1500, 1500, 1500, 1500 ];

	var stylesColor = [ 'red', 'purple', 'green', 'blue', 'yellow' ];

	var imagesSrc = [ 'images/animal_1.jpg', 'images/animal_1.jpg' ];

	var letters = 'אבגדהוזחטיכלמנסעפצקרשת';

	playLetters = function(index) {
		if ($.mobile.activePage.attr("id") != "alefbetsong") {
			return;
		}
		showLetter(index + 1);
		if (timing.length > index + 1) {
			setTimeout("playLetters(" + (index + 1) + ")", timing[index]);
		} else {
			playAlefSong();
		}
	};

	showLetter = function(index) {
		resetAlefSongPanel(letters[index - 1], stylesColor[(index - 1) % 5] + "-letter", stylesColor[(index - 1) % 5]
				+ "-image", imagesSrc[(index - 1) % 2]);
	};

	showAllLetters = function() {
		for ( var int = 1; int < 23; int++) {
			showLetter(int);
		}
	};

	hideAlefSongControl = function(time) {
		if (alefSongLastTap == time) {
			$('.alefsong-control').fadeOut();
		}
	};

	var words = [ 'שלום' ];
	var voices = [ 'givemeletter.mp3' ];
	var mistakes = 0;
	var blockSelection = false;

	detectionExecute = function(status, arguments) {
		if (status == 'start') {
			var startSong = playAudio("start.mp3");
			setTimeout(function() {
				detectionExecute('word');
			}, 3000);
			setTimeout(function() {
				startSong.release();
			}, 4000);

		} else if (status == 'word') {
			blockSelection = false;
			var word = words[0];
			var voice = voices[0];
			var voiceSong = playAudio(voice);
			setTimeout(function() {
				voiceSong.release();
			}, 2000);
			mistakes = 0;
			$("div[id^=detection-]").bind('tap', function() {
				if (blockSelection) {
					return;
				}
				blockSelection = true;
				detectionExecute('selected', {
					clicked : this,
					word : word
				});
			});

		} else if (status == 'selected') {
			var clicked = arguments.clicked.innerText;
			var word = arguments.word;
			detectionExecute(word[0] == clicked ? 'correct' : 'wrong', {
				clicked : arguments.clicked
			});

		} else if (status == 'correct') {
			// play welldone
			var s = playAudio('welldone.mp3');
			setTimeout(function() {
				s.release();
			}, 5000);

			// randomize a new word
			setTimeout(function() {
				detectionExecute('word');
			}, 2000);

			// hide word
			var clicked = arguments.clicked;
			clicked.style.visibility = "hidden";

		} else if (status == 'wrong') {
			var s = playAudio('ding.mp3');
			setTimeout(function() {
				s.release();
			}, 5000);
			mistakes++;
			blockSelection = false;
		}
	};

	var boards = [ [ 2, 2 ], [ 2, 3 ], [ 4, 3 ], [ 4, 4 ] ];
	var board = [];
	var boardLevel = 0;
	var boardLetters = [];
	var maxLetter = 8;
	var minLetter = 1;
	var previousTap = null;
	var matching = false;

	gameExecute = function(status, arguments) {

		if (status == 'rand') {
			boardLetters = [];
			var cols = boards[boardLevel][0];
			var rows = boards[boardLevel][1];
			while (boardLetters.length != rows * cols) {
				var letter = letters[Math.ceil(Math.random() * (maxLetter - minLetter + 1))];
				if ($.inArray(letter, boardLetters) == -1) {
					boardLetters.push(letter);
					boardLetters.push(letter);
				}
			}
			boardLetters = shuffle(boardLetters);
			board = listToMatrix(boardLetters, rows, cols);
			gameExecute('render');

		} else if (status == 'render') {

			// reset
			$('#board-game').html("");

			$.each(board, function(indX, row) {
				var iX = indX;
				$.each(row, function(iY, e) {
					var l = $("<div/>").appendTo('#board-game');
					l.addClass("black-letter-medium");
					var x = (iY + 1) * (100 / (board[iX].length + 2)) + '%';
					l.css('top', x);
					var y = (iX + 1) * (100 / (board.length + 2)) + '%';
					l.css('right', y);
					l.html("&nbsp;");

					l.bind('tap', function() {
						gameExecute('tap', {
							'clicked' : l,
							'x' : iX,
							'y' : iY
						});
					});
				});
			});

		} else if (status == 'tap') {
			if (matching) {
				return;
			}
			if (previousTap == null) {
				previousTap = arguments;
				revealLetter(arguments.clicked, board[arguments.x][arguments.y]);
			} else {
				matching = true;
				var selected = board[arguments.x][arguments.y];
				revealLetter(arguments.clicked, selected);
				if (selected != board[previousTap.x][previousTap.y]) {
					hideLetter(arguments.clicked, function() {
						hideLetter(previousTap.clicked);
						gameExecute('result', {
							result : false
						});
					});
				} else {
					gameExecute('result', {
						result : true
					});
				}
			}

		} else if (status == 'result') {
			previousTap = null;
			matching = false;
			if (arguments.result) {
				// carrot sound?
				boardLetters.pop();
				boardLetters.pop();
				if (boardLetters.length == 0) {
					setTimeout(function() {
						boardLevel = (boardLevel + 1) % (boards.length);
						gameExecute('rand');
					}, 2000);
				}
			} else {
				// stick sound?
			}
		}
		;
	};

	listToMatrix = function(arr, rows, cols) {
		var matrix = [];
		if (rows * cols === arr.length) {
			for ( var i = 0; i < arr.length; i += cols) {
				matrix.push(arr.slice(i, cols + i));
			}
		}
		return matrix;
	};

	shuffle = function(arr) {
		for ( var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x)
			;
		return arr;
	};

	randomBt = function(from, to) {
		return Math.floor(Math.random() * (to - from + 1) + from);
	};

	var position = {};
	var currentState = {};

	dragDropExecute = function(status, arguments) {

		if (status == 'start') {
			var letter = letters[randomBt(0, 21)];
			var extraLetter = letter;
			while (letter == extraLetter)
				extraLetter = letters[randomBt(0, 21)];
			console.log(letter);
			console.log(extraLetter);
			var orig = vocabulary[letter][randomBt(0, vocabulary[letter].length - 1)];
			var extra = vocabulary[extraLetter][randomBt(0, vocabulary[extraLetter].length - 1)];
			var target = randomBt(1, 2);
			currentState = {
				letter : letter,
				orig : orig,
				target : target,
				extra : extra
			};
			dragDropExecute('render', currentState);

		} else if (status == 'render') {

			var letter = arguments.letter;
			var imOrig = arguments.orig.image;
			var imExtra = arguments.extra.image;
			var target = arguments.target;

			var color = getColor(letter);
			$('#drag-letter').removeAttr('style');
			$('#drag-letter').html(letter);
			$('#drag-letter').attr("class", color + "-letter-medium");
			$('#drag-letter').css('top', '40%');
			$('#drag-letter').css('left', '60%');
			position = $('#drag-letter').position();

			$('#drag-letter').draggable({
				containment : ".containment-wrapper"
			});

			$.each([ 1, 2 ], function(ind, e) {
				var box = e;
				$('#drop-' + box).attr('class', 'drop-image');
				$('#drop-' + box).css('background-image', "url('" + box == target ? imOrig : imExtra + "')");
				$('#drop-' + box).css('top', box == 1 ? '20%' : '60%');
				$('#drop-' + box).droppable({
					accept : "#drag-letter",
					activeClass : "ui-state-hover",
					hoverClass : "ui-state-active",
					drop : function(event, ui) {
						dragDropExecute('dropped', {
							index : box,
							target : target
						});
					}
				});
			});

		} else if (status == 'dropped') {
			var current = $('#drag-letter').position();
			var index = arguments.index;
			var target = arguments.target;

			if (index == target) {
				dragDropExecute('start');
			} else {
				$('#drag-letter').transition({
					x : position.left - current.left,
					y : position.top - current.top,
					delay : 200
				}, 500, function() {
					dragDropExecute('render', currentState);
				});

			}
		}
	};

	init();
});
