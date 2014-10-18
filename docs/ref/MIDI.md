
## Binary Layout

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
  file. (TODO: fill in information about both kinds of time-division)

