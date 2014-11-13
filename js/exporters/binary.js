'use strict';

var errors = require('../Errors');
var data = require('../Data');
var BinaryBuffer = require('./buffer');

module.exports = exportBinary;

function exportBinary(midi) {
  var b = new BinaryBuffer();
  var header = generateFileHeader(midi, b);
  var tracks = generateTracks(midi);
  b.append(header).append(tracks);
  return b.toString();
}

// TODO: generate frames instead if that's what they're using?
function generateFileHeader(m) {
  var header = new BinaryBuffer();
  header.appendString('MThd') /* TODO: use constant */
    .appendInt32(6) /* header size: TODO: ever anything but 6? */
    .appendInt16(m.type()) /* type */
    .appendInt16(m.countTracks()) /* num tracks */
    .appendInt16(m.getTiming().ticksPerBeat); /* ticks per beat */
  return header;
}

function generateTracks(m) {
  var buffer = new BinaryBuffer();
  for (var i = 0, n = m.countTracks(); i < n; i += 1) {
    buffer.appendString('MTrk');
    var evts = generateEvents(m.track(i));
    buffer.appendInt32(evts.length());
    buffer.append(evts);
  }
  return buffer;
}

function generateEvents(track) {
  var buffer = new BinaryBuffer();
  for (var i = 0, n = track.countEvents(); i < n; i += 1) {
    generateEvent(buffer, track.event(i));
  }
  return buffer;
}

function generateEvent(buffer, event) {
  buffer.appendVariableInteger(event.timestamp);
  switch (event.kind) {
    case 'channel':
      generateChannelMessage(buffer, event);
      break;
    case 'meta':
      generateMetaMessage(buffer, event);
      break;
    case 'sysex':
      generateSysexMessage(buffer, event);
      break;
    default:
      throw new Error('unrecognized event type'); // TODO: Formalize
  }
}

function generateChannelMessage(buffer, evt) {
  var statusByte = (data.typeToBinary[evt.message] << 4) | evt.channel;
  buffer.appendInt8(statusByte);
  buffer.appendInt8(evt.parameters[0]);
  if (evt.parameters[1] !== undefined) {
    buffer.appendInt8(evt.parameters[1]);
  }
}

var valueWriters = {
  'string': function(p, buffer) {
    buffer.appendString(p);
  }
};

function generateMetaMessage(buffer, evt) {
  buffer.appendInt8(0xFF);
  buffer.appendInt8(data.typeToBinary[evt.message]);
  var info = data.typeMap[evt.message];
  if (info.length === 'variable') {
    buffer.appendVariableInteger(evt.parameters.value.length);
  } else {
    buffer.appendVariableInteger(info.parameters.map(function(p) {
      return p.length;
    }).reduce(function(prev, current) {
      return prev + current;
    }, 0));
  }

  if (info.length === 'variable') {
    valueWriters[info.valueType](evt.parameters.value, buffer);
  } else {
    info.parameters.forEach(function(p) {
      if (p.exporters && p.exporters.binary) {
        p.exporters.binary(evt.parameters[p.name], buffer);
      } else {
        buffer.appendInteger(evt.parameters[p.name], p.length);
      }
    });
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

