gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
setvar $BOT~COMMAND "surround"
setvar $PLAYER~SAVE TRUE
loadvar $PLAYER~SURROUNDOVERWRITE
loadvar $PLAYER~SURROUNDAVOIDALLPLANETS
loadvar $PLAYER~SURROUNDAVOIDSHIELDEDONLY
loadvar $PLAYER~SURROUNDPASSIVE
loadvar $PLAYER~SURROUNDLIMP
loadvar $PLAYER~SURROUNDMINE
loadvar $PLAYER~SURROUNDFIGS

loadvar $SHIPPHOTONCHECK

setvar $HELP~HELP[1] $HELP~TAB&"surround   "
setvar $HELP~HELP[2] $HELP~TAB&"      Surrounds sector with fighters, armids, or limpets.  "
setvar $HELP~HELP[3] $HELP~TAB&"      "
setvar $HELP~HELP[4] $HELP~TAB&"    - Options for surround can be found in the"
setvar $HELP~HELP[5] $HELP~TAB&"      preferences menu in bot"
gosub :HELP~HELPFILE

gosub :PLAYER~QUIKSTATS
if (($PLAYER~TURNS <= $BOT~BOT_TURN_LIMIT) and ($PLAYER~UNLIMITEDGAME <> TRUE))
  setvar $SWITCHBOARD~MESSAGE "Turns Exceed Bot Turn Limit.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($PLAYER~PHOTONS > 0)
  if ($SHIPPHOTONCHECK = $PLAYER~SHIP_NUMBER)

  else
    setvar $SHIPPHOTONCHECK $PLAYER~SHIP_NUMBER
    savevar $SHIPPHOTONCHECK
    echo "*"&ANSI_14&"You are carrying photons. *If you wish to surround anyway, press TAB-S again.*"&ANSI_7
    halt
  end
end
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ($STARTINGLOCATION = "Command")
elseif ($STARTINGLOCATION = "Citadel")
  send "q "
  gosub :PLANET~GETPLANETINFO
  send "q "
elseif ($STARTINGLOCATION = "Planet")
  gosub :PLANET~GETPLANETINFO
  send "q "
else
  echo "*Wrong prompt for surround command.*"
  halt

end
gosub :GRID~SURROUND

if (($STARTINGLOCATION = "Citadel") or ($STARTINGLOCATION = "Planet"))
  gosub :PLANET~LANDINGSUB
else
  gosub :PLAYER~QUIKSTATS
end
setvar $SWITCHBOARD~MESSAGE "Surrounded sector "&$PLAYER~CURRENT_SECTOR&".*"
gosub :SWITCHBOARD~SWITCHBOARD
echo "*"&ANSI_14&$PLAYER~SURROUNDOUTPUT&"*"&ANSI_7
halt

# includes:
include "source\include\grid"
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
