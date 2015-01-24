function sinetone(freq1, freq2) {
  var phase1 = 0;
  var phase2 = 0;
  var phaseIncr1 = (freq1 || 440) / Pico.sampleRate;
  var phaseIncr2 = (freq2 || 442) / Pico.sampleRate;

  return function(e) {
    var out = e.buffers;

    for (var i = 0; i < e.bufferSize; i++) {
      out[0][i] = Math.sin(2 * Math.PI * phase1) * 0.25;
      out[1][i] = Math.sin(2 * Math.PI * phase2) * 0.25;
      phase1 += phaseIncr1;
      phase2 += phaseIncr2;
    }
  };
}

module.exports = sinetone;
