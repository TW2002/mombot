:PORT~DESTROYPORT
gosub :PLAYER~QUIKSTATS
setvar $BOT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $PORT~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
setvar $BOT~VALIDPROMPTS "Citadel Command"
gosub :BOT~CHECKSTARTINGPROMPT

if ($PORT~STARTINGLOCATION = "Command")
  send "** "
  waiton "Warps to Sector(s)"
else
  if ($PLANET~PLANET = 0)
    send "q"
    gosub :PLANET~GETPLANETINFO
    send "m*** cs* "
    gosub :PLAYER~QUIKSTATS
  end
end
if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] <> TRUE)
  setvar $SWITCHBOARD~MESSAGE "No port in sector!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
gosub :SHIP~GETSHIPSTATS

if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] = TRUE)
  :PORT~KEEPDESTROYING
  killtrigger 1
  killtrigger 2
  killtrigger 3
  killtrigger 4
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~FIGHTERS >= $SHIP~SHIP_MAX_ATTACK)
    if ($PORT~STARTINGLOCATION = "Citadel")
      send "q q q * *  "
    end
    send "p"
    settexttrigger 1 :PORTALREADYGONE "Captain! Are you sure you want to port here?"
    settexttrigger 2 :CONTINUEDESTROY "<A> Attack this Port"
    pause
    :PORT~CONTINUEDESTROY
    killtrigger 1
    killtrigger 2
    killtrigger 3
    killtrigger 4
    send " a y "&$SHIP~SHIP_MAX_ATTACK&"** "
    if ($PORT~STARTINGLOCATION = "Citadel")
      send "l "&$PLANET~PLANET&"* m * * * q "
    end
    settexttrigger 1 :KEEPDESTROYING "Incoming laser barrage from"
    settexttrigger 2 :DONEDESTROYING "You destroyed the Star Port!"
    pause
    :PORT~DONEDESTROYING
    :PORT~PORTALREADYGONE
    send "*   "
    if ($PORT~STARTINGLOCATION = "Citadel")
      send "l "&$PLANET~PLANET&"* c s*  "
    end
    killtrigger 1
    killtrigger 2
    killtrigger 3
    killtrigger 4

    setvar $SWITCHBOARD~MESSAGE "Port Destroyed.*"
    gosub :SWITCHBOARD~SWITCHBOARD

  else
    setvar $SWITCHBOARD~MESSAGE "Not enough fighters.  Better reload before the you blow up this port.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
end
halt
