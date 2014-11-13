'use strict';

module.exports = BinaryBuffer;

// used to simplify binary operations
function BinaryBuffer(n) {
  n = (n ? n : 0);
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

BinaryBuffer.prototype.toString = function() {
  return String.fromCharCode.apply(null, this.rep);
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
