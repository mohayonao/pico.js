# pico.js
[![Build Status](http://img.shields.io/travis/mohayonao/pico.js.svg?style=flat-square)](https://travis-ci.org/mohayonao/pico.js)
[![NPM Version](http://img.shields.io/npm/v/node-pico.svg?style=flat-square)](https://www.npmjs.org/package/node-pico)
[![Bower](https://img.shields.io/bower/v/pico.js.svg?style=flat-square)](https://github.com/mohayonao/pico.js)
[![6to5](http://img.shields.io/badge/module-6to5-brightgreen.svg?style=flat-square)](https://6to5.org/)
[![License](http://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat-square)](http://mohayonao.mit-license.org/)

> Audio processor for the cross-platform

- [online demo](http://mohayonao.github.io/pico.js/)

## Support

|                      | Support | API            |
| -------------------- |:-------:| -------------- |
| Google Chrome 10+    | :o:     | Web Audio API  |
| Firefox 25+          | :o:     | Web Audio API  |
| Safari 6+            | :o:     | Web Audio API  |
| Opera 15+            | :o:     | Web Audio API  |
| Internet Explorer 10 | :o:     | Flash fallback |
| Node.js 0.10         | :o:     | node-speaker   |

## Installation

npm:

```
npm install node-pico
```

bower:

```
bower install pico.js
```

downloads:

- [pico.js](https://raw.githubusercontent.com/mohayonao/pico.js/master/build/pico.js)
- [pico.min.js](https://raw.githubusercontent.com/mohayonao/pico.js/master/build/pico.min.js)
- [pico.swf](http://mohayonao.github.io/pico.js/build/pico.swf) - must be put in the same directory with the pico.js.

## API

- `Pico.play(audioprocess: function): void`
- `Pico.pause(): void`
- `Pico.sampleRate: number`
- `Pico.bufferSize: number`
- `Pico.isPlaying: boolean`

## Example

```javascript
var Pico = require("node-pico");

function sinetone() {
  var x1 = 0, y1 = 440 / Pico.sampleRate;
  var x2 = 0, y2 = 442 / Pico.sampleRate;

  return function(e) {
    var out = e.buffers;

    for (var i = 0; i < e.bufferSize; i++) {
      out[0][i] = Math.sin(2 * Math.PI * x1) * 0.25;
      out[1][i] = Math.sin(2 * Math.PI * x2) * 0.25;
      x1 += y1;
      x2 += y2;
    }
  };
}

Pico.play(sinetone());

setTimeout(function() {
  Pico.pause();
}, 5000);
```

How to play other examples on node.js

```
$ npm install .
$ npm run build
$ node examples
```

## Development

build: `6to5 -> browserify -> uglify`

```
npm run build
```

test: `mocha`

```
npm run test
```

coverage: `istanbul`

```
npm run cover
```

lint: `jshint`

```
npm run lint
```

## License

[MIT](http://mohayonao.mit-license.org/)
