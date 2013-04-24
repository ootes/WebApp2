var APP = APP || {};

// anonymous function
(function(window, document){

	// ajax call to locations.json
	microAjax("json/locations.json", function (contents) {
  		// get the data from json file and store it into APP.data
  		APP.data = JSON.parse(contents);
	});

	// object used for the template engine
	APP.directives = {
		// find a classname link
		link : {
			href : function(){
				// this refers to one instance in the json file
				return "#locatie/"+this.nicename;
			},
			text : function(){

				// this refers to one instance in the json file
				return this.title;
			}
		},
		// find a classname loctitle
		loctitle :{
			text : function(){
				// this = refers to one instance in the json file
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

				// get classname from target
				var targetClass = e.target.className;

				// if backbtn is clicked go to index
				if(targetClass == 'backbtn'){
					routie('');
				}
				
			});
		}
	};

	APP.states = {
		init: function () {
			routie({
    			'locatie/:name': APP.pages.location,
    			'*': APP.pages.locations	
			});
		},

		// function to get a page
		getPage: function (page, slug) {

            var pages = document.querySelectorAll('section[data-role=page]'),
                currentPage = document.querySelectorAll('#'+page)[0];
            
            // add show / hide classes to pages
            if (page) {
            	// loop trough pages and remove all show classes
            	for (var i=0; i < pages.length; i++){
            		pages[i].classList.remove('show');
            	}

            	// add show class to current page
            	currentPage.classList.add('show');
            }


            // populate template with data
            switch (page) {
			   	case 'detail':
			   		// get data based on hash with underscore
            		var location = _.findWhere(APP.data, {nicename: slug});
            		if(location){
            			// make an array from the object for Transparency
            			location = [location];
            			// render the data
            			Transparency.render(document.querySelectorAll('#detail')[0], location, APP.directives);	
            		}else{
            			// if there is no location get the listview
            			APP.states.getPage('list');
            		}
			    	break;

			    case 'list':
			    	Transparency.render(document.querySelectorAll('.locations')[0], APP.data, APP.directives);
			    	break;
				default:

			}
		}

	};


	// functions for the routing
	APP.pages = {
		locations: function () {
			APP.states.getPage('list');
		},
		location: function(slug){
			APP.states.getPage('detail', slug);
		}
	};

	// some handy stuff
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

	// map object to handle the mapview
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