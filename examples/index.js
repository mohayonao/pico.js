#!/usr/bin/env node

if (!module.parent) {
  var demo = process.argv[2] || "demo";

  require("fs").stat(__dirname + "/" + demo + ".js", function(err, stats) {
    if (err) {
      return console.log("demo: " + demo + " not exists");
    }

    global.Pico = require("../");

    var processor = require("./" + demo);

    if (typeof processor === "function") {
      Pico.play(processor());
    }
  });
}
