import data from '../data/dataset.js';

/* J Alsterda javascript for M220a hw2
 * play two tones simultaneously,
 * which sonify the contingency planning controller
*/

const start = (beats_mode) => {
    console.log("print here to debug");
    console.log(data.amps_n[266]);

    // create web audio api context
    const context = new AudioContext();

    // define frequencies, gains, & play periods
    //var freqs   = data.freqs;
    var gains   = data.amps_n;
    var t_start = 0.0;
    var t_stop  = 1.0;

    // define containers for oscillator & gain nodes
    const sins = [];
    const amps = [];

    data.freqs.forEach((freq, idx) => {
        // create oscillator & gain nodes
        sins[idx] = new OscillatorNode(context);
        amps[idx] = new GainNode(context);

        // set freq and gain values
        sins[idx].frequency.value = freq;
        amps[idx].gain.value      = gains[idx];

        // connect osc to gain to dest
        sins[idx].connect(amps[idx]);
        amps[idx].connect(context.destination);

        // start & stop tones
        sins[idx].start(t_start);
        sins[idx].stop( t_stop)
    });
};

// click -> make sound
document.querySelector('#cmpc')
        .addEventListener('click',function(){start("yes");});
