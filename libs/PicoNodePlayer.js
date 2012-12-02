"use strict";

var macaudio = require("macaudio");

function PicoNodePlayer(sys) {
    var node = new macaudio.JavaScriptOutputNode(sys.streamsize);
    
    this.defaultSamplerate = node.sampleRate;
    this.env = "node";
    
    this.play = function() {
        var onaudioprocess, x, dx;
        
        if (sys.samplerate === node.sampleRate) {
            onaudioprocess = function(e) {
                var inL = sys.strmL, inR = sys.strmR,
                    outL = e.getChannelData(0),
                    outR = e.getChannelData(1),
                    i = e.bufferSize;
                sys.process();
                while (i--) {
                    outL[i] = inL[i];
                    outR[i] = inR[i];
                }
            };
        } else {
            x  = sys.streamsize;
            dx = sys.samplerate / node.sampleRate;
            onaudioprocess = function(e) {
                var inL = sys.strmL, inR = sys.strmR,
                    outL = e.getChannelData(0),
                    outR = e.getChannelData(1),
                    streamsize = sys.streamsize,
                    i, imax = e.bufferSize;
                for (i = 0; i < imax; ++i) {
                    if (x >= streamsize) {
                        sys.process();
                        x -= streamsize;
                    }
                    outL[i] = inL[x|0];
                    outR[i] = inR[x|0];
                    x += dx;
                }
            };
        }
        node.onaudioprocess = onaudioprocess;
        node.start();
    };
    
    this.pause = function() {
        node.stop();
    };
}

module.exports = PicoNodePlayer;
if (global.pico) {
    global.pico.NodePlayer = PicoNodePlayer;
}
