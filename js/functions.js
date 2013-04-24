var APP = APP || {};

// anonymous function
(function(window, document){


	microAjax("json/locations.json", function (contents) {
  		APP.data = JSON.parse(contents);
	});

	APP.directives = {
		link : {
			href : function(){
				return this.href;
			},
			text : function(){
				return this.title;
			}
		},
		loctitle :{
			text : function(){
				return this.title;
			}
		}
	}
	

	APP.controller = {
		// Use regular expression for string matching (gi == global search, ignore case)
		isAndroid : (/android/gi).test(navigator.appVersion),
		isIDevice : (/iphone|ipad/gi).test(navigator.appVersion),

		init: function () {

			// Init page states			
			APP.states.init();

			// init mapView
			APP.map.init();

			// Hide addressbar on mobile/tablet
			APP.utils.hideAddressBar();
			
			Gator(window).on('orientationchange', function(e) {
			    APP.utils.hideAddressBar();
			});

			// Event delegation, for efficient event handling
			var el = document.querySelector("body");
			Gator(el).on('click', function(e) {

				var targetClass = e.target.className;
				if(targetClass == 'backbtn'){
					window.location = '/#/index';
				}
				
			});
		}
	};

	APP.states = {
		init: function () {
			var routes = {
		        '/locations/:locId': APP.pages.location,
		        '/locations': APP.pages.locations,
		        '/:hash': APP.pages.locations
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
            	 Transparency.render(document.querySelectorAll('.locations')[0], APP.data, APP.directives);
            }else if(page == 'detail'){
            	// get data based on hash with underscore
            	var location = _.findWhere(APP.data, {href: window.location.hash});
            	

            	if(location){
            		// make an array from the object for Transparency
            		location = [location];
            		// render the data
            		Transparency.render(document.querySelectorAll('#detail')[0], location, APP.directives);	
            	}else{
            		// if there is no location
            		APP.states.getPage('list');
            	}

            	
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

	APP.map = {
		init: function(){
			this.mapView = L.map('map').setView([51.505, -0.09], 13);

			// add an OpenStreetMap tile layer
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(this.mapView);
		}
	}


	onDomReady( APP.controller.init );

})(window, document);