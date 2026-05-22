gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~armid_count_file

setvar $help~help[1] $help~tab&"CALL - Call SaveMe Command"
setvar $help~help[2] $help~tab&"       Used to trigger a SaveMe Script"
setvar $help~help[3] $help~tab&"     "
setvar $help~help[4] $help~tab&"       - Originally written by Cherokee"
gosub :help~helpfile

getwordpos " "&$bot~user_command_line&" " $pos " kill "
if ($pos > 0)
	setvar $combat~kill true
else
	setvar $combat~kill false
end

getwordpos " "&$bot~user_command_line&" " $pos " cap "
if ($pos > 0)
	setvar $combat~cap true
else
	setvar $combat~cap false
end

gosub :combat~callsaveme
halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\xenter"
include "source\include\player"
include "source\include\planet"
include "source\include\combat"
include "source\include\help"
