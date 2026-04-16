gosub :BOT~LOADVARS

setvar $BOT~HELP[1] $BOT~TAB&"  port {build/create} {destroy/kill} {upgrade/max}                "
setvar $BOT~HELP[2] $BOT~TAB&"  Options:"
setvar $BOT~HELP[3] $BOT~TAB&"     port build {port name} "
setvar $BOT~HELP[4] $BOT~TAB&"       - create sbb port in sector if possible"
setvar $BOT~HELP[5] $BOT~TAB&"         {port name} - Name of port to create "
setvar $BOT~HELP[6] $BOT~TAB&"                   default: Mind ()ver Matter "
setvar $BOT~HELP[7] $BOT~TAB&"      "
setvar $BOT~HELP[8] $BOT~TAB&"     port destroy "
setvar $BOT~HELP[9] $BOT~TAB&"       - blow up port in sector if possible"
setvar $BOT~HELP[10] $BOT~TAB&"      "
setvar $BOT~HELP[11] $BOT~TAB&"     port upgrade {f} {o} {e} {noexp}"
setvar $BOT~HELP[12] $BOT~TAB&"       - upgrade port if possible, using treasury if available"
setvar $BOT~HELP[13] $BOT~TAB&"             {f} - upgrade fuel"
setvar $BOT~HELP[14] $BOT~TAB&"             {o} - upgrade organics"
setvar $BOT~HELP[15] $BOT~TAB&"             {e} - upgrade equipment"
setvar $BOT~HELP[16] $BOT~TAB&"         {noexp} - upgrade without experience increase"
setvar $BOT~HELP[16] $BOT~TAB&"                   default: s/b/b upgraded"
gosub :BOT~HELPFILE


setvar $BOT~BOT_NAME $SWITCHBOARD~BOT_NAME

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if (($STARTINGLOCATION <> "Citadel") and ($STARTINGLOCATION <> "Command"))
  setvar $SWITCHBOARD~MESSAGE "You must run port helper from command or citadel prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
loadvar $PLANET~PLANET

setvar $I 1
setvar $LINE $BOT~USER_COMMAND_LINE
setvar $NOTHING "<>!<>junk<>!<>!"
getword $LINE $WORD 1 $NOTHING

while ($WORD <> $NOTHING)
  add $I 1
  getword $LINE $WORD $I $NOTHING
  if ($WORD <> $NOTHING)
    setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&$WORD&" "
  end
end

if (($BOT~PARM1 = "build") or ($BOT~PARM1 = "create"))
  gosub :PORT~BUILDPORT
  halt
elseif (($BOT~PARM1 = "destroy") or ($BOT~PARM1 = "kill"))
  gosub :PORT~DESTROYPORT
  halt
elseif (($BOT~PARM1 = "max") or ($BOT~PARM1 = "upgrade"))
  gosub :PORT~UPGRADEPORT
  halt
else
  setvar $SWITCHBOARD~MESSAGE "Option used for port helper not recognized.  Try build/create/destroy/kill/upgrade/max options.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt

end
halt

# includes:
include "source\include\BOT"
include "source\include\SWITCHBOARD"
include "source\include\PLAYER"
include "source\include\PORT"
