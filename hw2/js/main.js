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
const amp_n = [];
for(     var i=0; i<num_freqs; i++ ) {
    osc_n[i] = [];
    amp_n[i] = [];
    for( var j=0; j<num_TS;    j++ ) {
        osc_n[i][j] = new OscillatorNode(context);
        amp_n[i][j] = new GainNode(context);
        osc_n[i][j].connect(amp_n[i][j])
                   .connect(context.destination);
        amp_n[i][j].gain.value      = 0;
        osc_n[i][j].frequency.value = frequencies[i];
        osc_n[i][j].start();
    }
}

// my trigger function: ramp up and down the gains for timestep j
function nom_trigger(j, start) {
    console.log('j = ',j);
    for( var i=0; i<num_freqs; i++ ) {
        amp_n[i][j].gain
                   .linearRampToValueAtTime(amplitudes_n[i][j], start + 0.01);
        amp_n[i][j].gain
                   .linearRampToValueAtTime(0.0,                start + duration);
    }
}

// construct TSDataPlayer objects and their trigger functions
const dmpc_player = new TSDataPlayer(context, j_idxs);
dmpc_player.onbeat = (value) => {
    value = value || 0;
    nom_trigger(value, context.currentTime);
};

function start_dmpc() {

    /*
    console.log("frequencies:",frequencies);
    console.log("nominal amplitudes (first freq):",amplitudes_n[0]);
    console.log("There are this many timesteps:",amplitudes_n[0].length);
    */

    dmpc_player.setBPM(BPM);             // 60 sec/min; 50 50 Hz
    dmpc_player.start();
    
    //let curr_t = context.currentTime+0.25; // wait an bit to let callbacks start
    //master_gain.gain
    //           .setValueAtTime(0, curr_t); // ramp up to gain 0.1
    //master_gain.gain
    //           .linearRampToValueAtTime(0.1, curr_t+0.25);
}

// execute functions when html buttons are clicked
document.querySelector('#dmpc')
        .addEventListener('click',start_dmpc);
//document.querySelector('#cmpc')
//        .addEventListener('click',start_cmpc);
//document.querySelector('#cdmpc')
//        .addEventListener('click',start_cdmpc);
