:player~currentprompt


















































































































































































killtrigger PROMPT
killtrigger PROMPT_DELAY
settexttrigger PROMPT :ALLPROMPTSCATCH #145&#8
setdelaytrigger PROMPT_DELAY :CURRENT_PROMPT_DELAY 5000
send #145
pause
:player~current_prompt_delay

settextouttrigger ATKEYS :CURRENT_PROMPT_AT_KEYS
setdelaytrigger PROMPT_DELAY :VERIFYDELAY 30000
pause
:player~current_prompt_at_keys

getouttext $player~out
send $player~out
killtrigger PROMPT_DELAY
return
:player~allpromptscatch

killtrigger PROMPT_DELAY
gosub :PARSE_CURRENT_PROMPT_LINE
setvar $player~startinglocation $player~current_prompt
return
:player~parse_current_prompt_line



setvar $player~ansiline CURRENTANSILINE
setvar $player~self_destruct_prompt FALSE
getwordpos $player~ansiline $player~pos "ARE YOU SURE CAPTAIN? (Y/N) [N]"
if ($player~pos > 0)
  setvar $player~self_destruct_prompt TRUE
end
setvar $player~full_current_prompt CURRENTLINE
striptext $player~full_current_prompt #145
striptext $player~full_current_prompt #8
getword $player~full_current_prompt $player~current_prompt 1
if ($player~current_prompt = 0)
  setvar $player~full_current_prompt CURRENTANSILINE
  striptext $player~full_current_prompt #145
  striptext $player~full_current_prompt #8
  getword $player~full_current_prompt $player~current_prompt 1
end
striptext $player~current_prompt #145
striptext $player~current_prompt #8
return
:player~verifydelay

killalltriggers
disconnect
:player~formatnumberforspaces



if ($player~inputvariable < 10)
  setvar $player~outputvariable "    "&$player~inputvariable
elseif ($player~inputvariable < 100)
  setvar $player~outputvariable "   "&$player~inputvariable
elseif ($player~inputvariable < 1000)
  setvar $player~outputvariable "  "&$player~inputvariable
elseif ($player~inputvariable < 10000)
  setvar $player~outputvariable " "&$player~inputvariable
else
  setvar $player~outputvariable $player~inputvariable
end
return
:player~quikstats













































































































































































































































setvar $player~current_prompt "Undefined"
setvar $player~quikstats_retry 0
if ($player~towed = 0)
  setvar $player~towed ""
end
loadvar $player~unlimitedgame
:player~trypromptagain

killtrigger TOOLONGPROMPT
killtrigger NOPROMPT
killtrigger PROMPT
killtrigger STATLINETRIG
killtrigger GETLINE2
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
settextlinetrigger STATLINETRIG :STATSTART #179
setdelaytrigger TOOLONGPROMPT :TRYPROMPTAGAIN 10000
send #145&"/"
pause
:player~allprompts

gosub :PARSE_CURRENT_PROMPT_LINE
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
pause
:player~statstart

killtrigger PROMPT
setvar $player~stats ""
setvar $player~wordy ""
:player~statsline

killtrigger STATLINETRIG
killtrigger GETLINE2
setvar $player~line2 CURRENTLINE
replacetext $player~line2 #179 " "
striptext $player~line2 ","
setvar $player~stats $player~stats&$player~line2
getwordpos $player~line2 $player~pos "Ship"
if ($player~pos > 0)
  goto :GOTSTATS
end
settextlinetrigger GETLINE2 :STATSLINE
pause
:player~gotstats


killtrigger TOOLONGPROMPT
killtrigger GETLINE2
setvar $player~stats $player~stats&" @@@"
getwordpos $player~stats $player~pos "Sect "
while ($player~pos = 0)
  add $player~quikstats_retry 1
  if ($player~quikstats_retry <= 3)
    goto :TRYPROMPTAGAIN
  end
end
getwordpos $player~stats $player~pos "Figs "
if ($player~pos = 0)
  add $player~quikstats_retry 1
  if ($player~quikstats_retry <= 3)
    goto :TRYPROMPTAGAIN
  end
end
setvar $player~current_word 1
getword $player~stats $player~wordy $player~current_word
:player~parsestats

if ($player~wordy <> "@@@")
  if ($player~wordy = "Sect")
    getword $player~stats $player~current_sector ($player~current_word + 1)
  elseif ($player~wordy = "Turns")
    getword $player~stats $player~turns ($player~current_word + 1)
    if ($player~unlimitedgame = TRUE)
      setvar $player~turns 65000
    end
  elseif ($player~wordy = "Creds")
    getword $player~stats $player~credits ($player~current_word + 1)
  elseif ($player~wordy = "Figs")
    getword $player~stats $player~fighters ($player~current_word + 1)
    savevar $player~fighters
  elseif ($player~wordy = "Shlds")
    getword $player~stats $player~shields ($player~current_word + 1)
    savevar $player~shields
  elseif ($player~wordy = "Hlds")
    getword $player~stats $player~total_holds ($player~current_word + 1)
  elseif ($player~wordy = "Ore")
    getword $player~stats $player~ore_holds ($player~current_word + 1)
  elseif ($player~wordy = "Org")
    getword $player~stats $player~organic_holds ($player~current_word + 1)
  elseif ($player~wordy = "Equ")
    getword $player~stats $player~equipment_holds ($player~current_word + 1)
  elseif ($player~wordy = "Col")
    getword $player~stats $player~colonist_holds ($player~current_word + 1)
  elseif ($player~wordy = "Phot")
    getword $player~stats $player~photons ($player~current_word + 1)
  elseif ($player~wordy = "Armd")
    getword $player~stats $player~armids ($player~current_word + 1)
  elseif ($player~wordy = "Lmpt")
    getword $player~stats $player~limpets ($player~current_word + 1)
  elseif ($player~wordy = "GTorp")
    getword $player~stats $player~genesis ($player~current_word + 1)
  elseif ($player~wordy = "TWarp")
    getword $player~stats $player~twarp_type ($player~current_word + 1)
  elseif ($player~wordy = "Clks")
    getword $player~stats $player~cloaks ($player~current_word + 1)
  elseif ($player~wordy = "Beacns")
    getword $player~stats $player~beacons ($player~current_word + 1)
  elseif ($player~wordy = "AtmDt")
    getword $player~stats $player~atomic ($player~current_word + 1)
  elseif ($player~wordy = "Corbo")
    getword $player~stats $player~corbo ($player~current_word + 1)
  elseif ($player~wordy = "EPrb")
    getword $player~stats $player~eprobes ($player~current_word + 1)
  elseif ($player~wordy = "MDis")
    getword $player~stats $player~mine_disruptors ($player~current_word + 1)
  elseif ($player~wordy = "PsPrb")
    getword $player~stats $player~psychic_probe ($player~current_word + 1)
  elseif ($player~wordy = "PlScn")
    getword $player~stats $player~planet_scanner ($player~current_word + 1)
  elseif ($player~wordy = "LRS")
    getword $player~stats $player~scan_type ($player~current_word + 1)
  elseif ($player~wordy = "Aln")
    getword $player~stats $player~alignment ($player~current_word + 1)
  elseif ($player~wordy = "Exp")
    getword $player~stats $player~experience ($player~current_word + 1)
  elseif ($player~wordy = "Corp")
    getword $player~stats $player~corp ($player~current_word + 1)
    setvar $player~corpnumber $player~corp
    savevar $player~corpnumber
  elseif ($player~wordy = "Ship")
    getword $player~stats $player~ship_number ($player~current_word + 1)
    getword $player~stats $player~ship_type ($player~current_word + 2)
  end
  add $player~current_word 1
  getword $player~stats $player~wordy $player~current_word
  goto :PARSESTATS
end
if ($player~current_prompt = "Undefined")
  settextlinetrigger PROMPTAFTERSTATS :PROMPTAFTERSTATS #145&#8
  setdelaytrigger NOPROMPT :NOPROMPT 1000
  pause
end
goto :DONEQUIKSTATS
:player~promptafterstats

killtrigger NOPROMPT
gosub :PARSE_CURRENT_PROMPT_LINE
goto :DONEQUIKSTATS
:player~noprompt

killtrigger PROMPTAFTERSTATS
goto :DONEQUIKSTATS
:player~donequikstats

killtrigger STATLINETRIG
killtrigger GETLINE2
killtrigger PROMPT
setvar $player~empty_holds $player~total_holds
subtract $player~empty_holds $player~ore_holds
subtract $player~empty_holds $player~organic_holds
subtract $player~empty_holds $player~equipment_holds
subtract $player~empty_holds $player~colonist_holds
savevar $player~unlimitedgame
if ($player~save)
  savevar $player~corp
  savevar $player~credits
  savevar $player~current_sector
  savevar $player~turns
  savevar $player~fighters
  savevar $player~shields
  savevar $player~total_holds
  savevar $player~ore_holds
  savevar $player~organic_holds
  savevar $player~equipment_holds
  savevar $player~colonist_holds
  savevar $player~empty_holds
  savevar $player~photons
  savevar $player~armids
  savevar $player~limpets
  savevar $player~genesis
  savevar $player~twarp_type
  savevar $player~cloaks
  savevar $player~beacons
  savevar $player~atomic
  savevar $player~corbo
  savevar $player~eprobes
  savevar $player~mine_disruptors
  savevar $player~psychic_probe
  savevar $player~planet_scanner
  savevar $player~scan_type
  savevar $player~alignment
  savevar $player~experience
  savevar $player~ship_number
  savevar $player~trader_name
end
return
:player~getcourse







































































































































































































































































































if (($player~destination <= 0) or ($player~destination = ""))
  setvar $player~courselength 0
  return
end
if (($player~starting_point <= 0) or ($player~starting_point = ""))
  setvar $player~starting_point CURRENTSECTOR
end


getcourse $player~course $player~starting_point $player~destination
if ($player~course > 0)
  setvar $player~courselength ($player~course + 1)
  return
end

setvar $player~sectors ""
setarray $player~course 80
settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
send "^f"&$player~starting_point&"*"&$player~destination&"*"
pause
:player~gotsectors

setvar $player~sectors $player~sectors&" :::"
setvar $player~courselength 0
setvar $player~index 1
goto :KEEPGOING
:player~keepgoing

getword $player~sectors $player~course[$player~index] $player~index
while ($player~course[$player~index] <> ":::")
  add $player~courselength 1
  add $player~index 1
  getword $player~sectors $player~course[$player~index] $player~index
end
return
:player~sectorsline






killtrigger SECTORLINETRIG
killtrigger SECTORLINETRIG2
killtrigger SECTORLINETRIG3
killtrigger SECTORLINETRIG4
killtrigger DONEPATH
killtrigger DONEPATH2
setvar $player~line CURRENTLINE
replacetext $player~line ">" " "
striptext $player~line "("
striptext $player~line ")"
setvar $player~line $player~line&" "
getwordpos $player~line $player~pos "So what's the point?"
getwordpos $player~line $player~pos2 ": ENDINTERROG"
getwordpos $player~line $player~pos3 " No route within "

if (($player~pos > 0) or ($player~pos2 > 0) or ($player~pos3 > 0))
  goto :NOPATH
end
getwordpos $player~line $player~pos " sector "
getwordpos $player~line $player~pos2 "TO"

if (($player~pos <= 0) and ($player~pos2 <= 0))
  setvar $player~sectors $player~sectors&" "&$player~line
end
getwordpos $player~line $player~pos " "&$player~destination&" "
getwordpos $player~line $player~pos2 "("&$player~destination&")"
getwordpos $player~line $player~pos3 "TO"

if ((($player~pos > 0) or ($player~pos2 > 0)) and ($player~pos3 <= 0))
  send "* q "
  goto :GOTSECTORS
end
settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
settextlinetrigger SECTORLINETRIG2 :SECTORSLINE " "&$player~destination&" "
settextlinetrigger SECTORLINETRIG3 :SECTORSLINE " "&$player~destination
settextlinetrigger SECTORLINETRIG4 :SECTORSLINE "("&$player~destination&")"
settextlinetrigger DONEPATH :SECTORSLINE "So what's the point?"
settextlinetrigger DONEPATH2 :SECTORSLINE ": ENDINTERROG"

pause
:player~nopath

send "q '{" $switchboard~bot_name "} - No path to that sector, cannot mow!*"
setvar $player~course 0
setvar $player~courselength 0
return
:player~addfigtodata






while (($player~target > 0) and ($player~target <= SECTORS))
  setsectorparameter $player~target "FIGSEC" TRUE
end
return
:player~removefigfromdata



getsectorparameter $player~target "FIGSEC" $player~check
if ($player~check = TRUE)
  getsectorparameter 2 "FIG_COUNT" $player~figcount
  setsectorparameter 2 "FIG_COUNT" ($player~figcount - 1)
end
setsectorparameter $player~target "FIGSEC" FALSE
return
:player~msgs_off


































setvar $player~was_silent FALSE
setvar $player~was_silent FALSE
:player~msgs_off_again

settexttrigger ONMSGS_ON :ONMSGS_ON "Displaying all messages."
settexttrigger ONMSGS_OFF :ONMSGS_OFF "Silencing all messages."
send "|"
pause
:player~onmsgs_on

killtrigger ONMSGS_OFF
setvar $player~was_silent TRUE
setvar $player~was_silent TRUE
goto :MSGS_OFF_AGAIN
:player~onmsgs_off

killtrigger ONMSGS_ON
return
:player~msgs_on



setvar $player~was_silent TRUE
setvar $player~was_silent TRUE
:player~msgs_on_again

settexttrigger ONMSGS_ON2 :ONMSGS_ON2 "Displaying all messages."
settexttrigger ONMSGS_OFF2 :ONMSGS_OFF2 "Silencing all messages."
send "|"
pause
:player~onmsgs_off2

killtrigger ONMSGS_ON2
setvar $player~was_silent FALSE
setvar $player~was_silent FALSE
goto :MSGS_ON_AGAIN
:player~onmsgs_on2

killtrigger ONMSGS_OFF2
return
