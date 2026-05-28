gosub :help~initialize
setvar $help~help[1] $help~tab&"Lifts from planet/citadel style prompts back toward command."
gosub :help~helpfile

:lift
send "0* 0* 0* q q q q q z a 999* * * * "
halt

include "source\include\help"
