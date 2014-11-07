if (!Detector.webgl) Detector.addGetWebGLMessage();
else $('#loader').show();

// ThreeJS variables
var container, stats;
var camera, controls, scene, renderer, composer;
var cross;

// Global variables for the mesh and the lines
var meshLoader = null
var lineLoader = null;
var lineMaterial = null;

// Arrays with all line data
var clearOldLines = true;
var lineIndex = [];
var lines = [];
var geometries = [];
var velocities = [];
var colors = [];
var lambda2s = [];
var times = [];

var geoName;
var particleGeometry;
var particleSystem;
var particleAttributes;

// Shader variables
var uniforms = {

	texture: { type: "t", value: THREE.ImageUtils.loadTexture( "img/ball.png" ) },
    curTime: { type: 'f', value: params.time },
	tailLength : {type: 'f', value: params.tailLength },
    slidingWindow: { type: 'i', value: 0 }
	
};

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 10000);
    scene.add(camera);

    // Camera position
    camera.up.set(0, 0, 1);
    camera.position.set(301.4413150759002, - 109.41576101231675, 33.908696783707434);

    // Light
    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000)
        .normalize();

    camera.add(dirLight);
    camera.add(dirLight.target);

    // Mesh
    meshLoader = new THREE.JSONLoader();
    meshLoader.addEventListener('load', function(event) {
        var geometry = event.content;
        var material;
        
        geoName = geometry.name;
        
        if(geometry.name.indexOf("_fl") > 0)
          material = new THREE.MeshLambertMaterial({color   : 0x333333, emissive: 0xe07777, shading : THREE.SmoothShading,  side : THREE.FrontSide, opacity : 0.3, transparent: true}); //false lumen
        else 
          material = new THREE.MeshLambertMaterial({color   : 0x333333, emissive: 0xe07777, shading : THREE.SmoothShading,  side : THREE.BackSide}); //true lumen 
               
        var mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        
        // Update spinner
		// loadedAssets++;
        updateSpinner();
    });   
    
    
    // load data
    lineLoader = new THREE.JSONLineLoader();
    lineLoader.addEventListener('load', function(event) {
        // Check and eventually clear the existing lines
        clearLines();

        // Add new data to the arrays
        geometries = geometries.concat(event.content[0]);
        velocities = velocities.concat(event.content[1]);
        lambda2s = lambda2s.concat(event.content[2]);
        times = times.concat(event.content[3]);
		
        // Calculate colors for the speed
        calculateColors();
		// Push lines to the renderer
        //filterLambda2();
		
		loadedAssets++;
		updateSpinner();

		 if(loadedAssets==totalAssets) // Loading Complete
		 {
			if (visualization.type == 'particles') 	
				initParticles();
       		if( visualization.type == 'lines') 	
				initLines();
			if(visualization.type == 'particles and lines'){	
			 initLines();	
			 initParticles();			 
			}

            if (visualization.type=='particlesAroundMouse'){
                // This part will be tricky
            }

			filterLambda2();
		 }
		
    });

    // renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(0xEEEEEE, 1);
    renderer.setSize(window.innerWidth, window.innerHeight);

    container = document.getElementById('container');
    container.appendChild(renderer.domElement);

    // mouse & camera controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.target.set(43.807794507474625, - 23.098968626234157, 28.628973020699387);

    controls.rotateSpeed = 5;
    controls.zoomSpeed = 5;
    controls.panSpeed = 2;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    
    // initialise the fps counter
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
    stats.domElement.style.display = 'none';
	container.appendChild(stats.domElement);


    //document.addEventListener("clickDown", onClickDown, false);


    window.addEventListener('resize', onWindowResize, false);
}

function initParticles() {
		particleGeometry = new THREE.Geometry();
		particleAttributes = {
            visibility: { type: 'f',  value: [] },  // Visible if value > 0.5, else invisible
			customColor:{ type: 'c',  value: [] }
		};			
		for (var i = 0; i < geometries.length; i++) {
		// Create Blank Particles
		particleGeometry.vertices.push( new THREE.Vector3() );
		particleAttributes.visibility.value [i] = 0.0; 
		particleAttributes.customColor.value[i] = new THREE.Color().setRGB(1, 1, 1);
		}
        var particleMaterial = new THREE.ShaderMaterial({
            attributes: particleAttributes,
            uniforms: uniforms,
            vertexShader: $('#particlevertexshader').text(),
            fragmentShader: $('#particlefragmentshader').text(),
			transparent: true
        });			
			
        particleSystem = new THREE.ParticleSystem(particleGeometry, particleMaterial);
		particleSystem.dynamic = true;
		particleSystem.sortParticles = true;
		scene.add(particleSystem);
}

function initLines() {

    getMouseRealTime();

	for (var i = 0; i < geometries.length; i++) {
        var geometry = new THREE.Geometry();
        geometry.vertices = geometries[i];
        geometry.colors = colors[i];
        var lineAttributes = {     time: {  type: 'f',  value: times[i]}};
           
		   var lineMaterial = new THREE.ShaderMaterial({
                attributes: lineAttributes,
                uniforms: uniforms,
                vertexShader: $('#linevertexshader').text(),
                fragmentShader: $('#linefragmentshader').text(),
                color: 0xffffff,
                //linewidth: 15.0,
                vertexColors: THREE.VertexColors
            });

        var line = new THREE.Line(geometry, lineMaterial, THREE.LineStrip);
        lineIndex.push(scene.children.length);		
        scene.add(line);		
        lines.push(line);    
    }	



}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    controls.handleResize();
}

function updatePosition(){	
	for (var i = 0; i < geometries.length; i++) {
		var length = times[i].length; 
		if (particleAttributes.visibility.value[i] < 0) {} // Comes from the Lambda-2 Filter. Leave those particles unchanged.
		else {
			//Particles are invisible if there are no measurement information for them
			if (uniforms.curTime.value < times[i][0] || uniforms.curTime.value > times[i][length-1]){
			particleAttributes.visibility.value[i]	= 0.0; // 
			}
			
			else{ 
				// Implement binary search to find in between which time interval values (tbefore,tafter) the current time is
				j = getClosestValue(times[i], uniforms.curTime.value);
				particleAttributes.customColor.value[i] = getColor(velocities[i][j]); // Sets the colour
				// Interpolates the current position as (v_new-v_old)/(t_new-t_old)*(t-t_old)+v_old;
				var c = new THREE.Vector3(); 
				c.subVectors( geometries[i][j], geometries[i][j-1] );
				c.multiplyScalar((uniforms.curTime.value-times[i][j-1])/(times[i][j]-times[i][j-1]));
				c.add(geometries[i][j-1]);
				particleGeometry.vertices[i] = c;
				particleAttributes.visibility.value[i] = 1.0; // Make Particles visible
			}
		}
	}



}

// Binary Search. Returns index of next higher value.
var getClosestValue = function(a, x) {
    var lo = -1, hi = a.length;
    while (hi - lo > 1) {
        var mid = Math.round((lo + hi)/2);
        if (a[mid] <= x) {
            lo = mid;
        } else {
            hi = mid;
        }
    }
    if (a[lo] == x) hi = lo;
    return hi;
}

function animate() {
    var now = new Date().getTime();
    var dt = now - (time || now);
    time = now;
    if (params.animation) {
        params.time = (params.time + dt / 20.0) % (phaseDuration * (phaseSteps));
        updateTime();
    }	
    requestAnimationFrame(animate);
	controls.update();
	if (visualization.type == 'particles' || visualization.type == 'particles and lines')
		updatePosition();



    render();
}

function render() {
        
    renderer.render(scene, camera);
    if (stats) stats.update();

}


/**
* This function is called, when a click is oushed down.
*/
/*
function onClickDown(e){
    $('canvas').click(function(e){
            if(e.ctrlKey)
            {
                alert( 'You pressed ctrl key' );
            }
            else
            {
                alert( 'You clicked on link without ctrl key' );
            }
            return false;
    });
}
*/


function getMouseRealTime() {
    var mousePos;

    document.onmousemove = handleMouseMove;
    setInterval(getMousePosition, 1); // setInterval repeats every X ms

    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event; // IE-ism

        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
              (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
              (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
              (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
              (doc && doc.clientTop  || body && body.clientTop  || 0 );
        }

        mousePos = {
            x: event.pageX,
            y: event.pageY
        };
    }
    function getMousePosition() {
        var pos = mousePos;
        
        if (!pos) {
            // We haven't seen any movement yet
        }
        else {
            // Use pos.x and pos.y
        }
    }
};