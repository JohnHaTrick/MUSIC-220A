// J Alsterda javascript for M220a hw3
// play a WAV file recorded in Pat's garage, 2013
const start = (beats_mode) => {
    console.log("hello world");

    // create web audio api context
    const context = new AudioContext();

    // some parameters
    var begin_time = 6*60 + 50; //seconds

    // import WAV
    var sample = new Audio('recording_with_Uncle_Pat_2013.wav');
    //var sample = document.getElementById('my-audio');

    // play it
    sample.play();
};

// click -> make sound
document.querySelector('#play-WAV')
        .addEventListener('click',function(){start("no");});
