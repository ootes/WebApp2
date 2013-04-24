(function(window, document){
	
	APP.map = {};

	APP.map = {
		init: function(){
			
			L.map('map').setView([51.505, -0.09], 13);
	
		}
	}
	
	console.log(map);

	onDomReady( APP.map.init );

})(window, document);

