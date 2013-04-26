var APP = APP || {};

// anonymous function
(function(window, document){

	// ajax call to locations.json
	microAjax("json/locations.json", function (contents) {
  		// get the data from json file and store it into APP.data
  		APP.data = JSON.parse(contents);

  		// only do when json is loaded
  		onDomReady( APP.controller.init );
	});


	// object used for the template engine
	APP.directives = {
		// find a classname link
		info: {
			html : function(){
				var content = "<h2>"+this.title+"</h2><p>"+this.info+"</p>";
				return content;
			}
		},

		link : {
			href : function(){
				// this refers to one instance in the json file
				return "#locatie/"+this.nicename+"/";
			},
			text : function(){

				// this refers to one instance in the json file
				return this.title;
			}
		},
		infolink: {
			href : function(){
				// this refers to one instance in the json file
				return "#locatie/"+this.nicename+"/info/";
			}
		},
		maplink: {
			href : function(){
				// this refers to one instance in the json file
				return "#locatie/"+this.nicename+"/kaart/";
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

			// init mapView
			APP.map.init();

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

				// get classname from target
				var targetClass = e.target.className;

				// if backbtn is clicked go to index
				if(targetClass == 'backbtn'){
					// route to index
					routie('');
				}
				
			});
		}
	};

	APP.states = {
		init: function () {
			routie({
    			'locatie/*': APP.pages.location,
    			'': APP.pages.locations	
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

			   		// spit the slug with a slash
			   		var hash = slug.split('/'),
			   			nicename = hash[0],
			   			tab = hash[1] || 'info';

			   		// if tab is not valid fallback to infotab
			   		if(tab != 'kaart'){
			   			// tab us info
			   			tab = 'info';

			   			document.querySelectorAll('.maplink')[0].classList.remove('active');
			   			document.querySelectorAll('.infolink')[0].classList.add('active');
			   		}else{
			   			// tab is map
						document.querySelectorAll('.infolink')[0].classList.remove('active');
			   			document.querySelectorAll('.maplink')[0].classList.add('active');

			   		}


			   		// select tabs
			   		var tabs = document.querySelectorAll('section[data-role=tab]'),
               			currentTab = document.querySelectorAll('#'+tab+'tab')[0];

	            	// loop trough pages and remove all show classes
	            	for (var i=0; i < tabs.length; i++){
	            		tabs[i].classList.remove('show');
	            	}

	            	// add show class to current tab
	            	currentTab.classList.add('show');

			   		// get data based on hash with underscore
            		var location = _.findWhere(APP.data, {nicename: nicename});
            		if(location){
            			
            			// fix to map for grey tiles
						APP.map.mapView.invalidateSize(false);

            			APP.map.mapView.setView(location.latlng, 15, true);

            			// give all markers an blue marker
            			_.each(APP.data, function(value, key, list){
            				if(value.nicename != location.nicename){
            					APP.map.markers[value.nicename].setIcon(APP.map.icons.normal);
            				}else{
            					APP.map.markers[value.nicename].setOpacity(1.0);
            					APP.map.markers[value.nicename].setIcon(APP.map.icons.active);
            				}	

            				APP.map.markers[value.nicename].closePopup();
            			});

            			if(tab == "kaart"){
            				APP.map.markers[location.nicename].openPopup();
            			}

            			// make an array from the object for Transparency
            			location = [location];

            			// if tablet view
            			if(APP.utils.documentWidth() >= 768){
            				Transparency.render(document.querySelectorAll('.locations')[0], APP.data, APP.directives);
            			}


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
		documentWidth: function(){
			return document.body.clientWidth;
		},

		documentHeight: function(){
			return document.body.clientHeight;
		},

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
			self = this;

			this.mapView = L.map('map', {
    			center: [52.36213, 4.8993],
    			zoom: 15
			});

			// add an OpenStreetMap tile layer
			L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(this.mapView);



			// add markers to map
			APP.map.markers = {};

			APP.map.icons = {
				normal : L.icon({
					iconUrl: 'images/icon.png'
				}),
				active: L.icon({
					iconUrl: 'images/icon-active.png'
				})
			}

			_.each(APP.data, function(value, key, list){
				// add markers to map
				APP.map.markers[value.nicename] = L.marker(value.latlng, {
					title : value.title,
					icon : APP.map.icons.normal
				}).addTo(self.mapView);

				// bind popup to markers
				APP.map.markers[value.nicename].bindPopup("<p>"+value.title+"</p>")

				// add mouseover event
				APP.map.markers[value.nicename].on('mouseover', function(e) {
					this.openPopup()
				});

				// add mouseout event
				APP.map.markers[value.nicename].on('mouseout', function(e) {
					this.closePopup()
				});

				//add click event
				APP.map.markers[value.nicename].on('click', function(e) {
					routie("locatie/"+value.nicename+"/");
				});

			});
		}
	}


})(window, document);