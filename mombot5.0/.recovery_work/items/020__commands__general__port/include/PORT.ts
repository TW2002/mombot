:PORT~BUILDPORT
killalltriggers
gosub :PLAYER~QUIKSTATS
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $PORT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command"
gosub :BOT~CHECKSTARTINGPROMPT

if ($PORT~STARTINGLOCATION = "Command")
  send "** "
  waiton "Warps to Sector(s)"
else
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "m*** cs* "
  gosub :PLAYER~QUIKSTATS
end
if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE)
  setvar $SWITCHBOARD~MESSAGE "Already a port in sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end


if (($BOT~USER_COMMAND_LINE = "") or ($BOT~USER_COMMAND_LINE = 0))
  setvar $PORT~PORT_NAME "Mind ()ver Matter"
else
  setvar $PORT~PORT_NAME $BOT~USER_COMMAND_LINE
end
killalltriggers

if ($PORT~STARTINGLOCATION = "Citadel")
  if ($PLAYER~CREDITS < 50000)
    send "T F 50000*"
  end
end
gosub :PLAYER~QUIKSTATS
if ($PLAYER~CREDITS < 50000)
  setvar $SWITCHBOARD~MESSAGE "Not Enough Credits to Make Ports*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
send "q q q z n * o3y" $PORT~PORT_NAME "*"
killtrigger 1
killtrigger 2
setvar $PORT~FAIL FALSE
settextlinetrigger 1 :TOO_MANY "Sorry... All of the StarPort Licenses have been granted."
settextlinetrigger 2 :BUILD_SUCCESS "For building this Starport, you receive"
pause
:PORT~TOO_MANY
setvar $SWITCHBOARD~MESSAGE "Too many ports in the universe!*"
gosub :SWITCHBOARD~SWITCHBOARD
setvar $PORT~FAIL TRUE
:PORT~BUILD_SUCCESS
if ($PORT~FAIL = FALSE)
  setvar $SWITCHBOARD~MESSAGE "Port successfully created!*"
  gosub :SWITCHBOARD~SWITCHBOARD
end
killtrigger 1
killtrigger 2
if ($PORT~STARTINGLOCATION = "Citadel")
  send "l "&#8&$PLANET~PLANET&"*  c  s* "
end

return
