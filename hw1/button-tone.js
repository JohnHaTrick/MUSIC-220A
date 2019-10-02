const start = () => {
        // create web audio api context
        const context = new AudioContext();
        
        // create 220, 440, & 660 oscillators
        const osc_220 = new OscillatorNode(context);
              const osc_440 = new OscillatorNode(context);
        const osc_660 = new OscillatorNode(context);
        osc_220.frequency.value = 220;
              osc_440.frequency.value = 440;
        osc_660.frequency.value = 660;
        
              // set gains for similar loudness
              amp_220 = new GainNode(context);
        amp_440 = new GainNode(context);
        amp_660 = new GainNode(context);
        osc_220.connect(amp_220)
        osc_440.connect(amp_440)
        osc_660.connect(amp_660)
              amp_220.connect(context.destination);
        amp_440.connect(context.destination);
        amp_660.connect(context.destination);
        amp_220.gain.value = 0.3;
        amp_440.gain.value = 0.2;
        amp_660.gain.value = 0.1;
        
        // start and stop oscillators
        osc_220.start(0.0);
        osc_220.stop( 0.5);
        osc_440.start(0.5);
        osc_440.stop( 1.0);
        osc_660.start(1.0);
        osc_660.stop( 1.5);
      };
      // click -> make sound (doc.body to limit to clicking text)
      document.addEventListener('click', start);
