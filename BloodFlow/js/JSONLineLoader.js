/**
 * @author Martijn Pieters
 */

THREE.JSONLineLoader = function () {};

THREE.JSONLineLoader.prototype = {

	constructor: THREE.JSONLoader,

	addEventListener: THREE.EventDispatcher.prototype.addEventListener,
	hasEventListener: THREE.EventDispatcher.prototype.hasEventListener,
	removeEventListener: THREE.EventDispatcher.prototype.removeEventListener,
	dispatchEvent: THREE.EventDispatcher.prototype.dispatchEvent,

	load: function ( url, callback ) {

		var scope = this;
		var request = new XMLHttpRequest();

		request.addEventListener( 'load', function ( event ) {

			var geometry = scope.parse( event.target.responseText );
		
			scope.dispatchEvent( { type: 'load', content: geometry } );

			if ( callback ) callback( geometry );

		}, false );

		request.addEventListener( 'progress', function ( event ) {

			scope.dispatchEvent( { type: 'progress', loaded: event.loaded, total: event.total } );

		}, false );

		request.addEventListener( 'error', function () {

			scope.dispatchEvent( { type: 'error', message: 'Couldn\'t load URL [' + url + ']' } );

		}, false );

		request.open( 'GET', url, true );
		request.overrideMimeType("application/json");
		request.send( null );

	},

	parse: function ( data ) {

		var geometries = [];
        var velocities = [];
        var lambda2s = [];
        var times = [];
        
        var json = jQuery.parseJSON(data.trim());
        var lines = json["lines"];

        for(var j = 0; j < lines.length; j++) {
            var line = lines[j];
            
            var geometry = [];
            var velocity = [];
            var lambda2 = [];
            var time = [];
           // console.log('Line Length' + line.length);
            for(var i = 0; i < line.length; i = i+6) {
                geometry.push( new THREE.Vector3( parseFloat(line[i]), parseFloat(line[i+1]), parseFloat(line[i+2]) ) );
                velocity.push( parseFloat(line[i+3]) );
                lambda2.push( parseInt(line[i+4]) );
                time.push( parseFloat(line[i+5]) );
            }
            
            geometries.push(geometry);
            velocities.push(velocity);
            lambda2s.push(lambda2);
            times.push(time);
        }

        return [geometries, velocities, lambda2s, times];

	}

};
