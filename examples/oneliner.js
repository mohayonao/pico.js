function f1(t) {
  return Math.sin(t*(0.001+Math.sin(t>>10)))*64;
}

function f2(t) {
  return (t>>9)&((t<<5)|(Math.sin(t*1.4142)*3000))+(t>>3);
}

function oneliner() {
  var t = 0, dt = 8000 / Pico.sampleRate;

  return function(e) {
    var out = e.buffers;

    for (var i = 0; i < e.bufferSize; i++) {
      out[0][i] = (f1(t|0) % 256) / 512;
      out[1][i] = (f2(t|0) % 256) / 512;
      t += dt;
    }
  };
}

module.exports = oneliner;
