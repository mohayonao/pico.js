(function() {
    "use strict";
    
    function PicoTagPlayer(sys, opts) {
        var timerId = 0;
        
        opts = opts || {};
        
        var bits = opts.bits === 1 ? 1 : 2;
        this.defaultSamplerate = 22050;
        this.env = "tag";
        
        this.play = function() {
            
            var samples = 1 << Math.ceil(Math.log(sys.samplerate * 0.5) * Math.LOG2E);
            var waveheader = make_waveheader(sys.samplerate, sys.channels, samples);
            
            var imax = sys.streamsize;
            var nmax = samples / sys.streamsize;
            var func;
            
            if (bits === 2) {
                func = function() {
                    var bytes = [];
                    var inL = sys.strmL, inR = sys.strmR;
                    var i, n = nmax, x;
                    
                    while (n--) {
                        sys.process();
                        
                        for (i = 0; i < imax; ++i) {
                            x = (inL[i] * 32767)|0;
                            bytes.push(String.fromCharCode(x & 0xff, (x >> 8) & 0xff));
                            x = (inR[i] * 32767)|0;
                            bytes.push(String.fromCharCode(x & 0xff, (x >> 8) & 0xff));
                        }
                    }
                    
                    new Audio("data:audio/wav;base64," +
                              btoa(waveheader + bytes.join(""))).play();
                };
            } else {
                func = function() {
                    var bytes = [];
                    var inL = sys.strmL, inR = sys.strmR;
                    var i, n = nmax, x;
                    
                    while (n--) {
                        sys.process();
                        
                        for (i = 0; i < imax; ++i) {
                            x = (inL[i] * 127)|0;
                            bytes.push(String.fromCharCode(x & 0xff));
                            x = (inR[i] * 127)|0;
                            bytes.push(String.fromCharCode(x & 0xff));
                        }
                    }
                    
                    new Audio("data:audio/wav;base64," +
                              btoa(waveheader + bytes.join(""))).play();
                };
            }
            timerId = setInterval(func, samples / sys.samplerate * 1000);
        };
        
        this.pause = function() {
            if (timerId !== 0) {
                clearInterval(timerId);
                timerId = 0;
            }
        };
        
        function make_waveheader(samplerate, channels, samples) {
            var l1 = (samples * channels * bits) - 8;
            var l2 = l1 - 36;
            
            return String.fromCharCode(
                0x52, 0x49, 0x46, 0x46, // 'RIFF'
                (l1 >>  0) & 0xff,
                (l1 >>  8) & 0xff,
                (l1 >> 16) & 0xff,
                (l1 >> 24) & 0xff,
                0x57, 0x41, 0x56, 0x45, // 'WAVE'
                0x66, 0x6D, 0x74, 0x20, // 'fmt '
                0x10, 0x00, 0x00, 0x00, // byte length
                0x01, 0x00,    // linear pcm
                channels, 0x00, // channel
                (samplerate >>  0) & 0xff,
                (samplerate >>  8) & 0xff,
                (samplerate >> 16) & 0xff,
                (samplerate >> 24) & 0xff,
                ((samplerate * channels * bits) >> 0) & 0xff,
                ((samplerate * channels * bits) >> 8) & 0xff,
                ((samplerate * channels * bits) >> 16) & 0xff,
                ((samplerate * channels * bits) >> 24) & 0xff,
                bits * channels, 0x00, // block size
                8 * bits, 0x00,       // bit
                0x64, 0x61, 0x74, 0x61, // 'data'
                (l2 >>  0) & 0xff,
                (l2 >>  8) & 0xff,
                (l2 >> 16) & 0xff,
                (l2 >> 24) & 0xff
            );
        }
    }
    
    if (window.pico) {
        window.pico.TagPlayer = PicoTagPlayer;
    } else {
        window.PicoTagPlayer = PicoTagPlayer;
    }
})();
