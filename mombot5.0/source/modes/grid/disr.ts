gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

setVar $HELP~HELP[1]  $HELP~TAB&"DisR - Disrupt Mines in Adjacent Sectors"
setVar $HELP~HELP[2]  $HELP~TAB&"   "
setVar $HELP~HELP[3]  $HELP~TAB&"Usage: >disr {burst} {nscan}"
setVar $HELP~HELP[7]  $HELP~TAB&"       >disr [sector] {burst} {nscan}"
setVar $HELP~HELP[4]  $HELP~TAB&"    "
setVar $HELP~HELP[4]  $HELP~TAB&"If the first parameter is not a sector, all adjacents will be disrupted."
setVar $HELP~HELP[4]  $HELP~TAB&"    "
setVar $HELP~HELP[5]  $HELP~TAB&"Options: "
setVar $HELP~HELP[6]  $HELP~TAB&"        {burst} - Sends only 1 Disruptor into each Sector"
setVar $HELP~HELP[7]  $HELP~TAB&"        {nscan} - Do Not Perform Holo Scan"
gosub :HELP~HELPFILE

isnumber $TST $PARM1
if ($TST = 0)
  setvar $TARGET 0
else
  setvar $TARGET $PARM1
end

getwordpos $bot~user_command_line $pos "nscan"
if ($pos > 0)
	setvar $MINES~SCANIT FALSE
else
	setvar $MINES~SCANIT TRUE
end

getwordpos $bot~user_command_line $pos "burst"
if ($pos > 0)
	setVar $MINES~BURSTING TRUE
else
	setVar $MINES~BURSTING FALSE
end

if (($TARGET < 11) and ($TARGET <> 0)) or (($MAP~STARDOCK > 11) and ($TARGET = $MAP~STARDOCK))
   setvar $switchboard~message "DisR - Invalid Target!"
   gosub :switchboard~switchboard
   halt
  setvar $TARGET $PARM1
end

gosub :PLAYER~QUIKSTATS

#if ($PLAYER~MINE_DISRUPTORS = 0)
#  setvar $switchboard~message "No Disruptors On Board!*"
#  gosub :switchboard~switchboard
#  return
#end

gosub :MINES~DISRUPT
if ($MINES~RESULT <> "")
  setvar $switchboard~message $MINES~RESULT & "*"
  gosub :switchboard~switchboard
end
halt

include "source\include\player"
include "source\include\help"
include "source\include\mines"
include "source\include\loadvars"
include "source\include\switchboard"
