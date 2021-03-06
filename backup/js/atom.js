var Game, atom, c, cancelAnimationFrame, eventCode, i, ref, ref1, requestAnimationFrame,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
  return window.setTimeout((function() {
    return callback(1000 / 60);
  }), 1000 / 60);
};

cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame || window.oCancelAnimationFrame || window.msCancelAnimationFrame || window.clearTimeout;

window.atom = atom = {};

atom.input = {
  _bindings: {},
  _down: {},
  _pressed: {},
  _released: [],
  mouse: {
    x: 0,
    y: 0
  },
  bind: function(key, action) {
    return this._bindings[key] = action;
  },
  onkeydown: function(e) {
    var action;
    action = this._bindings[eventCode(e)];
    if (!action) {
      return;
    }
    if (!this._down[action]) {
      this._pressed[action] = true;
    }
    this._down[action] = true;
    e.stopPropagation();
    return e.preventDefault();
  },
  onkeyup: function(e) {
    var action;
    action = this._bindings[eventCode(e)];
    if (!action) {
      return;
    }
    this._released.push(action);
    e.stopPropagation();
    return e.preventDefault();
  },
  clearPressed: function() {
    var action, i, len, ref;
    ref = this._released;
    for (i = 0, len = ref.length; i < len; i++) {
      action = ref[i];
      this._down[action] = false;
    }
    this._released = [];
    return this._pressed = {};
  },
  pressed: function(action) {
    return this._pressed[action];
  },
  down: function(action) {
    return this._down[action];
  },
  released: function(action) {
    return indexOf.call(this._released, action) >= 0;
  },
  onmousemove: function(e) {
    var b, d;
    if (window.pageXOffset !== void 0) {
      this.mouse.x = e.clientX + window.pageXOffset;
      return this.mouse.y = e.clientY + window.pageYOffset;
    } else {
      d = document.documentElement;
      b = document.body;
      this.mouse.x = e.clientX + d.scrollLeft + b.scrollLeft;
      return this.mouse.y = e.clientY + d.scrollTop + b.scrollTop;
    }
  },
  onmousedown: function(e) {
    return this.onkeydown(e);
  },
  onmouseup: function(e) {
    return this.onkeyup(e);
  },
  onmousewheel: function(e) {
    this.onkeydown(e);
    return this.onkeyup(e);
  },
  oncontextmenu: function(e) {
    if (this._bindings[atom.button.RIGHT]) {
      e.stopPropagation();
      return e.preventDefault();
    }
  }
};

document.onkeydown = atom.input.onkeydown.bind(atom.input);

document.onkeyup = atom.input.onkeyup.bind(atom.input);

document.onmouseup = atom.input.onmouseup.bind(atom.input);

atom.button = {
  LEFT: -1,
  MIDDLE: -2,
  RIGHT: -3,
  WHEELDOWN: -4,
  WHEELUP: -5
};

atom.key = {
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  LEFT_ARROW: 37,
  UP_ARROW: 38,
  RIGHT_ARROW: 39,
  DOWN_ARROW: 40
};

for (c = i = 65; i <= 90; c = ++i) {
  atom.key[String.fromCharCode(c)] = c;
}

eventCode = function(e) {
  if (e.type === 'keydown' || e.type === 'keyup') {
    return e.keyCode;
  } else if (e.type === 'mousedown' || e.type === 'mouseup') {
    switch (e.button) {
      case 0:
        return atom.button.LEFT;
      case 1:
        return atom.button.MIDDLE;
      case 2:
        return atom.button.RIGHT;
    }
  } else if (e.type === 'mousewheel') {
    if (e.wheel > 0) {
      return atom.button.WHEELUP;
    } else {
      return atom.button.WHEELDOWN;
    }
  }
};

atom.canvas = document.getElementsByTagName('canvas')[0];

atom.canvas.style.position = "absolute";

atom.canvas.style.top = "0";

atom.canvas.style.left = "0";

atom.context = atom.canvas.getContext('2d');

atom.canvas.onmousemove = atom.input.onmousemove.bind(atom.input);

atom.canvas.onmousedown = atom.input.onmousedown.bind(atom.input);

atom.canvas.onmouseup = atom.input.onmouseup.bind(atom.input);

atom.canvas.onmousewheel = atom.input.onmousewheel.bind(atom.input);

atom.canvas.oncontextmenu = atom.input.oncontextmenu.bind(atom.input);

window.onresize = function(e) {
  atom.canvas.width = window.innerWidth;
  atom.canvas.height = window.innerHeight;
  atom.width = atom.canvas.width;
  return atom.height = atom.canvas.height;
};

window.onresize();

Game = (function() {
  function Game() {}

  Game.prototype.update = function(dt) {};

  Game.prototype.draw = function() {};

  Game.prototype.run = function() {
    var s;
    if (this.running) {
      return;
    }
    this.running = true;
    s = (function(_this) {
      return function() {
        _this.step();
        return _this.frameRequest = requestAnimationFrame(s);
      };
    })(this);
    this.last_step = Date.now();
    return this.frameRequest = requestAnimationFrame(s);
  };

  Game.prototype.stop = function() {
    if (this.frameRequest) {
      cancelAnimationFrame(this.frameRequest);
    }
    this.frameRequest = null;
    return this.running = false;
  };

  Game.prototype.step = function() {
    var dt, now;
    now = Date.now();
    dt = (now - this.last_step) / 1000;
    this.last_step = now;
    this.update(dt);
    this.draw();
    return atom.input.clearPressed();
  };

  return Game;

})();

atom.Game = Game;

atom.audioContext = typeof webkitAudioContext === "function" ? new webkitAudioContext() : void 0;

atom._mixer = (ref = atom.audioContext) != null ? ref.createGainNode() : void 0;

if ((ref1 = atom._mixer) != null) {
  ref1.connect(atom.audioContext.destination);
}

atom.loadSound = function(url, callback) {
  var e, request;
  if (!atom.audioContext) {
    return typeof callback === "function" ? callback('No audio support') : void 0;
  }
  request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onload = function() {
    return atom.audioContext.decodeAudioData(request.response, function(buffer) {
      return typeof callback === "function" ? callback(null, buffer) : void 0;
    }, function(error) {
      return typeof callback === "function" ? callback(error) : void 0;
    });
  };
  try {
    return request.send();
  } catch (_error) {
    e = _error;
    return typeof callback === "function" ? callback(e.message) : void 0;
  }
};

atom.sfx = {};

atom.preloadSounds = function(sfx, cb) {
  var name, results, toLoad, url;
  if (!atom.audioContext) {
    return typeof cb === "function" ? cb('No audio support') : void 0;
  }
  toLoad = 0;
  results = [];
  for (name in sfx) {
    url = sfx[name];
    toLoad++;
    results.push((function(name, url) {
      return atom.loadSound("sounds/" + url, function(error, buffer) {
        if (error) {
          console.error(error);
        }
        if (buffer) {
          atom.sfx[name] = buffer;
        }
        if (!--toLoad) {
          return typeof cb === "function" ? cb() : void 0;
        }
      });
    })(name, url));
  }
  return results;
};

atom.playSound = function(name, time) {
  var source;
  if (time == null) {
    time = 0;
  }
  if (!(atom.sfx[name] && atom.audioContext)) {
    return;
  }
  source = atom.audioContext.createBufferSource();
  source.buffer = atom.sfx[name];
  source.connect(atom._mixer);
  source.noteOn(time);
  return source;
};

atom.setVolume = function(v) {
  var ref2;
  return (ref2 = atom._mixer) != null ? ref2.gain.value = v : void 0;
};

// ---
// generated by coffee-script 1.9.2