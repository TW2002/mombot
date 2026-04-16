gosub :BOT~LOADVARS


setvar $BOT~HELP[1] $BOT~TAB&"    bg2019 [command]"
setvar $BOT~HELP[2] $BOT~TAB&"        "
setvar $BOT~HELP[3] $BOT~TAB&"    sellship  - sells your ship and sits you in scout"
setvar $BOT~HELP[4] $BOT~TAB&"    stripcash - strips cash from corp mates (11k+ req)"
setvar $BOT~HELP[5] $BOT~TAB&"    buycorp   - buys Corp Flag "
setvar $BOT~HELP[6] $BOT~TAB&"    buydora   - buys Orion "
setvar $BOT~HELP[7] $BOT~TAB&"    buycolt   - buys Colt "
setvar $BOT~HELP[8] $BOT~TAB&"    movecolt  - moves Colts to sectors  "
setvar $BOT~HELP[9] $BOT~TAB&"                  >movecolt 95 16822 87 "
setvar $BOT~HELP[10] $BOT~TAB&"    grabcolo  - fills any Colt in sector with colos "
setvar $BOT~HELP[11] $BOT~TAB&"    docim     - downloads port/warp data "

gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "BG2019 Utilities"
gosub :BOT~BANNER


if ($BOT~PARM1 = "sellship")
  gosub :SELLSHIP
  halt
end

if ($BOT~PARM1 = "buycorp")
  gosub :BUYCORP
  halt
end

if ($BOT~PARM1 = "stripcash")
  gosub :STRIPCASH
  halt
end


if ($BOT~PARM1 = "buydora")
  gosub :BUYDORA
  halt
end

if ($BOT~PARM1 = "docim")
  gosub :DOCIM
  halt
end

if (($BOT~PARM1 = "buycolt") or ($BOT~PARM1 = "buycolts"))
  gosub :BUYCOLT
  halt
end

if (($BOT~PARM1 = "movecolt") or ($BOT~PARM1 = "movecolts"))
  gosub :MOVECOLT
  halt
end

if (($BOT~PARM1 = "grabcolo") or ($BOT~PARM1 = "grabcolos"))
  gosub :GRABCOLOS
  halt
end

setvar $SWITCHBOARD~MESSAGE "I'll do a lot.. but not that.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
halt
:GRABCOLOS

setarray $COLTS 10
setvar $COLTS 0
gosub :PLAYER~QUIKSTATS
setvar $ORIGSHIP $PLAYER~SHIP_NUMBER
setvar $LOCATION $PLAYER~CURRENT_PROMPT
setvar $STARTING $PLAYER~CURRENT_SECTOR
if (($STARTING = $MAP~STARDOCK) or ($STARTING <= 10))
  setvar $SWITCHBOARD~MESSAGE "Can't start this from Fed Space.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($LOCATION <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Start from Command Prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
send "w** "
settextlinetrigger FOUNDCOLT :FOUNDCOLT "  0  Colonial Transport"
settextlinetrigger NOMORE :NOMORE "Choose which ship to tow (Q=Quit)"
settextlinetrigger NOMORE2 :NOMORE "You do not own any other ships in this sector!"
pause
:FOUNDCOLT
getword CURRENTLINE $SHIPNUMBER 1
add $COLTS 1
setvar $COLTS[$COLTS] $SHIPNUMBER
settextlinetrigger FOUNDCOLT :FOUNDCOLT "  0  Colonial Transport"
pause
:NOMORE
killtrigger FOUNDCOLT
killtrigger NOMORE
killtrigger NOMORE2

if ($COLTS <= 0)
  setvar $SWITCHBOARD~MESSAGE "No Colts found in this sector.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $I 1
while ($I <= $COLTS)
  send "*"
  gosub :PLAYER~QUIKSTATS
  if ((PORT.BUYFUEL[$STARTING] = FALSE) and ((PORT.CLASS[$STARTING] <> 0) and (PORT.CLASS[$STARTING] <> 9)))
    send "p  t  * * *"
  end
  send "x  "&$COLTS[$I]&"*  *  j y x  "&$ORIGSHIP&"*  *  w * "&$COLTS[$I]&"* "
  setvar $PLAYER~WARPTO 1
  gosub :PLAYER~TWARP
  if ($PLAYER~TWARPSUCCESS = FALSE)
    setvar $SWITCHBOARD~MESSAGE "Can't make it to Terra.  Halting.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  gosub :PLAYER~QUIKSTATS
  send "x  "&$COLTS[$I]&"*  *  l**  x  "&$ORIGSHIP&"*  *   w * "&$COLTS[$I]&"* "
  if ($PLAYER~TWARPSUCCESS = TRUE)
    setvar $PLAYER~WARPTO $STARTING
    gosub :PLAYER~TWARP
    if ($PLAYER~TWARPSUCCESS = FALSE)
      setvar $SWITCHBOARD~MESSAGE "Can't get back!  Halting*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    gosub :PLAYER~QUIKSTATS
    send "w "
  end
  add $I 1
end


return
:MOVECOLT

setarray $COLTS 10 1
setvar $COLTS 0
gosub :PLAYER~QUIKSTATS
setvar $ORIGSHIP $PLAYER~SHIP_NUMBER
setvar $LOCATION $PLAYER~CURRENT_PROMPT
setvar $STARTING $PLAYER~CURRENT_SECTOR
if ($LOCATION <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Start from Command Prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($BOT~PARM2 = "")
  setvar $SWITCHBOARD~MESSAGE "No sectors selected.  You need to choose a sector to move to.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
setvar $COLTCOUNT 0
if ($BOT~PARM2 <> "")
  isnumber $ISANUMBER $BOT~PARM2
  if ($ISANUMBER <> TRUE)
    setvar $SWITCHBOARD~MESSAGE "Sector param is invalid.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  add $COLTCOUNT 1
  setvar $COLTS[$COLTCOUNT][1] $BOT~PARM2
end
if ($BOT~PARM3 <> "")
  isnumber $ISANUMBER $BOT~PARM3
  if ($ISANUMBER <> TRUE)
    setvar $SWITCHBOARD~MESSAGE "Sector param is invalid.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  add $COLTCOUNT 1
  setvar $COLTS[$COLTCOUNT][1] $BOT~PARM3
end
if ($BOT~PARM4 <> "")
  isnumber $ISANUMBER $BOT~PARM4
  if ($ISANUMBER <> TRUE)
    setvar $SWITCHBOARD~MESSAGE "Sector param is invalid.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  add $COLTCOUNT 1
  setvar $COLTS[$COLTCOUNT][1] $BOT~PARM4
end

send "w** "
settextlinetrigger FOUNDCOLT :FOUNDCOLTMOVE "  0  Colonial Transport"
settextlinetrigger NOMORE :NOMOREMOVE "Choose which ship to tow (Q=Quit)"
settextlinetrigger NOMORE2 :NOMOREMOVE "You do not own any other ships in this sector!"
pause
:FOUNDCOLTMOVE
getword CURRENTLINE $SHIPNUMBER 1
add $COLTS 1
setvar $COLTS[$COLTS] $SHIPNUMBER
settextlinetrigger FOUNDCOLT :FOUNDCOLT "  0  Colonial Transport"
pause
:NOMOREMOVE
killtrigger FOUNDCOLT
killtrigger NOMORE
killtrigger NOMORE2

if ($COLTS <= 0)
  setvar $SWITCHBOARD~MESSAGE "No Colts found in this sector.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($COLTS < $COLTCOUNT)
  setvar $SWITCHBOARD~MESSAGE "Not enough colts in the sector for "&$COLTCOUNT&" sectors.  Buy more colts or choose fewer sectors.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

setvar $I 1
while ($I <= $COLTCOUNT)
  send "w * "&$COLTS[$I]&"* "
  setvar $PLAYER~WARPTO $COLTS[$I][1]
  gosub :PLAYER~TWARP
  if ($PLAYER~TWARPSUCCESS = FALSE)
    setvar $SWITCHBOARD~MESSAGE "Sector missing fig, moving onto next.*"
    gosub :SWITCHBOARD~SWITCHBOARD
  else
    setvar $SWITCHBOARD~MESSAGE "Colt moved to sector "&$COLTS[$I][1]&".*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "*"
    gosub :PLAYER~QUIKSTATS
    if ((PORT.BUYFUEL[$COLTS[$I][1]] = FALSE) and ((PORT.CLASS[$COLTS[$I][1]] <> 0) and (PORT.CLASS[$COLTS[$I][1]] <> 9)))
      send "p  t  * * *"
    end
  end
  send "w "
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~TWARPSUCCESS = TRUE)
    setvar $PLAYER~WARPTO $STARTING
    gosub :PLAYER~TWARP
    if ($PLAYER~TWARPSUCCESS = FALSE)
      setvar $SWITCHBOARD~MESSAGE "Can't get back!  Halting*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
    gosub :PLAYER~QUIKSTATS
  end
  add $I 1
end

halt
return
:DOCIM


setvar $SWITCHBOARD~MESSAGE "Entering the matrix...*"
gosub :SWITCHBOARD~SWITCHBOARD
send "^i?"
waitfor "<U> Unexplored Sectors"
send "r?"
waitfor "<U> Unexplored Sectors"
send "q"
setvar $SWITCHBOARD~MESSAGE "Cim downlaod complete..*"
gosub :SWITCHBOARD~SWITCHBOARD

return
:BUYCOLT

gosub :PLAYER~QUIKSTATS
setvar $ORIGSHIP $PLAYER~SHIP_NUMBER
setvar $LOCATION $PLAYER~CURRENT_PROMPT
if ($LOCATION <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Start from Command Prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send "d"
waitfor "Sector  :"
settextlinetrigger STARDOCK2 :STARDOCK2 "Ports   : Stargate Alpha I"
settextlinetrigger NOSTARDOCK2 :NOSTARDOCK2 "Warps to Sector(s) :"
pause
:NOSTARDOCK2
setvar $SWITCHBOARD~MESSAGE "Start at dock*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:STARDOCK2
killalltriggers


setvar $ORIGSHI $PLAYER~SHIP_NUMBER
if ($PLAYER~CREDITS < 565000)
  setvar $SWITCHBOARD~MESSAGE "Need 565k for Colt, 120 holds, twarp and torp*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
send "pssbnyfyc1234512345***sq"

waitfor "vailable Ships in Orbit"
settextlinetrigger THESHIP :THESHIP 1234512345
pause
:THESHIP
getword CURRENTLINE $SHIPNUM 1
killalltriggers

send "qqx*" $SHIPNUM "*qpss"
waitfor "You walk past row after row of space ships"
send "ryShip " $SHIPNUM "*y"
send "pa120*yb200*c500*qqhrw1t1*qq"
waitfor "You return to your ship and blast off from the StarDock."
send "x*" $ORIGSHIP "**"
setvar $SWITCHBOARD~MESSAGE "Colt purchased.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
return
:STRIPCASH


gosub :PLAYER~QUIKSTATS
setvar $LOCATION $PLAYER~CURRENT_PROMPT
if ($LOCATION <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Start from Command Prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end



send "t"
setvar $GO 1
setvar $I 1
while ($GO = 1)
  send "c"
  setvar $Y 1
  while ($Y < $I)
    send "nm"
    add $Y 1
  end
  waitfor "Exchange with"
  send "yf"
  settextlinetrigger CASH :CASH "credits, and"
  settextlinetrigger CASHDONE :CASHDONE "You may only be on one Corp at a time"
  pause
  :CASHDONE
  killalltriggers
  send "* * * * * * * * * "
  setvar $SWITCHBOARD~MESSAGE "Cash Strip Complete.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
  :CASH
  killalltriggers
  gettext CURRENTLINE $DECASH " has " "."
  striptext $DECASH ","
  striptext $DECASH " "
  if ($DECASH > 11000)
    setvar $DECASH ($DECASH - 5000)
    send $DECASH&"*"
  else
    setvar $DECASH 0
    send "*"
  end

  add $I 1
  if ($I > 10)
    send "* * * "
    halt
  end
end

return
:BUYDORA


gosub :ATDOCKINMERCH

send "pssbyymycDora The Explorer**pa30*yqqhrhqspb3000*qqq"
waitfor "You return to your ship and blast off from the StarDock"
send "tfyf450*fnyf450** * * "
setvar $SWITCHBOARD~MESSAGE "Should be in Orion.*"
gosub :SWITCHBOARD~SWITCHBOARD

setvar $SEC 1001
:PATHAGAIN
send "cf*" $SEC "*q"

settextlinetrigger SHORTEST :SHORTEST "The shortest path"
pause
:SHORTEST
killalltriggers
getword CURRENTLINE $HOPS 4
striptext $HOPS "("
if ($HOPS < 8)
  add $SEC 1
  waitfor "<Computer deactivated>"
  goto :PATHAGAIN
else

  settextlinetrigger THEPATH :THEPATH " > "
  pause
  :THEPATH
  killalltriggers
  getword CURRENTLINE $WHERETO 11
  striptext $WHERETO ")"
  striptext $WHERETO "("
  setvar $BOT~COMMAND "mow"
  setvar $BOT~USER_COMMAND_LINE " mow "&$WHERETO
  setvar $BOT~PARM1 $WHERETO
  savevar $BOT~PARM1
  savevar $BOT~COMMAND
  savevar $BOT~USER_COMMAND_LINE
  load "scripts\mombot\modes\grid\mow.cts"
  seteventtrigger MOWENDED :MOWENDED "SCRIPT STOPPED" "scripts\mombot\modes\grid\mow.cts"
  pause
  :MOWENDED
  send "'" $SWITCHBOARD~BOT_NAME " dora 2000 none ports*"
  halt
end


halt

return
:BUYCORP


gosub :ATDOCKINMERCH
if ($PLAYER~CREDITS < 350000)
  setvar $SWITCHBOARD~MESSAGE "Need 350k cash to get flag.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send "pssbyyey"
settextlinetrigger FLAGOK :FLAGOK "What do you want to name this ship?"
settextlinetrigger FLAGNOTOK :FLAGNOTOK "Only Corporate Chairs can purchase this ship!"
pause
:FLAGNOTOK
killalltriggers
send "q q "
setvar $SWITCHBOARD~MESSAGE "You're not the CEO!.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:FLAGOK
killalltriggers
send "The Bossman**pa130*yb99*qqhrhw2qq"
waitfor "u return to your ship and blast off from the St"
send "t f y f 900* * * * "
send "t f n y f 900*  * * * * * * * * * "
send "t f n n y f  900* * * * * * * * * * "
send "t f n n n y f  900* * * * * * * * * * "
send "t f n n n n y f  900* * * * * * * * * * "

setvar $SWITCHBOARD~MESSAGE "Should be in flaggy.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt

return
:SELLSHIP


gosub :ATDOCKINMERCH

send "pssbyybycSitInIt**qq"
waitfor "You return to your ship and blast off from the StarDock"
setvar $SWITCHBOARD~MESSAGE "Ship sold, cash on me.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt

return
:ATDOCKINMERCH

gosub :PLAYER~QUIKSTATS
setvar $LOCATION $PLAYER~CURRENT_PROMPT
if ($LOCATION <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Start from Command Prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
send "i"
waitfor "Ship Name      :"
settextlinetrigger MERCH :MERCH "Merchant Cruiser"
settextlinetrigger NOMERCH :NOMERCH "Credits        :"
pause
:NOMERCH
setvar $SWITCHBOARD~MESSAGE "Start at dock, in day 1 merch.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:MERCH
killalltriggers
send "d"
waitfor "Sector  :"
settextlinetrigger STARDOCK :STARDOCK "Ports   : Stargate Alpha I"
settextlinetrigger NOSTARDOCK :NOSTARDOCK "Warps to Sector(s) :"
pause
:NOSTARDOCK
setvar $SWITCHBOARD~MESSAGE "Start at dock, in day 1 merch*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:STARDOCK
killalltriggers

return

# includes:
include "source\include\BOT"
include "source\include\SWITCHBOARD"
include "source\include\PLAYER"
