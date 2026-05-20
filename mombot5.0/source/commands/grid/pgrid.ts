gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
setVar $HELP~HELP[1]  $HELP~TAB&"pgrid - planet grid into sector "
setVar $HELP~HELP[2]  $HELP~TAB&"   "
setVar $HELP~HELP[3]  $HELP~TAB&"  Usage: pgrid <sector> [wave count] [options]"
setVar $HELP~HELP[4]  $HELP~TAB&"   "
setVar $HELP~HELP[5]  $HELP~TAB&"       Options: "
setVar $HELP~HELP[6]  $HELP~TAB&"   "
setVar $HELP~HELP[7]  $HELP~TAB&"         {scan} - Do a density scan of the sector before gridding"
setVar $HELP~HELP[8]  $HELP~TAB&"       {unsafe} - Send fast macro, don't wait for planet"
setVar $HELP~HELP[9]  $HELP~TAB&"          {f:x} - Drop x fighters after gridding into sector"
setVar $HELP~HELP[10] $HELP~TAB&"          {x:y} - xport to ship y after gridding"
setVar $HELP~HELP[11] $HELP~TAB&"          {d:x} - Maximum density to grid into"
setVar $HELP~HELP[12] $HELP~TAB&"            {r} - Move and immediately retreat from sector"
setVar $HELP~HELP[13] $HELP~TAB&"        {nosur} - Don't surrender on retreat"
gosub :HELP~HELPFILE

getWordPos " "&$bot~user_command_line&" " $pos "scan"
if ($pos > 0)
	setVar $grid~pgrid_scan TRUE
else
	setVar $grid~pgrid_scan FALSE
end

getWordPos " "&$bot~user_command_line&" " $pos "unsafe"
if ($pos > 0)
	setVar $grid~pgrid_unsafe TRUE
else
	setVar $grid~pgrid_unsafe FALSE
end

getWordPos " " & $bot~user_command_line & " " $pos " wave:"
if ($pos > 0)
	getText $bot~user_command_line $wave "wave:" " "
	isNumber $test $wave
	if ($test)
		setVar $grid~pgrid_waves $wave
	else
		setVar $grid~pgrid_waves 0
	end     
else
	setVar $grid~pgrid_waves 0
end

getWordPos " " & $bot~user_command_line & " " $pos " f:"
if ($pos > 0)
	getText $bot~user_command_line $grid~pgrid_fighterDrop "f:" " "
	isNumber $test $grid~pgrid_fighterDrop
	if ($test)
		setVar $grid~pgrid_fighterDrop $grid~pgrid_fighterDrop
	else
		setVar $grid~pgrid_fighterDrop 1
	end     
else
	setVar $grid~pgrid_fighterDrop 1
end

getWordPos " "&$bot~user_command_line&" " $pos1 " nosur"
getWordPos " "&$bot~user_command_line&" " $pos2 " nosurrender"
if (($pos1 > 0) or ($pos2 > 0))
	setVar $grid~pgrid_surrender FALSE	
else
	setVar $grid~pgrid_surrender TRUE
end

getWordPos " " & $bot~user_command_line & " " $pos " x:"
if ($pos > 0)
	setVar $xline $bot~user_command_line&" t"
	getText $xline $grid~pgrid_xportShip "x:" " "
	isNumber $test $grid~pgrid_xportShip
	if ($test)
		setVar $grid~pgrid_xporting TRUE
	else
		setvar $grid~pgrid_xportship 0
	end
end

setVar $grid~pgrid_surrender TRUE

getWordPos " "&$bot~user_command_line&" " $pos " d:"
setVar $validDesignatedDen FALSE

if ($pos > 0)
	setVar $grid~pgrid_scan TRUE


	getText $bot~user_command_line $designatedDen "d:" " "
	
	isNumber $test $designatedDen
	if ($test)
		setVar $grid~pgrid_maxdensity $designatedDen
	else
		setVar $SWITCHBOARD~message "invalid#"&$designatedDen&"# designated density*"
		gosub :SWITCHBOARD~switchboard
		halt
	end		
else
	setVar $grid~pgrid_maxdensity 0
end

getWordPos " "&$bot~user_command_line&" " $pos " r "
if ($pos > 0)
	setVar $grid~pgrid_retreat TRUE
else
	setVar $grid~pgrid_retreat FALSE
end
setVar $grid~pgridSector $bot~parm1
isNumber $test $grid~pgridSector
if ($test = 0)
	setVar $SWITCHBOARD~message "Invalid sector number.*"
	gosub :SWITCHBOARD~switchboard
	halt
end
isNumber $test $bot~parm2
if ($test = 0)
	setVar $grid~pgrid_waves 1
else
	if ($bot~parm2 > 0)
		setVar $grid~pgrid_waves $bot~parm2
	else
		setVar $grid~pgrid_waves 1
	end
end

gosub :grid~pgrid
halt

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\grid"
include "source\include\switchboard.ts"
