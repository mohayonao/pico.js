pico.js
=======

Pico.js is a JavaScript library for real-time audio processing that runs a browser and node.js.

Reference and Demo
------------------

[English](http://mohayonao.github.com/pico.js/) | [日本語](http://mohayonao.github.com/pico.js/index-ja.html)

Installation
------------

#### browser ####
````html
<script src="pico.js"></script>
```

#### node.js ####
```bash
$ npm install node-pico
```

Example
-------

```javascript
var pico = require("node-pico");

function sinetone(freq) {
    var phase = 0,
        phaseStep = freq / pico.samplerate;
    return {
        process: function(L, R) {
            for (var i = 0; i < L.length; i++) {
                L[i] = R[i] = Math.sin(6.28318 * phase) * 0.25;
                phase += phaseStep;
            }
        }
    };
}

pico.play(sinetone(880));
```

Change log
----------

2012 12 11 - **0.0.4**

* Added fake Float32Array (for IE9)
* Fixed: default samplerate (webkit=auto, moz,node.js=44.1KHz, flash=22.05KHz)

2012 12 08 - **0.0.3**

* Fixed issue [#2](https://github.com/mohayonao/pico.js/issues/2), added support cross-platform node.js

2012 12 07 - **0.0.2**

* Fixed issue [#1](https://github.com/mohayonao/pico.js/issues/1), the sound does not stop when switching browser tabs (Firefox)

2012 12 05 - **0.0.1**

* First release
