




gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE

loadvar $GAME~PORT_MAX
loadvar $GAME~PTRADESETTING
loadvar $GAME~MAX_PLANETS_IN_GAME
loadvar $BOT~FOLDER
loadvar $PLAYER~SURROUNDFIGS
loadvar $PLAYER~SURROUNDLIMP;
loadvar $PLAYER~SURROUNDMINE
loadvar $MAP~STARDOCK
loadvar $BOT~LIMP_FILE
loadvar $BOT~ARMID_FILE
loadvar $BOT~BOT_TURN_LIMIT
loadvar $BOT~BOT_NAME

setvar $HELP~HELP[1] $HELP~TAB&"       Marco Polo - Trade Route for PPTing"
setvar $HELP~HELP[2] $HELP~TAB&"       "
setvar $HELP~HELP[3] $HELP~TAB&" macro [trade/report] {turns} {filename.txt} "
setvar $HELP~HELP[4] $HELP~TAB&"                      "
setvar $HELP~HELP[5] $HELP~TAB&" trade  - indicates bot will trade the route"
setvar $HELP~HELP[6] $HELP~TAB&" report - indicates bot will write route to file"
setvar $HELP~HELP[7] $HELP~TAB&" "
setvar $HELP~HELP[8] $HELP~TAB&" {filename.txt} - can either be used as a source"
setvar $HELP~HELP[9] $HELP~TAB&"                  route or for writing to share."
setvar $HELP~HELP[10] $HELP~TAB&"  "
setvar $HELP~HELP[11] $HELP~TAB&" {turns}       - Compulsary when trade option used "
setvar $HELP~HELP[12] $HELP~TAB&"                 stops trading when reaching turns"
setvar $HELP~HELP[13] $HELP~TAB&"  "
setvar $HELP~HELP[14] $HELP~TAB&"  Marco requires pairs to have one ore seller."
setvar $HELP~HELP[15] $HELP~TAB&"  Please update CIM Ports/Warps and Figs."

gosub :HELP~HELPFILE


gosub :PLAYER~QUIKSTATS
setvar $STARTCREDITS $PLAYER~CREDITS
setvar $STARTTURNS $PLAYER~TURNS
setvar $STAT_PAIRS_TRADED 0
setvar $CASH_MADE 0
setvar $TURNS_TAKEN 0


setvar $MODE ""

setvar $TRADEMODE ""
setvar $CASHPAUSE 0
setarray $PORTSUSED SECTORS






setvar $PORTPAIRS 0
setvar $PORTPAIRSI 0

setvar $TOTALDIST 0
setvar $ONEORETOTALDIST 12
setvar $TWOORETOTALDIST 20











setvar $PORTS[1] "BBS"
setvar $PORTS[2] "BSB"
setvar $PORTS[3] "SBB"
setvar $PORTS[4] "SSB"
setvar $PORTS[5] "SBS"
setvar $PORTS[6] "BSS"
setvar $PORTS[7] "SSS"
setvar $PORTS[8] "BBB"

if (($BOT~PARM1 <> "trade") and ($BOT~PARM1 <> "report"))
  setvar $SWITCHBOARD~MESSAGE "First parameter should be trade or report.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
if ($BOT~PARM2 = 0)
  setvar $BOT~PARM2 ""
end

if ($BOT~PARM3 = 0)
  setvar $BOT~PARM3 ""
end

if ($BOT~PARM1 = "trade")
  setvar $MODE "trade"
  isnumber $TEST $BOT~PARM2
  if ($TEST)
    setvar $SWITCHBOARD~MESSAGE "We will stop when we reach "&$BOT~PARM2&" turns.*"
    gosub :SWITCHBOARD~SWITCHBOARD
  else
    setvar $SWITCHBOARD~MESSAGE "Halt turns must be greater than 0.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end

  setvar $HALT_TURNS $BOT~PARM2

  setvar $STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  if ($STARTINGLOCATION <> "Command")
    setvar $SWITCHBOARD~MESSAGE "must be started from Command prompt.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end

  if (($PLAYER~TWARP_TYPE <> 1) and ($PLAYER~TWARP_TYPE <> 2))
    setvar $SWITCHBOARD~MESSAGE "Requires T-Warp as we warp around.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end

  if (($PLAYER~ORE_HOLDS = 0) or ($PLAYER~ORGANIC_HOLDS > 0) or ($PLAYER~EQUIPMENT_HOLDS > 0) or ($PLAYER~COLONIST_HOLDS > 0))
    setvar $SWITCHBOARD~MESSAGE "Fuel in holds only please.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end

  if ($PLAYER~FIGHTERS < 100)
    setvar $SWITCHBOARD~MESSAGE "Less than 100 figs - are you mad?*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  send "cuyq"
  if ($PLAYER~TOTAL_HOLDS > 200)
    if ($PLAYER~CREDITS < 25000)
      setvar $SWITCHBOARD~MESSAGE "We have 200+ holds and less than 25k Creds - more Cash Please!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  elseif ($PLAYER~TOTAL_HOLDS > 150)
    if ($PLAYER~CREDITS < 20000)
      setvar $SWITCHBOARD~MESSAGE "We have 150+ holds and less than 20k Creds - more Cash Please!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  elseif ($PLAYER~TOTAL_HOLDS > 100)
    if ($PLAYER~CREDITS < 15000)
      setvar $SWITCHBOARD~MESSAGE "We have 100+ holds and less than 15k Creds - more Cash Please!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end
  else
    if ($PLAYER~CREDITS < 10000)
      setvar $SWITCHBOARD~MESSAGE "We need at least 10k Creds please!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
    end



  end
  setdelaytrigger DELAY :STARTPAUSE 1000
  pause
  :STARTPAUSE

  if ($BOT~PARM3 <> "")
    setvar $TRADEMODE "file"
    setvar $FREAD $BOT~FOLDER&"/"&$BOT~PARM3
    fileexists $EXISTS $FREAD
    if ($EXISTS)
      setarray $PAIRLIST SECTORS
      setvar $I 1
      setvar $PAIRI 1
      read $FREAD $PAIR $I
      while ($PAIR <> "EOF")

        if ($PAIR <> "")
          setvar $PAIRLIST[$PAIRI] $PAIR
          add $PAIRI 1
        end
        add $I 1
        read $FREAD $PAIR $I
      end
      setvar $TOTALPAIRS ($PAIRI - 1)
    end
    setvar $I 1
    setvar $PORTPAIRSI 0
    while ($I <= $TOTALPAIRS)
      add $PORTPAIRSI 1
      getword $PAIRLIST[$PORTPAIRSI] $PORTPAIRS[$I][1] 1
      getword $PAIRLIST[$PORTPAIRSI] $PORTPAIRS[$I][2] 2
      getword $PAIRLIST[$PORTPAIRSI] $PORTPAIRS[$I][3] 3
      getword $PAIRLIST[$PORTPAIRSI] $PORTPAIRS[$I][4] 4
      echo $PAIRLIST[$PORTPAIRSI] "*"
      add $I 1
    end
    echo "total pairs: " $TOTALPAIRS "*"

  else
    setvar $TRADEMODE "self"
    gosub :GETPAIRS
  end
else

  if ($BOT~PARM2 = "")
    setvar $SWITCHBOARD~MESSAGE "Filename not specified.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $SWITCHBOARD~MESSAGE "Writig to file: "&$BOT~PARM2&".*"
  gosub :SWITCHBOARD~SWITCHBOARD


  gosub :GETPAIRS
  setvar $FWRITE $BOT~FOLDER&"/"&$BOT~PARM2
  delete $FWRITE
  setvar $I 1
  while ($I <= $PORTPAIRSI)
    write $FWRITE $PORTPAIRS[$I][1]&" "&$PORTPAIRS[$I][2]&" "&$PORTPAIRS[$I][3]&" "&$PORTPAIRS[$I][4]&"*"
    add $I 1
  end

  setvar $SWITCHBOARD~MESSAGE "Written "&$PORTPAIRSI&" to file*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt






end
setvar $LOOPI 1
while ($LOOPI <= $PORTPAIRSI)
  setvar $SEC $PORTPAIRS[$LOOPI][1]
  setvar $PAIRSEC $PORTPAIRS[$LOOPI][2]
  setvar $SKIP FALSE
  if (PORT.EXISTS[$SEC] = 1)
    if (PORT.PERCENTEQUIP[$SEC] < 85)
      setvar $SKIP TRUE
    end
  end
  if (PORT.EXISTS[$PAIRSEC] = 1)
    if (PORT.PERCENTEQUIP[$PAIRSEC] < 85)
      setvar $SKIP TRUE
    end
  end
  if ($SKIP = TRUE)
    goto :NEXTLOOP
  end

  if ($PLAYER~TURNS < $HALT_TURNS)
    stop "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\cashing\ppt.cts"
    setvar $SWITCHBOARD~MESSAGE "Turns are low, halting!*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  if ($PLAYER~CURRENT_SECTOR <> $PAIRSEC)

    send "m" $SEC "*yn"
    settextlinetrigger CHECKPAIR2LOCKYES :CHECKPAIR2LOCKYES "Locating beam pinpointed, TransWarp"
    settextlinetrigger CHECKPAIR2LOCKNO :CHECKPAIR2LOCKNO "No locating beam found for sector"
    pause
    :CHECKPAIR2LOCKNO
    killalltriggers
    setvar $SWITCHBOARD~MESSAGE "Sector missing fig, moving onto next.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :NEXTLOOP
    :CHECKPAIR2LOCKYES
    killalltriggers

    setvar $PLAYER~WARPTO $PAIRSEC
    gosub :MOVE~TWARP
    if ($PLAYER~TWARPSUCCESS = FALSE)
      setvar $SWITCHBOARD~MESSAGE "Sector missing fig, moving onto next.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      goto :NEXTLOOP
    end
    gosub :PLAYER~QUIKSTATS
  end


  gosub :CHECKDIST
  send "d"
  waitfor "Warps to Sect"
  if ($CASHPAUSE = 1)
    if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
      if (PORT.BUYFUEL[CURRENTSECTOR] = FALSE)
        send "'[atm:" $SWITCHBOARD~BOT_NAME "=" CURRENTSECTOR "]*"
        waitfor "[atmdone]"
        send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
        setvar $CASHPAUSE 0
      end
    end
  end
  if (PORT.BUYFUEL[$PAIRSEC] = 1)

    gosub :BALANCETRADE
    if ($PORTPAIRS[$LOOPI][4] = 1)
      setvar $MOVE~MOVEINTOSECTOR $SEC
      gosub :MOVE~MOVEINTOSECTOR
    else
      setvar $PLAYER~WARPTO $SEC
      gosub :MOVE~TWARP
      if ($PLAYER~TWARPSUCCESS = FALSE)
        setvar $SWITCHBOARD~MESSAGE "Sector missing fig, moving onto next.*"
        gosub :SWITCHBOARD~SWITCHBOARD
        goto :NEXTLOOP
      end
    end
    gosub :PLAYER~QUIKSTATS
    send "d"
    waitfor "Warps to Sect"
    if ($CASHPAUSE = 1)
      if (PORT.EXISTS[CURRENTSECTOR] = TRUE)
        if (PORT.BUYFUEL[CURRENTSECTOR] = FALSE)
          send "'[atm:" $SWITCHBOARD~BOT_NAME "=" CURRENTSECTOR "]*"
          waitfor "[atmdone]"
          send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
          setvar $CASHPAUSE 0
        end
      end
    end
  end

  setvar $BEFORETRADECASH $PLAYER~CREDITS
  gosub :TRADEPAIR
  gosub :PLAYER~QUIKSTATS
  if ($BEFORETRADECASH = $PLAYER~CREDITS)
    setvar $SWITCHBOARD~MESSAGE "Something went wrong with that trade; didn't make any money.*"
    gosub :SWITCHBOARD~SWITCHBOARD
  end

  add $STAT_PAIRS_TRADED 1
  setvar $CASH_MADE ($PLAYER~CREDITS - $STARTCREDITS)
  setvar $TURNS_TAKEN ($STARTTURNS - $PLAYER~TURNS)

  setvar $SWITCHBOARD~MESSAGE "Pairs Traded: "&$STAT_PAIRS_TRADED&" Cash Made: "&$CASH_MADE&" Turns Taken: "&$TURNS_TAKEN&".*"
  gosub :SWITCHBOARD~SWITCHBOARD
  :NEXTLOOP

  add $LOOPI 1
end

halt
:BALANCETRADE


if ($PORTPAIRS[$LOOPI][4] > 1)
  setvar $OREREQ ($PORTPAIRS[$LOOPI][4] * 3)
else
  setvar $OREREQ 0
end

if ($OREREQ > $PLAYER~ORE_HOLDS)
  setvar $SWITCHBOARD~MESSAGE "Not enough fuel to keep trading.*"
  gosub :SWITCHBOARD~SWITCHBOARD
end


if (PORT.BUYORG[$SEC] = 1)
  setvar $PRODUCTTOBUY "org"
else
  setvar $PRODUCTTOBUY "equip"
end
setvar $SELLOREQUANT ($PLAYER~ORE_HOLDS - $OREREQ)

send "p   t"
waitfor "Commerce report for"

settextlinetrigger CHECKCASH :CHECKCASH "empty cargo holds"
settextlinetrigger PORTFAIL :PORTFAIL "ou don't have anything they want, and they don't have anything you can b"
pause
:PORTFAIL
setvar $SWITCHBOARD~MESSAGE "Oops nothing to trade; script fail*"
gosub :SWITCHBOARD~SWITCHBOARD
halt
:CHECKCASH
killalltriggers

killalltriggers
:TRADELOOP
settexttrigger SELL1 :SELL1 "How many holds of Fuel Ore do you want to sell"
settexttrigger SELL2 :SELL2 "How many holds of Organics do you want to sell"
settexttrigger SELL3 :SELL3 "How many holds of Equipment do you want to sell"
settexttrigger BUY1 :BUY1 "How many holds of Fuel Ore do you want to buy"
settexttrigger BUY2 :BUY2 "How many holds of Organics do you want to buy"
settexttrigger BUY3 :BUY3 "How many holds of Equipment do you want to buy"
settexttrigger TRADELOOPDONE :TRADELOOPDONE "Command ["
pause
:SELL1

killalltriggers
send $SELLOREQUANT "*"
gosub :DOTRADE
goto :TRADELOOP
:SELL2
killalltriggers
send "*"
gosub :DOTRADE
goto :TRADELOOP
:SELL3

killalltriggers
send "*"
gosub :DOTRADE
goto :TRADELOOP
:BUY1

killalltriggers
gosub :NOTRADE
goto :TRADELOOP
:BUY2
killalltriggers
if ($PRODUCTTOBUY = "org")
  send "*"
else
  gosub :NOTRADE
end
goto :TRADELOOP
:BUY3
killalltriggers
if ($PRODUCTTOBUY = "equip")
  send "*"
else
  gosub :NOTRADE
end
goto :TRADELOOP
:TRADELOOPDONE

killalltriggers

return
:DOTRADE

waitfor "Agreed,"
settextlinetrigger TRADEFIN :TRADEFIN "empty cargo holds"
pause
:TRADEFIN
return
:NOTRADE


send "0*"
waitfor "empty cargo holds."
return
:TRADEPAIR




if ($PLAYER~CURRENT_SECTOR = $PORTPAIRS[$LOOPI][1])
  setvar $TRADESEC $PORTPAIRS[$LOOPI][2]
elseif ($PLAYER~CURRENT_SECTOR = $PORTPAIRS[$LOOPI][2])
  setvar $TRADESEC $PORTPAIRS[$LOOPI][1]
else
  setvar $SWITCHBOARD~MESSAGE "We should be at one of the ports here, fail.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt

end
if (($PORTPAIRS[$LOOPI][3] = 1) and ($PORTPAIRS[$LOOPI][4] = 1))
  setvar $BOT~PARM1 $TRADESEC
  setvar $BOT~PARM2 "ore:"&$PLAYER~TOTAL_HOLDS
  setvar $BOT~PARM3 ""
else
  setvar $BOT~PARM1 $TRADESEC
  setvar $BOT~PARM2 "twarp"
  setvar $BOT~PARM3 "ore:"&$PLAYER~TOTAL_HOLDS
end
setvar $BOT~COMMAND "ppt"
setvar $BOT~USER_COMMAND_LINE $TRADESEC&" "&$BOT~PARM2&" "&$BOT~PARM3


savevar $BOT~PARM1
savevar $BOT~PARM2
savevar $BOT~PARM3

savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE

load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\cashing\ppt.cts"
:BACKPPTWAIT
settextlinetrigger PPTPAUSEFORCASH :PPTPAUSEFORCASH "[atm:"&$SWITCHBOARD~BOT_NAME&"]"
settextlinetrigger PPTMOVE :PPTMOVE "<Move>"
seteventtrigger PPTENDED :PPTENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\cashing\ppt.cts"
pause
:PPTPAUSEFORCASH
killalltriggers
setvar $CASHPAUSE 1
send "'[atm:ack] Will pause at next SXB post trading.*"
goto :BACKPPTWAIT
:PPTMOVE
killalltriggers
if ($PLAYER~TURNS < $HALT_TURNS)
  stop "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\cashing\ppt.cts"
  setvar $SWITCHBOARD~MESSAGE "Turns are low, halting!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
goto :BACKPPTWAIT
:PPTENDED
killalltriggers
gosub :PLAYER~QUIKSTATS


return
:CHECKDIST
:TRYAGAINPLOT1

send "cf" $PAIRSEC "*" $SEC "*q"
settextlinetrigger PATHGOOD1 :PATHGOOD1 "he shortest path"
settextlinetrigger PATHBAD1 :PATHBAD1 "No route within"
pause
:PATHBAD1
killalltriggers
send "yq"
setvar $PLOT 0
goto :TRYAGAINPLOT1
:PATHGOOD1
killalltriggers

getword CURRENTLINE $DIST2 4
striptext $DIST2 "("

send "cf" $SEC "*" $PAIRSEC "*q"
settextlinetrigger PATHGOOD2 :PATHGOOD2 "he shortest path"
settextlinetrigger PATHBAD2 :PATHBAD2 "No route within"
pause
:PATHBAD2
killalltriggers
send "yq"
setvar $PLOT 0
goto :TRYAGAINPLOT1
:PATHGOOD2
killalltriggers

getword CURRENTLINE $DIST1 4
striptext $DIST1 "("

setvar $PORTPAIRS[$LOOPI][3] $DIST1
setvar $PORTPAIRS[$LOOPI][4] $DIST2

return
:GETPAIRS


setvar $SWITCHBOARD~MESSAGE "Finding Pairs..*"
gosub :SWITCHBOARD~SWITCHBOARD



setvar $TOTALDIST $ONEORETOTALDIST

setvar $SEC 11
while ($SEC < SECTORS)

  if ($PORTSUSED[$SEC] = 0)
    setvar $CPORT PORT.CLASS[$SEC]
    getsectorparameter $SEC "FIGSEC" $HASFIG

    if (($HASFIG = 1) and (PORT.PERCENTEQUIP[$SEC] > 80))
      if ($CPORT = 5)
        setvar $TARGETA 2
        gosub :CHECKPAIRDIST
      elseif ($CPORT = 4)
        setvar $TARGETA 1
        gosub :CHECKPAIRDIST
      end
    end
  end
  add $SEC 1
end




echo "Two Ore Port " $TWOORETOTALDIST " total warps apart*"





setvar $TOTALDIST $TWOORETOTALDIST
setvar $SEC 11
while ($SEC < SECTORS)

  if ($PORTSUSED[$SEC] = 0)
    setvar $CPORT PORT.CLASS[$SEC]
    getsectorparameter $SEC "FIGSEC" $HASFIG
    if (($HASFIG = 1) and (PORT.PERCENTEQUIP[$SEC] > 80))
      if ($CPORT = 5)
        setvar $TARGETA 4

        gosub :CHECKPAIRDIST
      elseif ($CPORT = 5)
        setvar $TARGETA 4

        gosub :CHECKPAIRDIST
      end
    end
  end
  add $SEC 1
end




return
:CHECKPAIRDIST


setvar $FR1 "[] "
setvar $FR2 "[] "
getnearestwarps $NEARARRAY $SEC
setvar $Y 1
while ($Y <= $NEARARRAY)
  setvar $FOCUS $NEARARRAY[$Y]

  if ((PORT.CLASS[$FOCUS] = $TARGETA) and ($PORTSUSED[$FOCUS] = 0))
    getsectorparameter $FOCUS "FIGSEC" $HASFIG2
    if ($HASFIG2 = 1)
      getdistance $TO $FOCUS $SEC
      getdistance $FROM $SEC $FOCUS
      if (($TO > 0) and ($FROM > 0))
        setvar $ACCUM $TO
        add $ACCUM $FROM
        if ($ACCUM <= $TOTALDIST)
          setvar $PAIRSEC $FOCUS
          setvar $PAIRCLASS PORT.CLASS[$FOCUS]
          if (PORT.PERCENTEQUIP[$PAIRSEC] > 80)
            setvar $PORTSUSED[$FOCUS] 1
            setvar $PORTSUSED[$SEC] 1
            add $PORTPAIRSI 1
            setvar $PORTPAIRS[$PORTPAIRSI][1] $SEC
            setvar $PORTPAIRS[$PORTPAIRSI][2] $PAIRSEC
            setvar $PORTPAIRS[$PORTPAIRSI][3] $FROM
            setvar $PORTPAIRS[$PORTPAIRSI][4] $TO

            echo "Pair Found (" $PORTPAIRSI "):" $FR1 $SEC "(" $PORTS[$CPORT] ") (" $FROM ") <> (" $TO ") " $FR2 $PAIRSEC "(" $PORTS[$PAIRCLASS] ")*"

            return
          end
        end
      end
    end
  end



  add $Y 1
end

return
:CHECKPAIR


setvar $FR1 "[] "
setvar $FR2 "[] "
setvar $Y 1
while ($Y <= SECTOR.WARPCOUNT[$SEC])
  if ($PORTSUSED[SECTOR.WARPS[$SEC][$Y]] = 0)
    if ((PORT.CLASS[SECTOR.WARPS[$SEC][$Y]] = $TARGETA) or (PORT.CLASS[SECTOR.WARPS[$SEC][$Y]] = $TARGETB))
      setvar $PAIRSEC SECTOR.WARPS[$SEC][$Y]
      setvar $PAIRCLASS PORT.CLASS[SECTOR.WARPS[$SEC][$Y]]
      getsectorparameter $PAIRSEC "FIGSEC" $HASFIG2
      if ($HASFIG2 = 1)
        gosub :CHECKADJ
        if ($ADJ = 1)
          setvar $PORTSUSED[SECTOR.WARPS[$SEC][$Y]] 1
          setvar $PORTSUSED[$SEC] 1
          getsectorparameter $SEC "FIGSEC" $HASFIG1
          if ($HASFIG1)
            setvar $FR1 "[x] "
          end
          getsectorparameter $PAIRSEC "FIGSEC" $HASFIG2
          if ($HASFIG2)
            setvar $FR2 "[x] "
          end
          echo "Pair Found:" $FR1 $SEC "(" $PORTS[$CPORT] ") <> " $FR2 $PAIRSEC "(" $PORTS[$PAIRCLASS] ")*"
          return
        else
          setvar $PAIRSEC 0
          setvar $PAIRCLASS 0
        end
      end
    end
  end
  add $Y 1
end

return
:CHECKADJ

setvar $ADJ 0
setvar $X 1
while ($X <= SECTOR.WARPCOUNT[$PAIRSEC])
  if (SECTOR.WARPS[$PAIRSEC][$X] = $SEC)
    setvar $ADJ 1
    return
  end
  add $X 1
end
return
:PORTREPORT





setvar $I 11
setarray $REPORTPORTS 10
setarray $REPORTPORTSUSED 10

while ($I <= SECTORS)

  if (PORT.CLASS[$I] > 0)
    add $REPORTPORTS[PORT.CLASS[$I]] 1
    if ($PORTSUSED[$I] = 1)
      add $REPORTPORTSUSED[PORT.CLASS[$I]] 1
    end
  end
  add $I 1
end

echo "Port Status and Usage *"
echo "Ports BBS: " $REPORTPORTSUSED[1] "/" $REPORTPORTS[1] "*"
echo "Ports BSB: " $REPORTPORTSUSED[2] "/" $REPORTPORTS[2] "*"
echo "Ports SBB: " $REPORTPORTSUSED[3] "/" $REPORTPORTS[3] "*"
echo "Ports SSB: " $REPORTPORTSUSED[4] "/" $REPORTPORTS[4] "*"
echo "Ports SBS: " $REPORTPORTSUSED[5] "/" $REPORTPORTS[5] "*"
echo "Ports BSS: " $REPORTPORTSUSED[6] "/" $REPORTPORTS[6] "*"
echo "Ports SSS: " $REPORTPORTSUSED[7] "/" $REPORTPORTS[7] "*"
echo "Ports BBB: " $REPORTPORTSUSED[8] "/" $REPORTPORTS[8] "*"
echo "**"
return

# includes:
include "source\include\move"
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
