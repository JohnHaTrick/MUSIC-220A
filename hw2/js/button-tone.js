import data         from '../data/dataset.js';
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

const context = new AudioContext();i   // create web audio api context
const master  = new GainNode(context); //   and master volume gain
master.connect(context.destination);
master.gain.value = 0;
//let SYNTH_STATE   = "stopped"; DO I NEED THIS?

const start = () => {
    console.log("print here to debug");
    console.log(data.freqs);

    // define frequencies, gains, & play periods
    //const freqs      = data.freqs;  // FFT frequencies for command sequences
    const multiplier = 2000;        // shift FFT freq to audible range
    //const amps_n     = data.amps_n; // nominal frequency content
    //const amps_c     = data.amps_c; // contingency frequency content
    const t_start    = 0.0;
    const t_stop     = 1.0;

    // define containers for oscillator & gain nodes
    const sins_n = [];
    const sins_c = [];
    const amps_n = [];
    const amps_c = [];

    data.freqs.forEach((freq, idx) => {
        // create oscillator & gain nodes
        sins_n[idx] = new OscillatorNode(context);
        sins_c[idx] = new OscillatorNode(context);
        amps_n[idx] = new GainNode(context);
        amps_c[idx] = new GainNode(context);

        // set freq and gain values
        sins_n[idx].frequency.value = freq * multiplier;
        sins_c[idx].frequency.value = freq * multiplier;
        amps_n[idx].gain.value      = data.amps_n[idx];
        amps_c[idx].gain.value      = data.amps_c[idx];

        // connect osc to gain to dest
        sins_n[idx].connect(amps_n[idx]);
        sins_c[idx].connect(amps_c[idx]);
        amps_n[idx].connect(context.destination);
        amps_c[idx].connect(context.destination);

        // start & stop tones
        sins_n[idx].start(t_start);
        sins_c[idx].start(t_start);
        sins_n[idx].stop( t_stop)
        sins_c[idx].stop( t_stop)
    });
};

const dmpc_player = new TSDataPlayer(context, data);
dmpc.onbeat = (value, start, duration) => {
    value = value || 0;

};

function start_dmpc() {
    dmpc_player.setBPM(60*50);             // 60 sec/min; 50 50 Hz
    dmpc_player.start();
    let curr_t = context.currentTime+0.25; // wait an bit to let callbacks start
    master_gain.gain
               .setValueAtTime(0, curr_t); // ramp up to gain 0.1
    master_gain.gain
               .linearRampToValueAtTime(0.1, curr_t+0.25);
}

// execute functions when html buttons are clicked
document.querySelector('#dmpc')
        .addEventListener('click',start_dmpc);
document.querySelector('#cmpc')
        .addEventListener('click',start_cmpc);
document.querySelector('#cdmpc')
        .addEventListener('click',start_cdmpc);
