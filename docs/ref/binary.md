# Binary Layout
~~~
              <------------- MIDI Chunk --------------> <-----Track Header----> <-Track data-> {Track out>
Byte number   0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 [22 to x]      [x+1 to x+4]
Byte data     4D 54 68 64 00 00 00 06 00 01 00 01 00 80 4D 54 72 6B 00 00 00 0A blah blah..... 00 FF 2F 00
MIDI section  A---------> B---------> C---> D---> E---> F---------> G---------> H------------> I--------->
~~~

## Integer Representations

<a name="varint"></a>
### Variable-Length Integers

In many places, an integer is used to specify the length of some piece
of data. Because the data length is arbitrary, the number of bytes
needed to represent the integer varies as well. Thus, the following scheme
is used so that the integer may be unambiguously decoded.

A *variable-length integer* is a sequence of 8-bit values, where the
most-significant bit represents "more to follow", and the next 7 bits
are value bits.

#### Encoding Example

To encode the number 150 = (96)<sub>16</sub> = (10010110)<sub>2</sub>, 
we would split the value into 7-bit chunks (starting at the left side),
and set the "more" bit on each chunk to 1, **except** for the last chunk.
~~~
         | Chunk 1 | Chunk 2 |    |  Value 1 |  Value 2 |
 0x96 => |---------|---------| => |----------|----------| => 0x81, 0x16
         |       1 | 0010110 |    | 10000001 | 00010110 |
~~~

#### Decoding Example

Given the sequence `0xBD, 0x84 0x40`:

~~~
|  Value 1 |  Value 2 |  Value 3 |    | Chunk 1 | Chunk 2 | Chunk 3 |
|----------|----------|----------| => |---------|---------|---------|
| 10111101 | 10000100 | 01000000 |    | 0111101 | 0000100 | 1000000 |
~~~

Next, we combine the chunks in order to get the binary `011110100001001000000`.

~~~
011110100001001000000 =>  0 1111 0100 0010 0100 0000 => 0xF4240 => 10,000
~~~
## The Header Chunk
~~~
              <----------- Header Chunk -------------->
Byte number   0  1  2  3  4  5  6  7  8  9  10 11 12 13
Byte data     4D 54 68 64 00 00 00 06 00 01 00 01 00 80
MIDI section  A---------> B---------> C---> D---> E--->
~~~

The header is made up of (at least) 13 bytes of data, comprised of:

* (Section A) The ASCII string `MThd`
* (Section B) A four-byte integer specifying the number of bytes remaining in the header
  (This value is almost always 6)
* (Section C) A two-byte integer specifying the type of the MIDI file.
  (We recognize only 0 and 1)
* (Section D) A two-byte integer specifying the number of *tracks* in the
  file. (A Type-0 file must specify 1 here)
* (Section E) A two-byte integer which represents the *time division* of the 
  file. There are two different representations for time division, as explained
  in the next section


### Time Division

The representation used for the time division section of the header is
determined by the most-significant bit of the two-byte value. If the
bit is 0, then the remaining 15 bits use the "ticks per beat"
representation. If it is 1, all 16 bits are used for the
"frames per second" representation.


#### Ticks per beat

This is a single, 15-bit value that describes the number of "ticks"
in a single beat of music. This can only be translated to an actual
number of (milli)seconds by also knowing the *tempo* of the song,
which is measured in *beats per minute (bpm)*.


#### Frames per second

The 16 bits of the time division are broken into 2 pieces:

1. The top 8 bits define the number of [SMPTE frames][SMPTE],
   and must be one of the following values:
     * `-24` (`0xE8`)
     * `-25` (`0xE7`)
     * `-29` (`0xE3`) - Note that this actually translates to 29.97
     * `-30` (`0xE2`) 
2. The lower byte is an (unsigned) value measuring the number of "ticks" per
   frame.


## Track Chunks

~~~
              <-----Track Header----> <-Track data-> {Track out>
Byte number   14 15 16 17 18 19 20 21 .............. 28 29 30 31
Byte data     4D 54 72 6B 00 00 00 0A .............. 00 FF 2F 00
MIDI section  F---------> G---------> H------------> I--------->
~~~


### Track Header
~~~
              <-----Track Header---->
Byte number   14 15 16 17 18 19 20 21
Byte data     4D 54 72 6B 00 00 00 0A
MIDI section  A---------> B--------->
~~~

The track header is made up of exactly 8 bytes of data, containing:

* (Section A) The ASCII string `MTrk`
* (Section B) A four-byte integer specifying the number of bytes in this track,
              including the track footer.


### Track Events


### Track Footer

TODO

## Events

The *delta time* is stored as a [variable-length integer](#varint).

### Channel Messages

A channel message has the following format:

`<type> <channel> <data>`

Where:

- *message* is a 4-bit quantity in the range `0x8`&ndash;`0xE`.
- *channel* is a 4-bit quantity in the range `0x0`&ndash;`0xF`.
- *data* is either 1 or 2 bytes of data, split into the *parameters*
  of the particular message.
 
These are the 7 defined channel messages:

Message    	  |Status  |Byte 1          |Byte 2
------------------|--------|----------------|-----------
Note Off    	  |`0x8`   |`note`          |`velocity`
Note On     	  |`0x9`   |`note`          |`velocity`
After Touch 	  |`0xA`   |`note`          |`amount`
Control Change    |`0xB`   |`controller`    |`value`
Program  Change   |`0xC`   |`program`       | N/A
Channel Pressure  |`0xD`   |`amount`        | N/A
Pitch Wheel       |`0xE`   |`pitchValue1`   |`pitchValue2`

## References

* [Wikipedia - MIDI Timecode](http://en.wikipedia.org/wiki/MIDI_timecode)
* [MIDI File Format at "The Sonic Spot"](http://www.sonicspot.com/guide/midifiles.html)
* [The MIDI File Format at Stanford](http://cs.fit.edu/~ryan/cse4051/projects/midi/midi.html)
* [Google Groups discussion of timing](https://groups.google.com/forum/#!topic/music21list/f9AboXHW0QE)
[SMPTE]: ../MIDI.html#SMPTE "SMPTE Definition"