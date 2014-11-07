var stats, camera, scene, renderer;

if ( Detector.webgl ) {
	init();
	animate();
} else {
	document.body.appendChild( Detector.getWebGLErrorMessage() );
}			
	
function init() {
	var width = window.innerWidth;
	var height = window.innerHeight;

	// add container
	scene = new THREE.Scene();
	var container = document.getElementById('drawingArea');
	
	//add camera
	camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 10000);
	scene.add(camera);
	camera.position.y = 160;
	camera.position.z = 400;
	
    // add light
	var dirLight = new THREE.DirectionalLight(0xffffff);
	dirLight.position.set(200, 200, 1000)
	.normalize();

	camera.add(dirLight);
	camera.add(dirLight.target);
	
	// add cube with six textures
	var cubeGeometry = new THREE.CubeGeometry(200, 220, 200);
	var cubeTexture = THREE.ImageUtils.loadTexture("images/naomi.jpg");
	var materials = [];
	materials.push(new THREE.MeshLambertMaterial({ map: cubeTexture, color: 0xff0000 })); // right face
	materials.push(new THREE.MeshLambertMaterial({ map: cubeTexture, color: 0xffff00 })); // left face
	materials.push(new THREE.MeshLambertMaterial({ map: cubeTexture, color: 0xffffff })); // top face
	materials.push(new THREE.MeshLambertMaterial({ map: cubeTexture, color: 0x00ffff })); // bottom face
	materials.push(new THREE.MeshLambertMaterial({ map: cubeTexture, color: 0x0000ff })); // front face
	materials.push(new THREE.MeshLambertMaterial({ map: cubeTexture, color: 0xff00ff })); // back face
	var cubeMaterial = new THREE.MeshFaceMaterial(materials);
	var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
	scene.add( cube );

	camera.lookAt(cube.position);	
	
	// add renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setClearColorHex(0x0a0a0a, 1);
	// Support window resize
    var resizeCallback = function () {
    var offsetHeight = 150;     	
    var devicePixelRatio = window.devicePixelRatio || 1;
    var width = window.innerWidth * devicePixelRatio - 25;
    var height = (window.innerHeight - offsetHeight -10)* devicePixelRatio;
    renderer.setSize(width, height);
    renderer.domElement.style.width = width + 'px';
    renderer.domElement.style.height = height + 'px';
    camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resizeCallback, false);
    resizeCallback(); 
	container.appendChild( renderer.domElement ); 
	
	// add motion detector
	var motionDetector = new SimpleMotionDetector( camera );	
	motionDetector.domElement.style.position = 'absolute';
 	motionDetector.domElement.style.left = '10px';
 	motionDetector.domElement.style.top = '10px';
    motionDetector.init();
	container.appendChild( motionDetector.domElement );	
	
	// dialog to change parameters
	var gui = new dat.GUI({ autoPlace: false });
	gui.add( motionDetector, 'offsetAlpha', -45.0, 45.0, 5 ).name( 'offset Î±' );
	gui.add( motionDetector, 'offsetGamma',  -45.0, 45.0, 5 ).name( 'offset Î³' );
	gui.add( motionDetector, 'amplificationAlpha', 1.0, 5.0, 0.5 ).name( 'amplification Î±' );
	gui.add( motionDetector, 'amplificationGamma', 1.0, 5.0, 0.5 ).name( 'amplification Î³' );
	gui.add( motionDetector, 'detectionBorder', 0.25, 1.0, 0.05 ).name( 'detection border' );
	gui.add( motionDetector, 'pixelThreshold', 100, 250, 10 ).name( 'pixel threshold' );
	gui.add( motionDetector.averageX, 'maxLength', 200, 2000, 100 ).name( 'averager X' );
	gui.add( motionDetector.averageY, 'maxLength', 200, 2000, 100 ).name( 'averager Y' );
	gui.domElement.style.position = 'absolute';
	gui.domElement.style.left = '10px';
	gui.domElement.style.top = '210px';
	container.appendChild(gui.domElement);
}

function animate() {			
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}	