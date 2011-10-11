(function() {

  function _Buffer(arg0, arg1) {
    var buf = new Buffer(arg0, arg1), arrbuf = buf._parent.buffer;
    delete buf._parent, arrbuf.__proto__ = buf;
    return arrbuf;
  }

  function Buffer(arg0, arg1) {
    var type = typeof arg0;
    if('object' === type && null !== arg0)
      // Uint8Array in Sfari 5.1 doesn't have constructor.name.
      type = Uint8Array === arg0.constructor ? 'Uint8Array': arg0.constructor.name;

    if(!(type in initialize))
      throw new Error('First argument needs to be a number, array or string.');

    var arr = this._parent = initialize[type](arg0, arg1);

    this.__defineGetter__('length', function() {
      return arr.length;
    });

    var i, len;
    for(i = 0, len = arr.length; i < len; i++)
      this.__defineGetter__('' + i, (function(i) {
        return function() {
          return arr[i];
        };
      })(i)), this.__defineSetter__('' + i, (function(i) {
        return function(_byte) {
          arr[i] = _byte;
        };
      })(i));
  }
  Buffer.prototype = new ArrayBuffer(0);

  var initialize = {};
  initialize['number'] = function(size) {
    return new Uint8Array(new ArrayBuffer(size));
  };
  initialize['string'] = function(str, enc) {
    enc = enc || 'utf8';
    if(!(enc in encode))
      throw new Error('Unknown encoding');
    var arr = encode[enc](str);
    return initialize['Array'](arr);

  };
  initialize['Array'] = function(arr) {
    var arrbuf = new ArrayBuffer(arr.length);
    var bytebuf = new Uint8Array(arrbuf);
    arr.forEach(function(_byte, i) {
      bytebuf[i] = _byte;
    });
    return bytebuf;
  };
  initialize['ArrayBuffer'] = function(buf) {
    return new Uint8Array(buf);
  };
  initialize['Uint8Array'] = function(arr) {
    return arr;
  };

  var encode = {};
  encode['ascii'] = function(str) {
    var i, len = str.length;
    var arr = [];
    for(i = 0; i < len; i++)
      arr.push(str.charCodeAt(i));
    return arr;
  };
  encode['utf8'] = function(str) {
    var i, len, arr = [];
    for(i = 0, len = str.length; i < len; i++) {
      var cp = str.charCodeAt(i);
      if(cp < 0x80)
        arr.push(0x7F & cp);
      else if(cp < 0x800)
        arr.push(0xC0 | (cp >>> 6), 0x80 | (0x3F & cp));
      else if(cp < 0x10000) {
        arr.push(0xE0 | (cp >>> 12));
        arr.push(0x80 | (0x3F & (cp >>> 6)));
        arr.push(0x80 | (0x3F & cp));
      } else if(cp < 0x200000) {
        arr.push(0xF0 | (cp >>> 18));
        arr.push(0x80 | (0x3F & (cp >>> 12)));
        arr.push(0x80 | (0x3F & (cp >>> 6)));
        arr.push(0x80 | (0x3F & cp));
      } else if(cp < 0x4000000) {
        arr.push(0xF8 | (cp >>> 24));
        arr.push(0x80 | (0x3F & (cp >>> 18)));
        arr.push(0x80 | (0x3F & (cp >>> 12)));
        arr.push(0x80 | (0x3F & (cp >>> 6)));
        arr.push(0x80 | (0x3F & cp));
      } else {
        arr.push(0xFC | (cp >>> 30));
        arr.push(0x80 | (0x3F & (cp >>> 24)));
        arr.push(0x80 | (0x3F & (cp >>> 18)));
        arr.push(0x80 | (0x3F & (cp >>> 12)));
        arr.push(0x80 | (0x3F & (cp >>> 6)));
        arr.push(0x80 | (0x3F & cp));
      }
    }
    return arr;
  };
  encode['ucs2'] = function(str) {
    var i, len = str.length;
    var arr = [];
    for(i = 0; i < len; i++) {
      var cp = str.charCodeAt(i);
      arr.push(0x00FF & cp, (0xFF00 & cp) >>> 8);
    }
    return arr;
  };
  encode['base64'] = function(str) {
    var _base64 = str.replace(/=/g, '');
    var i, len, buf = '';
    for(i = 0, len = _base64.length; i < len; i++)
      buf += detbl[_base64[i]];
    _base64 = undefined;

    var arr = [];
    for(i = 0, len = buf.length; i + 8 <= len; i += 8)
      arr.push(parseInt(buf.slice(i, i + 8), 2));

    return arr;
  };

  var decode = {};
  decode['ascii'] = function(bytes, start, end) {
    var i, len, ascii = '';

    for(i = start, len = end; i < len; i++)
      ascii += String.fromCharCode(bytes[i]);

    return ascii;
  };
  decode['utf8'] = decode['utf-8'] = function(bytes, start, end) {
    var i, len, utf8 = '';

    for(i = start, len = end; i < len;) {
      var j, pos, unicode, mask;
      var _1st = bytes[i], msb = _1st >>> 7;

      for(j = pos = 1, mask = 0x7F; j & msb; j &= _1st >>> (7 - ++pos), mask >>>= 1);
      for(unicode = 0; pos--; unicode |= (mask & bytes[i++]) << (pos * 6), mask = 0x3F);

      utf8 += String.fromCharCode(unicode);
    }
    return utf8;

  };
  decode['ucs2'] = decode['ucs-2'] = function(bytes, start, end) {
    var i, len, ucs2 = '';

    for(i = start, len = end; i < len;) {
      var cp = bytes[i++] + (bytes[i++] << 8);
      ucs2 += String.fromCharCode(cp);
    }
    return ucs2;
  };
  decode['base64'] = function(bytes, start, end) {
    var i, len, _6bit, bin = '', base64 = '';

    for(i = start, len = end; i < len; i++) {
      bin += ('0000000' + bytes[i].toString(2)).slice(-8);
      for(; 6 <= bin.length;) {
        _6bit = bin.slice(0, 6), bin = bin.slice(6);
        base64 += entbl[_6bit];
      }
    }
    if(bin.length)
      base64 += entbl[(bin + '00000').slice(0, 6)];
    for(i = ((~(base64.length % 4) >>> 0) + 1) & 3; i--;)
      base64 += '=';

    return base64;

  };

  // @deprecated
  // encode['binary'] = function() {};

  Buffer.prototype['write'] = _Buffer.prototype['write'] = function(string,
      offset, encoding) {
    encoding = encoding || 'utf8';
    if(!(encoding in encode))
      throw new Error('Unknown encoding');
    offset = +offset || 0;

    var length = this.length - offset;

    var i, j, bytelen, len = string.length;

    if('base64' === encoding) {
      var arr = encode[encoding](string, encoding);
      var arrlen = arr.length;
      for(j = 0; j < arrlen; j++)
        this[offset + j] = arr[j];
      i = len, bytelen = arrlen;

    } else
      for(i = bytelen = 0; i < len; i++) {
        var arr = encode[encoding](string[i], encoding);
        var arrlen = arr.length;
        if(length < bytelen + arrlen)
          break;
        for(j = 0; j < arrlen; j++)
          this[offset + bytelen + j] = arr[j];
        bytelen += arrlen;
      }
    _Buffer['_charsWritten'] = i;
    return bytelen;
  };
  Buffer.prototype.toString = _Buffer.prototype.toString = function(encoding,
      start, end) {
    encoding = encoding || 'utf8';
    start = +start || 0, end = 'number' === typeof end ? end: this.length;
    if(!(encoding in decode))
      throw new Error('Unknown encoding');
    if(end < start)
      throw new Error('Must have start <= end');
    var bytes = new Uint8Array(this);
    var i = Math.max(0, start);
    var len = Math.min(bytes.length, end);

    return decode[encoding](bytes, i, len);
  };
  Buffer.prototype['copy'] = _Buffer.prototype['copy'] = function(target,
      targetStart, sourceStart, sourceEnd) {
    if(!_Buffer.isBuffer(target))
      return;
    targetStart = +targetStart || 0;
    sourceStart = +sourceStart || 0, sourceEnd = +sourceEnd || this.length;
    if(this.length < sourceEnd)
      throw new Error('sourceEnd out of bounds');
    var i, len = Math.min(target.length - targetStart, sourceEnd - sourceStart);
    for(i = 0; i < len; i++)
      target[targetStart + i] = this[sourceStart + i];
  };
  Buffer.prototype.slice = _Buffer.prototype.slice = function(start, end) {
    start = +start || 0, end = +end || this.length;
    if(this.length < end || end < start)
      throw new Error('oob');
    var arr = new Uint8Array(this);// this.parent;
    return new Buffer(arr.subarray(start, end));
  };

  _Buffer.isBuffer = function(obj) {
    return obj instanceof Buffer;
  };
  _Buffer.byteLength = function(string, encoding) {
    var buf = new Buffer(string, encoding);
    return buf.length;
  };

  // prepare for base64
  var entbl = {}, detbl = {};
  (function forBase64() {

    var i, c, k;
    for(i = 0; i < 26; i++) {
      c = String.fromCharCode(i + 65);
      k = detbl[c] = toBinaryString(i);
      entbl[k] = c;
    }
    for(; i < 52; i++) {
      c = String.fromCharCode(i + 71);
      k = detbl[c] = toBinaryString(i);
      entbl[k] = c;
    }
    for(; i < 62; i++) {
      c = '' + (i - 52);
      k = detbl[c] = toBinaryString(i);
      entbl[k] = c;
    }
    var syms = ['+', '/'];
    syms.forEach(function(c) {
      var k = detbl[c] = toBinaryString(i++);
      entbl[k] = c;
    });
    function toBinaryString(i) {
      return ('00000' + i.toString(2)).slice(-6);
    }
  })();

  var root = this;
  root['Buffer'] = _Buffer;

}).call(this);
