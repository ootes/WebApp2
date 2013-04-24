var APP = APP || {};

// anonymous function
(function(window, document){

	// data here;
	APP.data = { 
		cafe : {
			loc: {
				lat: 25452425252,
				lng: 32554252455
			},
			image: "images/thumb.png",
			info: "Lorem ipsum dolar sit amet"
		}
	}

	APP.controller = {
		// Use regular expression for string matching (gi == global search, ignore case)
		isAndroid : (/android/gi).test(navigator.appVersion),
		isIDevice : (/iphone|ipad/gi).test(navigator.appVersion),

		init: function () {
			// Init page states			
			APP.states.init();

			// Hide addressbar on mobile/tablet
			APP.utils.hideAddressBar();
			
			Gator(window).on('orientationchange', function(e) {
			    APP.utils.hideAddressBar();
			});

			// Event delegation, for efficient event handling
			var el = document.querySelector("body");
			Gator(el).on('click', function(e) {
				e.preventDefault();
			    // e.target retrieves clicked element 
			});
		}
	};

	APP.states = {
		init: function () {
			var routes = {
		        '/locations': APP.pages.locations,
		        '/locations/:locId': APP.pages.location
		      };

			var router = Router(routes);
      		router.init();
		},

		getPage: function (page, id) {

            var route = window.location.hash.slice(2),
            	id = id || false,
                sections = document.querySelectorAll('section[data-role=page]'),
                section = document.querySelectorAll('#'+page)[0];

                console.log(section);
            
            if (section) {
            	for (var i=0; i < sections.length; i++){
            		sections[i].classList.remove('show');
            	}
            	section.classList.add('show');
            }

		}

	};

	APP.pages = {
		locations: function () {
			APP.states.getPage('list');
		},
		location: function(locId){
			APP.states.getPage('detail', locId);
		}
	};

	APP.utils = {
		// Source: https://gist.github.com/mhammonds/1190492#file-hidemobileaddressbar-js
		hideAddressBar: function () {
			if(!window.location.hash) {
			    if(document.height < window.outerHeight) {
			          document.body.style.height = (window.outerHeight + 50) + 'px';
			    }
			 
			    setTimeout( function(){ window.scrollTo(0, 1); }, 50 );
			}
		}
	};


	APP.map = {};


	onDomReady( APP.controller.init );

})(window, document);