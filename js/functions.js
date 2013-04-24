var APP = APP || {};

// anonymous function
(function(window, document){

	// data here;
	APP.data = [
		{
			name : 'Café Noir',
			slug : 'cafe-noir',
			type : 'cafe'
		},
		{
			name : 'Café Noir',
			slug : 'cafe-noir',
			type : 'cafe'
		},
		{
			name : 'Café Noir',
			slug : 'cafe-noir',
			type : 'cafe'
		}
	]

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

		getPage: function (page, slug) {


            var route = window.location.hash.slice(2),
            	slug = slug || false,
               
                pages = document.querySelectorAll('section[data-role=page]'),
                currentPage = document.querySelectorAll('#'+page)[0];
            
            if (page) {
            	for (var i=0; i < pages.length; i++){
            		pages[i].classList.remove('show');
            	}
            	currentPage.classList.add('show');
            }

            if(page == 'list'){
            	 weld(document.querySelector('.location'), APP.data);
            }

		}

	};

	APP.pages = {
		locations: function () {
			APP.states.getPage('list');
		},
		location: function(slug){
			APP.states.getPage('detail', slug);
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