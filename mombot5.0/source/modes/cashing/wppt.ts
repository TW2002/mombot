gosub :BOT~loadVars

setVar $BOT~help[1]   $BOT~tab&"- wppt {holoscan} {evade} {pay}"
setVar $BOT~help[2]   $BOT~tab&"  World PPT using the legacy worldtrade engine                     "
setVar $BOT~help[3]   $BOT~tab&"                                                                  "
setVar $BOT~help[4]   $BOT~tab&"     {holoscan}      0 - doesn't holoscan                         "
setVar $BOT~help[5]   $BOT~tab&"                     1 - holoscans on odd densities               "
setVar $BOT~help[6]   $BOT~tab&"                     2 - always holoscans (default)               "
setVar $BOT~help[7]   $BOT~tab&"                                                                  "
setVar $BOT~help[8]   $BOT~tab&"     {evade}         0 - normal (default)                         "
setVar $BOT~help[9]   $BOT~tab&"                     1 - paranoid                                 "
setVar $BOT~help[10]  $BOT~tab&"                     2 - avoids nothing                           "
setVar $BOT~help[11]  $BOT~tab&"                                                                  "
setVar $BOT~help[12]  $BOT~tab&"     {pay}             - pays tolls                               "
setVar $BOT~help[13]  $BOT~tab&"                                                                  "
setVar $BOT~help[14]  $BOT~tab&"     Fig type/count come from your Mombot tab-~ preferences      "

gosub :BOT~helpfile

setVar $BOT~script_title "World PPT"
gosub :BOT~banner

setTextLineTrigger prompt :allPrompts #145 & #8
send #145&"/"
pause
:allPrompts
getWord CURRENTLINE $CURRENT_PROMPT 1
stripText $CURRENT_PROMPT #145
stripText $CURRENT_PROMPT #8
killalltriggers

if ($CURRENT_PROMPT <> "Command")
  clientMessage "This script must be run from the command menu"
  halt
end

reqRecording
logging off

# Native haggle owns the offer flow for wppt.
setVar $haggle~hagglefactor 0
setVar $PPT~BATCHMODE 0

if (($bot~parm1 = 0) OR ($bot~parm1 = 1) OR ($bot~parm1 = 2))
  setVar $Move~ScanHolo $bot~parm1
else
  setVar $Move~ScanHolo 2
end

if (($bot~parm2 = 0) OR ($bot~parm2 = 1) OR ($bot~parm2 = 2))
  setVar $Move~Evasion $bot~parm2
else
  setVar $Move~Evasion 0
end

getWordPos " "&$bot~user_command_line&" " $pos " pay "
if ($pos > 0)
  setVar $Move~Attack 3
else
  setVar $Move~Attack 2
end
setVar $Move~PortPriority 1

if ($PLAYER~DROPOFFENSIVE = TRUE)
  setVar $WPPT~DEPLOYFIG "o"
elseif ($PLAYER~DROPTOLL = TRUE)
  setVar $WPPT~DEPLOYFIG "t"
else
  setVar $WPPT~DEPLOYFIG "d"
end

if ($PLAYER~SURROUNDFIGS > 0)
  setVar $Move~ExtraSend "f z" & $PLAYER~SURROUNDFIGS & "*zc" & $WPPT~DEPLOYFIG & "*  "
  setVar $Move~ExtraSendAll 1
  setVar $PPT~DropFigs 1
else
  setVar $Move~ExtraSend ""
  setVar $Move~ExtraSendAll 0
  setVar $PPT~DropFigs 0
end

loadVar $PPT~SAVED
if ($PPT~SAVED)
  loadVar $PPT~PERCTRADE
else
  setVar $PPT~PERCTRADE 20
  saveVar $PPT~PERCTRADE
  setVar $PPT~SAVED 1
  saveVar $PPT~SAVED
end

setVar $PortCheck~Danger 1
setVar $PortCheck~FuelOrganics 1
setVar $PortCheck~PortType 1

:Menu_Go
setVar $WorldTrade~Quota 0
setEventTrigger disconnect :disconnected "Connection lost"
gosub :WorldTrade~WorldTrade
goto :shutdown

:disconnected
killAllTriggers
waitFor "Command [TL="
goto :Menu_Go

:shutdown
halt

# includes:
include "source\include\bot"
include "source\include\haggle"
include "source\include\worldtrade"
include "source\include\ppt"
include "source\include\portcheck"
include "source\include\move"
include "source\include\player"
include "source\include\playerinfo"
include "source\include\gameprefs"
