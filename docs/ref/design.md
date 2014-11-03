# Library Design

The `MIDIFile` module
------------------------------
* Always contains *raw* message data; unprocessed in any way.

The `MIDISequence` module
---------------------------------------

* Event parameters are interpreted to be human readable whenever
   possible.
* Many of the interpretation routines are contained inside the `Utils`
   module for use in the the text and xml import modules.

TODO: expand

The `Data` module
---------------------------

TODO: describe structure
- importers
- exporters
- encoder
- decoder

value is IMPORTED => DECODED => (used by clients) => ENCODED => EXPORTED
decoding / encdoding only happens when MIDISequence gets involved