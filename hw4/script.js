import GeneratorModule from './GeneratorModule.js'
import TremoloModule   from './TremoloModule.js'
import EchoModule      from './EchoModule.js'

const context = new AudioContext();
var i;
var j;

// setup C major scale
const ratios    = [ 1, 9/8, 5/4, 4/3, 3/2, 5/3, 15/8 ];
const bass_freq = 262; // C
const freqs     = [];  // array of frequencies for keys
for (i = 0; i < ratios.length; i++) {
  freqs.push(bass_freq * ratios[i]);
}

// setup generator objects, parameters, and connections
const gain     = 0.5;  // nominal gain for scale fundamental
const velocity = 0.01; // time const for TargetAtTime
const gens     = [];   // array of generators
for (i = 0; i < ratios.length; i++) {
  gens.push(new GeneratorModule(context, freqs[i], 'sine'));
}                      // last one: error tone
gens.push(  new GeneratorModule(context, freqs[0], 'square'));
for (i = 0; i < gens.length; i++) {
  gens[i].output.connect(context.destination);
}

// setup tremolo objects, parameters, and connections
const depth = 1.0;     // fraction of signal to fade
const speed = 2.0;     // cycles per second
const trem  = new TremoloModule(context, 0.0, speed);

// setup echo objects, parameters, and connections
const numEchs = 2;     // number of echos to play
var   delay   = 0.5;   // time in sec between echos
var   sustain = 0.5;   // gain reduction between echos
const echos   = [];    // array of echo oscillators
for (i = 0; i < ratios.length; i++) {
  echos.push([]);      //   1st dimension: frequency
  for (j = 0; j < numEchs; j++) {  // 2nd: number of echos
    echos[i].push(new EchoModule(context, freqs[i]));
    echos[i][j].output.connect(context.destination);
  }
}

// do stuff when keys are pressed and released
const handleKeyDown = (i) => {
  if (i < 7) {
    var gain_scaled = gain*freqs[0]/freqs[i];
    gens[i].noteOn(gain_scaled, velocity, 0);
    trem.output.connect(gens[i]._amp.gain);
    for (j = 0; j < echos[i].length; j++) {
      var gain_sustain = gain_scaled * Math.pow(sustain,j+1);
      echos[i][j].noteOn(gain_sustain, velocity, delay*(j+1)); 
    }
  } else {             // Error. set gain low
    gens[i].noteOn(gain/10,                velocity, 0);
  }
}
document.addEventListener('keydown', function(event) {
  console.log('Key pressed: %i', event.keyCode);
  var scale_int = get_scale_integer(event.keyCode);
  handleKeyDown(scale_int);
});

const handleKeyUp = (i) => {
  gens[i].noteOff(velocity*5); // turn off more slowly
  if (i < 7) { // no tremolo | echo for error signal
    trem.output.disconnect(gens[i]._amp.gain);
    for (j = 0; j < echos[i].length; j++) {
      echos[i][j].noteOff(velocity*5, delay*(j+1));
    }
  }
}
document.addEventListener('keyup', function(event) {
  console.log('Key released: %i', event.keyCode);
  var scale_int = get_scale_integer(event.keyCode);
  handleKeyUp(scale_int);
});

const handleSpeedSlider = (event) => {
  // map to speed in [0 inf] (assume value in [0 10], init to 0)
  var value    = event.srcElement.valueAsNumber;
  var newSpeed = speed * value / (10.1-value);
  // set new speed for tremolo
  trem.setSpeed(newSpeed);
};

const handleDepthSlider = (event) => {
  // map to depth in [0 1] (assume value in [0 10], init to 0)
  var value    = event.srcElement.valueAsNumber;
  var newDepth = depth * value / 10;
  // set new dpeth for tremolo
  trem.setDepth(newDepth);
};

const handleDelaySlider = (event) => {
  // map to delay in [0 1] and set (assume value in [0 10])
  var value = event.srcElement.valueAsNumber;
  delay     = value / 10;
};

const handleSustainSlider = (event) => {
  // map to sustain in [0 1] and set (assume value in [0 10])
  var value = event.srcElement.valueAsNumber;
  sustain   = value / 10;
};

function get_scale_integer(keyCode) {
  switch(keyCode) {
    case 67: return 0; // C
    case 68: return 1; // D
    case 69: return 2; // E
    case 70: return 3; // F
    case 71: return 4; // G
    case 65: return 5; // A
    case 66: return 6; // B
    default: return 7; // error: not a valid key
  }
}

const n =  new Date();
const y = n.getFullYear();
const m = n.getMonth() + 1;
const d = n.getDate();
document.getElementById("date").innerHTML = m+"/"+d+"/"+y;

// get things ready
const setup = async () => {
  console.log('setup');
  await gens[gens.length-1].initialize();
  await trem.initialize();

  const speedSlideElem = document.querySelector('#speed');
  speedSlideElem.addEventListener('input', handleSpeedSlider);
  
  const depthSlideElem = document.querySelector('#depth');
  depthSlideElem.addEventListener('input', handleDepthSlider);

  const delaySlideElem = document.querySelector('#delay');
  delaySlideElem.addEventListener('input', handleDelaySlider);
  
  const sustainSlideElem = document.querySelector('#sustain');
  sustainSlideElem.addEventListener('input', handleSustainSlider);
}
window.addEventListener('load', setup, {once: true});
