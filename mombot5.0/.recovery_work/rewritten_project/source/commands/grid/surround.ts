gosub :BOT~LOADVARS
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

setvar $BOT~HELP[1] $BOT~TAB&"surround   "
setvar $BOT~HELP[2] $BOT~TAB&"      Surrounds sector with fighters, armids, or limpets.  "
setvar $BOT~HELP[3] $BOT~TAB&"      "
setvar $BOT~HELP[4] $BOT~TAB&"    - Options for surround can be found in the"
setvar $BOT~HELP[5] $BOT~TAB&"      preferences menu in bot"
gosub :BOT~HELPFILE

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
include "source\include\BOT"
include "source\include\SWITCHBOARD"
include "source\include\PLAYER"
include "source\include\PLANET"
include "source\include\GRID"
include "source\include\SHIP"
