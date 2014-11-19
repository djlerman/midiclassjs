# MIDI Sequences

## Events

## Message Details

### Channel (Voice) Messages

Message     | Description | Parameter 1 | Parameter 2
------------|-------------|-------------|-------------
Note Off| Silence a given note| note | velocity (of release)

Note On | Attack a given note |note | velocity ( force of attack). **Note that a value of 0 translates in MIDI devices as a Note Off event.**

AfterTouch  | A change in the pressure of a note after the attack |  | amount (of pressure)

Control Change | Sends a "controller" some "value". A "controller" is usually an "effect" of some sort, affecting a single channel. The controller number identifies which effect to use. | controller | value (sent to controller)

Program Change | Changes the current program (instrument) for a given channel | instrument | N/A

Channel Pressure | Varies the amount of pressure for the currently played note (may affect timbre, volume, etc.) | amount (of pressure) | asdf

Pitch Wheel | Bends the pitch of the currently playing note some number of semitones, either up or down | +/-semitones | N/A

## SMPTE [SMPTE]

