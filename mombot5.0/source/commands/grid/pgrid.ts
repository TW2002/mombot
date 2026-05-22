gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"pgrid - planet grid into sector "
setvar $help~help[2]  $help~tab&"   "
setvar $help~help[3]  $help~tab&"  Usage: pgrid <sector> [wave count] [options]"
setvar $help~help[4]  $help~tab&"   "
setvar $help~help[5]  $help~tab&"       Options: "
setvar $help~help[6]  $help~tab&"   "
setvar $help~help[7]  $help~tab&"         {scan} - Do a density scan of the sector before gridding"
setvar $help~help[8]  $help~tab&"       {unsafe} - Send fast macro, don't wait for planet"
setvar $help~help[9]  $help~tab&"          {f:x} - Drop x fighters after gridding into sector"
setvar $help~help[10] $help~tab&"          {x:y} - xport to ship y after gridding"
setvar $help~help[11] $help~tab&"          {d:x} - Maximum density to grid into"
setvar $help~help[12] $help~tab&"            {r} - Move and immediately retreat from sector"
setvar $help~help[13] $help~tab&"        {nosur} - Don't surrender on retreat"
gosub :help~helpfile

getwordpos " "&$bot~user_command_line&" " $pos "scan"
if ($pos > 0)
	setvar $grid~pgrid_scan true
else
	setvar $grid~pgrid_scan false
end

getwordpos " "&$bot~user_command_line&" " $pos "unsafe"
if ($pos > 0)
	setvar $grid~pgrid_unsafe true
else
	setvar $grid~pgrid_unsafe false
end

getwordpos " " & $bot~user_command_line & " " $pos " wave:"
if ($pos > 0)
	gettext $bot~user_command_line $wave "wave:" " "
	isnumber $test $wave
	if ($test)
		setvar $grid~pgrid_waves $wave
	else
		setvar $grid~pgrid_waves 0
	end
else
	setvar $grid~pgrid_waves 0
end

getwordpos " " & $bot~user_command_line & " " $pos " f:"
if ($pos > 0)
	gettext $bot~user_command_line $grid~pgrid_fighterdrop "f:" " "
	isnumber $test $grid~pgrid_fighterdrop
	if ($test)
		setvar $grid~pgrid_fighterdrop $grid~pgrid_fighterdrop
	else
		setvar $grid~pgrid_fighterdrop 1
	end
else
	setvar $grid~pgrid_fighterdrop 1
end

getwordpos " "&$bot~user_command_line&" " $pos1 " nosur"
getwordpos " "&$bot~user_command_line&" " $pos2 " nosurrender"
if (($pos1 > 0) or ($pos2 > 0))
	setvar $grid~pgrid_surrender false
else
	setvar $grid~pgrid_surrender true
end

getwordpos " " & $bot~user_command_line & " " $pos " x:"
if ($pos > 0)
	setvar $xline $bot~user_command_line&" t"
	gettext $xline $grid~pgrid_xportship "x:" " "
	isnumber $test $grid~pgrid_xportship
	if ($test)
		setvar $grid~pgrid_xporting true
	else
		setvar $grid~pgrid_xportship 0
	end
end

setvar $grid~pgrid_surrender true

getwordpos " "&$bot~user_command_line&" " $pos " d:"
setvar $validdesignatedden false

if ($pos > 0)
	setvar $grid~pgrid_scan true

	gettext $bot~user_command_line $designatedden "d:" " "

	isnumber $test $designatedden
	if ($test)
		setvar $grid~pgrid_maxdensity $designatedden
	else
		setvar $switchboard~message "invalid#"&$designatedden&"# designated density*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $grid~pgrid_maxdensity 0
end

getwordpos " "&$bot~user_command_line&" " $pos " r "
if ($pos > 0)
	setvar $grid~pgrid_retreat true
else
	setvar $grid~pgrid_retreat false
end
setvar $grid~pgridsector $bot~parm1
isnumber $test $grid~pgridsector
if ($test = 0)
	setvar $switchboard~message "Invalid sector number.*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $bot~parm2
if ($test = 0)
	setvar $grid~pgrid_waves 1
else
	if ($bot~parm2 > 0)
		setvar $grid~pgrid_waves $bot~parm2
	else
		setvar $grid~pgrid_waves 1
	end
end

gosub :grid~pgrid
halt

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\grid"
include "source\include\switchboard.ts"
