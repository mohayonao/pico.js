function whitenoise() {
  return function(e) {
    var out = e.buffers;

    for (var i = 0; i < e.bufferSize; i++) {
      out[0][i] = out[1][i] = Math.random() * 0.25;
    }
  };
}

module.exports = whitenoise;
