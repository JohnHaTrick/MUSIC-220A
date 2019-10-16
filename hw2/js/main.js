import frequencies  from '../data/frequency-data.js';
import amplitudes_n from '../data/nominal-amp-data.js';
import amplitudes_c from '../data/contingency-amp-data.js';
import TSDataPlayer from './TSDataPlayer.js';

/* J Alsterda main javascript for M220a hw2
 *  
 * Play audio compositions derived from Contingency Model Predictive Control,
 *   an automated vehicle controller which maintains two plans simultaneously.
 * The nominal plan shows the vehicle's intent to pursue normal driving goals.
 *   The contingency plan averts a potential collision with a potential obstacle.
 *
 * Playing both tones simulataneously illustrates the dissonance present when the
 *   two plans differ considerably. When the obstacle appears, both plans agree --
 *   and thus the total sounds becomes more consonant.
*/

// initialize top-level audio-context objects
const context = new AudioContext();     // create web audio api context
const master  = new GainNode(context);  //   and master volume gain
master.connect(context.destination);
master.gain.value = 1;

// Parameters
const BPM        = 60; //* 50;     1Hz!       // 60 sec/min; 50 Hz
const num_freqs  = frequencies.length;        // FFT bins
const num_TS     = amplitudes_n[0].length;    // how many time-steps in the data
const j_idxs     = [];                        // array from 0:num_TS-1
const duration   = 3;                         // each mpc plan is 3 sec
const freq_scale = 10000;                     // scale FFT freqs to audible range

// Scale frequencies
for( var i=0; i<num_freqs; i++ ) {
    frequencies[i] *= freq_scale * frequencies[i];
}

// fill j idx array
for( var j=0; j<num_TS; j++ ) {
    j_idxs.push(j);
}

// Construct oscillators
const osc_n = [];
const osc_c = [];
const amp_n = [];
const amp_c = [];
for(     var i=0; i<num_freqs; i++ ) {
    osc_n[i] = [];
    osc_c[i] = [];
    amp_n[i] = [];
    amp_c[i] = [];
    for( var j=0; j<num_TS;    j++ ) {
        osc_n[i][j] = new OscillatorNode(context);
        osc_c[i][j] = new OscillatorNode(context);
        amp_n[i][j] = new GainNode(context);
        amp_c[i][j] = new GainNode(context);
        osc_n[i][j].connect(amp_n[i][j])
                   .connect(context.destination);
        osc_c[i][j].connect(amp_c[i][j])
                   .connect(context.destination);
        amp_n[i][j].gain.value      = 0;
        amp_c[i][j].gain.value      = 0;
        osc_n[i][j].frequency.value = frequencies[i];
        osc_c[i][j].frequency.value = frequencies[i];
        osc_n[i][j].start();
        osc_c[i][j].start();
    }
}

// my trigger functions: ramp up and down the gains for timestep j
function nom_trigger(j, start) {
    console.log('j = ',j);
    for( var i=0; i<num_freqs; i++ ) {
        amp_n[i][j].gain
                   .linearRampToValueAtTime(amplitudes_n[i][j], start + 0.01);
        amp_n[i][j].gain
                   .linearRampToValueAtTime(0.0,                start + duration);
    }
}

function cont_trigger(j, start) {
    console.log('j = ',j);
    for( var i=0; i<num_freqs; i++ ) {
        amp_c[i][j].gain
                   .linearRampToValueAtTime(amplitudes_c[i][j], start + 0.01);
        amp_c[i][j].gain
                   .linearRampToValueAtTime(0.0,                start + duration);
    }
}

// construct TSDataPlayer objects and their trigger functions
const dmpc_player = new TSDataPlayer(context, j_idxs);
dmpc_player.onbeat = (value) => {
    value = value || 0;
    nom_trigger(value, context.currentTime);
};
const cmpc_player = new TSDataPlayer(context, j_idxs);
cmpc_player.onbeat = (value) => {
    value = value || 0;
    cont_trigger(value, context.currentTime);
};

function start_dmpc() {
    dmpc_player.setBPM(BPM);
    dmpc_player.start();
}
function start_cmpc() {
    cmpc_player.setBPM(BPM);
    cmpc_player.start();
}
function start_cdmpc() {
    dmpc_player.setBPM(BPM);
    dmpc_player.start();
    cmpc_player.setBPM(BPM);
    cmpc_player.start();
}

// execute functions when html buttons are clicked
document.querySelector('#dmpc')
        .addEventListener('click',start_dmpc);
document.querySelector('#cmpc')
        .addEventListener('click',start_cmpc);
document.querySelector('#cdmpc')
        .addEventListener('click',start_cdmpc);
