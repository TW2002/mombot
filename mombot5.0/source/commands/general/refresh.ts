gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"refresh - refresh cached bot state from the live game"
setvar $BOT~HELP[2] $BOT~TAB&"  "
setvar $BOT~HELP[3] $BOT~TAB&"  refresh"
setvar $BOT~HELP[4] $BOT~TAB&"    - re-reads player, game, ship, and planet data"
setvar $BOT~HELP[5] $BOT~TAB&"      from the current prompt"
gosub :BOT~HELPFILE

gosub :BOT~KILLTHETRIGGERS
gosub :PLAYER~QUIKSTATS
setvar $BOT~VALIDPROMPTS "Citadel Command"
gosub :BOT~CHECKSTARTINGPROMPT
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
include "source\include\game"
include "source\include\player"
include "source\include\planet"
include "source\include\ship"
include "source\include\switchboard"
