import { getArrays } from './load-data.js';

// J Alsterda javascript for M220a hw1
// play a series of frequencies on click
const start = (beats_mode) => {
    console.log("print frequency array:");
    //array = getArray	
    console.log(getArrays());

    // create web audio api context
    const context = new AudioContext();

    // define frequencies, gains, & play periods
    var freqs   = [ 220, 440, 660 ];
    var gains   = [ 0.3, 0.2, 0.1 ]; // make function 1/freq?
    var t_start = [ 0.0, 0.5, 1.0 ];
    var t_stop  = [ 0.5, 1.0, 1.5 ];

    // make beat frequencies?
    var beat_freq  = 4;
    if (beats_mode == "yes") {
        freqs.forEach((val,idx) => {
            freqs.push(   freqs[idx] + beat_freq );
            gains.push(   gains[idx]             );
            t_start.push( t_start[idx]           );
            t_stop.push(  t_stop[idx]            );
        });
    }

    // define containers for oscillator & gain nodes
    const sins = [];
    const amps = [];

    freqs.forEach((val, idx) => {
        // create oscillator & gain nodes
        sins[idx] = new OscillatorNode(context);
        amps[idx] = new GainNode(context);

        // set freq and gain values
        sins[idx].frequency.value = freqs[idx];
        amps[idx].gain.value      = gains[idx];

        // connect osc to gain to dest
        sins[idx].connect(amps[idx]);
        amps[idx].connect(context.destination);

        // start & stop tones
        sins[idx].start(t_start[idx]);
        sins[idx].stop( t_stop[idx])
    });
};

// click -> make sound
document.querySelector('#cmpc')
        .addEventListener('click',function(){start("yes");});
