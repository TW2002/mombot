gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

setvar $HELP~HELP[1] $HELP~TAB&"- dump [type] - Jettisons colos off of planet"
setvar $HELP~HELP[2] $HELP~TAB&"     [type] = use [f]uel, [o]rg, [e]quip, or [a]ll "
gosub :HELP~HELPFILE
:COLO_DUMP



gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTINGLOCATION <> "Planet") and ($STARTINGLOCATION <> "Citadel"))
  setvar $SWITCHBOARD~MESSAGE "Colo Dump must be run from Citadel or Planet prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD

  halt
end
:GETCOLOSFROM

setvar $COLOGROUP $BOT~PARM1
setvar $COLOSDUMPED 0
setvar $COLOCOUNTING FALSE
setvar $NUMBERCOLOSTODUMP 0
if ($COLOGROUP = "f")
  setvar $COLOGROUP 1
  setvar $COLODISPLAY "Fuel"
elseif ($COLOGROUP = "o")
  setvar $COLOGROUP 2
  setvar $COLODISPLAY "Organics"
elseif ($COLOGROUP = "e")
  setvar $COLOGROUP 3
  setvar $COLODISPLAY "Equipment"
elseif ($COLOGROUP = "a")
  setvar $COLOGROUP 1
  setvar $COLODISPLAY "All"
else
  isnumber $TEST $BOT~PARM1
  if ($TEST)
    if ($BOT~PARM1 > 0)
      setvar $NUMBERCOLOSTODUMP $BOT~PARM1
      setvar $COLODISPLAY $NUMBERCOLOSTODUMP
      setvar $COLOGROUP 1
      setvar $COLOCOUNTING TRUE
    else
      setvar $SWITCHBOARD~MESSAGE "Please use [F]uel, [O]rganics, [E]quipment, [A]ll, or a Number.*"
      gosub :SWITCHBOARD~SWITCHBOARD

      halt
    end
  else
    setvar $SWITCHBOARD~MESSAGE "Please use [F]uel, [O]rganics, [E]quipment, [A]ll, or a Number.*"
    gosub :SWITCHBOARD~SWITCHBOARD

    halt
  end

end
if ($STARTINGLOCATION = "Citadel")
  send "q"
end
gosub :PLANET~GETPLANETINFO
setvar $SWITCHBOARD~MESSAGE "Dumping "&$COLODISPLAY&" Colonists from Planet: "&$PLANET~PLANET&".*"
gosub :SWITCHBOARD~SWITCHBOARD
killtrigger 1
send "q j y "
:SUB_LAND

send "l j"&#8&$PLANET~PLANET&"* s n t "&$COLOGROUP&"* "
settexttrigger NEXT_GROUP :NEXT_GROUP "There aren't that many on the planet!"
settexttrigger KEEP_DUMPING :KEEP_DUMPING "The Colonists file aboard your ship, eager to head out."
if ($COLOCOUNTING and ($COLOSDUMPED >= $NUMBERCOLOSTODUMP))
  goto :DONEDUMPING
end
pause
:NEXT_GROUP

killtrigger KEEP_DUMPING
if (($BOT~PARM1 = "a") and ($COLOGROUP < 3))
  add $COLOGROUP 1
  goto :SUB_LAND
else
  :DONEDUMPING
  killtrigger NEXT_GROUP
  killtrigger KEEP_DUMPING
  setvar $SWITCHBOARD~MESSAGE "Finished Dumping "&$COLODISPLAY&" Colonists from Planet: "&$PLANET~PLANET&".*"
  gosub :SWITCHBOARD~SWITCHBOARD
  send "s n l 1* s n l 2* s n l 3* "
  if ($STARTINGLOCATION = "Citadel")
    send "c"
  end
  halt
end
:KEEP_DUMPING


killtrigger NEXT_GROUP
send "q j y "
if ($COLOCOUNTING)
  add $COLOSDUMPED $PLAYER~TOTAL_HOLDS
end
goto :SUB_LAND

# includes:
include "source\include\planet"
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
