// Original work by Martijn Pieters.
// Particle Implementation by D. Huebner

var guiVolunteer;
var guiDissection;
var guiVisible = 1;
var visualization = {  type: 'particles' };

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var x,y;



// Volunteer

volunteerPhaseDuration = 55;
volunteerPhaseSteps    = 20;
volunteerTimeStep      = volunteerPhaseDuration / volunteerPhaseSteps;

var volunteerTimes = {
    'all'  :  'all',
    '0 ms' :  'volunteer/lines_volunteer_00.json',
    '55 ms':  'volunteer/lines_volunteer_01.json',
    '110 ms': 'volunteer/lines_volunteer_02.json',
    '165 ms': 'volunteer/lines_volunteer_03.json',
    '220 ms': 'volunteer/lines_volunteer_04.json',
    '275 ms': 'volunteer/lines_volunteer_05.json',
    '330 ms': 'volunteer/lines_volunteer_06.json',
    '385 ms': 'volunteer/lines_volunteer_07.json',
    '440 ms': 'volunteer/lines_volunteer_08.json',
    '495 ms': 'volunteer/lines_volunteer_09.json',
    '550 ms': 'volunteer/lines_volunteer_10.json',
    '605 ms': 'volunteer/lines_volunteer_11.json',
    '660 ms': 'volunteer/lines_volunteer_12.json',
    '715 ms': 'volunteer/lines_volunteer_13.json',
    '770 ms': 'volunteer/lines_volunteer_14.json',
    '825 ms': 'volunteer/lines_volunteer_15.json',
    '880 ms': 'volunteer/lines_volunteer_16.json',
    '935 ms': 'volunteer/lines_volunteer_17.json',
    '990 ms': 'volunteer/lines_volunteer_18.json',
    '1045 ms':'volunteer/lines_volunteer_19.json',
};

var volunteerParams = {
    patient      : 'volunteer',
    minSpeed     : 0,
    maxSpeed     : 100,
    time         : 100.0,
    dataset      : volunteerTimes['55 ms'],
    filterLambda : false, 
    animation    : false,
    slidingWindow: false, 
	tailLength	 : 15.0,
    debug        : true
};

// Dissection patient

dissectionPhaseDuration = 32;
dissectionPhaseSteps    = 25;
dissectionTimeStep      = dissectionPhaseDuration / dissectionPhaseSteps;

var dissectionTimes = {
    'all'  :  'all',
    '0 ms' :  'dissection/lines_dissection_00.json',
    '32 ms':  'dissection/lines_dissection_01.json',
    '64 ms':  'dissection/lines_dissection_02.json',
    '96 ms':  'dissection/lines_dissection_03.json',
    '128 ms': 'dissection/lines_dissection_04.json',
    '160 ms': 'dissection/lines_dissection_05.json',
    '192 ms': 'dissection/lines_dissection_06.json',
    '224 ms': 'dissection/lines_dissection_07.json',
    '256 ms': 'dissection/lines_dissection_08.json',
    '288 ms': 'dissection/lines_dissection_09.json',
    '320 ms': 'dissection/lines_dissection_10.json',
    '352 ms': 'dissection/lines_dissection_11.json',
    '384 ms': 'dissection/lines_dissection_12.json',
    '416 ms': 'dissection/lines_dissection_13.json',
    '448 ms': 'dissection/lines_dissection_14.json',
    '480 ms': 'dissection/lines_dissection_15.json',
    '512 ms': 'dissection/lines_dissection_16.json',
    '544 ms': 'dissection/lines_dissection_17.json',
    '576 ms': 'dissection/lines_dissection_18.json',
    '608 ms': 'dissection/lines_dissection_19.json',
    '640 ms': 'dissection/lines_dissection_20.json',
    '672 ms': 'dissection/lines_dissection_21.json',
    '704 ms': 'dissection/lines_dissection_22.json',
    '736 ms': 'dissection/lines_dissection_23.json',
    '768 ms': 'dissection/lines_dissection_24.json',
};

var dissectionParams = {
    patient      : 'aortic dissection',
    minSpeed     : 0,
    maxSpeed     : 100,
    time         : 100.0,
    dataset      : dissectionTimes['64 ms'],
    filterLambda : false,
    animation    : false,
   // slidingWindow: false, // Obsolete
	tailLength	 : 15.0,
    debug        : false
};

// Time variables
var phaseDuration = volunteerPhaseDuration;
var phaseSteps    = volunteerPhaseSteps;
var timeStep      = volunteerTimeStep;
var seedTimes     = volunteerTimes;


var time          = 0; 
var params        = volunteerParams;

// Load mesh and lines
$(document).ready(function() {
    init();
    animate();
    
    meshLoader.load("models/volunteer/aorta.json");
    lineLoader.load("models/" + params.dataset);
});

function getColor(speed) {
    color = speed / 200 * 255;

    min = params.minSpeed;
    max = params.maxSpeed;
    factor = 200 / (max - min);
    color = (color - min) * factor;

    if (color <= 0) {
        var r = 0.0;
        var g = 0.0;
        var b = 0.0;
    } else if (color <= 255 * 0.4) {
        var r = 0.902 * (color / 102);
        var g = 0.0;
        var b = 0.0;
    } else if (color <= 255 * 0.8) {
        var r = 0.902;
        var g = 0.902 * ((color - 102) / 102);
        var b = 0.0;
    } else if (color > 255 * 0.8) {
        var r = 0.902 + 0.098 * ((color - 204) / 51);
        var g = 0.902 + 0.098 * ((color - 204) / 51);
        var b = 1.0 * ((color - 204) / 51);
    } else {
        var r = 1.0;
        var g = 1.0;
        var b = 1.0;
    }

    return new THREE.Color().setRGB(r, g, b);
}

function clearModels(){ 
  mesh = [];
  loadedAssets--;
  
  var l = scene.children.length;
    
  while(l--)
  {
    if (scene.children[l] instanceof THREE.Mesh) {
      scene.remove(scene.children[l]);
    }
  }
}

function clearLines() {
    if (clearOldLines) {
        // Reset all arrays
        geometries = [];
        velocities = [];
        lambda2s = [];
        times = [];
 		lines = [];
        lineIndex = [];

        var l = scene.children.length;
        while (l--) {
            if (scene.children[l] instanceof THREE.ParticleSystem || scene.children[l] instanceof THREE.Line) {
                scene.remove(scene.children[l]);
            }
        }
    }
}

function calculateColors() {
    // reset global variable 'colors'
    colors = [];

    for (var i = 0; i < velocities.length; i++) {
        var list = [];
        for (var j = 0; j < velocities[i].length; j++) {
            list.push(getColor(velocities[i][j]));
        }
        colors.push(list);
    }
}


// INTERESTING
function updateColors() {
    // calculate global variable 'colors'
    calculateColors();
	if (visualization.type == 'lines' || visualization.type == 'particles and lines')
	{
	    for (var i = 0; i < colors.length; i++) {
        scene.children[lineIndex[i]].geometry.colors = colors[i];
        scene.children[lineIndex[i]].geometry.colorsNeedUpdate = true; 
		}
    }
}

function updateTime() {
    uniforms.curTime.value = parseFloat(params.time);
}

function filterLambda2() {
    // Iterate over all lambda-2 arrays
    for (var i = 0; i < lambda2s.length; i++) {
        if (params.filterLambda) {
            var l2 = [];
            var sum = 0.0;
            for (var j = 0; j < lambda2s[i].length; j++) {
                l2.push(lambda2s[i][j]);
                sum += lambda2s[i][j];
            }
            var mean = sum/l2.length;

            if (mean < 0){ visible = true; }
            else visible = false;
        } else {
            visible = true;
        }
		if (visualization.type == 'particles' ) 
			particleAttributes.visibility.value[i] = visible*2-1; 
	    if (visualization.type == 'lines' ) 
			scene.children[lineIndex[i]].visible = visible; 
		if (visualization.type == 'particles and lines' ){
			particleAttributes.visibility.value[i] = visible*2-1; 
			scene.children[lineIndex[i]].visible = visible; 
		} 
    }

}

// Obsolete
//function slidingWindow() { 
//    uniforms.slidingWindow.value = params.slidingWindow;
//}

function toggleSubject()
{
  if(guiVisible == 1)
  {
    volunteerParams.patient  = 'aortic dissection';
    dissectionParams.patient = 'aortic dissection';
        
    params = dissectionParams;    
    
    phaseDuration = dissectionPhaseDuration;
    phaseSteps    = dissectionPhaseSteps;
    timeStep      = dissectionTimeStep;
    seedTimes     = dissectionTimes;
           
    for (var i in guiDissection.__controllers) {
       guiDissection.__controllers[i].updateDisplay();
    }    
    
    guiVolunteer.domElement.style.display = 'none';
    guiDissection.domElement.style.display = 'block';    
    guiVisible = 0;
  }
  else
  {
    volunteerParams.patient  = 'volunteer';
    dissectionParams.patient = 'volunteer';
    
    params = volunteerParams;
    
    phaseDuration = volunteerPhaseDuration;
    phaseSteps    = volunteerPhaseSteps;
    timeStep      = volunteerTimeStep;
    seedTimes     = volunteerTimes;
    
    for (var i in guiVolunteer.__controllers) {
      guiVolunteer.__controllers[i].updateDisplay();
    }          
    
    guiVolunteer.domElement.style.display = 'block';
    guiDissection.domElement.style.display = 'none';
    guiVisible = 1;
  }  
}

function updateSubject() {
  toggleSubject();
  
  if(params.patient == 'aortic dissection')
  {
    // change the mesh
    clearModels();
    meshLoader.load("models/dissection/aorta.json");   
    meshLoader.load("models/dissection/aorta_fl.json");   
  }
  else
  {
    // change the mesh
    clearModels();
    meshLoader.load("models/volunteer/aorta.json");    
  }
  
  // load the lines
  loadDataset();
}

function changeVisualisation() {
	if (visualization.type == 'particles and lines'){
		uniforms.slidingWindow.value = true;	
	}
	if (visualization.type == 'lines'){
		uniforms.slidingWindow.value = false;	
	}
	loadDataset();
}

function tailLengthUpdate() {
	uniforms.tailLength.value = params.tailLength;
}

function loadDataset() {
    if(params.dataset != 'all') {
        clearOldLines = true;
        lineLoader.load("models/" + params.dataset);
		
        // Disable lambda-2 filter
        params.filterLambda = false;
        
        // Update spinner
        loadedAssets = 0;
        totalAssets = 1;
        updateSpinner();
    } else {
        // Clear old lines, but only once
		clearOldLines = true;
        clearLines();
        clearOldLines = false;
        
        // Enable lambda-2 filter
        // params.filterLambda = true;
        
        sum = 0;
        i = 500;
        for (var dataset in seedTimes) {
            if(dataset != 'all') {
                setTimeout('lineLoader.load("models/' + seedTimes[dataset] + '")', i);
                i += 200;
                sum++;
            }	
        }
        // Update spinner
        loadedAssets = 0;
        totalAssets = sum;
		
        updateSpinner();
    }
}

function loadDebugData(timestep) {
    params.debug = true;
    clearOldLines = false;
    lineLoader.load("models/" + seedTimes[timestep]);
    
    loadedAssets = 0;
    totalAssets = 1;
    updateSpinner();
}

function createGUIVolunteer()
{
  guiVolunteer = new dat.GUI({
      width: 300
  });
  
  // dat.gui controls
  
   guiVolunteer.add(visualization, 'type', ['particles', 'lines','particles and lines'])
      .name('visualisation')
      .onChange(changeVisualisation);	
  
  guiVolunteer.add(volunteerParams, 'patient', ['volunteer', 'aortic dissection'])
      .name('data set')
      .onChange(updateSubject);
      
  guiVolunteer.add(volunteerParams, 'animation');

  guiVolunteer.add(volunteerParams, 'time', 0, phaseSteps * phaseDuration).listen()
      .name('time (ms)')
      .onChange(updateTime);
      
  guiVolunteer.add(volunteerParams, 'dataset', volunteerTimes)
      .name('seed time')
      .onChange(loadDataset);      

  var p1 = guiVolunteer.addFolder('advanced parameters');

  // Obsolete.
  // p1.add(volunteerParams, 'slidingWindow')
  //   .name('sliding window')
  //   .onChange(slidingWindow);
      
  // Vortex Filter
  p1.add(volunteerParams, 'filterLambda').listen()
      .name('filter vorticity')
      .onChange(filterLambda2);

  // Length of Speed-Lines behind the Particles
  p1.add(volunteerParams, 'tailLength', 0, 100)
      .name('tail length')
      .onChange(tailLengthUpdate);
	  
  // Speed scale
  p1.add(volunteerParams, 'minSpeed', 0, 200)
      .name('min speed (cm/s)')
      .onChange(function() {
          updateColors();
          $('#minSpeedText').html(parseInt(params.minSpeed));
      });
  p1.add(volunteerParams, 'maxSpeed', 0, 200)
      .name('max speed (cm/s)')
      .onChange(function() {
          updateColors();
          $('#maxSpeedText').html(parseInt(params.maxSpeed));
      });
  
  guiVolunteer.domElement.style.display = 'block';
}

function createGUIDissection()
{
  guiDissection = new dat.GUI({
      width: 300
  });
  guiDissection.add(visualization, 'type', ['particles', 'lines','particles and lines'])
      .name('visualisation')
      .onChange(changeVisualisation);	
  guiDissection.add(dissectionParams, 'patient', ['volunteer', 'aortic dissection'])
      .name('data set')
      .onChange(updateSubject);
      
  guiDissection.add(dissectionParams, 'animation');

  guiDissection.add(dissectionParams, 'time', 0, phaseSteps * phaseDuration).listen()
      .name('time (ms)')
      .onChange(updateTime);
      
  guiDissection.add(dissectionParams, 'dataset', dissectionTimes)
      .name('seed time')
      .onChange(loadDataset);      

  var p1 = guiDissection.addFolder('advanced parameters');

  // Lambda2 filtering
  // p1.add(dissectionParams, 'slidingWindow')
  //    .name('sliding window')
  //    .onChange(slidingWindow);
      
  // Vortex Filter
  p1.add(dissectionParams, 'filterLambda').listen()
      .name('filter vorticity')
      .onChange(filterLambda2);

  // Length of Speed-Lines behind the Particles
  p1.add(volunteerParams, 'tailLength', 0, 100)
      .name('tail length')
      .onChange(tailLengthUpdate);  
	  
  // Speed scale
  p1.add(dissectionParams, 'minSpeed', 0, 200)
      .name('min speed (cm/s)')
      .onChange(function() {
          updateColors();
          $('#minSpeedText').html(parseInt(params.minSpeed));
      });
      
  p1.add(dissectionParams, 'maxSpeed', 0, 200)
      .name('max speed (cm/s)')
      .onChange(function() {
          updateColors();
          $('#maxSpeedText').html(parseInt(params.maxSpeed));
      });
  
  guiDissection.domElement.style.display = 'none';
}



$(document).ready(function() {
    
    createGUIVolunteer();
    
    createGUIDissection();        
    
    // Set speed scale text
    $('#minSpeedText')
        .html(parseInt(params.minSpeed));
    $('#maxSpeedText')
        .html(parseInt(params.maxSpeed));
});

// Press 'f' to show or hide the FPS
$(document).keydown(function(e) {
    if(e.keyCode == 70) {
        stats.domElement.style.display = (stats.domElement.style.display == 'block') ? 'none' : 'block';
    }
    
    if (e.keyCode==17) {
      guiVisible=(guiVisible+1)%2;
      toggleSubject();
      updateSubject();
    }


    if (e.keyCode==32){
    
      guiVisible=(guiVisible+1)%2;

      if (visualization.type=='lines'){
        visualization.type='particles';
      } else if (visualization.type=='particles'){
        visualization.type='particles and lines';
      } else {
        visualization.type='lines';
      }

    if(params.patient == 'aortic dissection')
      {
        // change the mesh
        clearModels();
        meshLoader.load("models/dissection/aorta.json");   
        meshLoader.load("models/dissection/aorta_fl.json");   
      }
      else
      {
        // change the mesh
        clearModels();
        meshLoader.load("models/volunteer/aorta.json");    
      }
      
      // load the lines
      loadDataset();
  }

    getMouseRealTime();

    
});



