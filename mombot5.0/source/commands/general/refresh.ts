gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

setvar $HELP~HELP[1] $HELP~TAB&"refresh - refresh cached bot state from the live game"
setvar $HELP~HELP[2] $HELP~TAB&"  "
setvar $HELP~HELP[3] $HELP~TAB&"  refresh"
setvar $HELP~HELP[4] $HELP~TAB&"    - re-reads player, game, ship, and planet data"
setvar $HELP~HELP[5] $HELP~TAB&"      from the current prompt"
gosub :HELP~HELPFILE

gosub :BOT~KILLTHETRIGGERS
gosub :PLAYER~QUIKSTATS
setvar $BOT~VALIDPROMPTS "Citadel Command"
gosub :PLAYER~CHECKSTARTINGPROMPT
if ($PLAYER~CURRENT_PROMPT = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "q"
end

gosub :PLAYER~GETINFO
gosub :GAME~GAMESTATS
gosub :SHIP~GETSHIPSTATS

gosub :PLAYER~QUIKSTATS
gosub :SHIP~GETSHIPCAPSTATS
gosub :SHIP~LOADSHIPINFO

gosub :PLANET~GETPLANETSTATS
gosub :PLANET~LOADPLANETINFO

if ($PLAYER~CURRENT_PROMPT = "Citadel")
  gosub :PLANET~LANDINGSUB
end

setvar $SWITCHBOARD~MESSAGE "Bot data refresh completed.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt

# includes:
include "source\include\bot"
include "source\include\help"
