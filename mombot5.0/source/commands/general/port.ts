gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

setvar $HELP~HELP[1] $HELP~TAB&"  port {build/create} {destroy/kill} {upgrade/max}                "
setvar $HELP~HELP[2] $HELP~TAB&"  Options:"
setvar $HELP~HELP[3] $HELP~TAB&"     port build {port name} "
setvar $HELP~HELP[4] $HELP~TAB&"       - create sbb port in sector if possible"
setvar $HELP~HELP[5] $HELP~TAB&"         {port name} - Name of port to create "
setvar $HELP~HELP[6] $HELP~TAB&"                   default: Mind ()ver Matter "
setvar $HELP~HELP[7] $HELP~TAB&"      "
setvar $HELP~HELP[8] $HELP~TAB&"     port destroy "
setvar $HELP~HELP[9] $HELP~TAB&"       - blow up port in sector if possible"
setvar $HELP~HELP[10] $HELP~TAB&"      "
setvar $HELP~HELP[11] $HELP~TAB&"     port upgrade {f} {o} {e} {noexp}"
setvar $HELP~HELP[12] $HELP~TAB&"       - upgrade port if possible, using treasury if available"
setvar $HELP~HELP[13] $HELP~TAB&"             {f} - upgrade fuel"
setvar $HELP~HELP[14] $HELP~TAB&"             {o} - upgrade organics"
setvar $HELP~HELP[15] $HELP~TAB&"             {e} - upgrade equipment"
setvar $HELP~HELP[16] $HELP~TAB&"         {noexp} - upgrade without experience increase"
setvar $HELP~HELP[16] $HELP~TAB&"                   default: s/b/b upgraded"
gosub :HELP~HELPFILE


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
include "source\include\loadvars"
include "source\include\port"
include "source\include\help"
