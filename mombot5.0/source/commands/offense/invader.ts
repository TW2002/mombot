gosub :BOT~LOADVARS

	setVar $BOT~help[1]   $BOT~tab&"  invader is a wrapper for the following commands:"
	setVar $BOT~help[2]   $BOT~tab&"  pe, ped, pel, pelk, pex, pxe, pxed, pxedx, pxel, pxelk, pxex"
	setVar $BOT~help[3]   $BOT~tab&"     "
  setVar $BOT~help[4]   $BOT~tab&"  usage:"
	setVar $BOT~help[5]   $BOT~tab&"     "
	setVar $BOT~help[6]   $BOT~tab&"  pe [Sector] - Launch photon into adjacent sector and immediately enter "
	setVar $BOT~help[7]   $BOT~tab&"  ped [Sector] - Launch photon, enter and launch genesis torpedo "
  setVar $BOT~help[8]   $BOT~tab&"  pel [Sector] [Planet#] - Photon, enter and land on planet "
  setVar $BOT~help[9]   $BOT~tab&"  pelk [Sector] [Planet#] - Photon, enter, land and send one wave of fighters "
  setVar $BOT~help[10]   $BOT~tab&"  pex [Sector] [Ship#] - Photon, enter and export to another ship "
  setVar $BOT~help[11]   $BOT~tab&"  pxe [Sector] [Ship#] - Photon, export to another ship and enter "
  setVar $BOT~help[12]   $BOT~tab&"  pxed [Sector] [Ship#] - Photon, export, enter and launch genesis torpedo "
  setVar $BOT~help[13]   $BOT~tab&"  pxel [Sector] [Ship#] [Planet#] - Photon, export, enter and land on planet "
  setVar $BOT~help[14]   $BOT~tab&"  pxelk [Sector] [Ship#] [Planet#] - Photon, export, enter, land and send wave "
  setVar $BOT~help[15]   $BOT~tab&"  pxex [Sector] [Ship#] - Photon, export, enter and export back "
	setVar $BOT~help[16]  $BOT~tab&"     "
	setVar $BOT~help[17]   $BOT~tab&"  Examples:"
	setVar $BOT~help[18]  $BOT~tab&"     "
  setVar $BOT~help[19]  $BOT~tab&"  >pe 24902 "
  setVar $BOT~help[20]  $BOT~tab&"  >pel 24902 15"
  setVar $BOT~help[21]  $BOT~tab&"  >pxel 24902 3 15"
	gosub :bot~helpfile

setvar $INVADER~COMMAND $BOT~COMMAND_TYPED
if (($INVADER~COMMAND = "") or ($INVADER~COMMAND = 0))
  setvar $INVADER~COMMAND $BOT~COMMAND
end
lowercase $INVADER~COMMAND

setvar $BOT~HELP[1] $BOT~TAB&"invader - photon invade dispatcher"
setvar $BOT~HELP[2] $BOT~TAB&"  Legacy commands alias here: pe, ped, pel, pelk,"
setvar $BOT~HELP[3] $BOT~TAB&"  pex, pxe, pxed, pxedx, pxel, pxelk, pxex."
gosub :BOT~HELPFILE

setvar $INVADER~VALID_COMMANDS " pe ped pel pelk pex pxe pxed pxedx pxel pxelk pxex "
getwordpos $INVADER~VALID_COMMANDS $INVADER~POS " "&$INVADER~COMMAND&" "
if ($INVADER~POS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Invader must be called through one of: pe ped pel pelk pex pxe pxed pxedx pxel pxelk pxex.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

gosub :INVADER~CHECK_INVADE_MACRO_PARAMS

setvar $INVADER~XPORT_COMMANDS " pxe pxed pxedx pxel pxelk pxex "
getwordpos $INVADER~XPORT_COMMANDS $INVADER~POS " "&$INVADER~COMMAND&" "
if ($INVADER~POS > 0)
  setvar $INVADER~SPEED_INVADE_MACRO $INVADER~XPORT&$INVADER~ENTER&"       * "
  setvar $INVADER~NORMAL_INVADE_MACRO $INVADER~XPORT&$INVADER~ENTER&"** "
else
  setvar $INVADER~SPEED_INVADE_MACRO $INVADER~ENTER&"     *  "
  setvar $INVADER~NORMAL_INVADE_MACRO $INVADER~ENTER&"*            "
end

gosub :INVADER~START_INVADE_MACRO
halt

# includes:
include "source\include\bot"
include "source\include\player"
include "source\include\ship"
include "source\include\switchboard"
include "source\include\invader"
