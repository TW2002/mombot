loadvar $BOT_NAME
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $SELF_COMMAND
loadvar $STARDOCK
loadvar $PLAYER~UNLIMITEDGAME
loadvar $SWITCHBOARD~BOT_NAME
loadvar $SWITCHBOARD~SELF_COMMAND
:QSET
:Q


getword $USER_COMMAND_LINE $PARM1 1
getword $USER_COMMAND_LINE $PARM2 2
gosub :DOQSETPROTECTIONS
gosub :PLAYER~CURRENTPROMPT
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Planet Citadel"
gosub :BOT~CHECKSTARTINGPROMPT
setvar $TOTALDAMAGE 0
setvar $CANNONTYPE $PARM1
setvar $CANNONDAMAGE $PARM2
if ($STARTINGLOCATION = "Citadel")
  send "q"
end
gosub :PLANET~GETPLANETINFO
if ($PLANET~CITADEL < 3)
  send "'{" $SWITCHBOARD~BOT_NAME "} - Planet number " $PLANET~PLANET " does not have a quasar cannon.*"
  if (($PLANET~CITADEL > 0) and ($STARTINGLOCATION = "Citadel"))
    send "c "
  end
else
  send "c "
  if ($CANNONTYPE = "s")
    setvar $PERCENTTOSET (((3 * $CANNONDAMAGE) * 100) / $PLANET~PLANET_FUEL)
    if (((($PLANET~PLANET_FUEL * $PERCENTTOSET) / 100) / 3) < $CANNONDAMAGE)
      add $PERCENTTOSET 1
    end
    if ($PERCENTTOSET > 100)
      setvar $PERCENTTOSET 100
    end
    add $TOTALDAMAGE ((($PLANET~PLANET_FUEL * $PERCENTTOSET) / 100) / 3)
    send "l s "&$PERCENTTOSET&"* "
    setvar $DAMAGETYPE "Sector"
  else
    if ($MBBS)
      setvar $PERCENTTOSET ((($CANNONDAMAGE / 2) * 100) / $PLANET~PLANET_FUEL)
      if (((($PLANET~PLANET_FUEL * $PERCENTTOSET) / 100) * 2) < $CANNONDAMAGE)
        add $PERCENTTOSET 1
      end
    else
      setvar $PERCENTTOSET (((2 * $CANNONDAMAGE) * 100) / $PLANET~PLANET_FUEL)
      if (((($PLANET~PLANET_FUEL * $PERCENTTOSET) / 100) / 2) < $CANNONDAMAGE)
        add $PERCENTTOSET 1
      end
    end
    if ($PERCENTTOSET > 100)
      setvar $PERCENTTOSET 100
    end
    if ($MBBS)
      add $TOTALDAMAGE ((($PLANET~PLANET_FUEL * $PERCENTTOSET) / 100) * 2)
    else
      add $TOTALDAMAGE ((($PLANET~PLANET_FUEL * $PERCENTTOSET) / 100) / 2)
    end
    send "l a "&$PERCENTTOSET&"* "
    setvar $DAMAGETYPE "Atmosphere"
  end
  if ($STARTINGLOCATION = "Planet")
    send "q "
  end
  setvar $SWITCHBOARD~MESSAGE "Quasar Cannon on planet "&$PLANET~PLANET&" is set to "&$TOTALDAMAGE&". ("&$DAMAGETYPE&")*"
  waiton "What level do you want"
  gosub :SWITCHBOARD~SWITCHBOARD
end
goto :WAIT_FOR_COMMAND
:DOQSETPROTECTIONS
isnumber $NUMBER $PARM2
if ($NUMBER <> TRUE)
  setvar $SWITCHBOARD~MESSAGE "Cannon Damage Entered is not a number!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :WAIT_FOR_COMMAND
end
if (($PARM1 <> "a") and ($PARM1 <> "s"))
  setvar $SWITCHBOARD~MESSAGE "Please use qset [a/s] [damage]!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :WAIT_FOR_COMMAND
end
return
:WAIT_FOR_COMMAND

halt
:KILLTHETRIGGERS

killalltriggers
return

# includes:
include "source\include\bot"
