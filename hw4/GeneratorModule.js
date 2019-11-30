class GeneratorModule {
  constructor(context, freq, shape) {
    // init objects
    this._context = context;
    this.output   = new GainNode(      this._context);
    this._osc     = new OscillatorNode(this._context);
    this._amp     = new GainNode(      this._context);
    // connect objects
    this._osc.connect(this._amp)
             .connect(this.output);
    // set parameters
    this._osc.frequency.value = freq;
    this._osc.type            = shape;
    this._amp.gain.value      = 0.0;
    // start oscillating
    this._osc.start();
  }

  async initialize() {}

  close() { this._osc.stop(); }

  noteOn(gain, velocity, when) {
    const now = this._context.currentTime;
    this._amp.gain
        .setTargetAtTime(gain, now, 0.01 + velocity);
  }

  noteOff(velocity) {
    const now = this._context.currentTime;
    this._amp.gain
        .setTargetAtTime(0.0,  now, 0.01 + velocity);
  }
}

export default GeneratorModule;
