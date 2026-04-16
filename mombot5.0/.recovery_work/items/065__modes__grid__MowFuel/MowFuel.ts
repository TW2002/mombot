logging "OFF"
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
loadvar $BACKDOOR
loadvar $RYLOS
loadvar $ALPHA_CENTAURI
loadvar $COMMAND
fileexists $DOESHELPFILEEXIST "scripts\MOMBot\Help\"&$COMMAND&".txt"
if ($DOESHELPFILEEXIST <> TRUE)
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "- "&$COMMAND&"                                              "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    Mows to unfigged upgraded fuel ports in grid.           "
  write "scripts\MOMBot\Help\"&$COMMAND&".txt" "    Does not do so safely.                                  "
  send "'{" $BOT_NAME "} - Writing help file for this command in Help directory.*"
end
window "MOWWINDOW" 250 80 "Sectors Gridded" "ONTOP"
setarray $COURSE 80
gosub :QUIKSTATS
if ($CURRENT_PROMPT <> "Citadel")
  send "'{" $BOT_NAME "} - You must run this script from the Citadel prompt.*"
  halt
end
setvar $LOCATION $CURRENT_PROMPT
setvar $HOMESECTOR $CURRENT_SECTOR
setvar $LASTDESTINATION 1
send "c;q"
waiton "Max Figs Per Attack:"
getword CURRENTLINE $MAXFIGATTACK2 5
:GETPLANETNUM
send "qD"
waiton "Planet #"
getword CURRENTLINE $PLANET 2
striptext $PLANET "#"
send "tnl1*tnl2*tnl3*snl1*snl2*snl3*tnt1*mnt*qjy"

setwindowcontents "MOWWINDOW" "Sectors Figged: "&$COUNT&" out of "&SECTORS&"*"
gosub :LANDONPLANETENTERCITADEL
gosub :GETTARGETS
:DOAGAIN
getrnd $RANDOM 1 $DATABASECOUNT
getword $RANDOMSECTORS $DESTINATION $RANDOM
if ($DESTINATION = 0)
  send "'{" $BOT_NAME "} -  Database Cleared - Refresh Figs and Restart.*"
  halt
end
if ($DESTINATION <> $HOMESECTOR)
  gosub :GETCOURSES
  if ($VALID)
    getdistance $DISTANCETHERE $DESTINATION $LASTDESTINATION
    if ($DISTANCETHERE < 0)
      send "/"
      waiton #179
      echo ANSI_14 "Updating database...*" ANSI_7
      send "^f"&$DESTINATION&"*"&$LASTDESTINATION&"*q"
      waiton "ENDINTERROG"
      getdistance $DISTANCETHERE $DESTINATION $LASTDESTINATION
    end
    getdistance $DISTANCEBACK $LASTDESTINATION $DESTINATION
    if ($DISTANCEBACK < 0)
      send "/"
      waiton #179
      echo ANSI_14 "Updating database...*" ANSI_7
      send "^f"&$LASTDESTINATION&"*"&$DESTINATION&"*q"
      waiton "ENDINTERROG"
      getdistance $DISTANCEBACK $LASTDESTINATION $DESTINATION
    end
    if (($DISTANCETHERE >= 5) and ($DISTANCEBACK >= 5))
      setvar $TEMP " "&$DESTINATION&" "
      replacetext $RANDOMSECTORS $TEMP " "
      subtract $DATABASECOUNT 1
      send "qm***t n t 1* q"
      gosub :MOW
      setvar $WINDOWDATA "Sectors Figged: "&$COUNT&" out of "&SECTORS&"*Current Target: "&$DESTINATION&"*Target Status: Attempting To Mow*"&$DATABASECOUNT&" sectors left in database*"
      setwindowcontents "MOWWINDOW" $WINDOWDATA
      setvar $LASTDESTINATION $DESTINATION
    else
      setvar $WINDOWDATA "Sectors Figged: "&$COUNT&" out of "&SECTORS&"*Current Target: "&$DESTINATION&"*Target Status: Sector Too Close To Last Target*"&$DATABASECOUNT&" sectors left in database*"
      setwindowcontents "MOWWINDOW" $WINDOWDATA
    end


  else
    setvar $TEMP " "&$DESTINATION&" "
    replacetext $RANDOMSECTORS $TEMP " "
    subtract $DATABASECOUNT 1
  end
end
goto :DOAGAIN
:MOW


gosub :QUIKSTATS
if ($MAXFIGATTACK2 > $FIGHTERS)
  setvar $MAXFIGATTACK2 9999
end
setvar $J 2
setvar $RESULT ""
while ($J <= $COURSELENGTH)
  setvar $RESULT $RESULT&"m  "&$COURSE[$J]&"* "
  if (($COURSE[$J] > 10) and ($COURSE[$J] <> STARDOCK))
    setvar $RESULT $RESULT&"za"&$MAXFIGATTACK2&"* z * "
  end
  if (($COURSE[$J] > 10) and (($COURSE[$J] <> $STARDOCK) and ($J > 2)))
    setvar $RESULT $RESULT&"f 1 * c d "
  end
  add $J 1
end
send $RESULT&"zr* "
gosub :QUIKSTATS
if ($CURRENT_SECTOR <> $DESTINATION)
  setvar $WINDOWDATA "Sectors Figged: "&$COUNT&" out of "&SECTORS&"*Current Target: "&$DESTINATION&"*Target Status: DANGER - Call Save Me Activated!"
  setwindowcontents "MOWWINDOW" $WINDOWDATA
  gosub :CALLSAVEME

else
  send "f 1* c d  mz "&$HOMESECTOR&"*y  y    *    "
  gosub :QUIKSTATS
  if ($CURRENT_SECTOR <> $HOMESECTOR)
    gosub :CALLSAVEME
  end
  setvar $WINDOWDATA "Sectors Figged: "&$COUNT&" out of "&SECTORS&"*Current Target: "&$DESTINATION&"*Target Status: Returned Home Safely*"&$DATABASECOUNT&" sectors left in database*"
  setwindowcontents "MOWWINDOW" $WINDOWDATA
  gosub :LANDONPLANETENTERCITADEL
end
return
:GETCOURSES

killalltriggers
setarray $COURSE 80
setvar $SECTORS ""
settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
send "^f*"&$DESTINATION&"*q"
pause
:SECTORSLINE


killalltriggers
setvar $LINE CURRENTLINE
replacetext $LINE ">" " "
striptext $LINE "("
striptext $LINE ")"
setvar $LINE $LINE&" "
getwordpos $LINE $POS "So what's the point?"
getwordpos $LINE $POS2 ": ENDINTERROG"
if (($POS > 0) or ($POS2 > 0))
  goto :NOPATH
end
getwordpos $LINE $POS " sector "
getwordpos $LINE $POS2 "TO"
if (($POS <= 0) and ($POS2 <= 0))
  setvar $SECTORS $SECTORS&" "&$LINE
end
getwordpos $LINE $POS " "&$DESTINATION&" "
getwordpos $LINE $POS2 "("&$DESTINATION&")"
getwordpos $LINE $POS3 "TO"
if ((($POS > 0) or ($POS2 > 0)) and ($POS3 <= 0))
  goto :GOTSECTORS
else
  settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
  settextlinetrigger SECTORLINETRIG2 :SECTORSLINE " "&$DESTINATION&" "
  settextlinetrigger SECTORLINETRIG3 :SECTORSLINE " "&$DESTINATION
  settextlinetrigger SECTORLINETRIG4 :SECTORSLINE "("&$DESTINATION&")"
  settextlinetrigger DONEPATH :SECTORSLINE "So what's the point?"
  settextlinetrigger DONEPATH2 :SECTORSLINE ": ENDINTERROG"
end
pause
:GOTSECTORS

killalltriggers
setvar $SECTORS $SECTORS&" :::"
setvar $COURSELENGTH 0
setvar $INDEX 1
setvar $VALID FALSE
:KEEPGOING
getword $SECTORS $COURSE[$INDEX] $INDEX
while ($COURSE[$INDEX] <> ":::")
  add $COURSELENGTH 1
  add $INDEX 1
  getword $SECTORS $COURSE[$INDEX] $INDEX
  if ($COURSE[$INDEX] <> ":::")
    setvar $VALID TRUE
  end
end
if ($VALID)
  setvar $WINDOWDATA "Sectors Figged: "&$COUNT&" out of "&SECTORS&"*Current Target: "&$DESTINATION&"*Target Status: Attempting To Mow*"&$DATABASECOUNT&" sectors left in database*"
else
  setvar $WINDOWDATA "Sectors Figged: "&$COUNT&" out of "&SECTORS&"*Current Target: "&$DESTINATION&"*Target Status: Path Already Figged*"&$DATABASECOUNT&" sectors left in database*"
end

setwindowcontents "MOWWINDOW" $WINDOWDATA
:NOPATH

killalltriggers
return
:GETTARGETS


setvar $DATABASECOUNT 0
setvar $RANDOMSECTORS "  "
setvar $I 11
while ($I <= SECTORS)
  getsectorparameter $I "FIGSEC" $ISFIGGED
  if (($I > 10) and ((PORT.BUYFUEL[$I] = FALSE) and ((PORT.EXISTS[$I] = TRUE) and ($ISFIGGED <> TRUE))))
    setvar $CURRENTFUEL PORT.FUEL[$I]
    multiply $CURRENTFUEL 100
    if (PORT.PERCENTFUEL[$I] <> 0)
      divide $CURRENTFUEL PORT.PERCENTFUEL[$I]
    end
    if ($CURRENTFUEL > 5000)
      setvar $RANDOMSECTORS $RANDOMSECTORS&$I&"  "
      add $DATABASECOUNT 1
    end
  end
  add $I 1
end
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
settexttrigger PROMPT1 :ALLPROMPTS "(?="
settextlinetrigger PROMPT2 :SECONDARYPROMPTS "(?)"
settextlinetrigger STATLINETRIG :STATSTART #179
settexttrigger PROMPT3 :TERRAPROMPTS "Do you wish to (L)eave or (T)ake Colonists?"
settexttrigger PROMPT4 :TERRAPROMPTS "How many groups of Colonists do you want to take ("

send "^Q/"
pause
:ALLPROMPTS

getword CURRENTANSILINE $CHECKPROMPT 1
getword CURRENTLINE $TEMPPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT $TEMPPROMPT
end
settextlinetrigger PROMPT1 :ALLPROMPTS "(?="
pause
:SECONDARYPROMPTS
getword CURRENTANSILINE $CHECKPROMPT 1
getword CURRENTLINE $TEMPPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT $TEMPPROMPT
end
settextlinetrigger PROMPT2 :SECONDARYPROMPTS "(?)"
pause
:TERRAPROMPTS
killtrigger PROMPT3
killtrigger PROMPT4
getword CURRENTANSILINE $CHECKPROMPT 1
getwordpos $CHECKPROMPT $POS "[35m"
if ($POS > 0)
  setvar $CURRENT_PROMPT "Terra"
end
settexttrigger PROMPT3 :TERRAPROMPTS "Do you wish to (L)eave or (T)ake Colonists?"
settexttrigger PROMPT4 :TERRAPROMPTS "How many groups of Colonists do you want to take ("
pause
:STATSTART

killtrigger PROMPT1
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
:CALLSAVEME



killalltriggers
send "*"
waitfor "(?="
getword CURRENTLINE $PROMPT 1
if ($PROMPT = "Citadel")
  echo "**Had to halt script, check ship to see if it is valid.**"
  halt
end
if (($PROMPT = "Computer") or ($PROMPT = "Corporate") or ($PROMPT = "NavPoint"))
  send "q"
  waitfor "Command [TL"
end
gosub :QUIKSTATS
setvar $FIGSTODEPLOY 1
gosub :DEPLOYFIGS
setvar $SAVETARGET $CURRENT_SECTOR
if ($SAVETARGET < 10)
  setvar $SAVETARGET 0000&$SAVETARGET
elseif ($SAVETARGET < 100)
  setvar $SAVETARGET 000&$SAVETARGET
elseif ($SAVETARGET < 1000)
  setvar $SAVETARGET 00&$SAVETARGET
elseif ($SAVETARGET < 10000)
  setvar $SAVETARGET 0&$SAVETARGET

end
send "'"&$SAVETARGET&"=saveme*"
send "'pickup "&$CURRENT_SECTOR&" ::*"
:WAITFORHELP


settextlinetrigger FRIENDLYTWARP :FRIENDLYTWARP "appears in a brilliant flash of warp energies!"
settextlinetrigger FRIENDLYPLANET :FRIENDLYPLANET "Saveme script activated - Planet "
settextlinetrigger TOWLOCKED :TOWLOCKED "locks a tractor beam on your ship."
setdelaytrigger TIMEOUT :TIMEOUT 30000
pause
:TIMEOUT

killalltriggers
send "'30 seconds after save call, script halted.*"
halt
:FRIENDLYTWARP

killalltriggers
setvar $FIGSTODEPLOY "ALL"
gosub :DEPLOYFIGS
goto :WAITFORHELP
:FRIENDLYPLANET

killalltriggers
gettext CURRENTLINE $PLANET "Saveme script activated - Planet " " to "
send "L "&$PLANET&"* C 'I landed on planet "&$PLANET&"*"
halt
:TOWLOCKED

killalltriggers
setvar $FIGSTODEPLOY 1
gosub :DEPLOYFIGS
send "'Tow locked, get us out of here!*"
halt
:DEPLOYFIGS


if ($FIGSTODEPLOY = 0)
  setvar $FIGSTODEPLOY 1
end
if (($CURRENT_SECTOR < 11) or ($CURRENT_SECTOR = STARDOCK))
  send "'Can't deploy figs in fed*"
  return
end
send "F"
settextlinetrigger NOCONTROL :NOCONTROL "These fighters are not under your control."
settextlinetrigger ABLETODEPLOY :ABLETODEPLOY "fighters available."
pause
:NOCONTROL

killalltriggers
send "'We don't control the figs in this sector!*"
halt
:ABLETODEPLOY

killalltriggers
getword CURRENTLINE $FIGSAVAILABLE 3
striptext $FIGSAVAILABLE ","
if ($FIGSTODEPLOY = "ALL")
  setvar $FIGSTODEPLOY $FIGSAVAILABLE
end
if ($FIGSAVAILABLE = 0)
  send "0* ZC D* 'I have no figs to deploy!*"
else
  send $FIGSTODEPLOY&"* ZC D* '"&$FIGSTODEPLOY&" figs deployed*"
end
return
:LANDONPLANETENTERCITADEL

send "l " $PLANET "* c"
waiton "<Enter Citadel>"
return
:LEAVECITADELANDPLANET
send "q q"
waiton "Blasting off from"
waiton "Command [TL"
return
