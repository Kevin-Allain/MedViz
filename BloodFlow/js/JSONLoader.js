/**
 * @author Martijn Pieters
 */

THREE.JSONLoader = function () {};

THREE.JSONLoader.prototype = {

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
      
      geometry.name = url;

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

		var geometry = new THREE.Geometry();

		function vertex( x, y, z ) {

			geometry.vertices.push( new THREE.Vector3( x, y, z ) );

		}

		function face3( a, b, c ) {

			geometry.faces.push( new THREE.Face3( a, b, c ) );

		}

		function face4( a, b, c, d ) {

			geometry.faces.push( new THREE.Face4( a, b, c, d ) );

		}
        
        var json = jQuery.parseJSON(data);
        var indices = json["indices"];
        var vertices = json["vertices"];
        
        for(var i = 0; i < vertices.length; i = i+3) {
            vertex( parseFloat( vertices[ i ] ), parseFloat( vertices[ i+1 ] ), parseFloat( vertices[ i+2 ] ) );
        }
        
        for(var i = 0; i < indices.length; i = i+3) {
            face3( parseInt( indices[ i ] ), parseInt( indices[ i+1 ] ), parseInt( indices[ i+2 ] ) );
        }

		geometry.computeCentroids();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
		geometry.computeBoundingSphere();

		return geometry;

	}

};
