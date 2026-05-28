gosub :help~initialize
setvar $help~help[1] $help~tab&"Emergency macro to escape menus and reset command state."
gosub :help~helpfile

send " q q q * p d 0* 0* 0* * *** * c q q q q q z 2 2 c q * z * *** * * "
halt

include "source\include\help"
