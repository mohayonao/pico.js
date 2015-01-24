function demo() {
  "use strict";

  function inherits(ctor, superCtor) {
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: { value: ctor }
    });
  }

  function repeat(n, ch) {
    var str = "";
    for (var i = 0; i < n; i++) {
      str += ch;
    }
    return str;
  }

  function midicps(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  var ToneGenerator = (function() {
    function ToneGenerator() {
      this.sampleRate = Pico.sampleRate;
      this.velocity = 0.8;
      this.cell = new Float32Array(Pico.bufferSize);
    }

    ToneGenerator.prototype.setVelocity = function(val) {
      return this.velocity = val / 16;
    };

    ToneGenerator.prototype.setParams = function(val) {
      if (this.env) {
        this.env.setParams(val);
      }
    };

    return ToneGenerator;
  })();

  var FMSynthBass = (function() {
    function FMSynthBass() {
      ToneGenerator.call(this);
      this.op = [
        { phase: 0, phaseIncr: 0, amp: 1 },
        { phase: 0, phaseIncr: 0, amp: 1 },
      ];
      this.fb = 0;
      this.fblv = 0.097;
    }
    inherits(FMSynthBass, ToneGenerator);

    FMSynthBass.prototype.setFreq = function(val) {
      this.op[0].phaseIncr = val / this.sampleRate * 0.5;
      this.op[1].phaseIncr = val / this.sampleRate;
      this.op[0].amp = 0.75;
      this.op[1].amp = 1;
    };

    FMSynthBass.prototype.process = function() {
      var op = this.op;

      for (var i = 0, imax = this.cell.length; i < imax; i++) {
        var phase0 = op[0].phase + this.fb * this.fblv;
        var x0 = Math.sin(phase0 * 2 * Math.PI) * op[0].amp;
        var phase1 = op[1].phase + x0;
        var x1 = Math.sin(phase1 * 2 * Math.PI) * op[1].amp;
        this.cell[i] = x1 * this.velocity * 0.15;
        this.fb = x0;
        op[0].phase += op[0].phaseIncr;
        op[1].phase += op[1].phaseIncr;
      }

      op[0].amp *= 0.995;

      return this.cell;
    };

    return FMSynthBass;
  })();

  var FMSynthLead = (function() {
    function FMSynthLead() {
      ToneGenerator.call(this);
      this.op = [
        { phase: 0, phaseIncr: 0, amp: 1 },
        { phase: 0, phaseIncr: 0, amp: 1 },
        { phase: 0, phaseIncr: 0, amp: 1 },
        { phase: 0, phaseIncr: 0, amp: 1 },
      ];
      this.fb = 0;
      this.fblv = 0.3;
      this.env = new Envelope();
      this.efx = new DelayNode({ time:225, feedback:0.35, wet:0.3 })
    }
    inherits(FMSynthLead, ToneGenerator);

    FMSynthLead.prototype.setFreq = function(val) {
      this.op[0].phaseIncr = val / this.sampleRate * 2;
      this.op[1].phaseIncr = val / this.sampleRate * 1;
      this.op[2].phaseIncr = val / this.sampleRate * 4;
      this.op[3].phaseIncr = val / this.sampleRate * 1.005;
      this.op[0].amp = 0.5;
      this.op[1].amp = 2;
      this.op[2].amp = 4;
      this.op[3].amp = 0.5;
      this.env.bang();
    };

    FMSynthLead.prototype.process = function() {
      var op = this.op;

      for (var i = 0, imax = this.cell.length; i < imax; i++) {
        var phase0 = op[0].phase + this.fb * this.fblv;
        var x0 = Math.sin(phase0 * 2 * Math.PI) * op[0].amp;
        var phase1 = op[1].phase + x0;
        var x1 = Math.sin(phase1 * 2 * Math.PI) * op[1].amp;
        var phase2 = op[2].phase;
        var x2 = Math.sin(phase2 * 2 * Math.PI) * op[2].amp;
        var phase3 = op[3].phase + x2;
        var x3 = Math.sin(phase3 * 2 * Math.PI) * op[3].amp;
        this.cell[i] = (x1 + x3) * this.velocity * 0.1;
        this.fb = x0;
        op[0].phase += op[0].phaseIncr;
        op[1].phase += op[1].phaseIncr;
        op[2].phase += op[2].phaseIncr;
        op[3].phase += op[3].phaseIncr;
      }

      op[0].amp *= 0.9988;
      op[2].amp *= 0.9998;

      this.env.process(this.cell);
      this.efx.process(this.cell);

      return this.cell;
    };

    return FMSynthLead;
  })();

  var PwmGenerator = (function() {
    function PwmGenerator() {
      ToneGenerator.call(this);
      this.env = new Envelope();
      this.phase = 0;
      this.phaseIncr = 0;
      this.width = 0.5;
    }
    inherits(PwmGenerator, ToneGenerator);

    PwmGenerator.prototype.setFreq = function(val) {
      this.phaseIncr = val / this.sampleRate;
      this.env.bang();
    };

    PwmGenerator.prototype.setWidth = function(val) {
      this.width = val * 0.01;
    };

    PwmGenerator.prototype.process = function() {
      for (var i = 0, imax = this.cell.length; i < imax; i++) {
        this.cell[i] = (this.phase < this.width ? +0.1 : -0.1) * this.velocity;
        this.phase += this.phaseIncr;
        while (this.phase >= 1) {
          this.phase -= 1;
        }
      }

      this.env.process(this.cell);

      return this.cell;
    };

    return PwmGenerator;
  })();

  var NoiseGenerator = (function() {
    function NoiseGenerator() {
      ToneGenerator.call(this);
      this.env = new Envelope();
      this.phase = 0;
      this.phaseIncr = 1;
      this.value = 0;
      this.onOff = 0;
    }
    inherits(NoiseGenerator, ToneGenerator);

    NoiseGenerator.prototype.setFreq = function(val) {
      this.onOff = val ? 0.15 : 0;
      this.env.bang();
    };

    NoiseGenerator.prototype.setNoise = function(val) {
      if (val > 0) {
        this.phaseIncr = 4 / val;
      } else {
        this.phaseIncr = 0;
      }
    };

    NoiseGenerator.prototype.process = function() {
      for (var i = 0, imax = this.cell.length; i < imax; i++) {
        this.cell[i] = this.value * this.onOff;
        this.phase += this.phaseIncr;
        if (this.phase >= 1) {
          this.phase -= 1;
          this.value = Math.random() * this.velocity;
        }
      }

      this.env.process(this.cell);

      return this.cell;
    };

    return NoiseGenerator;
  })();

  var Envelope = (function() {
    function Envelope() {
      this.sampleRate = Pico.sampleRate;
      this.a = 0;
      this.d = 64;
      this.s = 32;
      this.r = 0;
      this.samples = 0;
      this.status = 0;
      this.x = 1;
      this.dx = 0;
    }

    Envelope.prototype.setParams = function(params) {
      this.a = params[0];
      this.d = params[1];
      this.s = params[2];
      this.r = params[3];
    };

    Envelope.prototype.bang = function() {
      this.samples = 0;
      this.status = 0;
      this.x = 1;
      this.dx = 0;
    };

    Envelope.prototype.process = function(cell) {
      while (this.samples <= 0) {
        switch (this.status) {
        case 0:
          this.status = 1;
          this.samples = (this.a * 0.005) * this.sampleRate;
          this.x = 0;
          this.dx = (1 / this.samples) * cell.length;
          break;
        case 1:
          this.status = 2;
          this.samples = (this.d * 0.005) * this.sampleRate;
          this.x = 1;
          this.dx = -(1 / this.samples) * cell.length;
          this.dx *= (1 - this.s / 128);
          break;
        case 2:
          this.status = 3;
          this.samples = Infinity;
          this.dx = 0;
          if (this.s === 0) {
            this.x = 0;
          }
        }
      }

      for (var i = 0, imax = cell.length; i < imax; i++) {
        cell[i] *= this.x;
      }

      this.x += this.dx;
      this.samples -= cell.length;

      return cell;
    };

    return Envelope;
  })();

  var DelayNode = (function() {
    function DelayNode(opts) {
      this.buffer = new Float32Array(65536);
      this.rdIndex = 0;
      this.wrIndex = (this.time / 1000 * Pico.sampleRate)|0;

      this.time = 125;
      this.feedback = 0.25;
      this.wet = 0.45;

      if (opts) {
        this.setParams(opts);
      }
    }

    DelayNode.prototype.setParams = function(opts) {
      if (opts.time) {
        this.time = opts.time;
        this.wrIndex = this.rdIndex + ((this.time / 1000 * Pico.sampleRate)|0);
        this.wrIndex &= 65535;
      }
      if (opts.feedback) {
        this.feedback = opts.feedback;
      }
      if (opts.wet) {
        this.wet = opts.wet;
      }
    };

    DelayNode.prototype.process = function(cell) {
      for (var i = 0, imax = cell.length; i < imax; ++i) {
        var x0 = cell[i];
        var x1 = this.buffer[this.rdIndex++];
        cell[i] = x0 * (1 - this.wet) + (x1 * this.wet);
        this.buffer[this.wrIndex++] = x0 - (x1 * this.feedback);
      }
      this.wrIndex &= 65535;
      this.rdIndex &= 65535;

      return cell;
    };

    return DelayNode;
  })();

  var MMLTrack = (function() {
    function MMLTrack(mml) {
      this.sampleRate = Pico.sampleRate;
      this.tempo = 120;
      this.len = 4;
      this.octave = 5;
      this.tie = false;
      this.curFreq = 0;
      this.index = -1;
      this.samples = 0;
      this.loopStack = [];
      this.commands = this.compile(mml);
      this.toneGenerator = null;
    }

    MMLTrack.prototype.compile = function(mml) {
      var cmd, m, mask;
      var commands = [];
      var checked = {};

      for (var i = 0, imax = MMLCommands.length; i < imax; i++) {
        var def = MMLCommands[i];

        while ((m = def.re.exec(mml)) !== null) {
          if (!checked[m.index]) {
            checked[m.index] = true;

            cmd = def.func(m);
            cmd.index = m.index;
            cmd.origin = m[0];

            commands.push(cmd);

            mask = repeat(m[0].length, " ");

            mml = mml.substr(0, m.index) + mask + mml.substr(m.index + mask.length);
          }
        }
      }

      commands.sort(function(a, b) {
        return a.index - b.index;
      });

      return commands;
    };

    MMLTrack.prototype.doCommand = function(cmd) {
      if (!cmd) {
        return;
      }

      var peek;

      switch (cmd.name) {
      case "@":
        switch (cmd.val) {
        case 3:
          this.toneGenerator = new PwmGenerator();
          break;
        case 4:
          this.toneGenerator = new NoiseGenerator();
          break;
        case 5:
          this.toneGenerator = new FMSynthBass();
          break;
        case 6:
          this.toneGenerator = new FMSynthLead();
          break;
        }
        break;
      case "@w":
        if (this.toneGenerator && this.toneGenerator.setWidth) {
          this.toneGenerator.setWidth(cmd.val);
        }
        break;
      case "@n":
        if (this.toneGenerator && this.toneGenerator.setNoise) {
          this.toneGenerator.setNoise(cmd.val);
        }
        break;
      case "@e1":
        if (this.toneGenerator && this.toneGenerator.setParams) {
          this.toneGenerator.setParams(cmd.val);
        }
        break;
      case "t":
        this.tempo = cmd.val;
        break;
      case "l":
        this.len = cmd.val;
        break;
      case "o":
        this.octave = cmd.val;
        break;
      case "<":
        this.octave += 1;
        break;
      case ">":
        this.octave -= 1;
        break;
      case "&":
        this.tie = true;
        break;
      case "/:":
        this.loopStack.push({
          index: this.index,
          count: cmd.val || 2,
          exit: 0
        });
        break;
      case ":/":
        peek = this.loopStack[this.loopStack.length - 1];
        peek.exit = this.index;
        peek.count -= 1;
        if (peek.count <= 0) {
          this.loopStack.pop();
        } else {
          this.index = peek.index;
        }
        break;
      case "/":
        peek = this.loopStack[this.loopStack.length - 1];
        if (peek.count === 1) {
          this.loopStack.pop();
          this.index = peek.exit;
        }
        break;
      case "v":
        this.toneGenerator.setVelocity(cmd.val);
        break;
      case "note":
      case "rest":
        var len = cmd.len || this.len;
        this.samples += ((60 / this.tempo) * (4 / len) * this.sampleRate) | 0;
        this.samples *= [1, 1.5, 1.75][cmd.dot] || 1;

        var freq = (cmd.name === "rest") ? 0 : midicps(cmd.tone + this.octave * 12);

        if (this.curFreq !== freq) {
          this.tie = false;
        }

        if (!this.tie) {
          this.toneGenerator.setFreq(freq);
          this.curFreq = freq;
        } else {
          this.tie = false;
        }

        break;
      }
    };

    MMLTrack.prototype.process = function() {
      while (this.samples <= 0) {
        this.index += 1;
        if (this.index >= this.commands.length) {
          this.samples = Infinity;
        } else {
          this.doCommand(this.commands[this.index]);
        }
      }

      this.samples -= Pico.bufferSize;

      if (this.samples !== Infinity && this.toneGenerator) {
        return this.toneGenerator.process();
      }
    };

    return MMLTrack;
  })();

  var MMLSequencer = (function() {
    function MMLSequencer(mml) {
      this.tracks = mml.split(";").filter(function(mml) {
        return mml;
      }).map(function(mml) {
        return new MMLTrack(mml);
      });
      this.cell = new Float32Array(Pico.bufferSize);
    }

    MMLSequencer.prototype.process = function() {
      this.cell.set(new Float32Array(this.cell.length));

      this.tracks.forEach(function(track) {
        var cell = track.process();
        if (cell) {
          for (var i = 0, imax = this.cell.length; i < imax; i++) {
            this.cell[i] += cell[i];
          }
        }
      }, this);

      return this.cell;
    };

    return MMLSequencer;
  })();

  function toInt(x) {
    return x | 0;
  }

  var MMLCommands = [
    {
      re: /@e1,(\d+,\d+,\d+,\d+)/g,
      func: function(m) {
        return { name: "@e1", val: m[1].split(",").map(toInt) };
      }
    },
    {
      re: /@w(\d*)/g,
      func: function(m) {
        return { name: "@w", val: toInt(m[1]) };
      }
    },
    {
      re: /@n(\d*)/g,
      func: function(m) {
        return { name: "@n", val: toInt(m[1]) };
      }
    },
    {
      re: /@(\d*)/g,
      func: function(m) {
        return { name: "@", val: toInt(m[1]) };
      }
    },
    {
      re: /t(\d*)/g,
      func: function(m) {
        return { name: "t", val: toInt(m[1]) };
      }
    },
    {
      re: /l(\d*)/g,
      func: function(m) {
        return { name: "l", val: toInt(m[1]) };
      }
    },
    {
      re: /v(\d*)/g,
      func: function(m) {
        return { name: "v", val: toInt(m[1]) };
      }
    },
    {
      re: /o(\d*)/g,
      func: function(m) {
        return { name: "o", val: toInt(m[1]) };
      }
    },
    {
      re: /[<>]/g,
      func: function(m) {
        return { name: m[0] };
      }
    },
    {
      re: /\/:(\d*)/g,
      func: function(m) {
        return { name: "/:", val: toInt(m[1]) };
      }
    },
    {
      re: /:\//g,
      func: function(m) {
        return { name: ":/" };
      }
    },
    {
      re: /\//g,
      func: function(m) {
        return { name: "/" };
      }
    },
    {
      re: /([cdefgab])([-+]?)(\d*)(\.*)/g,
      func: function(m) {
        return {
          name: "note",
          note: m[1],
          len: toInt(m[3]),
          dot: m[4].length,
          tone: {
            c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11
          }[m[1]] + toInt({
            "-": -1,
            "+": +1
          }[m[2]])
        };
      }
    },
    {
      re: /([r])([-+]?)(\d*)(\.*)/g,
      func: function(m) {
        return { name: "rest", note: m[1], len: toInt(m[3]), dot: m[4].length };
      }
    },
    {
      re: /&/g,
      func: function(m) {
        return { name: "&" };
      }
    }
  ];

  var mmldata = [
    "t200l8 @6 @w60 @e1,0,64,64,10 v15o4",
    "r4. /:2",
    "efga4.>a4 <c+dee4ede r1 r1 <c+>ab-gafge b-gafgefd c+defgab-<c+ ec+>b-<f>c+b-r4 >g2.ab- <c+2.ef gfefgab-<c+ ee4.f4g4",
    "fecd&d2&d2>a<cdc fecd&d2&d2>agfe f4.d4.f4 g4.e4.g4 a4.f4.d4 e4.g4.b-4",
    "a1 <defgagfe g4.e4.c4 >g4.<c4.e4 fd>afda<df ec>gecg<ce >dfa<c+dfa<c+d1",
    ">fecd&d2&d2>a<cdc fecd&d2&d2>agfe f4.d4.f4 g4.e4.g4 a4.f4.d4 e4.g4.b-4",
    "a1 <defgagfe g4.e4.c4 >g4.<c4.e4 fd>afda<df ec>gecg<ce >e-4.e-g4.e-16g16 b-4.g16b-16<e-2",
    "/",
    "a2dfg a&a4g4fg4 <d&d4>a4gf4 e&e4f4.g4. a2dfg a&a4g4fg4 <d&d2e4d4 d2c+2",
    "> /:2 /:4dfa:/ e-gb-g /:4dfa:/cceg :/ > :/",
    "arrar4aa;",

    "t200l8 @3@w40 v10 o5",
    "r4. /:2",
    "e1 g1 /:2d+16e16d+16e16:/</:2d+16e16d+16e16:/ > efg+fefg+a /:4r4.e&e2 / r1:/ c+c+c+c+ddee",
    "/:2dc>ga&a2 <a4g4f4e4:/ d4.>b-4.<d4 e4.c4.e4 f4.d4.>a4 a4.<e4.g4",
    "d1 >a2<d2 e1 c1 f1 e1 d1 d4c+4>b4<c+4",
    "/:2dc>ga&a2 <a4g4f4e4:/ d4.>b-4.<d4 e4.c4.e4 f4.d4.>a4 a4.<e4.g4",
    "d1 >a2<d2 e1 c1 f1 e1 b-1&b-1",
    "/",
    ">a1&a1 b-1 a1 < /:2v6ffv2fv6fv2fv6fff:/ b-b-v5b-v10b-v5b-v10b-b-b- aav5av10av5av10aec+",
    "> /:2 /:4fa<d>:/gb-<d+>b- /:4fa<d>:/gg<ce> :/ < :/",
    "drrdr4dd;",

    "t200l8 @3@w40 v10 o4",
    "r4. /:2",
    "a1 < c+1 > /:2g+16a16g+16a16:/ <  /:2g+16a16g+16a16:/ >ab-<c+>b-ab-<c+d >/:4r4.a&a2 / r1:/ aaaabb<c+c+",
    "> /:2agef&f2 <f4e4d4c4>:/ b-4.f4.b-4 <c4.>g4.<c4 d4.>a4.f4 e4.<c+4.e4",
    ">a1 f2a2 <c1 >g1 <d1 c1 r1 <d4c+4>b4<c+4>",
    "> /:2agef&f2 <f4e4d4c4>:/ b-4.f4.b-4 <c4.>g4.<c4 d4.>a4.f4 e4.<c+4.e4",
    ">a1 f2a2 <c1 >g1 <d1 c1 g1&g1>",
    "/",
    "f1&f1 f1 e1 < /:2v6ddv2dv6dv2dv6ddd:/ ggv5gv10gv5gv10ggg eev5ev10ev5ev10ec+>a",
    "/:8r1:/ :/",
    ">arrar4aa;",

    "t200l8 @5 v11o3",
    "r4. /:2",
    "aaaaaa<e>a aa<e>a<g>a<f>a aa<g>a<f>a<e>a <c+>ab-<c+>b-agb- /:4a4r2<a4 / ae>a4a4<c+e >:/ >a4<a4>b4<c+4",
    "/:16d:/ /:16c:/ >b-b-<fb-<d>b-fb- ccg<cec>g<c >ddfa<d>afd >a<aec+>aaaa",
    "</:16d:/ /:16c:/ >b-b-<fb-<d>b-fb- ccg<cec>g<c >ddfa<d>afd >a<aec+>aaaa",
    "</:16d:/ /:16c:/ >b-b-<fb-<d>b-fb- ccg<cec>g<c >ddfa<d>afd >a<aec+>aaaa",
    "</:16d:/ /:16c:/ >b-b-<fb-<d>b-fb- ccg<cec>g<c >e-e-b-e-ge-b-f ge-b-e-<e->e-<g>e- >",
    "/",
    "< /:2dd<d>dga<cd >ff<f>fff<f>f b-b-<b->b-b-b-<b->b- aa<a>a / <g>a<a>a :/ <aec+>a",
    "/:2 drrdr4<c&d >rdfde-e-gb- drrdr4<c&d >rdfdccec :/ > :/",
    "dd<d>dga<cd;",

    "t200l8 @4 @n2 @e1,0,5,0,8 v11",
    "r4.",
    "/:4r1:/ /:7cccrr2:/ cr4.r2 /:15ccrc:/ r2 /:14ccrc:/ cr4.r2 /:15ccr4:/ r2 /:14ccr4:/ cr4.r2",
    "/:15ccr4:/ r2 /:4rccrccr4 r1:/",
    "/:4r1:/ /:7cccrr2:/ cr4.r2 /:15ccrc:/ r2 /:14ccrc:/ cr4.r2 /:15ccr4:/ r2 /:14ccr4:/ cr4.r2",
    "r1;",

    "t200l8 @4 @n20 @e1,0,20,0,10 v15",
    "r8 cr",
    "/:8r4cr:/ /:3r4.crcr4:/ r4.crccc /:3r4.crcr4:/ r8ccccccc /:15r4cr:/cccc /:14r4cr:/",
    "rccrccrc /:15r4cr:/cccc /:14r4cr:/ r@n105c@n100c@n105c @n110c16c16c16c16 @n120c16c16c16c16@n100",
    "/:15r4cr:/r2 /:4 r2.cr r4crr4cr :/",
    "/:8r4cr:/ /:3r4.crcr4:/ r4.crccc /:3r4.crcr4:/ r8ccccccc /:15r4cr:/cccc /:14r4cr:/",
    "rccrccrc /:15r4cr:/cccc /:14r4cr:/ r@n105c@n100c@n105c @n110c16c16c16c16 @n120c16c16c16c16@n100",
    "crrcr4cc;",

    "t200l8 @4@n127 @e1,0,15,0,10 v15",
    "cr4",
    "/:8crr4:/ /:7crr4crcc:/ cr4.r2 /:64crr4:/",
    "/:15crr4:/ cccc /:4 crrcr2 ccrccccc :/",
    "/:8crr4:/ /:7crr4crcc:/ cr4.r2 /:64crr4:/",
    "rccrccr4;",
  ].join("");

  var sequencer = new MMLSequencer(mmldata);

  return function(e) {
    var cell = sequencer.process();

    e.buffers[0].set(cell);
    e.buffers[1].set(cell);
  }
}

module.exports = demo;
