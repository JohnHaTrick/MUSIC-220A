class TremoloModule {
  constructor(context, depth, speed) {
    // init objects
    this._context = context;
    this.output   = new GainNode(      this._context);
    this._osc     = new OscillatorNode(this._context);
    this._amp     = new GainNode(      this._context);
    // connect objects
    this._osc.connect(this._amp)
             .connect(this.output);
    // set parameters
    this.setSpeed(speed);
    this.setDepth(depth);
    // start oscillating
    this._osc.start();
  }

  async initialize() {} // if needed

  close() {}

  setSpeed(value) {
    this._osc.frequency.value = value;
  }

  setDepth(value) {
    this._amp.gain.value = value;
  }
}

export default TremoloModule;
