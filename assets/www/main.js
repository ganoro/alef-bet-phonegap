require.config({
	paths : {
		'jquery' : 'lib/require-jquery',
		'mobile' : 'lib/mobile',
		'underscore' : 'lib/underscore',
		'backbone' : 'lib/backbone',
		'moment' : 'lib/moment',
		'less' : 'lib/less-1.3.0.min'
	}
});

require(
		[ 'jquery', 'mobile', 'less' ],
		function($, mobile) {

			init = function() {
				// wait until device is ready
				document.addEventListener("deviceready", function() {
				}, false);

				$.mobile.hashListeningEnabled = false;

				if ((typeof cordova == 'undefined')
						&& (typeof Cordova == 'undefined')) {
					alert('Cordova variable does not exist. Check that you have included cordova.js correctly');
				}

				// play the welcome page song
				playWelcomepageSong();

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

				$('#alefbetsong').live(
						'tap',
						function(event) {
							$('.alefsong-control').show();
							alefSongLastTap = new Date().getTime();
							setTimeout("hideAlefSongControl(" + alefSongLastTap
									+ ")", 3000);
						});

				$('#alefsong-control-mute').click(
						function() {
							if (muteButton) {

								alefSong.getCurrentPosition(
								// success callback
								function(position) {
									if (position > -1) {
										mutedOn = position;
										mutedOnTime = new Date().getTime();
										console.log("mutedOn: " + mutedOn);
										console.log("mutedOnTime: "
												+ mutedOnTime);
										alefSong.pause();
									}
								},
								// error callback
								function(e) {
									console.log("Error getting pos=" + e);
								});
							} else {
								var newPosition = mutedOn
										+ (new Date().getTime() - mutedOnTime)
										/ 1000;
								console.log("newPosition: " + newPosition);
								alefSong.seekTo(newPosition * 1000);
								alefSong.play();
							}
							setMute(!muteButton);
						});

			};

			onSuccess = function() {
				console.log("playAudio():Audio Success");
			};

			onError = function(error) {
				alert('code: ' + error.code + '\n' + 'message: '
						+ error.message + '\n');
			};

			setMute = function(status) {
				muteButton = status;
				$('#alefsong-control-mute .ui-btn-text').text(
						muteButton ? "Mute" : "Unmute");
			};

			resetAlefSongPanel = function(letter, letterClass, imageClass,
					imageSrc) {
				$('#alefsong-main-letter').text(letter);
				$('#alefsong-main-letter').attr("class", letterClass);
				$('#alefsong-image-img').attr("class", imageClass);
				$('#alefsong-image-img').attr("src", imageSrc);
			};

			playAudio = function(src) {
				// play media object from src
				var my_media = new Media(src, onSuccess, onError);
				my_media.play();
				return my_media;
			};

			playWelcomepageSong = function() {
				welcomepageSong = playAudio("/android_asset/www/music/welcome.mp3");
			};

			playAlefSong = function() {
				$('.alefsong-control').hide();
				setMute(true);
				if (typeof alefSong === "undefined") {
				} else {
					alefSong.release();
				}
				alefSong = playAudio("/android_asset/www/music/alefsong.mp3");
				playLetters(0);
			};

			var timing = [ 1500, 1000, 1000, 1500, 1500, 1500, 1500, 1500,
					1500, 1500, 1000, 1500, 1500, 1600, 1400, 1500, 1700, 1500,
					1500, 1500, 1500, 1500, 1500 ];

			var stylesColor = [ 'red', 'purple', 'green', 'blue', 'yellow' ];

			var imagesSrc = [ 'images/animal_1.jpg', 'images/animal_1.jpg' ];

			var letters = 'אבגדהוזחטיכלמנסעפצקרשת';

			playLetters = function(index) {
				if ($.mobile.activePage.attr("id") != "alefbetsong") {
					return;
				}
				showLetter(index + 1);
				if (timing.length > index + 1) {
					setTimeout("playLetters(" + (index + 1) + ")",
							timing[index]);
				} else {
					playAlefSong();
				}
			};

			showLetter = function(index) {
				resetAlefSongPanel(letters[index - 1],
						stylesColor[(index - 1) % 5] + "-letter",
						stylesColor[(index - 1) % 5] + "-image",
						imagesSrc[(index - 1) % 2]);
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

			init();
		});
