(function() {
    "use strict";
    
    function PicoDelayNode(opts) {
        var i, bits = Math.ceil(Math.log(pico.samplerate * 1.5) * Math.LOG2E);
        
        this.time = 125;
        this.feedback  = 0.25;
        
        this.bufferL = new Float32Array(1 << bits);
        this.bufferR = new Float32Array(1 << bits);
        this.mask    = (1 << bits) - 1;
        this.wet     = 0.45;
        
        this.readIndex  = 0;
        this.writeIndex = (this.time / 1000 * pico.samplerate)|0;
        
        if (opts) this.setParams(opts);
    }
    
    PicoDelayNode.prototype.setParams = function(opts) {
        if (opts.time) {
            this.time = opts.time;
            this.writeIndex = this.readIndex + ((this.time / 1000 * pico.samplerate)|0);
        }
        if (opts.feedback) {
            this.feedback = opts.feedback;
        }
        if (opts.wet) {
            this.wet = opts.wet;
        }
        return this;
    };
    
    PicoDelayNode.prototype.process = function(L, R) {
        var bufferL, bufferR, writeIndex, readIndex, feedback;
        var value, wet, dry;
        var i, imax;
        bufferL = this.bufferL;
        bufferR = this.bufferR;
        writeIndex = this.writeIndex;
        readIndex  = this.readIndex;
        feedback   = this.feedback;
        wet = this.wet;
        dry = 1 - this.wet;
        if (R) {
            for (i = 0, imax = L.length; i < imax; ++i) {
                value = bufferL[readIndex];
                bufferL[writeIndex] = L[i] - (value * feedback);
                L[i] = (L[i] * dry) + (value * wet);
                value = bufferR[readIndex];
                bufferR[writeIndex] = R[i] - (value * feedback);
                R[i] = (R[i] * dry) + (value * wet);
                writeIndex += 1;
                readIndex  += 1;
            }
        } else {
            for (i = 0, imax = L.length; i < imax; ++i) {
                value = bufferL[readIndex];
                bufferL[writeIndex] = L[i] - (value * feedback);
                L[i] = (L[i] * dry) + (value * wet);                
                writeIndex += 1;
                readIndex  += 1;
            }
        }
        this.writeIndex = writeIndex & this.mask;
        this.readIndex  = readIndex  & this.mask;
    };
    
    if (typeof module !== "undefined" && module.exports) {
        module.exports = PicoDelayNode;
        if (global.pico) {
            global.pico.DelayNode = PicoDelayNode;
        }
    } else {
        if (window.pico) {
            window.pico.DelayNode = PicoDelayNode;
        } else {
            window.PicoDelayNode = PicoDelayNode;
        }
    }
})();
