'use strict';

/* Directives */

var module = angular.module('bloomboard.directives', []);
<<<<<<< HEAD

=======
>>>>>>> c04b40c5418c328fe4705dc90e0bcc7112126cf6
module.directive('clickLogin', function() {
	return {
		restrict: 'A',
		scope: true,
		replace: true,
		templateUrl: 'partials/loginmodal',
		controller: ['$scope', '$http', '$location', 'sessionService',
			function($scope, $http, $location, sessionService) {

				if (sessionService.activeSession) {
					$("#loginModal").modal('show');
				}

				$scope.$watch(function() {
						return sessionService.activeSession;
					},
					function(newVal) {
						if (newVal)
							$("#loginModal").modal('hide');
						else
							$("#loginModal").modal('show');
					});

				$scope.showLogin = true;


				$scope.checkValidity = function(inputElem) {
					return inputElem.$dirty && inputElem.$invalid;
				}

				var alertOpenHtml = "<div id='failAlert' class='alert alert-danger alert-dismissable'>" +
					"<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>";

				var showFailedLoginMessage = function(warningMessage) {
					$("#loginHidden #failAlert").remove();
					if (warningMessage != null) {
						$("#loginHidden button").before(alertOpenHtml + warningMessage + "</div>");
					}
				}

				var showFailedRegisterMessage = function(warningMessage) {
					$("#signUpHidden #failAlert").remove();
					if (warningMessage != null) {
						$("#signUpHidden button").before(alertOpenHtml + warningMessage + "</div>");
					}
				}

				$scope.loginData = function() {
					//add some validation?
					if ($(".alert"))
						sessionService.login($scope.login, showFailedLoginMessage);
				};
				$scope.createUser = function() {
					//add some validation?
					sessionService.register($scope.create, showFailedRegisterMessage);
				};
			}
		]
	};
});

module.directive('bloomboard', function(socket, persistenceService, sessionService) {
	return {
		restrict: "E",
		templateUrl: 'partials/bloomboard',
		scope: {
			width: "=",
			height: "="
		},
		compile: function(element, attrs) {
			var css = document.createElement("style");
			css.type = "text/css";
			css.innerHTML = "#drawingBoard { width: " + attrs.width + "px; height: " + attrs.height + "px; }";
			document.body.appendChild(css);
			var sketchpad = Raphael.sketchpad("drawingBoard", {
				width: attrs.width,
				height: attrs.height,
				editing: true
			});

			return function(scope, element, attrs, controller) {

				scope.isSelectMode = false;

				scope.toggleSelectMode = function() {
					scope.isSelectMode = !scope.isSelectMode;
					if (scope.isSelectMode) {
						sketchpad.editing("select");
					} else {
						sketchpad.editing(true);
						sketchpad.clearSelected();
					}
				}

				persistenceService.getBoardData().then(function(boardInfo) {
					sketchpad.json(boardInfo.data.data, {
						fireChange: false,
						overwrite: true
					});
				});

				socket.on('connect', function() {

					var penID;

					socket.on('penID', function(uPenID) {
						penID = uPenID;
					});

					socket.on('concurrent_users', function(con_pens) {
						sketchpad.add_current_users(con_pens);
					});


					socket.emit('s_new_con_user', {
						'pen': Cereal.stringify(sketchpad.pen())
					});

					sketchpad.change(function() { // need to pass in change instead of finding it out the long way
						var boardData = document.querySelector('#boardData');
						var json = sketchpad.json();
						boardData.value = JSON.stringify(json);
						socket.emit('draw', json[json.length - 1]); // emit added element change
					});

					socket.on('clearBoard', function(data) {
						sketchpad.clear();
					});

					scope.clearBoard = function() {
						// var img = canvas.toDataURL("image/png");
						// exportService.svg_png(sketchpad.canvas);
						console.log('clear')
						var canvas = document.createElement('canvas');
						canvas.id = 'canvas';
						canvas.width =  1000;
						canvas.height = 1000;
						document.body.appendChild(canvas);
						var paper = sketchpad.paper();
						console.log("paper" + paper);
						//var svg = paper.toSVG();
						var svg = '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="overflow: hidden; position: relative;" width="640" version="1.1" height="320"><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M135,193L135,193L135,194L135,194L137,197L137,197L145,206L145,206L152,211L152,211L159,213L159,213L161,214L161,214L166,215L166,215L167,216L167,216L169,216L169,216L178,215L178,215L187,212L187,212L190,210L190,210L193,209L193,209L199,204L199,204L205,197L205,197L207,194L207,194L208,191L208,191L209,185L209,185L209,184L209,184" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M274,156L274,156L274,158L274,158L275,165L275,165L278,173L278,173L281,185L281,185L285,193L285,193L294,208L294,208L296,209L296,209" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M384,134L384,134L385,134L385,134L388,134L388,134L392,134L392,134L397,135L397,135L400,136L400,136L401,137L401,137L403,138L403,138L403,139L403,139L406,140L406,140L408,142L408,142L411,144L411,144L414,145L414,145L415,147L415,147L416,147L416,147L417,148L417,148L418,148L418,148L419,149L419,149L421,151L421,151L424,153L424,153L427,156L427,156L428,158L428,158L430,159L430,159L431,160L431,160L433,163L433,163L435,165L435,165L437,168L437,168L440,171L440,171L441,172L441,172L442,174L442,174L443,176L443,176L445,179L445,179L447,182L447,182L450,185L450,185L452,189L452,189L452,191L452,191L453,192L453,192L453,193L453,193L453,195L453,195L454,196L454,196L454,197L454,197L454,198L454,198L454,199L454,199L454,200L454,200L454,201L454,201L453,201L453,201L453,202L453,202L452,203L452,203L452,204L452,204L451,205L451,205L451,206L451,206L450,208L450,208L449,209L449,209L449,210L449,210L448,213L448,213L448,214L448,214L447,215L447,215L447,216L447,216L446,217L446,217L445,218L445,218L445,219L445,219L444,220L444,220L443,221L443,221L442,222L442,222L442,223L442,223L440,224L440,224L439,225L439,225L438,226L438,226L437,226L437,226L436,226L436,226L435,227L435,227L433,228L433,228L432,229L432,229L431,229L431,229L430,230L430,230L428,230L428,230L427,230L427,230L426,230L426,230L425,230L425,230L423,230L423,230L421,231L421,231L419,231L419,231L416,231L416,231L414,231L414,231L411,231L411,231L409,231L409,231L407,231L407,231L405,231L405,231L403,231L403,231L402,231L402,231L401,231L401,231L401,231L401,231L400,231L400,231L399,231L399,231L398,231L398,231L397,231L397,231L396,231L396,231L395,231L395,231L394,231L394,231L393,231L393,231L391,231L391,231L390,230L390,230L389,230L389,230L387,229L387,229L385,228L385,228L384,227L384,227L382,225L382,225L381,224L381,224L379,222L379,222L378,220L378,220L377,218L377,218L375,216L375,216L374,215L374,215L374,213L374,213L373,212L373,212L373,210L373,210L373,209L373,209L373,206L373,206L372,203L372,203L371,200L371,200L368,193L368,193L366,190L366,190L364,185L364,185L362,183L362,183L362,181L362,181L362,180L362,180L361,180L361,180L361,179L361,179L360,176L360,176L358,173L358,173L356,168L356,168L355,164L355,164L353,161L353,161L351,158L351,158L350,157L350,157L349,156L349,156L348,155L348,155L347,154L347,154L346,151L346,151L344,150L344,150L341,148L341,148L340,146L340,146L337,145L337,145L334,145L334,145L331,143L331,143L327,142L327,142L323,141L323,141L321,141L321,141L317,140L317,140L314,140L314,140L310,139L310,139L306,139L306,139L304,139L304,139L300,138L300,138L297,137L297,137L295,135L295,135L293,134L293,134L291,133L291,133L288,133L288,133L287,132L287,132L284,131L284,131L282,129L282,129L281,129L281,129L280,127L280,127L279,126L279,126L278,126L278,126L276,126L276,126L274,125L274,125L273,125L273,125L271,124L271,124L269,124L269,124L268,124L268,124L267,124L267,124L265,124L265,124L264,124L264,124L263,124L263,124" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M545,79L545,79L545,80L545,80L544,82L544,82L544,83L544,83L544,85L544,85L544,87L544,87L544,88L544,88L544,90L544,90L544,92L544,92L544,94L544,94L544,96L544,96L544,99L544,99L544,101L544,101L544,104L544,104L544,107L544,107L544,110L544,110L544,112L544,112L544,113L544,113L544,115L544,115L544,116L544,116L543,118L543,118L543,119L543,119L543,120L543,120L543,121L543,121L542,122L542,122L542,123L542,123L542,124L542,124L542,125L542,125L542,127L542,127L542,128L542,128L542,129L542,129L542,130L542,130L542,131L542,131L542,132L542,132L542,134L542,134L542,135L542,135L542,136L542,136L542,137L542,137L542,139L542,139L542,141L542,141L542,143L542,143L542,144L542,144L542,146L542,146L542,147L542,147L542,148L542,148L542,149L542,149L542,150L542,150L542,151L542,151L542,152L542,152L542,153L542,153L542,154L542,154L542,155L542,155L542,156L542,156L542,157L542,157L542,158L542,158L542,159L542,159L541,161L541,161L541,162L541,162L541,163L541,163L541,164L541,164L541,165L541,165L541,166L541,166L541,168L541,168L541,169L541,169L541,171L541,171L541,172L541,172L541,173L541,173L541,175L541,175L541,176L541,176L541,177L541,177L541,178L541,178L541,179L541,179L541,180L541,180L541,181L541,181L540,181L540,181L540,182L540,182L540,183L540,183L540,184L540,184L540,185L540,185L540,186L540,186L540,188L540,188L540,189L540,189L540,190L540,190L540,191L540,191L540,192L540,192L540,193L540,193L540,194L540,194L540,195L540,195L540,196L540,196L540,197L540,197L540,198L540,198" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M29,59L29,59L29,58L29,58L29,61L29,61L29,64L29,64L29,68L29,68L29,72L29,72L29,75L29,75L29,79L29,79L29,80L29,80L29,81L29,81L29,82L29,82L29,83L29,83L30,86L30,86L30,88L30,88L31,91L31,91L31,94L31,94L32,99L32,99L32,101L32,101L32,101L32,101L33,102L33,102L33,106L33,106L34,109L34,109L35,113L35,113L35,115L35,115L36,116L36,116L36,117L36,117L36,118L36,118L36,120L36,120L36,124L36,124L37,130L37,130L38,137L38,137L38,141L38,141L39,144L39,144L39,145L39,145L39,146L39,146L39,147L39,147L39,148L39,148L39,150L39,150L40,152L40,152L40,154L40,154L41,154L41,154L41,155L41,155L41,156L41,156" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M81,40L81,40L81,42L81,42L81,45L81,45L81,48L81,48L81,51L81,51L81,54L81,54L82,57L82,57L82,62L82,62L82,66L82,66L82,70L82,70L82,73L82,73L82,78L82,78L82,81L82,81L82,84L82,84L82,86L82,86L83,88L83,88L83,90L83,90L83,94L83,94L83,97L83,97L83,100L83,100L83,104L83,104L83,106L83,106L83,110L83,110L83,112L83,112L83,114L83,114L83,117L83,117L83,119L83,119L83,121L83,121L83,122L83,122L83,123L83,123L83,124L83,124L83,125L83,125L83,126L83,126L83,127L83,127L83,128L83,128L83,129L83,129L83,130L83,130L83,131L83,131L83,132L83,132L83,133L83,133L82,133L82,133" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M105,121L105,121L106,122L106,122L107,123L107,123L110,124L110,124L112,126L112,126L114,126L114,126L119,128L119,128L123,130L123,130L128,132L128,132L135,133L135,133L142,134L142,134L148,136L148,136L157,136L157,136L163,136L163,136L169,137L169,137L174,138L174,138L179,139L179,139L184,139L184,139L187,139L187,139L191,139L191,139L192,139L192,139" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M277,50L277,50L277,51L277,51L277,53L277,53L277,55L277,55L277,57L277,57L277,59L277,59L277,61L277,61L277,64L277,64L277,66L277,66L277,69L277,69L276,71L276,71L276,72L276,72L276,75L276,75L276,76L276,76L276,77L276,77L276,78L276,78L275,79L275,79L275,80L275,80L274,80L274,80L274,81L274,81L274,82L274,82" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M273,72L273,72L274,72L274,72L275,72L275,72L276,72L276,72L278,72L278,72L279,72L279,72L280,73L280,73L283,74L283,74L286,75L286,75L288,77L288,77L289,77L289,77L290,78L290,78L291,78L291,78L291,79L291,79L292,79L292,79L293,79L293,79" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M291,61L291,61L292,61L292,61L293,62L293,62L294,64L294,64L294,66L294,66L295,68L295,68L296,72L296,72L297,76L297,76L297,80L297,80L297,83L297,83L297,87L297,87L297,90L297,90L297,93L297,93L297,96L297,96L297,98L297,98L297,101L297,101L297,103L297,103L296,105L296,105L296,106L296,106L296,107L296,107L295,107L295,107" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M302,85L302,85L303,86L303,86L304,86L304,86L306,86L306,86L308,86L308,86L311,86L311,86L313,86L313,86L315,86L315,86L318,86L318,86L321,86L321,86L324,86L324,86L327,86L327,86L329,86L329,86L330,86L330,86L331,85L331,85L331,83L331,83L331,82L331,82L331,81L331,81L331,80L331,80L331,79L331,79L331,78L331,78L331,76L331,76L330,75L330,75L329,74L329,74L328,74L328,74L327,73L327,73L326,72L326,72L325,71L325,71L324,71L324,71L323,71L323,71L322,71L322,71L321,71L321,71L319,72L319,72L317,73L317,73L316,74L316,74L314,75L314,75L313,76L313,76L311,77L311,77L310,78L310,78L309,80L309,80L308,81L308,81L308,82L308,82L308,85L308,85L308,87L308,87L308,88L308,88L308,90L308,90L308,92L308,92L308,94L308,94L308,96L308,96L308,97L308,97L308,99L308,99L308,100L308,100L309,101L309,101L309,102L309,102L310,102L310,102L311,102L311,102L313,101L313,101L314,99L314,99L316,99L316,99L316,96L316,96L319,94L319,94L321,90L321,90L324,87L324,87L327,83L327,83L331,81L331,81L332,79L332,79L336,77L336,77L339,73L339,73L342,71L342,71L344,68L344,68L345,67L345,67L347,66L347,66L348,65L348,65L349,64L349,64L350,63L350,63L350,62L350,62L350,61L350,61L350,60L350,60L351,60L351,60L351,59L351,59L351,58L351,58L351,57L351,57L351,56L351,56L351,55L351,55L351,54L351,54L351,53L351,53L351,55L351,55L351,56L351,56L351,59L351,59L351,62L351,62L351,64L351,64L351,67L351,67L351,71L351,71L351,74L351,74L351,79L351,79L351,82L351,82L351,85L351,85L351,89L351,89L351,92L351,92L351,95L351,95L351,97L351,97L351,98L351,98L351,100L351,100L351,101L351,101L351,102L351,102L352,103L352,103L353,103L353,103L353,102L353,102L353,100L353,100L354,98L354,98L355,94L355,94L356,90L356,90L356,88L356,88L356,86L356,86L356,82L356,82L356,80L356,80L356,77L356,77L356,75L356,75L356,73L356,73L356,72L356,72L357,71L357,71L357,69L357,69L357,68L357,68L358,66L358,66L358,65L358,65L358,63L358,63L358,62L358,62L358,61L358,61L358,60L358,60L359,59L359,59L359,58L359,58L359,57L359,57L359,58L359,58L359,60L359,60L360,63L360,63L360,66L360,66L360,68L360,68L360,70L360,70L360,72L360,72L360,75L360,75L360,77L360,77L360,80L360,80L360,82L360,82L361,84L361,84L361,86L361,86L361,89L361,89L361,90L361,90L361,91L361,91L362,93L362,93L362,95L362,95L362,96L362,96L362,97L362,97L363,99L363,99L363,100L363,100L364,101L364,101L364,102L364,102L364,103L364,103L365,103L365,103L366,102L366,102L367,101L367,101L370,100L370,100L371,98L371,98L372,97L372,97L372,96L372,96L373,95L373,95L374,95L374,95L375,94L375,94L375,93L375,93L376,93L376,93L376,91L376,91L376,90L376,90L376,89L376,89L376,88L376,88L377,88L377,88L378,87L378,87L378,86L378,86L378,85L378,85L379,85L379,85L379,84L379,84L379,83L379,83L380,83L380,83L384,84L384,84L386,85L386,85L387,86L387,86L388,86L388,86L387,86L387,86L386,86L386,86L384,86L384,86L382,86L382,86L379,86L379,86L377,86L377,86L376,86L376,86L373,86L373,86L371,86L371,86L370,86L370,86L370,87L370,87L369,88L369,88L368,89L368,89L368,91L368,91L368,92L368,92L368,93L368,93L368,95L368,95L369,96L369,96L369,97L369,97L369,98L369,98L370,98L370,98L370,99L370,99L371,99L371,99L372,100L372,100L373,100L373,100L374,100L374,100L376,100L376,100L377,100L377,100L380,100L380,100L382,100L382,100L384,99L384,99L384,98L384,98L387,98L387,98L388,97L388,97L389,97L389,97L390,96L390,96L390,95L390,95L391,95L391,95L391,94L391,94L391,93L391,93L392,92L392,92L392,91L392,91L392,90L392,90L391,89L391,89L390,89L390,89L389,89L389,89L388,89L388,89L387,89L387,89L386,88L386,88L385,88L385,88L386,88L386,88L387,88L387,88L388,88L388,88L389,88L389,88L389,89L389,89L391,89L391,89L392,90L392,90L394,90L394,90L396,90L396,90L398,90L398,90L400,90L400,90L401,90L401,90L402,90L402,90" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M414,107L414,107L412,107L412,107L409,107L409,107L408,107L408,107L405,107L405,107L401,108L401,108L397,108L397,108L392,108L392,108L387,108L387,108L380,108L380,108L370,109L370,109L361,109L361,109L351,109L351,109L342,109L342,109L328,109L328,109L317,109L317,109L305,109L305,109L294,109L294,109L282,109L282,109L268,109L268,109L259,109L259,109L248,109L248,109L240,109L240,109L234,109L234,109L228,109L228,109L224,109L224,109L222,109L222,109L221,109L221,109" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M487,77L487,77L487,80L487,80L487,84L487,84L487,89L487,89L487,97L487,97L487,104L487,104L487,115L487,115L487,123L487,123L487,137L487,137L487,149L487,149L487,161L487,161L487,172L487,172L486,182L486,182L486,189L486,189L486,196L486,196L486,200L486,200L486,203L486,203L486,204L486,204L486,206L486,206" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M234,348L234,348L233,348L233,348" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M200,337L200,337L199,337L199,337" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M223,341L223,341L222,341L222,341L221,342L221,342L218,343L218,343L215,344L215,344L215,345L215,345" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="M235,338L235,338L234,338L234,338L234,336L234,336" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path transform="matrix(1,0,0,1,0,0)" fill="none" stroke="#000000" d="" stroke-opacity="1" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

						console.log("svgfile: " + svg);
						canvg('canvas', svg);
						console.log("HERE:)");
						var img = canvas.toDataURL("image/png");
						console.log("HERE " + img);
						// var png = img_b64.split(',')[1];
//window.open(img);
					    var binaryImg = atob(img);
					    var length = binaryImg.length;
					    var ab = new ArrayBuffer(length);
					    var ua = new Uint8Array(ab);
					    for (var i = 0; i < length; i++) {
					        ua[i] = binaryImg.charCodeAt(i);
					    }

						var a = document.createElement('a');
						var blob = new Blob([atob(img)], {'type':'image/png'});
						a.href = window.URL.createObjectURL(blob);
						a.download = 'bloomboard.png';
						a.click();

						// socket.emit('s_clearBoard', {});
						// sketchpad.clear();
						// persistenceService.clearBoard("testBoard2", function(data, info) {

						// });
					};

					sketchpad.mousedown(function(e) {
						var x_ = e.pageX;
						var y_ = e.pageY;
						socket.emit('s_con_mouse_down', {
							e: {
								pageX: x_,
								pageY: y_
							},
							id: penID
						});
					});

					sketchpad.mousemove(function(data) {
						if (data) {
							socket.emit('s_con_mouse_move', {
								data: data,
								id: penID
							});
						}
					});

					sketchpad.mouseup(function(path_) {
						socket.emit('s_con_mouse_up', {
							id: penID
						});
					});

					socket.on('con_mouse_down', function(data) {
						sketchpad.con_mouse_down(data, data.id);
					});

					socket.on('con_mouse_move', function(data) {
						sketchpad.con_mouse_move(data, data.id);
					});

					socket.on('con_mouse_up', function(data) {
						console.log("the pen id I recieved is: " + data.id);
						sketchpad.con_mouse_up(data, data.id);
					});

					// socket.on('con_pen_change', function(newPen, userEmail) {
					// 	sketchpad.con_pen_change(newPen, userEmail);
					// });


					socket.on('new_con_user', function(data) {
						sketchpad.new_concurrent_user(data.pen, data.id);
					});

				});

			}
		}
	}
});
