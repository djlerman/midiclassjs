
/**
 * @namespace MIDITools.Generators
 */
window.MIDITools.Generators.Binary = (function(MIDI, MT) {
  'use strict';

  // ======================
  // = BEGIN BinaryBuffer =
  // ======================

  // used to simplify binary operations
  function BinaryBuffer(n) {
    this.rep = new Uint8Array(n);
  }

  BinaryBuffer.prototype.append = function(bb) {
    var bbPosition = this.rep.length;
    var result = new Uint8Array(this.rep.length + bb.rep.length);

    result.set(this.rep);
    result.set(bb.rep, bbPosition);

    this.rep = result;
    return this;
  };

  BinaryBuffer.prototype.length = function() {
    return this.rep.byteLength;
  };

  BinaryBuffer.prototype.appendInteger = function(n, bytes) {
    var intBuf = new BinaryBuffer(bytes);
    var result = n;
    for (var i = (bytes - 1); i >= 0; i -= 1) {
      var shiftAmount = 8 * (i);
      var byteValue = (result >> shiftAmount);
      result -= (byteValue * Math.pow(2, shiftAmount));
      intBuf.set(bytes - i - 1, byteValue);
    }
    return this.append(intBuf);
  };


  BinaryBuffer.prototype.appendInt8 = function(n) {
    return this.appendInteger(n, 1);
  };

  BinaryBuffer.prototype.appendInt16 = function(n) {
    return this.appendInteger(n, 2);
  };

  BinaryBuffer.prototype.appendInt32 = function(n) {
    return this.appendInteger(n, 4);
  };

  BinaryBuffer.prototype.appendString = function(str) {
    this.append(stringToBuffer(str));
    return this;
  };

  BinaryBuffer.prototype.appendVariableInteger = function(n) {
    var r = n;
    while (r >= 0x80) {
      var thisByte = r >> 7;
      r -= (thisByte * 0x80);
      thisByte = 0x80 | thisByte;
      this.appendInt8(thisByte);
    }
    this.appendInt8(r);
  };

  BinaryBuffer.prototype.set = function(i, val) {
    this.rep[i] = val;
    return this;
  };

  BinaryBuffer.prototype.get = function(i) {
    return this.rep[i];
  };

  BinaryBuffer.prototype.size = function() {
    return this.rep.length;
  };

  function stringToBuffer(str) {
    var arr = new Uint8Array(str.length);
    for (var i = 0, n = str.length; i < n; i += 1) {
      arr[i] = str.charCodeAt(i);
    }
    var buf = new BinaryBuffer();
    buf.rep = arr;
    return buf;
  }

  // ====================
  // = END BinaryBuffer =
  // ====================
  function exportBinary(m) {
    var b = new BinaryBuffer();
    var header = generateFileHeader(m, b);
    var tracks = generateTracks(m);
    b.append(header).append(tracks);
    return b.rep;
  }

  function generateFileHeader(m) {
    var header = new BinaryBuffer();
    header.appendString('MThd') /* TODO: use constant */
      .appendInt32(6) /* header size: TODO: ever anything but 6? */
      .appendInt16(m.type) /* type */
      .appendInt16(m.tracks.length) /* num tracks */
      .appendInt16(m.ticksPerBeat); /* ticks per beat */
    return header;
  }

  function generateTracks(m) {
    var buffer = new BinaryBuffer();
    m.tracks.forEach(function(track) {
      buffer.appendString('MTrk');
      var evts = generateEvents(track);
      buffer.appendInt32(evts.length());
      buffer.append(evts);
    });
    return buffer;
  }

  function generateEvents(track) {
    var buffer = new BinaryBuffer();
    track.events.forEach(function(event) {
      generateEvent(buffer, event);
    });
    return buffer;
  }

  function generateEvent(buffer, event) {
    buffer.appendVariableInteger(event.timestamp);
    switch (event.message.kind) {
      case 'channel':
        generateChannelMessage(buffer, event.message);
        break;
      case 'meta':
        generateMetaMessage(buffer, event.message);
        break;
      case 'sysex':
        generateSysexMessage(buffer, event.message);
        break;
      default:
        throw new Error('unrecognized event type'); // TODO: Formalize
    }
  }

  function generateChannelMessage(buffer, msg) {
    var statusByte = (MT.Data.typeToBinary[msg.type] << 4) | msg.channel;
    buffer.appendInt8(statusByte);
    buffer.appendInt8(msg.parameters[0]);
    if (msg.parameters[1] !== undefined) {
      buffer.appendInt8(msg.parameters[1]);
    }
  }

  function generateMetaMessage(buffer, msg) {
    buffer.appendInt8(0xFF);
    buffer.appendInt8(MT.Data.typeToBinary[msg.type]);
    var info = MT.Data.typeMap[msg.type];
    if (info.length === 'variable') {
      buffer.appendVariableInteger(msg.parameters.value.length);
    } else {
      buffer.appendVariableInteger(info.length);
    }
  }

  function generateSysexMessage(buffer, event) {

  }


  function generateTrackHeader() {
    return toBytes('MTrk');
  }

  function toBytes(str) {
    var arr = new Uint8Array(new ArrayBuffer(str.length));
    for (var i = 0, n = str.length; i < n; i += 1) {
      arr[i] = str.charCodeAt(i);
    }
    return arr;
  }

  function toString(buffer) {
    var str = '';
    for (var i = 0; i < buffer.size(); i += 1) {
      str += String.fromCharCode(buffer.get(i));
    }
    return str;
  }

  return {
    generate: exportBinary
  };

}(MIDI, window.MIDITools));