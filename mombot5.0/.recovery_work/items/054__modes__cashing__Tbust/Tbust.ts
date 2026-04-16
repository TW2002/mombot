logging "OFF"
reqrecording
loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
loadvar $BOT_TURN_LIMIT
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8
loadvar $STARDOCK
loadvar $COMMAND


gosub :QUIKSTATS
:LOAD
fileexists $DOESHELPFILEEXIST "scripts\MOMBot\Help\"&$COMMAND&".txt"
if ($DOESHELPFILEEXIST <> TRUE)
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "- tbust [Experience] {safe} {2fer} {max} {override} {delay} {makered}"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "  Traitors Planet Buster Modified for M()M Bot Use "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "                                                            "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [Experience]   = Desired Experience"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [safe]         = Create and Destroy one at a time"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [2fer]         = Create and Destroy two at a time"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [max]          = Create and Destroy the max amount"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [override]     = Override Turns low Limit"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [delay]        = Random delay for each bust"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [bank]         = Corpie will pass credits through bank"
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "   - [red]          = Will Attempt negative align"
  send "'{" $BOT_NAME "} - Writing help file for this command in Help directory.*"
end
if ($TOTAL_HOLDS < 10)
  send "'{" $BOT_NAME "} - You need at least 10 Holds to create a planet.*"
  halt
end
isnumber $TEST $PARM1
if ($TEST)
  if ($PARM1 < 1)
    send "'{" $BOT_NAME "} - Must enter Experience to Achiece*"
    halt
  end
else
  send "'{" $BOT_NAME "} - Invalid Experience amount entered. *"
  halt
end
if ($CURRENT_PROMPT = "Command")
  send "p ss ys *q"
end
if (($CURRENT_PROMPT <> "<StarDock>") and ($CURRENT_PROMPT <> "Command"))
  send "'{" $BOT_NAME "} - Must start from StarDock or Command Prompt*"
  halt
end
getwordpos $USER_COMMAND_LINE $POS "safe"
if ($POS > 0)
  setvar $BUSTMODE "safe"
end
getwordpos $USER_COMMAND_LINE $POS "2fer"
if ($POS > 0)
  setvar $BUSTMODE "2fer"
end
getwordpos $USER_COMMAND_LINE $POS "max"
if ($POS > 0)
  setvar $BUSTMODE "max"
end
getwordpos $USER_COMMAND_LINE $POS "override"
if ($POS > 0)
  setvar $OVVERIDE TRUE
end
getwordpos $USER_COMMAND_LINE $POS "delay"
if ($POS > 0)
  setvar $RANDOMDELAY TRUE
end
getwordpos $USER_COMMAND_LINE $POS "bank"
if ($POS > 0)
  setvar $CORPIEBANKER TRUE
end
getwordpos $USER_COMMAND_LINE $POS "red"
if ($POS > 0)
  setvar $MAKERED "true"
end
if ($PARM1 < $EXPERIENCE)
  send "'{" $BOT_NAME "} - Already at or Above Desired Experience*"
  halt
end
setvar $NEEDEDCYCLES ($PARM1 / 75)
:CHECK_CORP

if ($CORP > 0)
  gosub :SILENCEMESSAGES
  goto :CHECKAUTOFLEE
else
  send "'{" $BOT_NAME "} - Must be on a Corp to Continue*"
  halt
end
:CHECKAUTOFLEE

send "\"
settextlinetrigger CHECKFLEE :CHECKFLEE "Online Auto Flee is"
pause
:CHECKFLEE

killtrigger CHECKFLEE
getword CURRENTLINE $AUTOFLEE 5
striptext $AUTOFLEE "."
if ($AUTOFLEE = "enabled")
  send "\"
end
goto :CHECKCN2
:CHECKCN2

waitfor "<StarDock>"
send "c"
settextlinetrigger CN2OFF :CN2OFF "Sorry, only Traders with ANSI"
settexttrigger CN2ON :CN2ON "Select(1-5,Q)"
pause
:CN2OFF

killtrigger CN2OFF
killtrigger CN2ON
goto :CHECKCN9
:CN2ON

killtrigger CN2OFF
killtrigger CN2ON
send "q"
waitfor "<StarDock> Where to?"
send " q  c  n  2  q  q  p  s"
waitfor "<StarDock> Where to?"
if ($UNLIMITEDGAME <> 1)
  subtract $TURNS 1
end
goto :CHECKCN9
:CHECKCN9

send "ge"
settextlinetrigger CN9SPACE :CN9SPACE "You enter the most"
settextlinetrigger CN9ALL :CN9ALL "<Galactic Bank>"
pause
:CN9SPACE

killtrigger CN9SPACE
killtrigger CN9ALL
setvar $CN9 "space"
settextlinetrigger CHECKBANKACCT :CHECKBANKACCT "credits in your account."
pause
:CN9ALL

killtrigger CN9SPACE
killtrigger CN9ALL
setvar $CN9 "all"
settextlinetrigger CHECKBANKACCT :CHECKBANKACCT "credits in your account."
pause
:CHECKBANKACCT

killtrigger CHECKBANKACCT
getword CURRENTLINE $BANKCREDS 3
striptext $BANKCREDS ","
send "q"
waitfor "<StarDock> Where to?"
goto :GETPRICING
:GETPRICING

send "ha"
settextlinetrigger GETDETCOST :GETDETCOST "We sell them for"
pause
:GETDETCOST

killtrigger GETDETCOST
getword CURRENTLINE $DETCOST 5
striptext $DETCOST ","
settexttrigger HOWMANYDETS :HOWMANYDETS "How many Atomic Detonators do you want"
pause
:HOWMANYDETS

killtrigger HOWMANYDETS
getword CURRENTLINE $MAXDETS 9
striptext $MAXDETS ")"
setvar $MAXDETS ($MAXDETS + $ATOMIC)
send "0*t"
settextlinetrigger GETGTORPCOST :GETGTORPCOST "Aldus Genesis Torpedo."
pause
:GETGTORPCOST

killtrigger GETGTORPCOST
getword CURRENTLINE $GTORPCOST 6
striptext $GTORPCOST ","
settexttrigger HOWMANYGTORPS :HOWMANYGTORPS "How many Genesis Torpedoes do you want"
pause
:HOWMANYGTORPS

killtrigger HOWMANYGTORPS
getword CURRENTLINE $MAXGTORPS 9
striptext $MAXGTORPS ")"
setvar $MAXGTORPS ($MAXGTORPS + $GENESIS)
send "0*q"
waitfor "See you later."
:REDCHECK

if ($MAKERED = "true")
  gosub :FIXALIGN
end
:CHECKFORPROBLEMS

if ($UNLIMITEDGAME = 1)
  goto :FIXCN9
elseif (($TURNS = 0) and ($UNLIMITEDGAME <> 1))
  send "'{" $BOT_NAME "} - Turns to low to Run TBust! *"
  gosub :HEARMESSAGES
  halt
elseif (($TURNS < 50) and ($OVERRIDE = TRUE))
  goto :FIXCN9
elseif ($TURNS < 50)
  gosub :HEARMESSAGES
  send "'{" $BOT_NAME "} - Turns to low to Run TBust!*"
  halt
end
:FIXCN9

if ($CN9 = "all")
  send "qcn9  q  q  p  s"
  setvar $CN9 "space"
  waitfor "Landing on Federation StarDock."
  if ($UNLIMITEDGAME <> 1)
    subtract $TURNS 1
  end
end
:GETUSERINPUT

if (($MAXDETS = $MAXGTORPS) or ($MAXDETS < $MAXGTORPS))
  setvar $MAXPERCYCLE $MAXDETS
else
  setvar $MAXPERCYCLE $MAXGTORPS
end
setvar $TOTALINITIALCREDS ($CREDITS + $BANKCREDS)
setvar $TOTALCYCLES (((($CREDITS + $BANKCREDS) / ($GTORPCOST + $DETCOST)) - 1) + $ATOMIC)
if ($CREDITS < ($GTORPCOST + $DETCOST))
  send "'{" $BOT_NAME "} - Need more Credits to bust.*"
  halt
else
  setvar $TOTALCYCLES ((($CREDITS / ($GTORPCOST + $DETCOST)) - 1) + $ATOMIC)
end
:FINALPREPBEFOREBUSTING

setvar $WTF 0
if ($BUSTMODE = "safe")
  setvar $MAXPERCYCLE 1
elseif ($BUSTMODE = "2fer")
  setvar $MAXPERCYCLE 2
elseif ($BUSTMODE = "max")
  setvar $MAXPERCYCLE $MAXGTORPS
end
send "@"
waitfor "hundredths"
gosub :QUIKSTATS
gosub :CHECKSTATUS
if ($TURNS < (($NEEDEDCYCLES / $MAXPERCYCLE) + 2))
  if ($UNLIMITEDGAME <> 1)
    gosub :HEARMESSAGES
    send "'{" $BOT_NAME "} - Not Enough Turns*"
    halt
  end
end
if ($ATOMIC < $MAXPERCYCLE)
  send "h  a  " ($MAXPERCYCLE - $ATOMIC) "*q"
  waitfor "See you later"
end
if ($GENESIS < $MAXPERCYCLE)
  send "h  t  " ($MAXPERCYCLE - $GENESIS) "*q"
  waitfor "See you later"
end
:STARTBUSTCYCLE

setvar $COUNT 1
setvar $BUSTSTRING "q  "
setvar $TEMPCYCLES $MAXPERCYCLE
if ($NEEDEDCYCLES < $TEMPCYCLES)
  setvar $TEMPCYCLES $NEEDEDCYCLES
end
if ($TEMPCYCLES < 1)
  setvar $TEMPCYCLES 1
  add $WTF 1
end
while ($COUNT <= $TEMPCYCLES)
  setvar $BUSTSTRING $BUSTSTRING&"u  y  n  .*cl  *  z  d  y  "
  add $COUNT 1
end
setvar $BUSTSTRING $BUSTSTRING&"p  s "
subtract $NEEDEDCYCLES $TEMPCYCLES
send $BUSTSTRING
waitfor "Command"
settextlinetrigger INVALIDREGNUM :INVALIDREGNUM "Invalid registry number"
settexttrigger BUSTOK :BUSTOK "<StarDock>"
pause
:BUSTOK

killtrigger INVALIDREGNUM
killtrigger BUSTOK
send "@"
waitfor "hundredths"
gosub :QUIKSTATS
gosub :CHECKSTATUS
if (($ATOMIC >= $TEMPCYCLES) and ($GENESIS >= $TEMPCYCLES))
  setvar $BUYDETQTY 0
  setvar $BUYTORPQTY 0
else
  setvar $BUYDETQTY ($TEMPCYCLES - $ATOMIC)
  setvar $BUYTORPQTY ($TEMPCYCLES - $GENESIS)
end
send "h  a  " $BUYDETQTY "*  t  " $BUYTORPQTY "*  q"
if ($RANDOMDELAY = "TRUE")
  gosub :RANDOMDELAY
end
goto :STARTBUSTCYCLE
:INVALIDREGNUM

killtrigger BUSTOK
killtrigger INVALIDREGNUM
setvar $PLANETNUMS ""
send "@"
waitfor "hundredths"
gosub :QUIKSTATS
gosub :CHECKSTATUS
send "h  t  1*  q"
waitfor "<StarDock>"
send "q  u  y  n  .*cl*  z  d  y  p  s "
waitfor "Command"
settexttrigger GETPLANNUM :GETPLANNUM "Registry#"
settexttrigger ONDOCK :ONDOCK "<StarDock>"
pause
:GETPLANNUM

killtrigger GETPLANNUM
settextlinetrigger PLANNUM :PLANNUM "   <"
pause
:PLANNUM

killtrigger PLANNUM
add $EXTRAPLANETS 1
getword CURRENTLINE $TEMPPLANETNUM 2
striptext $TEMPPLANETNUM ">"
setvar $PLANETNUMS $PLANETNUMS&" "&$TEMPPLANETNUM
settexttrigger PLANNUM :PLANNUM "   <"
pause
:ONDOCK

killtrigger GETPLANNUM
killtrigger PLANNUM
killtrigger ONDOCK
getword CURRENTLINE $SPOOFPLANETNAME 1
if ($SPOOFPLANETNAME <> "<StarDock>")
  settexttrigger ONDOCK :ONDOCK "<StarDock>"
  settexttrigger PLANNUM :PLANNUM "   <"
  pause
end
setarray $RANDOMPLANNUM $EXTRAPLANETS
setvar $C 1
setvar $RNDPLANETNUMS ""
:PLANETNUMBERRANDOMIZER

while ($C <= $EXTRAPLANETS)
  getrnd $RANDOM 1 $EXTRAPLANETS
  if ($RANDOMPLANNUM[$RANDOM] = 1)
    goto :PLANETNUMBERRANDOMIZER
  else
    getword $PLANETNUMS $TEMPPLANETNUM $RANDOM
    setvar $RNDPLANETNUMS $RNDPLANETNUMS&" "&$TEMPPLANETNUM
    add $C 1
    setvar $RANDOMPLANNUM[$RANDOM] 1
  end
end
:MULTIPLANETS

send "@"
waitfor "hundredths"
gosub :QUIKSTATS
gosub :CHECKSTATUS
if ($EXTRAPLANETS >= 1)
  send "h  a  1*  q"
  waitfor "<StarDock>"
  getword $RNDPLANETNUMS $TEMPPLANETNUM $EXTRAPLANETS
  send "q  l  "&#8&#8&$TEMPPLANETNUM "*  n  z  n  d  y  *  p  s "
  settexttrigger BACKONDOCK :BACKONDOCK "<StarDock>"
  settexttrigger PLANETNUMGONE :PLANETNUMGONE "That planet is not in this sector."
  settexttrigger TRIEDTOMOVE :TRIEDTOMOVE "<Move>"
  pause
else
  send "@"
  waitfor "hundredths"
  goto :BUSTOK
end
:BACKONDOCK

killtrigger BACKONDOCK
killtrigger PLANETNUMGONE
killtrigger TRIEDTOMOVE
getword CURRENTLINE $SPOOFPLANETNAME 1
if ($SPOOFPLANETNAME <> "<StarDock>")
  settexttrigger BACKONDOCK :BACKONDOCK "<StarDock>"
  settexttrigger PLANETNUMGONE :PLANETNUMGONE "That planet is not in this sector."
  settexttrigger TRIEDTOMOVE :TRIEDTOMOVE "<Move>"
  pause
end
subtract $EXTRAPLANETS 1
goto :MULTIPLANETS
:PLANETNUMGONE

killtrigger BACKONDOCK
killtrigger PLANETNUMGONE
killtrigger TRIEDTOMOVE
goto :INVALIDREGNUM
:TRIEDTOMOVE

killtrigger BACKONDOCK
killtrigger PLANETNUMGONE
killtrigger TRIEDTOMOVE
goto :BUSTOK
:CHECKSTATUS

if ($CURRENT_PROMPT <> "<StarDock>")
  gosub :HEARMESSAGES
  send "p  s  t"
  send "'{" $BOT_NAME "} - Houston, we have a problem...*"
  halt
end
if ($EXPERIENCE >= $PARM1)
  gosub :HEARMESSAGES
  send "'{" $BOT_NAME "} - Target Exp Reached!*"
  halt
end
if (($TURNS < 10) and ($UNLIMITEDGAME <> 1))
  gosub :HEARMESSAGES
  send "'{" $BOT_NAME "} - Not Enough Turns to Continue!*"
  halt
end
:RESUME

if ($CREDITS < (($GTORPCOST + $DETCOST) * $MAXPERCYCLE))
  if ($CORPIEBANKER = TRUE)
    send "ge"
    settextlinetrigger VIEWBANKACCT :VIEWBANKACCT "credits in your account."
    pause
    :VIEWBANKACCT

    killtrigger VIEWBANKACCT
    getword CURRENTLINE $BANKCREDS 3
    striptext $BANKCREDS ","
    send "q"
    waitfor "<StarDock> Where to?"
    if (($CREDITS + $BANKCREDS) < (($GTORPCOST + $DETCOST) * $MAXPERCYCLE))
      if ($CORPIEBANKER = TRUE)
        gosub :HEARMESSAGES
        send "'{" $BOT_NAME "} - Need Creds in bank to continue. Waiting on Transfer*"
        settextlinetrigger WAITFORCREDS :WAITFORCREDS "credits to your Galactic bank account."
        pause
        :WAITFORCREDS

        killtrigger WAITFORCREDS
        send "ge"
        settextlinetrigger VERIFYBANKACCT :VERIFYBANKACCT "credits in your account."
        pause
        :VERIFYBANKACCT

        killtrigger VERIFYBANKACCT
        getword CURRENTLINE $BANKCREDS 3
        striptext $BANKCREDS ","
        send "q"
        waitfor "<StarDock> Where to?"
        if (($CREDITS + $BANKCREDS) < (($GTORPCOST + $DETCOST) * $MAXPERCYCLE))
          send "'{" $BOT_NAME "} - Not enough Creds in bank*"
          settextlinetrigger WAITFORCREDS :WAITFORCREDS "your Galactic bank account."
          pause
        else
          subtract $BANKCREDS (($GTORPCOST + $DETCOST) * $MAXPERCYCLE)
          send "g  w" ((($GTORPCOST + $DETCOST) * $MAXPERCYCLE) - $CREDITS) "*  q"
          gosub :SILENCEMESSAGES
          waitfor "<StarDock>"
        end
      end
    else
      subtract $BANKCREDS (($GTORPCOST + $DETCOST) * $MAXPERCYCLE)
      send "g  w" ((($GTORPCOST + $DETCOST) * $MAXPERCYCLE) - $CREDITS) "*  q"
      waitfor "<StarDock>"
    end
  end
end
if ($WTF > 10)
  gosub :HEARMESSAGES
  pause
end
return
:RANDOMDELAY

getrnd $RNDNUM 50 2000
setdelaytrigger DELAY :DELAY $RNDNUM
pause
:DELAY

killtrigger DELAY
return
:SILENCEMESSAGES

send "|"
setvar $HEARMESSAGES "no"
settextlinetrigger MESSAGE :MESSAGE "all messages."
pause
:HEARMESSAGES

send "|"
setvar $HEARMESSAGES "yes"
settextlinetrigger MESSAGE :MESSAGE "all messages."
pause
:MESSAGE

killtrigger MESSAGE
getword CURRENTLINE $MSGSTAT 1
if (($MSGSTAT = "Displaying") and ($HEARMESSAGES = "yes"))
  return
elseif (($MSGSTAT = "Displaying") and ($HEARMESSAGES = "no"))
  send "|"
  return
elseif (($MSGSTAT = "Silencing") and ($HEARMESSAGES = "no"))
  return
else
  send "|"
  return
end
:FIXALIGN

if (($ALIGNMENT > 0) and ($ALIGNMENT < 200))
  send "ttmafia*y"
  settexttrigger GETMAFIAPWPRICE :GETMAFIAPWPRICE "will ye pay?"
  pause
  :GETMAFIAPWPRICE


  killtrigger GETMAFIAPWPRICE
  getword CURRENTLINE $MAFIAPWPRICE 6
  striptext $MAFIAPWPRICE ","
  send "n*q"
  waitfor "You make a hasty exit from the Tavern."
  setvar $FIXALIGN $ALIGNMENT
  setvar $FIXALIGNCREDS (($FIXALIGN * 250) + $MAFIAPWPRICE)
  setvar $NEWMAFIAPW "use mombot more"
  goto :GETMAFIAPW

elseif ($YOURALIGN > 199)
  send "'{" $BOT_NAME "} - Cant Get a Negative Alignement.  Continuing for Experience*"
  goto :FIXALIGNRETURN
end
:GETMAFIAPW

send "ttmafia*yy"
settextlinetrigger MAFIAPW :MAFIAPW "The password today is"
pause
:MAFIAPW

killtrigger MAFIAPW
gettext CURRENTLINE $TEMPMAFIAPW "today is "&#34 ""
getlength $TEMPMAFIAPW $MAFIAPWLENGTH
cuttext $TEMPMAFIAPW $MAFIAPW 1 ($MAFIAPWLENGTH - 1)
send "*q"
waitfor "<StarDock>"
goto :UNDERGROUND
:UNDERGROUND

send "u"
waitfor "Your reply :"
send $MAFIAPW "*"
settexttrigger PWWORKS :PWWORKS "The magnetic shielding goes down and the door opens."
settexttrigger PWFAILS :PWFAILS "<StarDock> Where to? (?=Help)"
pause
:PWFAILS

killtrigger PWWORKS
killtrigger PWFAILS
send "'{" $BOT_NAME "} - Underground PW failed. You will have to fix manually.  Halting Script*"
halt
:PWWORKS

killtrigger PWWORKS
killtrigger PWFAILS
send "y" $NEWMAFIAPW "*"
:PLACECONTRACT

setvar $LETTERS "e t a o i n s r h l d c u m f p g w y b v k x j q z"
setvar $COUNT 1
:PICKTRADER4CONTRACT

if ($COUNT <= 26)
  getword $LETTERS $TEMP $COUNT
  send "p" $TEMP "*"
  settexttrigger KNOWNTRADER :KNOWNTRADER "Do you mean"
  settexttrigger UNKNOWNTRADER :UNKNOWNTRADER "Unknown Trader!"
  pause
else
  gosub :HEARMESSAGES
  send "'{" $BOT_NAME "} - Problems placing a Bounty. - HALTING*"
  halt
end
:UNKNOWNTRADER

killtrigger KNOWNTRADER
killtrigger UNKNOWNTRADER
add $COUNT 1
goto :PICKTRADER4CONTRACT
:KNOWNTRADER

killtrigger KNOWNTRADER
killtrigger UNKNOWNTRADER
send "y" ($FIXALIGN * 250) "*q"
waitfor "<StarDock>"
send "@"
waitfor "hundredths"
gosub :QUIKSTATS
:FIXALIGNRETURN

return
:QUIKSTATS


setvar $CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
settextlinetrigger STATLINETRIG :STATSTART #179
send #145&"/"
pause
:ALLPROMPTS

getword CURRENTLINE $CURRENT_PROMPT 1
striptext $CURRENT_PROMPT #145
striptext $CURRENT_PROMPT #8
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
pause
:STATSTART

killtrigger PROMPT
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger NOPROMPT
setvar $STATS ""
setvar $WORDY ""
:STATSLINE


killtrigger STATLINETRIG
killtrigger GETLINE2
setvar $LINE2 CURRENTLINE
replacetext $LINE2 #179 " "
striptext $LINE2 ","
setvar $STATS $STATS&$LINE2
getwordpos $LINE2 $POS "Ship"
if ($POS > 0)
  goto :GOTSTATS
else
  settextlinetrigger GETLINE2 :STATSLINE
  pause
end
:GOTSTATS

setvar $STATS $STATS&" @@@"

setvar $CURRENT_WORD 0
if ($WORDY <> "@@@")
  if ($WORDY = "Sect")
    getword $STATS $CURRENT_SECTOR ($CURRENT_WORD + 1)
  elseif ($WORDY = "Turns")
    getword $STATS $TURNS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Creds")
    getword $STATS $CREDITS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Figs")
    getword $STATS $FIGHTERS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Shlds")
    getword $STATS $SHIELDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Hlds")
    getword $STATS $TOTAL_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Ore")
    getword $STATS $ORE_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Org")
    getword $STATS $ORGANIC_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Equ")
    getword $STATS $EQUIPMENT_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Col")
    getword $STATS $COLONIST_HOLDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Phot")
    getword $STATS $PHOTONS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Armd")
    getword $STATS $ARMIDS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Lmpt")
    getword $STATS $LIMPETS ($CURRENT_WORD + 1)
  elseif ($WORDY = "GTorp")
    getword $STATS $GENESIS ($CURRENT_WORD + 1)
  elseif ($WORDY = "TWarp")
    getword $STATS $TWARP_TYPE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Clks")
    getword $STATS $CLOAKS ($CURRENT_WORD + 1)
  elseif ($WORDY = "Beacns")
    getword $STATS $BEACONS ($CURRENT_WORD + 1)
  elseif ($WORDY = "AtmDt")
    getword $STATS $ATOMIC ($CURRENT_WORD + 1)
  elseif ($WORDY = "Corbo")
    getword $STATS $CORBO ($CURRENT_WORD + 1)
  elseif ($WORDY = "EPrb")
    getword $STATS $EPROBES ($CURRENT_WORD + 1)
  elseif ($WORDY = "MDis")
    getword $STATS $MINE_DISRUPTORS ($CURRENT_WORD + 1)
  elseif ($WORDY = "PsPrb")
    getword $STATS $PSYCHIC_PROBE ($CURRENT_WORD + 1)
  elseif ($WORDY = "PlScn")
    getword $STATS $PLANET_SCANNER ($CURRENT_WORD + 1)
  elseif ($WORDY = "LRS")
    getword $STATS $SCAN_TYPE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Aln")
    getword $STATS $ALIGNMENT ($CURRENT_WORD + 1)
  elseif ($WORDY = "Exp")
    getword $STATS $EXPERIENCE ($CURRENT_WORD + 1)
  elseif ($WORDY = "Corp")
    getword $STATS $CORP ($CURRENT_WORD + 1)
  elseif ($WORDY = "Ship")
    getword $STATS $SHIP_NUMBER ($CURRENT_WORD + 1)
  end
  add $CURRENT_WORD 1
  getword $STATS $WORDY $CURRENT_WORD
end
:DONEQUIKSTATS
killtrigger PROMPT1
killtrigger PROMPT2
killtrigger PROMPT3
killtrigger PROMPT4
killtrigger STATLINETRIG
killtrigger GETLINE2

return
