# Binary Layout

~~~
              <------------- MIDI Chunk --------------> <-----Track Header----> <-Track data-> {Track out>
Byte number   0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 [22 to x]      [x+1 to x+4]
Byte data     4D 54 68 64 00 00 00 06 00 01 00 01 00 80 4D 54 72 6B 00 00 00 0A blah blah..... 00 FF 2F 00
MIDI section  A---------> B---------> C---> D---> E---> F---------> G---------> H------------> I--------->
~~~


### The Header Chunk
~~~
              <------------- MIDI Chunk -------------->
Byte number   0  1  2  3  4  5  6  7  8  9  10 11 12 13
Byte data     4D 54 68 64 00 00 00 06 00 01 00 01 00 80
MIDI section  A---------> B---------> C---> D---> E--->
~~~

The header is made up of (at least) 13 bytes of data, which comprises:

* (Section A) The ASCII string `Mtrk`
* (Section B) A four-byte integer specifying the number of bytes remaining in the header
  (This value is almost always 6)
* (Section C) A two-byte integer specifying the type of the MIDI file.
  (We recognize only 0 and 1)
* (Section D) A two-byte integer specifying the number of *tracks* in the
  file. (A Type-0 file must specify 1 here)
* (Section E) A two-byte integer which represents the *time division* of the 
  file. There are two different representations for time division, as explained
  in the next section


#### Time Division

The representation used for the time division section of the header is
determined by the most-significant bit of the two-byte value. If the
bit is 0, then the remaining 15 bits use the "ticks per beat"
representation. If it is 1, all 16 bits are used for the
"frames per second" representation.


##### Ticks per beat

This is a single, 15-bit value that describes the number of "ticks"
in a single beat of music. This can only be translated to an actual
number of (milli)seconds by also knowing the *tempo* of the song,
which is measured in *beats per minute*.


##### Frames per second

The 16 bits of the time division are broken into 2 pieces:

1. The top 8 bits define the number of [SMPTE frames][SMPTE],
   and must be one of the following values:
     * `-24` (`0xE8`)
     * `-25` (`0xE7`)
     * `-29` (`0xE3`) - Note that this actually translates to 29.97
     * `-30` (`0xE2`) 
2. The lower byte is an (unsigned) value measuring the number of "ticks" per
   frame.


## References

* [Wikipedia - MIDI Timecode](http://en.wikipedia.org/wiki/MIDI_timecode)
* [MIDI File Format at "The Sonic Spot"](http://www.sonicspot.com/guide/midifiles.html)


[SMPTE]: ../MIDI.html#SMPTE "SMPTE Definition"