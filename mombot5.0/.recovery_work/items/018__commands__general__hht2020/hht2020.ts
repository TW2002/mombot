gosub :BOT~LOADVARS
loadvar $SWITCHBOARD~BOT_NAME
loadvar $BOT~CORPPASSWORD
loadvar $PLAYER~CORPNUMBER

setvar $BOT~HELP[1] $BOT~TAB&"    hht2020 [command]"
setvar $BOT~HELP[2] $BOT~TAB&"        "
setvar $BOT~HELP[3] $BOT~TAB&"    stripfig n - sells your ship and sits you in scout"
setvar $BOT~HELP[4] $BOT~TAB&"    stripcash - strips cash from corp mates (11k+ req)"
setvar $BOT~HELP[5] $BOT~TAB&"    buycorp   - buys Lucifer's Limo (corp) "
setvar $BOT~HELP[6] $BOT~TAB&"    updora     - Upgrades Your Pumpkin to Dora "
setvar $BOT~HELP[7] $BOT~TAB&"    buycolt   - buys Dracula's Coffin (colt) "
setvar $BOT~HELP[8] $BOT~TAB&"    movecolt  - moves Colts to sectors  "
setvar $BOT~HELP[9] $BOT~TAB&"                  >movecolt 95 16822 87 "
setvar $BOT~HELP[10] $BOT~TAB&"    grabcolo  - fills any Colt in sector with colos "
setvar $BOT~HELP[11] $BOT~TAB&"    docim     - downloads port/warp data "
setvar $BOT~HELP[12] $BOT~TAB&"    gopod     - Goto pod sector at start of game"
setvar $BOT~HELP[13] $BOT~TAB&"    masterpod - MD: Will pod corpies in sector"
setvar $BOT~HELP[14] $BOT~TAB&"                everyone assembles with gopod, MD runs this"
setvar $BOT~HELP[15] $BOT~TAB&"                masterpod person runs this"
setvar $BOT~HELP[16] $BOT~TAB&"    class0   - Search database for potenial class 0s"


gosub :BOT~HELPFILE

setvar $BOT~SCRIPT_TITLE "HHT2020 Utilities"

gosub :BOT~BANNER

setvar $PODPEOPLE[1] "ham"
setvar $PODPEOPLE[2] "kane"
setvar $PODPEOPLE[3] "r2"
setvar $PODPEOPLE[4] "ob"
setvar $PODPEOPLEI 4

setvar $PODPEOPLEOK 0



if ($BOT~PARM1 = "class0")
  gosub :FINDCLASSOHS
  halt
end

if ($BOT~PARM1 = "crazymow")
  gosub :CRAZYMOW
  halt
end

if ($BOT~PARM1 = "gopod")
  gosub :GOPOD
  halt
end


if ($BOT~PARM1 = "preppod")
  gosub :PREPPOD
  halt
end

if ($BOT~PARM1 = "masterpod")

  gosub :MASTERPOD
  halt
end

if ($BOT~PARM1 = "waitandmow")
  gosub :WAITANDMOW
  halt
end

if ($BOT~PARM1 = "stripfig")
  setvar $FIGSREQUIRED $BOT~PARM2
  gosub :STRIPFIG
  halt
end

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


if ($BOT~PARM1 = "updora")
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

setvar $SWITCHBOARD~MESSAGE "Strewth mate, if you've got ere you've gone walkabout. Have a yarn with the help file and see whats what.*"
gosub :SWITCHBOARD~SWITCHBOARD

halt
:FINDCLASSOHS




setvar $I 11
while ($I <= 10000)
  setvar $NOFIG 0
  if (SECTOR.WARPCOUNT[$I] >= 1)
    setvar $ADJ 1
    while ($ADJ <= SECTOR.WARPCOUNT[$I])
      setvar $ADJSECTOR SECTOR.WARPS[$I][$ADJ]
      if ($ADJSECTOR = 6)
        send "'Potenial Alpha: " $I " has " SECTOR.WARPCOUNT[$I] " warps*"
      end
      if ($ADJSECTOR = 8)
        echo "'Potenial Rylos: " $I " has " SECTOR.WARPCOUNT[$I] " warps*"
      end
      add $ADJ 1
    end
  end
  add $I 1
end
halt
return
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
settextlinetrigger FOUNDCOLT :FOUNDCOLT "  0  Dracula's Coffin"
settextlinetrigger NOMORE :NOMORE "Choose which ship to tow (Q=Quit)"
settextlinetrigger NOMORE2 :NOMORE "You do not own any other ships in this sector!"
pause
:FOUNDCOLT
getword CURRENTLINE $SHIPNUMBER 1
add $COLTS 1
setvar $COLTS[$COLTS] $SHIPNUMBER
settextlinetrigger FOUNDCOLT :FOUNDCOLT "  0  Dracula's Coffin"
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
settextlinetrigger FOUNDCOLT :FOUNDCOLTMOVE "  0  Dracula's Coffin"
settextlinetrigger NOMORE :NOMOREMOVE "Choose which ship to tow (Q=Quit)"
settextlinetrigger NOMORE2 :NOMOREMOVE "You do not own any other ships in this sector!"
pause
:FOUNDCOLTMOVE
getword CURRENTLINE $SHIPNUMBER 1
add $COLTS 1
setvar $COLTS[$COLTS] $SHIPNUMBER
settextlinetrigger FOUNDCOLT :FOUNDCOLT "  0  Dracula's Coffin"
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
settextlinetrigger STARDOCK2 :STARDOCK2 "Ports   : Haunted Circuit City"
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

send "psspa55*yqqhrhqspb3000*qqq"
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
  load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
  seteventtrigger MOWENDED :MOWENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
  pause
  :MOWENDED
  send "'" $SWITCHBOARD~BOT_NAME " dora 1400 all ports mcicbuy*"
  halt
end


halt

return
:BUYCORP


gosub :ATDOCKINMERCH
if ($PLAYER~CREDITS < 1200000)
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
send "The Bossman**pa155*yb199*qqhrhw2qq"
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


setvar $SWITCHBOARD~MESSAGE "Retired.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
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
settextlinetrigger MERCH :MERCH "Pumpkin Seed"
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
settextlinetrigger STARDOCK :STARDOCK "Ports   : Haunted Circuit City"
settextlinetrigger NOSTARDOCK :NOSTARDOCK "Warps to Sector(s) :"
pause
:NOSTARDOCK
setvar $SWITCHBOARD~MESSAGE "Start at dock, in day 1 merch*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:STARDOCK
killalltriggers

return
:WAITANDMOW
send "co*cq"
send "nq"
settextlinetrigger GETDOCKWAIT :GETDOCKWAIT "(S) Sector  :"
pause
:GETDOCKWAIT
killalltriggers
getword CURRENTLINE $STARDOCK 4

setvar $TOWSHIP $BOT~PARM2
send "wn" $TOWSHIP "*"

setdelaytrigger BRIEFWAIT :BRIEFWAIT 2000
pause
:BRIEFWAIT
setvar $MOW~DESTINATION $STARDOCK
setvar $MOW~DEPLOY 0
gosub :MOW~RUN


gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_SECTOR <> $STARDOCK)
  halt
end

send "x* " $TOWSHIP "* * "
setvar $FIGSREQUIRED 2000
gosub :PLAYER~QUIKSTATS

send "cv0*yyq"
setvar $BOT~COMMAND "reboot"
setvar $BOT~USER_COMMAND_LINE " reboot "
setvar $BOT~PARM1 ""
setvar $BOT~PARM2 ""
savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\reboot.cts"
seteventtrigger REBOOTDONE :REBOOTDONE "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\reboot.cts"
pause
:REBOOTDONE
killalltriggers
return
:MASTERPOD


gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_PROMPT <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Need to be at Command Prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send "tt.**q"

send "i"
settextlinetrigger GETCORP :GETCORP "Corp           #"
pause
:GETCORP
getword CURRENTLINE $CORPNUM 3
striptext $CORPNUM ","
gosub :PLAYER~QUIKSTATS

setvar $SECS 0
setvar $SECI 0
send "d"
settextlinetrigger GETWARPS :GETWARPS "Warps to Sector(s) :"
pause
:GETWARPS

setvar $STUFF CURRENTLINE&" done"
setvar $Y 5
setvar $GO 1
while ($GO = 1)
  getword $STUFF $WARP $Y
  if ($WARP = "done")
    setvar $GO 0
  elseif ($WARP <> "-")
    striptext $WARP "("
    striptext $WARP ")"
    add $SECI 1
    setvar $SECS[$SECI] $WARP
  end

  add $Y 1
  if ($Y > 50)
    setvar $GO 0
  end
end


setvar $I 1
while ($I <= $SECI)

  send "cf" $PLAYER~CURRENT_SECTOR "*" $SECS[$I] "*q"
  send "cf" $SECS[$I] "*" $PLAYER~CURRENT_SECTOR "*q"


  add $I 1
end
send "^q"
waitfor ": ENDINTERROG"


setvar $PLAYER~SURROUNDFIGS 1
gosub :GRID~SURROUND
send "tt.**q"

setvar $CURRENTSEC $PLAYER~CURRENT_SECTOR

setvar $I 1
while ($I <= SECTOR.WARPCOUNT[$CURRENTSEC])
  setvar $CSEC SECTOR.WARPS[$CURRENTSEC][$I]
  getsectorparameter $CSEC "FIGSEC" $HASFIG

  if ($HASFIG <> 1)
    setvar $MOW~DESTINATION $CSEC
    setvar $MOW~DEPLOY 1
    gosub :MOW~RUN

    setvar $MOW~DESTINATION $CURRENTSEC
    setvar $MOW~DEPLOY 1
    gosub :MOW~RUN
  end
  add $I 1
end

setvar $PODI 1
while ($PODI <= $PODPEOPLEI)
  if ($PODPEOPLE[$PODI] = $SWITCHBOARD~BOT_NAME)

    gosub :PREPPOD
    :MACAGAIN
    send "'" $PODPEOPLE[2] " mac ajyj1^Majnjyj1^M^Majnjnjyj1^M^M*"
    settextlinetrigger MACROWAIT :MACROWAIT "Macro Complete"
    setdelaytrigger MACROFAIL :MACROFAIL 1500
    pause
    :MACROFAIL
    killalltriggers
    goto :MACAGAIN
    :MACROWAIT
    killalltriggers
    send "'" $PODPEOPLE[$PODI] " corp join " $CORPNUM " " $BOT~CORPPASSWORD "*"
    waitfor "I joined the Corporation"

  else

    send "'" $PODPEOPLE[$PODI] " callout*"
    settextlinetrigger CORPMATE :CORPMAT " Sec:"
    setdelaytrigger CMTIMEOUT :CMTIMEOUT 3000
    pause
    :CMTIMEOUT
    killalltriggers
    send "'Corpie timed out, moving on*"
    goto :PODLOOPEND
    :CORPMAT
    killalltriggers
    setvar $PODPEOPLEOK[$PODI] 1

    cuttext CURRENTLINE $THEIRNAME 3 6
    gettext CURRENTLINE $THEIRSEC "Sec: " " Exp:"
    trim $THEIRNAME
    gettext CURRENTLINE $THEIRSHIP "Ship: " " Turns:"

    if ($THEIRSEC = $PLAYER~CURRENT_SECTOR)
      setvar $PODVICTIM $PODPEOPLE[$PODI]
      setvar $PODNAME $THEIRNAME
      gosub :PODPERSON
      send "'" $PODPEOPLE[$PODI] " corp join " $CORPNUM " " $BOT~CORPPASSWORD "*"
      waitfor "I joined the Corporation and Claimed my Ship Corporate!"

    else
      send "'their not in our sector!*"
    end
  end
  :PODLOOPEND

  add $PODI 1
end

send "f"
settextlinetrigger FIGTRIG1 :FIGTRIG1 "fighters available."
settextlinetrigger FIGTRIG2 :FIGTRIG2 "Your ship can support up to"
pause
:FIGTRIG1
getword CURRENTLINE $FIGSAVAIL 3
striptext $FIGSAVAIL ","
pause
:FIGTRIG2
getword CURRENTLINE $FIGSSUP 7
striptext $FIGSSUP ","
killalltriggers
if ($FIGSSUP < $FIGSAVAIL)
  setvar $DEP ($FIGSAVAIL - $FIGSSUP)
  send $DEP "*cd"
else
  if ($FIGSAVAIL > 0)
    send "1*cd"
  else
    send "0*"
  end
end

send "co*cq"

setvar $SHIPS ""
setvar $SHIPSI 0

send "wn*"
waitfor "-------------------------"
settextlinetrigger TOWLINE :TOWLINE 0
settextlinetrigger TOWDONE :TOWDONE "Choose which ship to tow"
pause
:TOWLINE
add $SHIPI 1
getword CURRENTLINE $SHIP 1
setvar $SHIPS[$SHIPI] $SHIP

settextlinetrigger TOWLINE :TOWLINE 0
pause
:TOWDONE
killalltriggers

send "wn" $SHIPS[1] "*"

setvar $Y 2

setvar $PODI 1
while ($PODI <= $PODPEOPLEI)
  if ($PODPEOPLEOK[$PODI] = 1)

    send "'" $PODPEOPLE[$PODI] " hht2020 waitandmow " $SHIPS[$Y] "*"
    add $Y 1
  end
  add $PODI 1
end
send "nq"
settextlinetrigger GETDOCKWAIT2 :GETDOCKWAIT2 "(S) Sector  :"
pause
:GETDOCKWAIT2
killalltriggers
getword CURRENTLINE $STARDOCK 4

setvar $MOW~DESTINATION $STARDOCK
setvar $MOW~DEPLOY 1
gosub :MOW~RUN

setvar $I 1
while ($I < 50)
  send "a z 10* "
  add $I 1
end
send "* * n s **"


gosub :PLAYER~QUIKSTATS
if ($PLAYER~CURRENT_SECTOR <> $STARDOCK)
  halt
end

echo "BRIEF PAUSE WHiLE WE LET CORPIES ARRIVE*"
echo "BRIEF PAUSE WHiLE WE LET CORPIES ARRIVE*"

setdelaytrigger WAITFORCORPS :WAITFORCORPS 2000
pause
:WAITFORCORPS

send "x* " $SHIPS[1] "* * "
setvar $FIGSREQUIRED 2000
gosub :PLAYER~QUIKSTATS
gosub :STRIPFIG




return
:PODPERSON






send "'" $PODVICTIM " hht2020 preppod*"
settextlinetrigger VICTIMREADY :VICTIMREADY "{"&$PODVICTIM&"} - Ready to be podded."
setdelaytrigger VICTIMELOST :VICTIMELOST 4000
pause
:VICTIMELOST
killalltriggers
setvar $SWITCHBOARD~MESSAGE "Victime didn't respond... moving on*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:VICTIMREADY
killalltriggers

send "a"
waitfor "<Attack>"
:ATTACKCONT

settexttrigger ATT :ATT "(Y/N) [N]?"
settexttrigger ENDATT :ENDATT "Command ["
pause
:ATT
killalltriggers

gettext CURRENTLINE $TEMPNAME "Attack " "'s"
getlength $TEMPNAME $LEN
if ($LEN > 6)
  setvar $TEMP $TEMPNAME
  cuttext $TEMP $TEMPNAME 1 6
end

gettext CURRENTLINE $SHIPTYPE "'s " " ("
getword $SHIPTYPE $SHIP 1

if ($SHIP = "unmanned")
  send "n"
  goto :ATTACKCONT
end

getwordpos $SHIP $POS "umpkin"
if (($POS > 0) and ($TEMPNAME = $THEIRNAME))
  gettext CURRENTLINE $FIGCOUNT "-" ") ("
  if ($FIGCOUNT = 0)
    send "y1*"
    return
  else
    echo "PROBLME THEY HAVE FIGS!!"
    echo "'This person has figs, should not!*"
    send "* * * * *"
    return
  end
else
  send "n"
  goto :ATTACKCONT
end
:ENDATT
killalltriggers
return
return
:PREPPOD



gosub :PLAYER~QUIKSTATS
send "f"
settextlinetrigger DEPLOYFIG :DEPLOYFIG " fighters available."
pause
:DEPLOYFIG
killalltriggers
getword CURRENTLINE $FIGS 3
striptext $FIGS ","
if ($FIGS = 0)
  send "0*"
else
  send $FIGS "*cd"
end
setvar $BOT~COMMAND "corp"
setvar $BOT~USER_COMMAND_LINE " corp drop "
setvar $BOT~PARM1 "drop"
setvar $BOT~PARM2 ""
savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\corp.cts"
seteventtrigger DROPCORP :DROPCORP "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\corp.cts"
pause
:DROPCORP
killalltriggers

setvar $SWITCHBOARD~MESSAGE "Ready to be podded.*"
gosub :SWITCHBOARD~SWITCHBOARD

return
:GOPOD




gosub :PLAYER~QUIKSTATS

if ($PLAYER~CURRENT_PROMPT <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Need to be at Command Prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send "v"
send "nq"
settextlinetrigger GETBACKDOCKGOPOD :GETBACKDOCKGOPOD "(S) Sector  :"
pause
:GETBACKDOCKGOPOD
killalltriggers
getword CURRENTLINE $STARDOCK 4




send "cr*q"
settextlinetrigger SEC1FIGS :SEC1FIGS "B  Fighters        :"
pause
:SEC1FIGS
killalltriggers
getword CURRENTLINE $MAXFIGS 8
subtract $MAXFIGS 200
if ($MAXFIGS > 250)
  setvar $MAXFIGS 250
end

if ($MAXFIGS > 0)
  send "ptb" $MAXFIGS "*q"
end

send "cv0*yyq"

setvar $PLAYER~DESTINATION $STARDOCK
gosub :VOIDFIRSTNOTFED

setvar $GO 1
while ($GO = 1)
  gosub :GETWARPANDAVOID

  if ($VOIDFOUND = 0)
    setvar $GO 0
  end
end

setvar $COURSE ""
setvar $BACKDOORROUTE ""
setvar $BACKDOORROUTEI 0
setvar $TERRAROUTE ""
setvar $TERRAROUTEI 0

send "cf1*" $STARDOCK "*q"
waitfor "The shortest path"
settextlinetrigger BDROUTE1 :BDROUTE1 ">"
settextlinetrigger BDROUTE2 :BDROUTE2 "command ["
pause
:BDROUTE1
setvar $COURSE $COURSE&" "&CURRENTLINE
settextlinetrigger BDROUTE1 :BDROUTE1 ">"
pause
:BDROUTE2
killalltriggers
setvar $COURSE $COURSE&" done"
setvar $Y 1
setvar $GO 1
while ($GO = 1)

  getword $COURSE $WARP $Y
  if ($WARP = "done")
    setvar $GO 0
  elseif ($WARP <> ">")
    striptext $WARP "("
    striptext $WARP ")"
    add $BACKDOORROUTEI 1
    setvar $BACKDOORROUTE[$BACKDOORROUTEI] $WARP
  end
  add $Y 1
  if ($Y > 50)
    setvar $GO 0
  end
end
setvar $VOIDI ($BACKDOORROUTEI - 2)
setvar $BACKDOORI ($BACKDOORROUTEI - 1)

setvar $GO 1
while ($GO = 1)
  :TRYVOIDAGAIN
  setvar $COURSE ""
  send "cv" $BACKDOORROUTE[$VOIDI] "*q"
  send "cf" $BACKDOORROUTE[$BACKDOORI] "*1*q"
  settextlinetrigger BADRETURNROUTE :BADRETURNROUTE "Error - No route within"
  settextlinetrigger GOODRETURNROUTE :GOODRETURNROUTE "The shortest path"
  pause
  :BADRETURNROUTE
  killalltriggers
  send "nq"
  send "cv0*yn" $BACKDOORROUTE[$VOIDI] "*q"
  setvar $VOIDI ($VOIDI - 1)
  setvar $BACKDOORI ($BACKDOORI - 1)
  goto :TRYVOIDAGAIN
  :GOODRETURNROUTE

  killalltriggers

  settextlinetrigger BDROUTE3 :BDROUTE3 ">"
  settextlinetrigger BDROUTE4 :BDROUTE4 "command ["
  pause
  :BDROUTE3

  setvar $COURSE $COURSE&" "&CURRENTLINE
  settextlinetrigger BDROUTE3 :BDROUTE3 ">"
  pause
  :BDROUTE4
  killalltriggers
  setvar $COURSE $COURSE&" done"
  setvar $Y 1
  setvar $GO2 1
  while ($GO2 = 1)

    getword $COURSE $WARP $Y
    if ($WARP = "done")
      setvar $GO2 0
    elseif ($WARP <> ">")
      striptext $WARP "("
      striptext $WARP ")"
      add $TERRAROUTEI 1
      setvar $TERRAROUTE[$TERRAROUTEI] $WARP
    end

    add $Y 1
    if ($Y > 50)
      setvar $GO2 0
    end
  end



  setvar $DESTSECTOR $TERRAROUTE[3]
  setvar $GO 0
end

setvar $MOW~DESTINATION $DESTSECTOR
setvar $MOW~DEPLOY 1
gosub :MOW~RUN

killalltriggers


return
:CRAZYMOW




gosub :PLAYER~QUIKSTATS

if ($PLAYER~CURRENT_PROMPT <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Need to be at Command Prompt.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send "v"
settextlinetrigger GETBACKDOCKCRAZY :GETBACKDOCKCRAZY "The StarDock is located in sector"
pause
:GETBACKDOCKCRAZY
killalltriggers
getword CURRENTLINE $STARDOCK 7
striptext $STARDOCK "."





setdelaytrigger CRAZYSTARTDELAY :CRAZYSTARTDELAY 3000
:CRAZYSTARTDELAY
killalltriggers


send "lt2*"


send "cr*q"
settextlinetrigger SEC1FIGS2 :SEC1FIGS2 "B  Fighters        :"
pause
:SEC1FIGS2
killalltriggers
getword CURRENTLINE $MAXFIGS 8
subtract $MAXFIGS 100
if ($MAXFIGS > 0)
  send "ptb" $MAXFIGS "*q"
end



send "cv0*yyq"

setvar $TARGETS 0
setvar $TARGETI 0
setvar $TARGETDONE 0

setvar $TOTALTARGETS 0
setvar $TOTALDONE 0

setvar $SENT 0

setvar $I 11
while ($I < 51)

  send "cf1*" $I "*q"
  add $SENT 1
  add $I 1
end
gosub :CRAZYGETTARGETS
setvar $SENT 0

setvar $I 51
while ($I < 91)

  send "cf1*" $I "*q"
  add $SENT 1
  add $I 1
end
gosub :CRAZYGETTARGETS


setvar $PLAYER~DESTINATION $STARDOCK
setvar $GO 1
while ($GO = 1)
  gosub :GETWARPANDAVOID

  if ($VOIDFOUND = 0)
    setvar $GO 0
  end
end

setvar $JETTISONDONE 0

setvar $I 1
while ($I <= $TARGETI)

  setvar $BOT~COMMAND "mow"
  setvar $BOT~USER_COMMAND_LINE " mow "&$TARGETS[$I]&" 1 "
  setvar $BOT~PARM1 $TARGETS[$I]
  setvar $BOT~PARM2 1
  savevar $BOT~PARM1
  savevar $BOT~PARM2
  savevar $BOT~COMMAND
  savevar $BOT~USER_COMMAND_LINE
  load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
  seteventtrigger MOWCRAZYEND2 :MOWCRAZYEND2 "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
  pause
  :MOWCRAZYEND2
  killalltriggers

  send "i"
  settextlinetrigger CRAZYMOWPOD :CRAZYMOWPOD "*Pumpkin Seed*"
  settextlinetrigger CRAZYMOWNOPOD :CRAZYMOWNOPOD "Total Holds    :"
  pause
  :CRAZYMOWPOD
  killalltriggers
  send "pzt"
  send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
  send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
  send "'ALERT I'VE BEEN PODED! MAY be AFK! HELP*"
  halt
  :CRAZYMOWNOPOD
  killalltriggers

  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_SECTOR <> $TARGETS[$I])
    send "'Didn't make mow sector.. going on still*"
  end

  gosub :PLAYER~QUIKSTATS
  if ($JETTISONDONE = 0)
    send "d"

    if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR])
      setvar $JETTISONDONE 1
      send "o210*q"
      send "jy"

      send "tt.**q"
      waitfor "Corporate command ["
      waitfor "Command ["
      send "'all watcher*"
    end
  end
  if ($PLAYER~FIGHTERS < 50)
    setvar $SWITCHBOARD~MESSAGE "Running low on figs, halting*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end

  add $I 1
end

send "'FIRE CRAZY MOW COMPELTE - WHO EVER DID THIS IS A SUCKER - bwahahah!*"

halt


setvar $TOTALTARGETS $TARGETI

setvar $TOTALDONE 1
setvar $SHORTESTTARGET 99999

while ($TOTALDONE <= $TOTALTARGETS)
  setvar $SHORTESTTARGET 99999

  if ($TOTALDONE = $TOTALTARGETS)
    echo "LAST TARGET!"
    setvar $I 1
    while ($I <= $TOTALTARGETS)

      if ($TARGETDONE[$I] = 0)
        setvar $SHORTESTTARGET $TARGETS[$I]
      end
      add $I 1
    end
  else
    gosub :CRAZYGETCLOSET
  end
  echo "TARGET" $TOTALDONE ": " $SHORTESTTARGET "*"
  :DOMOW

  setvar $BOT~COMMAND "mow"
  setvar $BOT~USER_COMMAND_LINE " mow "&$SHORTESTTARGET&" 1 "
  setvar $BOT~PARM1 $SHORTESTTARGET
  setvar $BOT~PARM2 1
  savevar $BOT~PARM1
  savevar $BOT~PARM2
  savevar $BOT~COMMAND
  savevar $BOT~USER_COMMAND_LINE
  load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
  seteventtrigger MOWCRAZYEND :MOWCRAZYEND "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\modes\grid\mow.cts"
  pause
  :MOWCRAZYEND
  killalltriggers




  if (PORT.EXISTS[$PLAYER~CURRENT_SECTOR] and ($DOCRAZYALIGN = 1))
    setvar $DOCRAZYALIGN 0
    send "o120*q"
  end
  if ($TOTALDONE = 1)
    send "jy*"
  end
  add $TOTALDONE 1
end

send "f1*cd"
send "pztn"
send "'FIRE CRAZY MOW COMPELTE - WHO EVER DID THIS IS A SUCKER - bwahahah!*"

halt


return
:CRAZYGETTARGETS


setvar $Y 1
while ($Y <= $SENT)
  settextlinetrigger CMOWPLOT :CMOWPLOT "The shortest path "
  pause
  :CMOWPLOT
  killalltriggers
  getword CURRENTLINE $CDIST 4
  striptext $CDIST "("
  getword CURRENTLINE $CSECTOR 13
  if ($CDIST > 15)
    add $TARGETI 1
    setvar $TARGETS[$TARGETI] $CSECTOR
    setvar $TARGETDONE[$TARGETI] 0
  end
  add $Y 1
end
return
:CRAZYGETCLOSET


setvar $SHORTESTDIST 99
setvar $SHORTESTTARGET 99999

setvar $I 1
while ($I <= $TARGETI)

  if ($TARGETDONE[$I] = 0)
    send "cf*" $TARGETS[$I] "*q"
  end
  add $I 1
end
send "^q"
:CRAZYCLOSESTWAITMORE

settextlinetrigger CRAZYSHORTESTPATH :CRAZYSHORTESTPATH "The shortest path "
settextlinetrigger CRAZYENDINTERROG :CRAZYENDINTERROG "ENDINTERROG"
pause
:CRAZYSHORTESTPATH
killalltriggers
getword CURRENTLINE $CSHORT 4
getword CURRENTLINE $CSECTOR 13
striptext $CSHORT "("
if ($CSHORT < $SHORTESTDIST)
  setvar $SHORTESTDIST $CSHORT
  setvar $SHORTESTTARGET $CSECTOR
  echo "Setting shortest:" $CSHORT " to sector " $CSECTOR "*"
end
goto :CRAZYCLOSESTWAITMORE
:CRAZYENDINTERROG

killalltriggers

setvar $I 1
while ($I <= $TARGETI)

  if ($TARGETS[$I] = $SHORTESTTARGET)
    setvar $TARGETDONE[$I] 1
  end
  add $I 1
end


return
:GETWARPANDAVOID

setvar $VOIDFOUND 0
send "cf" $PLAYER~DESTINATION "*" $PLAYER~CURRENT_SECTOR "*q"
settextlinetrigger VOID1 :VOID1 "The shortest path"
settextlinetrigger NOPATH :NOPATH "Error - No route within "
pause
:NOPATH
killalltriggers
send "nq"
return
:VOID1
killalltriggers
settextlinetrigger VOID2 :VOID2 ">"
pause
:VOID2
killalltriggers

getword CURRENTLINE $WARP1 3
striptext $WARP1 "("
striptext $WARP1 ")"
send "cv" $WARP1 "*q"
setvar $VOIDFOUND 1

return
:VOIDFIRSTNOTFED


send "cf" $PLAYER~CURRENT_SECTOR "*" $PLAYER~DESTINATION "*q"
setvar $COURSE ""
settextlinetrigger VOIDNOTFEDL :VOIDNOTFEDL "The shortest path"
settextlinetrigger NOINDIRECTFED :NOINDIRECTFED "Error - No route within"
pause
:NOINDIRECTFED
killalltriggers
send "yq"
setvar $SWITCHBOARD~MESSAGE "Not initial path, exiting.*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:VOIDNOTFEDL
killalltriggers
:KEEPADDINGFED
settextlinetrigger ADDCOURSEFED :ADDCOURSEFED ">"
settexttrigger ENDCOURSEFED :ENDCOURSEFED "Computer command ["
pause
:ADDCOURSEFED
killalltriggers
setvar $COURSE $COURSE&" "&CURRENTLINE
goto :KEEPADDINGFED
:ENDCOURSEFED
killalltriggers
setvar $PREVWARP ""
setvar $Y 1
setvar $GO 1
while ($GO = 1)

  getword $COURSE $WARP $Y
  if ($WARP <> ">")
    striptext $WARP "("
    striptext $WARP ")"
    if (($WARP > 10) and ($Y > 1))
      setvar $GO 0
      if ($WARP <> $PLAYER~DESTINATION)
        send "cv" $WARP "*q"
      end
    end

    setvar $PREVWARP $WARP
  end
  add $Y 1
  if ($Y > 50)
    setvar $GO 0
  end
end



return
:STRIPFIG



send "c;q"
settextlinetrigger GETMAXFIGS :GETMAXFIGS " Main Drive Cost: "
pause
:GETMAXFIGS
killalltriggers
getword CURRENTLINE $MAXFIGS 7
striptext $MAXFIGS ","

if ($MAXFIGS < $FIGSREQUIRED)
  setvar $FIGSREQUIRED $MAXFIGS
  setvar $SWITCHBOARD~MESSAGE "You want more figs than this ship holds so readjusting to "&$MAXFIGS&".*"
  gosub :SWITCHBOARD~SWITCHBOARD
end


setvar $HAVECORPIES 0
setvar $TOTALFIGS $PLAYER~FIGHTERS
setvar $FIGSTOTAKE ($FIGSREQUIRED - $TOTALFIGS)

if ($FIGSTOTAKE <= 0)
  setvar $SWITCHBOARD~MESSAGE "We already have equal or more than "&$FIGSREQUIRED&", exiting strip.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  return
end
if ($FIGSREQUIRED < 1)
  setvar $SWITCHBOARD~MESSAGE "We didn't specify how many fighters is required for stripFigs.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

send "t"
setvar $GO 1
setvar $I 1
while ($GO = 1)
  send "f"
  setvar $Y 1
  while ($Y < $I)
    send "nm"
    add $Y 1
  end

  if ($HAVECORPIES = 0)
    :WAITCORPIESFIGS

    settextlinetrigger NOCORPIESFIGS :NOCORPIESFIGS "Your Associate must be in the same sector to conduct transfers!"
    settexttrigger CORPIESFIGS :CORPIESFIGS "Exchange with"
    pause
    :NOCORPIESFIGS
    killalltriggers
    send "f"
    goto :WAITCORPIESFIGS
    :CORPIESFIGS
    killalltriggers
    setvar $HAVECORPIES 1
  else
    waitfor "Exchange with"
  end
  send "yf"
  settextlinetrigger FIGS :FIGS "fighters, and"
  settextlinetrigger FIGSDONE :FIGSDONE "You may only be on one Corp at a time"
  pause
  :FIGSDONE
  killalltriggers
  send "* * * * * * * * * "
  setvar $SWITCHBOARD~MESSAGE "Fig Strip Complete.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  return
  :FIGS
  killalltriggers
  gettext CURRENTLINE $DEFIG " has " "."
  striptext $DEFIG ","
  striptext $DEFIG " "

  if ($DEFIG > 0)
    if ($FIGSTOTAKE > $DEFIG)
      setvar $TAKEFIGS $DEFIG
      setvar $FIGSTOTAKE ($FIGSTOTAKE - $TAKEFIGS)
    else
      setvar $TAKEFIGS $FIGSTOTAKE
      setvar $FIGSTOTAKE 0
    end

    send $TAKEFIGS&"*"
  else
    setvar $DEFIG 0
    send "*"
  end

  if ($FIGSTOTAKE = 0)
    setvar $SWITCHBOARD~MESSAGE "Fig Strip Complete.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "* * * * * * * * * "
    return
  end
  add $I 1
  if ($I > 10)
    send "* * * "
    halt
  end
end

return

# includes:
include "include/BOT.ts"
include "include/BOT_2/BOT.ts"
include "include/BOT_3/BOT.ts"
include "include/BOT_4/BOT.ts"
include "include/SWITCHBOARD.ts"
include "include/BOT_5/BOT.ts"
include "include/BOT_6/BOT.ts"
include "include/PLAYER.ts"
include "include/PLAYER_2/PLAYER.ts"
include "include/PLAYER_3/PLAYER.ts"
include "include/SWITCHBOARD.ts"
include "include/BOT_5/BOT.ts"
include "include/PLAYER_4/PLAYER.ts"
include "include/GRID.ts"
include "include/SHIP.ts"
include "include/PLANET.ts"
include "include/MOW.ts"
