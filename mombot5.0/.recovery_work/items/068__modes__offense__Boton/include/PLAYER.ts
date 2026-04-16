:PLAYER~INIT







setarray $PLAYER~TRADERS 50
setarray $PLAYER~FAKETRADERS 50
setvar $PLAYER~RANKSLENGTH 47
setarray $PLAYER~RANKS $PLAYER~RANKSLENGTH
setvar $PLAYER~RANKS[1] "36mCivilian"
setvar $PLAYER~RANKS[2] "36mPrivate 1st Class"
setvar $PLAYER~RANKS[3] "36mPrivate"
setvar $PLAYER~RANKS[4] "36mLance Corporal"
setvar $PLAYER~RANKS[5] "36mCorporal"
setvar $PLAYER~RANKS[6] "36mStaff Sergeant"
setvar $PLAYER~RANKS[7] "36mGunnery Sergeant"
setvar $PLAYER~RANKS[8] "36m1st Sergeant"
setvar $PLAYER~RANKS[9] "36mSergeant Major"
setvar $PLAYER~RANKS[10] "36mSergeant"
setvar $PLAYER~RANKS[11] "31mAnnoyance"
setvar $PLAYER~RANKS[12] "31mNuisance 3rd Class"
setvar $PLAYER~RANKS[13] "31mNuisance 2nd Class"
setvar $PLAYER~RANKS[14] "31mNuisance 1st Class"
setvar $PLAYER~RANKS[15] "31mMenace 3rd Class"
setvar $PLAYER~RANKS[16] "31mMenace 2nd Class"
setvar $PLAYER~RANKS[17] "31mMenace 1st Class"
setvar $PLAYER~RANKS[18] "31mSmuggler 3rd Class"
setvar $PLAYER~RANKS[19] "31mSmuggler 2nd Class"
setvar $PLAYER~RANKS[20] "31mSmuggler 1st Class"
setvar $PLAYER~RANKS[21] "31mSmuggler Savant"
setvar $PLAYER~RANKS[22] "31mRobber"
setvar $PLAYER~RANKS[23] "31mTerrorist"
setvar $PLAYER~RANKS[24] "31mInfamous Pirate"
setvar $PLAYER~RANKS[25] "31mNotorious Pirate"
setvar $PLAYER~RANKS[26] "31mDread Pirate"
setvar $PLAYER~RANKS[27] "31mPirate"
setvar $PLAYER~RANKS[28] "31mGalactic Scourge"
setvar $PLAYER~RANKS[29] "31mEnemy of the State"
setvar $PLAYER~RANKS[30] "31mEnemy of the People"
setvar $PLAYER~RANKS[31] "31mEnemy of Humankind"
setvar $PLAYER~RANKS[32] "31mHeinous Overlord"
setvar $PLAYER~RANKS[33] "31mPrime Evil"
setvar $PLAYER~RANKS[34] "36mChief Warrant Officer"
setvar $PLAYER~RANKS[35] "36mWarrant Officer"
setvar $PLAYER~RANKS[36] "36mEnsign"
setvar $PLAYER~RANKS[37] "36mLieutenant J.G."
setvar $PLAYER~RANKS[38] "36mLieutenant Commander"
setvar $PLAYER~RANKS[39] "36mLieutenant"
setvar $PLAYER~RANKS[40] "36mCommander"
setvar $PLAYER~RANKS[41] "36mCaptain"
setvar $PLAYER~RANKS[42] "36mCommodore"
setvar $PLAYER~RANKS[43] "36mRear Admiral"
setvar $PLAYER~RANKS[44] "36mVice Admiral"
setvar $PLAYER~RANKS[45] "36mFleet Admiral"
setvar $PLAYER~RANKS[46] "36mAdmiral"
setvar $PLAYER~LASTTARGET ""


return
:PLAYER~QUIKSTATS


setvar $PLAYER~CURRENT_PROMPT "Undefined"
killtrigger NOPROMPT
killtrigger PROMPT
killtrigger STATLINETRIG
killtrigger GETLINE2
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
settextlinetrigger STATLINETRIG :STATSTART #179
send #145&"/"
pause
:PLAYER~ALLPROMPTS
getword CURRENTLINE $PLAYER~CURRENT_PROMPT 1
setvar $PLAYER~FULL_CURRENT_PROMPT CURRENTLINE
striptext $PLAYER~FULL_CURRENT_PROMPT #145
striptext $PLAYER~FULL_CURRENT_PROMPT #8
striptext $PLAYER~CURRENT_PROMPT #145
striptext $PLAYER~CURRENT_PROMPT #8
settextlinetrigger PROMPT :ALLPROMPTS #145&#8
pause
:PLAYER~STATSTART
killtrigger PROMPT
setvar $PLAYER~STATS ""
setvar $PLAYER~WORDY ""
:PLAYER~STATSLINE
killtrigger STATLINETRIG
killtrigger GETLINE2
setvar $PLAYER~LINE2 CURRENTLINE
replacetext $PLAYER~LINE2 #179 " "
striptext $PLAYER~LINE2 ","
setvar $PLAYER~STATS $PLAYER~STATS&$PLAYER~LINE2
getwordpos $PLAYER~LINE2 $PLAYER~POS "Ship"
if ($PLAYER~POS > 0)
  goto :GOTSTATS
else
  settextlinetrigger GETLINE2 :STATSLINE
  pause
end
:PLAYER~GOTSTATS
setvar $PLAYER~STATS $PLAYER~STATS&" @@@"
setvar $PLAYER~CURRENT_WORD 0
if ($PLAYER~WORDY <> "@@@")
  if ($PLAYER~WORDY = "Sect")
    getword $PLAYER~STATS $PLAYER~CURRENT_SECTOR ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Turns")
    getword $PLAYER~STATS $PLAYER~TURNS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Creds")
    getword $PLAYER~STATS $PLAYER~CREDITS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Figs")
    getword $PLAYER~STATS $PLAYER~FIGHTERS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Shlds")
    getword $PLAYER~STATS $PLAYER~SHIELDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Hlds")
    getword $PLAYER~STATS $PLAYER~TOTAL_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Ore")
    getword $PLAYER~STATS $PLAYER~ORE_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Org")
    getword $PLAYER~STATS $PLAYER~ORGANIC_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Equ")
    getword $PLAYER~STATS $PLAYER~EQUIPMENT_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Col")
    getword $PLAYER~STATS $PLAYER~COLONIST_HOLDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Phot")
    getword $PLAYER~STATS $PLAYER~PHOTONS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Armd")
    getword $PLAYER~STATS $PLAYER~ARMIDS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Lmpt")
    getword $PLAYER~STATS $PLAYER~LIMPETS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "GTorp")
    getword $PLAYER~STATS $PLAYER~GENESIS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "TWarp")
    getword $PLAYER~STATS $PLAYER~TWARP_TYPE ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Clks")
    getword $PLAYER~STATS $PLAYER~CLOAKS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Beacns")
    getword $PLAYER~STATS $PLAYER~BEACONS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "AtmDt")
    getword $PLAYER~STATS $PLAYER~ATOMIC ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Corbo")
    getword $PLAYER~STATS $PLAYER~CORBO ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "EPrb")
    getword $PLAYER~STATS $PLAYER~EPROBES ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "MDis")
    getword $PLAYER~STATS $PLAYER~MINE_DISRUPTORS ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "PsPrb")
    getword $PLAYER~STATS $PLAYER~PSYCHIC_PROBE ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "PlScn")
    getword $PLAYER~STATS $PLAYER~PLANET_SCANNER ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "LRS")
    getword $PLAYER~STATS $PLAYER~SCAN_TYPE ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Aln")
    getword $PLAYER~STATS $PLAYER~ALIGNMENT ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Exp")
    getword $PLAYER~STATS $PLAYER~EXPERIENCE ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Corp")
    getword $PLAYER~STATS $PLAYER~CORP ($PLAYER~CURRENT_WORD + 1)
  elseif ($PLAYER~WORDY = "Ship")
    getword $PLAYER~STATS $PLAYER~SHIP_NUMBER ($PLAYER~CURRENT_WORD + 1)
  end
  add $PLAYER~CURRENT_WORD 1
  getword $PLAYER~STATS $PLAYER~WORDY $PLAYER~CURRENT_WORD
end
:PLAYER~DONEQUIKSTATS
killtrigger STATLINETRIG
killtrigger GETLINE2
return
:PLAYER~GETINFO



setvar $PLAYER~NOFLIP FALSE
setvar $PLAYER~PHOTONS 0
setvar $PLAYER~SCAN_TYPE "None"
setvar $PLAYER~TWARP_TYPE 0
setvar $PLAYER~CORPSTRING "[0]"
setvar $PLAYER~IGSTAT 0
settextlinetrigger GETINFO_CN9_CHECK_1 :GETINFO_CN9_CHECK "<N> Interdictor Control"
settextlinetrigger GETINFO_CN9_CHECK_2 :GETINFO_CN9_CHECK "<N> Move to NavPoint"
:PLAYER~WAITONINFO
send "?I"
waiton "<Info>"
settextlinetrigger GETTRADERNAME :GETTRADERNAME "Trader Name    :"
settextlinetrigger GETEXPANDALIGN :GETEXPANDALIGN "Rank and Exp"
settextlinetrigger GETCORP :GETCORP "Corp           #"
settextlinetrigger GETSHIPTYPE :GETSHIPTYPE "Ship Info      :"
settextlinetrigger GETTPW :GETTPW "Turns to Warp  :"
settextlinetrigger GETSECT :GETSECT "Current Sector :"
settextlinetrigger GETTURNS :GETTURNS "Turns left"
settextlinetrigger GETHOLDS :GETHOLDS "Total Holds"
settextlinetrigger GETFIGHTERS :GETFIGHTERS "Fighters       :"
settextlinetrigger GETSHIELDS :GETSHIELDS "Shield points  :"
settextlinetrigger GETPHOTONS :GETPHOTONS "Photon Missiles:"
settextlinetrigger GETSCANTYPE :GETSCANTYPE "LongRange Scan :"
settextlinetrigger GETTWARPTYPE1 :GETTWARPTYPE1 "  (Type 1 Jump):"
settextlinetrigger GETTWARPTYPE2 :GETTWARPTYPE2 "  (Type 2 Jump):"
settextlinetrigger GETCREDITS :GETCREDITS "Credits"
settextlinetrigger CHECKIG :CHECKIG "Interdictor ON :"
settexttrigger GETINFODONE :GETINFODONE "Command [TL="
settexttrigger GETINFODONE2 :GETINFODONE "Citadel command"
pause
:PLAYER~GETINFO_CN9_CHECK
setvar $PLAYER~NOFLIP TRUE
pause
:PLAYER~GETTRADERNAME
killtrigger GETINFO_CN9_CHECK_1
killtrigger GETINFO_CN9_CHECK_2
setvar $PLAYER~TRADER_NAME CURRENTLINE
striptext $PLAYER~TRADER_NAME "Trader Name    : "
setvar $PLAYER~I 1
while ($PLAYER~I <= $PLAYER~RANKSLENGTH)
  setvar $PLAYER~TEMP $PLAYER~RANKS[$PLAYER~I]
  striptext $PLAYER~TEMP "31m"
  striptext $PLAYER~TEMP "36m"
  striptext $PLAYER~TRADER_NAME $PLAYER~TEMP&" "
  add $PLAYER~I 1
end
pause
:PLAYER~GETEXPANDALIGN
getword CURRENTLINE $PLAYER~EXPERIENCE 5
getword CURRENTLINE $PLAYER~ALIGNMENT 7
striptext $PLAYER~EXPERIENCE ","
striptext $PLAYER~ALIGNMENT ","
striptext $PLAYER~ALIGNMENT "Alignment="
pause
:PLAYER~GETCORP
getword CURRENTLINE $PLAYER~CORP 3
striptext $PLAYER~CORP ","
setvar $PLAYER~CORPSTRING "["&$PLAYER~CORP&"]"
pause
:PLAYER~GETSHIPTYPE
getwordpos CURRENTLINE $PLAYER~SHIPTYPEEND "Ported="
subtract $PLAYER~SHIPTYPEEND 18
cuttext CURRENTLINE $PLAYER~SHIP_TYPE 18 $PLAYER~SHIPTYPEEND
pause
:PLAYER~GETTPW
getword CURRENTLINE $PLAYER~TURNS_PER_WARP 5
pause
:PLAYER~GETSECT
getword CURRENTLINE $PLAYER~CURRENT_SECTOR 4
pause
:PLAYER~GETTURNS
getword CURRENTLINE $PLAYER~TURNS 4
if ($PLAYER~TURNS = "Unlimited")
  setvar $PLAYER~TURNS 65000
  setvar $PLAYER~UNLIMITEDGAME TRUE
end
savevar $PLAYER~UNLIMITEDGAME
pause
:PLAYER~GETHOLDS
setvar $PLAYER~TEMP CURRENTLINE&" "
gettext $PLAYER~TEMP $PLAYER~ORE_HOLDS "Ore=" " "
if ($PLAYER~ORE_HOLDS = "")
  setvar $PLAYER~ORE_HOLDS 0
end
gettext $PLAYER~TEMP $PLAYER~ORGANIC_HOLDS "Organics=" " "
if ($PLAYER~ORGANIC_HOLDS = "")
  setvar $PLAYER~ORGANIC_HOLDS 0
end
gettext $PLAYER~TEMP $PLAYER~EQUIPMENT_HOLDS "Equipment=" " "
if ($PLAYER~EQUIPMENT_HOLDS = "")
  setvar $PLAYER~EQUIPMENT_HOLDS 0
end
gettext $PLAYER~TEMP $PLAYER~COLONIST_HOLDS "Colonists=" " "
if ($PLAYER~COLONIST_HOLDS = "")
  setvar $PLAYER~COLONIST_HOLDS 0
end
gettext $PLAYER~TEMP $PLAYER~EMPTY_HOLDS "Empty=" " "
if ($PLAYER~EMPTY_HOLDS = "")
  setvar $PLAYER~EMPTY_HOLDS 0
end
pause
:PLAYER~GETFIGHTERS
getword CURRENTLINE $PLAYER~FIGHTERS 3
striptext $PLAYER~FIGHTERS ","
pause
:PLAYER~GETSHIELDS
getword CURRENTLINE $PLAYER~SHIELDS 4
striptext $PLAYER~SHIELDS ","
pause
:PLAYER~GETPHOTONS
getword CURRENTLINE $PLAYER~PHOTONS 3
pause
:PLAYER~GETSCANTYPE
getword CURRENTLINE $PLAYER~SCAN_TYPE 4
pause
:PLAYER~GETTWARPTYPE1
getword CURRENTLINE $PLAYER~TWARP_1_RANGE 4
setvar $PLAYER~TWARP_TYPE 1
pause
:PLAYER~GETTWARPTYPE2
getword CURRENTLINE $PLAYER~TWARP_2_RANGE 4
setvar $PLAYER~TWARP_TYPE 2
pause
:PLAYER~GETCREDITS
getword CURRENTLINE $PLAYER~CREDITS 3
striptext $PLAYER~CREDITS ","
if ($PLAYER~IGSTAT = 0)
  setvar $PLAYER~IGSTAT "NO IG"
end
pause
:PLAYER~CHECKIG
getword CURRENTLINE $PLAYER~IGSTAT 4
pause
:PLAYER~GETINFODONE
killtrigger GETEXPANDALIGN
killtrigger GETCORP
killtrigger GETSHIPTYPE
killtrigger GETTPW
killtrigger GETSECT
killtrigger GETTURNS
killtrigger GETHOLDS
killtrigger GETFIGHTERS
killtrigger GETSHIELDS
killtrigger GETPHOTONS
killtrigger GETSCANTYPE
killtrigger GETTWARPTYPE1
killtrigger GETTWARPTYPE2
killtrigger GETCREDITS
killtrigger CHECKIG
killtrigger GETINFODONE
killtrigger GETINFODONE2

return
:PLAYER~CURRENT_PROMPT



settexttrigger PROMPT :ALLPROMPTSCATCH #145&#8
setdelaytrigger PROMPT_DELAY :CURRENT_PROMPT_DELAY 5000
send #145
pause
:PLAYER~CURRENT_PROMPT_DELAY
settextouttrigger ATKEYS :CURRENT_PROMPT_AT_KEYS
setdelaytrigger PROMPT_DELAY :VERIFYDELAY 30000
pause
:PLAYER~CURRENT_PROMPT_AT_KEYS
getouttext $PLAYER~OUT
send $PLAYER~OUT
killtrigger PROMPT_DELAY
return
:PLAYER~ALLPROMPTSCATCH
killtrigger PROMPT_DELAY
getword CURRENTLINE $PLAYER~CURRENT_PROMPT 1
if ($PLAYER~CURRENT_PROMPT = 0)
  getword CURRENTANSILINE $PLAYER~CURRENT_PROMPT 1
end
striptext $PLAYER~CURRENT_PROMPT #145
striptext $PLAYER~CURRENT_PROMPT #8
setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
return
:PLAYER~VERIFYDELAY

killalltriggers
disconnect
:PLAYER~FASTATTACK

setvar $PLAYER~TARGETSTRING "a"
setvar $PLAYER~ISFOUND FALSE
getwordpos $SECTOR~SECTORDATA $PLAYER~BEACONPOS "[0m[35mBeacon  [1;33m:"
:PLAYER~CHECKINGFIGS
if ($PLAYER~FIGHTERS <= 0)
  gosub :QUIKSTATS
  if ($PLAYER~FIGHTERS <= 0)
    echo ANSI_12 "*You have no fighters.*" ANSI_7
    goto :STOPPINGPOINT
  end
end
if ((($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK)) and ($PLAYER~BEACONPOS > 0))
  setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"*"
end
if (($SECTOR~EMPTYSHIPCOUNT + ($SECTOR~FAKETRADERCOUNT + $SECTOR~REALTRADERCOUNT)) > 0)
  setvar $PLAYER~I 0
  while ($PLAYER~I < ($SECTOR~EMPTYSHIPCOUNT + $SECTOR~FAKETRADERCOUNT))
    setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    add $PLAYER~I 1
  end
  setvar $PLAYER~C 1
  if (($PLAYER~C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))

    if ($PLAYER~TRADERS[$PLAYER~C][1] = $PLAYER~CORP)
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    elseif ((($PLAYER~CURRENT_SECTOR <= 10) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)) and ($PLAYER~TRADERS[$PLAYER~C][2] = TRUE))
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"zy z"
    end
    add $PLAYER~C 1
  end
else
  setvar $SWITCHBOARD~MESSAGE "You have no targets.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :STOPPINGPOINT
end
if ($PLAYER~ISFOUND = TRUE)
  setvar $PLAYER~ATTACKSTRING ""
  while ($PLAYER~FIGHTERS > 0)
    if ($PLAYER~FIGHTERS < $SHIP~SHIP_MAX_ATTACK)
      setvar $PLAYER~ATTACKSTRING $PLAYER~ATTACKSTRING&$PLAYER~TARGETSTRING&$PLAYER~FIGHTERS&"* * "
      setvar $PLAYER~FIGHTERS 0
    else
      setvar $PLAYER~ATTACKSTRING $PLAYER~ATTACKSTRING&$PLAYER~TARGETSTRING&$SHIP~SHIP_MAX_ATTACK&"* * "
      setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $SHIP~SHIP_MAX_ATTACK)
    end
  end
else
  setvar $SWITCHBOARD~MESSAGE "You have no valid targets.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :STOPPINGPOINT
end
send $PLAYER~ATTACKSTRING&"* "
gosub :QUIKSTATS
:PLAYER~STOPPINGPOINT
return
:PLAYER~FASTCAPTURE

setvar $PLAYER~ISFOUND FALSE
setvar $PLAYER~TARGETISALIEN FALSE
setvar $PLAYER~STILLSHIELDS FALSE
getwordpos $SECTOR~SECTORDATA $PLAYER~BEACONPOS "[0m[35mBeacon  [1;33m:"
:PLAYER~CHECKINGFIGS
if ($PLAYER~FIGHTERS <= 0)
  gosub :QUIKSTATS
  if ($PLAYER~FIGHTERS <= 0)
    setvar $SWITCHBOARD~MESSAGE "No fighters on ship.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    goto :CAPSTOPPINGPOINT
  else
    goto :CHECKINGFIGS
  end
end
if (($SECTOR~REALTRADERCOUNT > $SECTOR~CORPIECOUNT) and ($PLAYER~ONLYALIENS <> TRUE))
  setvar $PLAYER~TARGETSTRING "a "
  if ((($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK)) and ($PLAYER~BEACONPOS > 0))
    setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
  end
  setvar $PLAYER~I 0
  while ($PLAYER~I < ($SECTOR~EMPTYSHIPCOUNT + $SECTOR~FAKETRADERCOUNT))
    setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    add $PLAYER~I 1
  end
  setvar $PLAYER~C 1
  if (($PLAYER~C <= $SECTOR~REALTRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))
    if ((($PLAYER~CURRENT_SECTOR <= 10) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK)) and ($PLAYER~TRADERS[$PLAYER~C][2] = TRUE))
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    elseif ($PLAYER~TRADERS[$PLAYER~C][1] = $PLAYER~CORP)
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGCORP = TRUE) and ($PLAYER~TRADERS[$PLAYER~C][1] <> $PLAYER~TARGET))
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    elseif (($PLAYER~TARGETINGPERSON = TRUE) and ($PLAYER~TRADERS[$PLAYER~C] <> $PLAYER~TARGET))
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"zy z"
    end
    add $PLAYER~C 1
  end
end
if ((($SECTOR~FAKETRADERCOUNT > 0) and ($PLAYER~CAPPINGALIENS = TRUE)) and ($PLAYER~ISFOUND <> TRUE))
  setvar $PLAYER~TARGETSTRING "a "
  if ((($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK)) and ($PLAYER~BEACONPOS > 0))
    setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
  end
  setvar $PLAYER~A 1
  while (($PLAYER~A <= $SECTOR~FAKETRADERCOUNT) and ($PLAYER~ISFOUND = FALSE))
    getwordpos $PLAYER~FAKETRADERS[$PLAYER~A] $PLAYER~POS "Zyrain"
    getwordpos $PLAYER~FAKETRADERS[$PLAYER~A] $PLAYER~POS2 "Clausewitz"
    getwordpos $PLAYER~FAKETRADERS[$PLAYER~A] $PLAYER~POS3 "Nelson"
    if (($PLAYER~POS <= 0) and (($PLAYER~POS2 <= 0) and ($PLAYER~POS3 <= 0)))
      setvar $PLAYER~I 0
      setvar $PLAYER~ISFOUND TRUE
      setvar $PLAYER~TARGETISALIEN TRUE
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"zy z"
    else
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    end
    add $PLAYER~A 1
  end
end
if (($PLAYER~ISFOUND = FALSE) and (($SECTOR~EMPTYSHIPCOUNT > 0) and (($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK))))
  setvar $PLAYER~TARGETSTRING "a "
  if ((($PLAYER~CURRENT_SECTOR > 10) and ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK)) and ($PLAYER~BEACONPOS > 0))
    setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
  end
  setvar $PLAYER~C 1
  setvar $PLAYER~ISFOUND FALSE
  while (($PLAYER~C <= $SECTOR~EMPTYSHIPCOUNT) and ($PLAYER~ISFOUND = FALSE))
    if (($PLAYER~EMPTYSHIPS[$PLAYER~C] = $PLAYER~CORP) or ($PLAYER~EMPTYSHIPS[$PLAYER~C] = $PLAYER~TRADER_NAME))
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"* "
    else
      setvar $PLAYER~ISFOUND TRUE
      setvar $PLAYER~TARGETSTRING $PLAYER~TARGETSTRING&"zy z"
    end
    add $PLAYER~C 1
  end
end
if ($PLAYER~ISFOUND = FALSE)
  setvar $SWITCHBOARD~MESSAGE "You have no targets.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  goto :CAPSTOPPINGPOINT
else
  setvar $PLAYER~ATTACKSTRING ""
  :PLAYER~CAP_SHIP

  setvar $PLAYER~UNMANNED "NO"
  setvar $PLAYER~OWN_ODDS $SHIP~SHIP_OFFENSIVE_ODDS
  setvar $PLAYER~CAP_POINTS 0
  setvar $PLAYER~MAX_FIGS 0
  setvar $PLAYER~CAP_SHIELD_POINTS 0
  setvar $PLAYER~SHIP_FIGHTERS 0
  setvar $PLAYER~LASTTARGET ""
  if ($PLAYER~FIGHTERS > 0)
    setvar $PLAYER~STILLSHIELDS FALSE
    setvar $PLAYER~ISSAMETARGET FALSE
    :PLAYER~CGOAHEAD
    settexttrigger FOUNDCAPTARGET :FOUNDCAPTARGET "(Y/N) [N]? Y"
    settextlinetrigger NOCTARGET :NOCAPPINGTARGETS "Do you want instructions (Y/N) [N]?"
    send $PLAYER~TARGETSTRING
    pause
    :PLAYER~FOUNDCAPTARGET
    killtrigger NOCTARGET
    killtrigger FOUNDCAPTARGET
    setvar $PLAYER~CAP_SHIP_INFO CURRENTLINE
    setvar $PLAYER~THISTARGET CURRENTANSILINE
    getword $PLAYER~CAP_SHIP_INFO $PLAYER~ATTACK_PROMPT 1
    if ($PLAYER~ATTACK_PROMPT <> "Attack")
      return
    end
    getwordpos $PLAYER~THISTARGET $PLAYER~POS "[0;33m([1;36m"
    cuttext $PLAYER~THISTARGET $PLAYER~THISTARGET 1 $PLAYER~POS
    if ($PLAYER~THISTARGET = $PLAYER~LASTTARGET)
      setvar $PLAYER~ISSAMETARGET TRUE
    elseif ($PLAYER~LASTTARGET = "")
      setvar $PLAYER~LASTTARGET $PLAYER~THISTARGET
    else
      goto :NOCAPPINGTARGETS
    end
    if ($PLAYER~ISSAMETARGET)
      goto :SEND_ATTACK
    end
    :PLAYER~SHIP_TYPE
    setvar $PLAYER~TYPE_COUNT 0
    setvar $PLAYER~IS_SHIP 0
    while ($PLAYER~TYPE_COUNT < $SHIP~SHIPCOUNTER)
      add $PLAYER~TYPE_COUNT 1
      getwordpos $PLAYER~CAP_SHIP_INFO $PLAYER~IS_SHIP $SHIP~SHIPLIST[$PLAYER~TYPE_COUNT]
      getwordpos $PLAYER~CAP_SHIP_INFO $PLAYER~UNMAN "'s unmanned"
      if ($PLAYER~UNMAN > 0)
        setvar $PLAYER~UNMANNED "YES"
      else
        setvar $PLAYER~UNMANNED "NO"
      end
      if (($PLAYER~IS_SHIP > 0) and ($SHIP~SHIPLIST[$PLAYER~TYPE_COUNT] <> 0))
        getword $SHIP~SHIP[$SHIP~SHIPLIST[$PLAYER~TYPE_COUNT]] $PLAYER~SHIELDS 1
        getword $SHIP~SHIP[$SHIP~SHIPLIST[$PLAYER~TYPE_COUNT]] $PLAYER~DEFODDS 2
        goto :SEND_ATTACK
      end
    end
    setvar $PLAYER~SHIELDS 10000
    setvar $PLAYER~DEFODDS 5
    goto :SEND_ATTACK
    setvar $SWITCHBOARD~MESSAGE "Unknown ship type, cannot calculate attack, you must do it manually.*"
    gosub :SWITCHBOARD~SWITCHBOARD
    send "* "
    return
    :PLAYER~SEND_ATTACK
    killtrigger FOUNDCAPTARGET
    killtrigger NOCTARGET
    killtrigger COMBAT
    killtrigger CAP_IT
    killtrigger NOTARGET
    killtrigger NOCOMBAT
    killtrigger THEYATTACKED

    gettext $PLAYER~CAP_SHIP_INFO $PLAYER~SHIP_FIGHTERS $SHIP~SHIPLIST[$PLAYER~TYPE_COUNT] "(Y/N)"
    if ($PLAYER~SHIP_FIGHTERS = "")
      gettext $PLAYER~CAP_SHIP_INFO $PLAYER~SHIP_FIGHTERS " (" ") (Y/N)"
    end
    gettext $PLAYER~SHIP_FIGHTERS $PLAYER~SHIP_FIGHTERS "-" ")"
    striptext $PLAYER~SHIP_FIGHTERS ","
    setvar $PLAYER~SHIP_SHIELD_PERCENT 0
    setvar $PLAYER~SHIELDPOINTS 0
    settextlinetrigger COMBAT :COMBAT_SCAN "Combat scanners show enemy shields at"
    settexttrigger NOCOMBAT :CAP_IT "How many fighters do you wish to use"
    settextlinetrigger NOTARGET :NOCAPPINGTARGETS "Do you want instructions (Y/N) [N]?"
    settextlinetrigger THEYATTACKED :THEYATTACKED "Shipboard Computers "
    pause
    :PLAYER~COMBAT_SCAN

    getword CURRENTLINE $PLAYER~SHIELDPERC 7
    striptext $PLAYER~SHIELDPERC "%"
    setvar $PLAYER~SHIELDPOINTS (($PLAYER~SHIELDS * $PLAYER~SHIELDPERC) / 100)
    setvar $PLAYER~STILLSHIELDS TRUE
    pause
    :PLAYER~THEYATTACKED
    setvar $PLAYER~SHIP_FIGHTERS 1
    :PLAYER~CAP_IT
    killtrigger COMBAT_SCAN
    killtrigger CAP_IT
    killtrigger NOTARGET
    killtrigger THEYATTACKED
    getword CURRENTLINE $PLAYER~MAX_FIGS 11
    striptext $PLAYER~MAX_FIGS ","
    striptext $PLAYER~MAX_FIGS ")"
    if ($PLAYER~SHIP_FIGHTERS = "")
      setvar $PLAYER~SHIP_FIGHTERS 1
    end
    setvar $PLAYER~CAP_POINTS (($PLAYER~SHIELDPOINTS + $PLAYER~SHIP_FIGHTERS) * $PLAYER~DEFODDS)
    if ((($PLAYER~DEFENDERCAPPING = TRUE) and ($PLAYER~UNMANNED <> "YES")) and ($PLAYER~TARGETISALIEN = TRUE))
      if ($PLAYER~SHIP_FIGHTERS > 100)
        setvar $PLAYER~FIGBUFFER (($PLAYER~SHIP_FIGHTERS * 2) / 100)
      else
        setvar $PLAYER~FIGBUFFER 0
      end
      if ($PLAYER~STILLSHIELDS = TRUE)
        if ($PLAYER~SHIP_FIGHTERS > 1000)
          setvar $PLAYER~CAP_POINTS (($PLAYER~CAP_POINTS / $PLAYER~OWN_ODDS) - ($PLAYER~CAP_POINTS / 100))
        else
          setvar $PLAYER~CAP_POINTS ($PLAYER~CAP_POINTS / $PLAYER~OWN_ODDS)
        end
      else
        setvar $PLAYER~CAP_POINTS 1
      end
    else
      setvar $PLAYER~CAP_POINTS (($PLAYER~CAP_POINTS / $PLAYER~OWN_ODDS) - ($PLAYER~CAP_POINTS / 100))
    end
    setvar $PLAYER~CAP_POINTS (($PLAYER~CAP_POINTS * 95) / 100)
    if ($PLAYER~UNMANNED = "YES")
      divide $PLAYER~CAP_POINTS 2
    end
    if ($PLAYER~CAP_POINTS <= 0)
      setvar $PLAYER~CAP_POINTS 1
    elseif ($PLAYER~CAP_POINTS > $PLAYER~MAX_FIGS)
      setvar $PLAYER~CAP_POINTS $PLAYER~MAX_FIGS
    end
    setvar $PLAYER~SENDATTACK $PLAYER~CAP_POINTS&"*"
    if ($PLAYER~STARTINGLOCATION = "Citadel")
      setvar $PLAYER~SENDATTACK $PLAYER~SENDATTACK&$PLAYER~REFURBSTRING
    end
    send $PLAYER~SENDATTACK
    setvar $PLAYER~FIGHTERS ($PLAYER~FIGHTERS - $PLAYER~CAP_POINTS)
    :PLAYER~KEEPCAPPING
  end
end
goto :CAPSTOPPINGPOINT
:PLAYER~NOCAPPINGTARGETS
killtrigger NOCTARGET
killtrigger FOUNDCAPTARGET
send "* "
:PLAYER~CAPSTOPPINGPOINT
return
:PLAYER~SURROUND
:PLAYER~STARTSURROUND


send "szh* "
killtrigger SURROUNDSECTOR
settexttrigger SURROUNDSECTOR :CONTINUESURROUNDSECTOR "["&$PLAYER~CURRENT_SECTOR&"]"
pause
:PLAYER~CONTINUESURROUNDSECTOR
if ($PLAYER~ALREADY_CHECKED_SHIP <> TRUE)
  gosub :SHIP~GETSHIPSTATS
end
if ($SHIP~SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
  setvar $SHIP~SHIP_MAX_ATTACK ($PLAYER~FIGHTERS / 2)
end

setvar $PLAYER~I 1
setvar $PLAYER~SURROUNDSTRING "c v 0* y* "&$PLAYER~CURRENT_SECTOR&"* q "
setvar $PLAYER~SURROUNDOUTPUT ""
setvar $PLAYER~YOUROWNCOUNT 0
if (SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$PLAYER~I] > 0)
  setvar $PLAYER~ADJ_SEC SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$PLAYER~I]
  getdistance $PLAYER~DISTANCE $PLAYER~ADJ_SEC $PLAYER~CURRENT_SECTOR
  if ($PLAYER~DISTANCE <= 0)
    send "^f"&$PLAYER~ADJ_SEC&"*"&$PLAYER~CURRENT_SECTOR&"*q"
    waiton "ENDINTERROG"
    getdistance $PLAYER~DISTANCE $PLAYER~ADJ_SEC $PLAYER~CURRENT_SECTOR
  end
  setvar $PLAYER~CONTAINSSHIELDEDPLANET FALSE
  setvar $PLAYER~P 1
  while ($PLAYER~P <= SECTOR.PLANETCOUNT[$PLAYER~ADJ_SEC])
    getword SECTOR.PLANETS[$PLAYER~ADJ_SEC][$PLAYER~P] $PLAYER~TEST 1
    if ($PLAYER~TEST = "<<<<")
      setvar $PLAYER~CONTAINSSHIELDEDPLANET TRUE
    end
    add $PLAYER~P 1
  end
  setvar $PLAYER~TEMPOFFODD $SHIP~SHIP_OFFENSIVE_ODDS
  multiply $PLAYER~TEMPOFFODD $SHIP~SHIP_MAX_ATTACK
  divide $PLAYER~TEMPOFFODD 12
  setvar $PLAYER~FIGOWNER SECTOR.FIGS.OWNER[$PLAYER~ADJ_SEC]
  setvar $PLAYER~MINEOWNER SECTOR.MINES.OWNER[$PLAYER~ADJ_SEC]
  setvar $PLAYER~LIMPOWNER SECTOR.LIMPETS.OWNER[$PLAYER~ADJ_SEC]
  if (($PLAYER~SURROUNDOVERWRITE = FALSE) and (($PLAYER~FIGOWNER = "belong to your Corp") or ($PLAYER~FIGOWNER = "yours")))
    add $PLAYER~YOUROWNCOUNT 1
    if ($PLAYER~YOUROWNCOUNT = $PLAYER~TOTALWARPS)
      setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) All sectors around are friendly fighters.*"
    end
  elseif (SECTOR.FIGS.QUANTITY[$PLAYER~ADJ_SEC] >= $PLAYER~TEMPOFFODD)
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Too many fighters in sector "&$PLAYER~ADJ_SEC&".*"
  elseif (($PLAYER~ADJ_SEC <= 10) or ($PLAYER~ADJ_SEC = $MAP~STARDOCK))
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided Fed Space, sector "&$PLAYER~ADJ_SEC&".*"
  elseif ((SECTOR.PLANETCOUNT[$PLAYER~ADJ_SEC] > 0) and $PLAYER~SURROUNDAVOIDALLPLANETS)
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided planet in sector "&$PLAYER~ADJ_SEC&".*"
  elseif (($PLAYER~CONTAINSSHIELDEDPLANET = TRUE) and ($PLAYER~SURROUNDAVOIDSHIELDEDONLY = TRUE))
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided shielded planet in sector "&$PLAYER~ADJ_SEC&".*"
  elseif ($PLAYER~DISTANCE > 1)
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided one way in sector "&$PLAYER~ADJ_SEC&".*"
  elseif (($PLAYER~SURROUNDPASSIVE = TRUE) and (((SECTOR.ANOMOLY[$PLAYER~ADJ_SEC] = TRUE) and (($PLAYER~LIMPOWNER <> "belong to your Corp") and ($PLAYER~LIMPOWNER <> "yours"))) or (SECTOR.FIGS.QUANTITY[$PLAYER~ADJ_SEC] > 0) or ((SECTOR.MINES.QUANTITY[$PLAYER~ADJ_SEC] > 0) and (($PLAYER~MINEOWNER <> "belong to your Corp") and ($PLAYER~MINEOWNER <> "yours")))))
    setvar $PLAYER~SURROUNDOUTPUT $PLAYER~SURROUNDOUTPUT&"(Surround) Avoided non-passive situation in sector "&$PLAYER~ADJ_SEC&".*"
  else
    if ($PLAYER~DROPOFFENSIVE = TRUE)
      setvar $PLAYER~DEPLOYFIG "o"
    elseif ($PLAYER~DROPTOLL = TRUE)
      setvar $PLAYER~DEPLOYFIG "t"
    else
      setvar $PLAYER~DEPLOYFIG "d"
    end
    setvar $PLAYER~SURROUNDSTRING $PLAYER~SURROUNDSTRING&" m z "&$PLAYER~ADJ_SEC&"* z a "&$SHIP~SHIP_MAX_ATTACK&"* * "
    if (($PLAYER~SURROUNDFIGS > 0) and ($PLAYER~FIGHTERS > $PLAYER~SURROUNDFIGS))
      setvar $PLAYER~SURROUNDSTRING $PLAYER~SURROUNDSTRING&"f z"&$PLAYER~SURROUNDFIGS&"*zc"&$PLAYER~DEPLOYFIG&"*  "
      subtract $PLAYER~FIGHTERS $PLAYER~SURROUNDFIGS
      setvar $PLAYER~TARGET $PLAYER~ADJ_SEC
      setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
    end
    if (($PLAYER~SURROUNDLIMP > 0) and (($PLAYER~LIMPETS > $PLAYER~SURROUNDLIMP) and ($PLAYER~LIMPETS > 0)))
      setvar $PLAYER~SURROUNDSTRING $PLAYER~SURROUNDSTRING&"h2 z"&$PLAYER~SURROUNDLIMP&"*zc* "
      subtract $PLAYER~LIMPETS $PLAYER~SURROUNDLIMP
    end

    if (($PLAYER~SURROUNDMINE > 0) and (($PLAYER~ARMIDS > $PLAYER~SURROUNDMINE) and ($PLAYER~ARMIDS > 0)))
      setvar $PLAYER~SURROUNDSTRING $PLAYER~SURROUNDSTRING&"h1 z"&$PLAYER~SURROUNDMINE&"*zc* "
      subtract $PLAYER~ARMIDS $PLAYER~SURROUNDMINE
    end

    setvar $PLAYER~SURROUNDSTRING $PLAYER~SURROUNDSTRING&"m z"&$PLAYER~CURRENT_SECTOR&"* "
    setvar $PLAYER~SURROUNDSTRING $PLAYER~SURROUNDSTRING&"za "&$SHIP~SHIP_MAX_ATTACK&"* * "
  end
  add $PLAYER~I 1
end
send $PLAYER~SURROUNDSTRING
return
:PLAYER~MOVEINTOSECTOR

setvar $PLAYER~RESULT ""
setvar $PLAYER~DROPFIGS TRUE
if ($SHIP~SHIP_MAX_ATTACK <= 0)
  setvar $PLAYER~ATTACK 9999
else
  setvar $PLAYER~ATTACK $SHIP~SHIP_MAX_ATTACK&9999
end
setvar $PLAYER~RESULT $PLAYER~RESULT&"m "&$PLAYER~MOVEINTOSECTOR&"* y * "
if (($PLAYER~MOVEINTOSECTOR > 10) and ($PLAYER~MOVEINTOSECTOR <> $MAP~STARDOCK))
  setvar $PLAYER~RESULT $PLAYER~RESULT&"za"&$PLAYER~ATTACK&"* * "
end
if (($PLAYER~DROPFIGS = TRUE) and (($PLAYER~MOVEINTOSECTOR > 10) and ($PLAYER~MOVEINTOSECTOR <> $MAP~STARDOCK)))
  setvar $PLAYER~RESULT $PLAYER~RESULT&"f 1 * c d "
  setvar $PLAYER~TARGET $PLAYER~MOVEINTOSECTOR
  setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
end
send $PLAYER~RESULT&"*"
settexttrigger MOVEIN_THERE :MOVEIN_THERE "["&$PLAYER~MOVEINTOSECTOR&"]"
settexttrigger MOVEIN_NOPE :MOVEIN_NOPE "(A,D,I,R,?):? D"
pause
:PLAYER~MOVEIN_NOPE
killtrigger MOVEIN_THERE
send "R"
:PLAYER~MOVEIN_THERE
killtrigger MOVEIN_NOPE
return
:PLAYER~HOLO_KILL
:PLAYER~HOLO_KILL_KILL_CHECK


settextlinetrigger NOSCAN1 :HOLO_KILL_NOSCANNER "Handle which mine type, 1 Armid or 2 Limpet"
settextlinetrigger NOSCAN2 :HOLO_KILL_NOSCANNER "You don't have a long range scanner."
settextlinetrigger SCANNED :HOLO_KILL_SCANDONE "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
if ($PLAYER~CURRENT_PROMPT = "Citadel")
  send " qqqz* sh*  l "&$PLANET~PLANET&" * j c * "
  setvar $PLAYER~CIT TRUE
else
  send " sh*"
end
pause
:PLAYER~HOLO_KILL_NOSCANNER
killalltriggers
setvar $SWITCHBOARD~MESSAGE "You don't have a HoloScanner!*"
send " *  "
return
:PLAYER~HOLO_KILL_SCANDONE
killalltriggers
gosub :SHIP~GETSHIPSTATS
:PLAYER~HOLO_KILL_GET_PROMPT
:PLAYER~HOLO_KILL_GET_CURRENT_SECTOR

setvar $PLAYER~HKILL_START_SECTOR $PLAYER~CURRENT_SECTOR
setvar $PLAYER~KILLSECTOR 0
setvar $PLAYER~IDX 1
while ($PLAYER~IDX <= SECTOR.WARPCOUNT[$PLAYER~CURRENT_SECTOR])
  setvar $PLAYER~TEST_SECTOR SECTOR.WARPS[$PLAYER~CURRENT_SECTOR][$PLAYER~IDX]
  setvar $PLAYER~SAFEPLANETS TRUE
  setvar $PLAYER~CONTAINSSHIELDEDPLANET FALSE
  if (SECTOR.PLANETCOUNT[$PLAYER~TEST_SECTOR] > 0)
    setvar $PLAYER~P 1
    while ($PLAYER~P <= SECTOR.PLANETCOUNT[$PLAYER~TEST_SECTOR])
      getword SECTOR.PLANETS[$PLAYER~TEST_SECTOR][$PLAYER~P] $PLAYER~TEST 1
      if ($PLAYER~TEST = "<<<<")
        setvar $PLAYER~CONTAINSSHIELDEDPLANET TRUE
      end
      add $PLAYER~P 1
    end
    if ($PLAYER~SURROUNDAVOIDALLPLANETS)
      setvar $PLAYER~SAFEPLANETS FALSE
    elseif ($PLAYER~CONTAINSSHIELDEDPLANET and $PLAYER~SURROUNDAVOIDSHIELDEDONLY)
      setvar $PLAYER~SAFEPLANETS FALSE
    end
  end
  if (($PLAYER~TEST_SECTOR <> $MAP~STARDOCK) and (($PLAYER~TEST_SECTOR > 10) and ((SECTOR.TRADERCOUNT[$PLAYER~TEST_SECTOR] > 0) and ($PLAYER~SAFEPLANETS = TRUE))))
    setvar $PLAYER~KILLSECTOR $PLAYER~TEST_SECTOR
    goto :HOLO_KILL_KILLEM
  end
  add $PLAYER~IDX 1
end
goto :HOLO_KILL_NO_TARGETS
:PLAYER~HOLO_KILL_KILLEM

send "'{" $SWITCHBOARD~BOT_NAME "} - HoloKill - Attacking sector "&$PLAYER~TEST_SECTOR&".*"
setvar $PLAYER~NO_STR ""
setvar $PLAYER~NO_CNT SECTOR.SHIPCOUNT[$PLAYER~KILLSECTOR]
setvar $PLAYER~NO_IDX 1
while ($PLAYER~NO_IDX <= $PLAYER~NO_CNT)
  setvar $PLAYER~NO_STR $PLAYER~NO_STR&"n"
  add $PLAYER~NO_IDX 1
end
send " c v 0 * y n "&$PLAYER~TEST_SECTOR&" * q "
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send " qmnt*qqz* "
end
send " m z "&$PLAYER~TEST_SECTOR&" *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
setvar $PLAYER~KILL_IDX 1
if ($PLAYER~SURROUND_BEFORE_HKILL = TRUE)
  gosub :QUIKSTATS
  gosub :SURROUND
  setvar $PLAYER~INSURROUND_BEFORE_HKILL FALSE
  gosub :QUIKSTATS
end

gosub :CURRENT_PROMPT
if ($PLAYER~CURRENT_PROMPT <> "Command")
  setvar $SWITCHBOARD~MESSAGE "Wrong prompt for holokill kill.*"
  return
end
gosub :SECTOR~GETSECTORDATA
gosub :FASTATTACK

send "m "&$PLAYER~HKILL_START_SECTOR&" *  *  z  a  99999  *  z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "
if ($PLAYER~CIT = TRUE)
  send " l "&$PLANET~PLANET&" * n n * j m * * * j c  *  "
end
gosub :QUIKSTATS
if ($PLAYER~CURRENT_SECTOR <> $PLAYER~HKILL_START_SECTOR)
  send "'"&$SWITCHBOARD~BOT_NAME " call*"
else
  setvar $SWITCHBOARD~MESSAGE "Attack made and back in original sector!*"
end
return
:PLAYER~HOLO_KILL_NO_TARGETS
setvar $SWITCHBOARD~SELF_COMMAND TRUE
setvar $SWITCHBOARD~MESSAGE "No Enemies found adjacent!*"
return
:PLAYER~BWARP


send "b"
settexttrigger NOBWARP :NOBWARP "Would you like to place a subspace order for one? "
settexttrigger YESBWARP :YESBWARP "Beam to what sector? (U="
settexttrigger IGBWARP :BWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
pause
:PLAYER~NOBWARP
killtrigger YESBWARP
killtrigger IGBWARP
killtrigger NOBWARP
send "*"
setvar $SWITCHBOARD~MESSAGE "No Bwarp installed on this planet*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLAYER~YESBWARP
killtrigger YESBWARP
killtrigger IGBWARP
killtrigger NOBWARP
send $PLAYER~WARPTO&"*"
settexttrigger BWARP_LOCK :BWARP_NO_RANGE "This planetary transporter does not have the range."
settexttrigger NO_BWRP_LOCK :NO_BWARP_LOCK "Do you want to make this transport blind?"
settexttrigger BWARP_READY :BWARP_LOCK "All Systems Ready, shall we engage?"
settextlinetrigger NO_BWARPFUEL :BWARPNOFUEL "This planet does not have enough Fuel Ore to transport you."
pause
:PLAYER~BWARP_NO_RANGE
killtrigger BWARP_LOCK
killtrigger NO_BWRP_LOCK
killtrigger BWARP_READY
killtrigger NO_BWARPFUEL
setvar $SWITCHBOARD~MESSAGE "Not enough range on this planet's transporter.*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLAYER~NO_BWARP_LOCK
killtrigger BWARP_LOCK
killtrigger NO_BWRP_LOCK
killtrigger BWARP_READY
killtrigger NO_BWARPFUEL
send "* "
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" FALSE
setvar $SWITCHBOARD~MESSAGE "No fighter down at that destination, aborting*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLAYER~BWARP_LOCK
killtrigger BWARP_LOCK
killtrigger NO_BWRP_LOCK
killtrigger BWARP_READY
killtrigger NO_BWARPFUEL
send "y     * "
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
setvar $SWITCHBOARD~MESSAGE "B-warp completed.*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLAYER~BWARPNOFUEL
killtrigger BWARP_LOCK
killtrigger NO_BWRP_LOCK
killtrigger BWARP_READY
killtrigger NO_BWARPFUEL
setvar $SWITCHBOARD~MESSAGE "Not enough fuel on the planet to make the transport!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLAYER~BWARPPHOTONED
killtrigger YESBWARP
killtrigger IGBWARP
killtrigger NOBWARP
setvar $SWITCHBOARD~MESSAGE "I have been photoned and can not B-warp!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLAYER~TWARP


setvar $PLAYER~TWARPSUCCESS FALSE
setvar $PLAYER~ORIGINAL 9999999
setvar $PLAYER~TARGET 0
if ($PLAYER~CURRENT_SECTOR = $PLAYER~WARPTO)
  setvar $PLAYER~MSG "Already in that sector!"
  goto :TWARPDONE
elseif (($PLAYER~WARPTO <= 0) or ($PLAYER~WARPTO > SECTORS))
  setvar $PLAYER~MSG "Destination sector is out of range!"
  goto :TWARPDONE
end
if ($PLAYER~TWARP_TYPE = "No")
  setvar $PLAYER~MSG "No T-warp drive on this ship!"
  goto :TWARPDONE
end

setvar $PLAYER~WEAREADJDOCK FALSE
if (($PLAYER~WARPTO = $MAP~STARDOCK) or ($PLAYER~WARPTO <= 10))
  setvar $PLAYER~TARGET $PLAYER~WARPTO
  setvar $PLAYER~A 1
  setvar $PLAYER~START_SECTOR $PLAYER~CURRENT_SECTOR
  while ($PLAYER~A <= SECTOR.WARPCOUNT[$PLAYER~START_SECTOR])
    setvar $PLAYER~ADJ_START SECTOR.WARPS[$PLAYER~START_SECTOR][$PLAYER~A]
    if ($PLAYER~ADJ_START = $PLAYER~TARGET)
      setvar $PLAYER~WEAREADJDOCK TRUE
    end
    add $PLAYER~A 1
  end
end
setvar $PLAYER~RED_ADJ 0
if (($PLAYER~ALIGNMENT < 1000) and ((($PLAYER~WEAREADJDOCK = FALSE) and (($PLAYER~WARPTO = $MAP~STARDOCK) or ($PLAYER~WARPTO <= 10)))))
  setvar $PLAYER~TARGET $PLAYER~WARPTO
  gosub :FINDJUMPSECTOR
  if ($PLAYER~RED_ADJ <> 0)
    setvar $PLAYER~ORIGINAL $PLAYER~WARPTO
    setvar $PLAYER~WARPTO $PLAYER~RED_ADJ
  else
    waitfor "Command [TL="
    setvar $PLAYER~MSG "Cannot Find Jump Sector Adjacent Sector "&$PLAYER~TARGET&"."
    goto :TWARPDONE
  end
end
if ($PLAYER~RED_ADJ <> 0)
  goto :TWARP_LOCK
end
if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "q t*t1* q q * c u y q mz" $PLAYER~WARPTO "*"
elseif ($PLAYER~STARTINGLOCATION = "Planet")
  send "t*t1* q q * c u y q mz" $PLAYER~WARPTO "*"
else
  send "q q q n n 0 * c u y q mz" $PLAYER~WARPTO "*"
end
settexttrigger THERE :ADJ_WARP "You are already in that sector!"
settextlinetrigger ADJ_WARP :ADJ_WARP "Sector  : "&$PLAYER~WARPTO&" "
settexttrigger LOCKING :LOCKING "Do you want to engage the TransWarp drive?"
settexttrigger IGD :TWARPIGD "An Interdictor Generator in this sector holds you fast!"
settexttrigger NOTURNS :TWARPPHOTONED "Your ship was hit by a Photon and has been disabled"
settexttrigger NOROUTE :TWARPNOROUTE "Do you really want to warp there? (Y/N)"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause
:PLAYER~ADJ_WARP
gosub :KILLTWARPTRIGGERS
send "z*"
goto :TWARP_ADJ
:PLAYER~LOCKING
gosub :KILLTWARPTRIGGERS
send "y"
settextlinetrigger TWARP_LOCK :TWARP_LOCK "TransWarp Locked"
settextlinetrigger NO_TWRP_LOCK :NO_TWARP_LOCK "No locating beam found"
settextlinetrigger TWARP_ADJ :TWARP_ADJ "<Set NavPoint>"
settextlinetrigger NO_FUEL :TWARPNOFUEL "You do not have enough Fuel Ore"
pause
:PLAYER~TWARPNOFUEL
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "Not enough fuel for T-warp."
goto :TWARPDONE
:PLAYER~TWARP_ADJ
gosub :KILLTWARPTRIGGERS
send "z* "
setvar $PLAYER~MSG "That sector is next door, just plain warping."
setvar $PLAYER~TWARPSUCCESS TRUE
goto :TWARPDONE
:PLAYER~TWARPNOROUTE
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $PLAYER~MSG "No route available to that sector!"
goto :TWARPDONE
:PLAYER~NO_TWARP_LOCK
gosub :KILLTWARPTRIGGERS
send "n* z* "
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" FALSE
setvar $PLAYER~MSG "No fighters at T-warp point!"
goto :TWARPDONE
:PLAYER~TWARPIGD
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "My ship is being held by Interdictor!"
goto :TWARPDONE
:PLAYER~TWARPPHOTONED
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~MSG "I have been photoned and can not T-warp!"
goto :TWARPDONE
:PLAYER~TWARP_LOCK
gosub :KILLTWARPTRIGGERS
setvar $PLAYER~TARGET $PLAYER~WARPTO
setsectorparameter $PLAYER~TARGET "FIGSEC" TRUE
send "y* "
setvar $PLAYER~MSG "T-warp completed."
setvar $PLAYER~TWARPSUCCESS TRUE
:PLAYER~TWARPDONE
if (($PLAYER~TWARPSUCCESS = TRUE) and (($PLAYER~ORIGINAL = $MAP~STARDOCK) or ($PLAYER~ORIGINAL <= 10)))
  send "* m "&$PLAYER~ORIGINAL&"*  za9999* * "
end
return
:PLAYER~KILLTWARPTRIGGERS
killtrigger THERE
killtrigger ADJ_WARP
killtrigger LOCKING
killtrigger IGD
killtrigger NOTURNS
killtrigger NOROUTE
killtrigger TWARP_LOCK
killtrigger NO_TWRP_LOCK
killtrigger TWARP_ADJ
killtrigger NO_FUEL
return
:PLAYER~GETCOURSE




setarray $PLAYER~MOWCOURSE 80
setvar $PLAYER~SECTORS ""
settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
send "^f*"&$PLAYER~DESTINATION&"**q"
pause
:PLAYER~SECTORSLINE
killtrigger SECTORLINETRIG
killtrigger SECTORLINETRIG2
killtrigger SECTORLINETRIG3
killtrigger SECTORLINETRIG4
killtrigger DONEPATH
killtrigger DONEPATH2
setvar $PLAYER~LINE CURRENTLINE
replacetext $PLAYER~LINE ">" " "
striptext $PLAYER~LINE "("
striptext $PLAYER~LINE ")"
setvar $PLAYER~LINE $PLAYER~LINE&" "
getwordpos $PLAYER~LINE $PLAYER~POS "So what's the point?"
getwordpos $PLAYER~LINE $PLAYER~POS2 ": ENDINTERROG"
getwordpos $PLAYER~LINE $PLAYER~POS3 " No route within "
if (($PLAYER~POS > 0) or ($PLAYER~POS2 > 0) or ($PLAYER~POS3 > 0))
  goto :NOPATH
end
getwordpos $PLAYER~LINE $PLAYER~POS " sector "
getwordpos $PLAYER~LINE $PLAYER~POS2 "TO"
if (($PLAYER~POS <= 0) and ($PLAYER~POS2 <= 0))
  setvar $PLAYER~SECTORS $PLAYER~SECTORS&" "&$PLAYER~LINE
end
getwordpos $PLAYER~LINE $PLAYER~POS " "&$PLAYER~DESTINATION&" "
getwordpos $PLAYER~LINE $PLAYER~POS2 "("&$PLAYER~DESTINATION&")"
getwordpos $PLAYER~LINE $PLAYER~POS3 "TO"
if ((($PLAYER~POS > 0) or ($PLAYER~POS2 > 0)) and ($PLAYER~POS3 <= 0))
  goto :GOTSECTORS
else
  settextlinetrigger SECTORLINETRIG :SECTORSLINE " > "
  settextlinetrigger SECTORLINETRIG2 :SECTORSLINE " "&$PLAYER~DESTINATION&" "
  settextlinetrigger SECTORLINETRIG3 :SECTORSLINE " "&$PLAYER~DESTINATION
  settextlinetrigger SECTORLINETRIG4 :SECTORSLINE "("&$PLAYER~DESTINATION&")"
  settextlinetrigger DONEPATH :SECTORSLINE "So what's the point?"
  settextlinetrigger DONEPATH2 :SECTORSLINE ": ENDINTERROG"
end
pause
:PLAYER~GOTSECTORS
setvar $PLAYER~SECTORS $PLAYER~SECTORS&" :::"
setvar $PLAYER~COURSELENGTH 0
setvar $PLAYER~INDEX 1
:PLAYER~KEEPGOING
getword $PLAYER~SECTORS $PLAYER~MOWCOURSE[$PLAYER~INDEX] $PLAYER~INDEX
while ($PLAYER~MOWCOURSE[$PLAYER~INDEX] <> ":::")
  add $PLAYER~COURSELENGTH 1
  add $PLAYER~INDEX 1
  getword $PLAYER~SECTORS $PLAYER~MOWCOURSE[$PLAYER~INDEX] $PLAYER~INDEX
end
return
:PLAYER~NOPATH

send "q '{" $SWITCHBOARD~BOT_NAME "} - No path to that sector, cannot mow!*"
return
:PLAYER~FINDJUMPSECTOR

setvar $PLAYER~I 1
setvar $PLAYER~RED_ADJ 0
send "q t*t1* q*"
while (SECTOR.WARPSIN[$PLAYER~TARGET][$PLAYER~I] > 0)
  setvar $PLAYER~RED_ADJ SECTOR.WARPSIN[$PLAYER~TARGET][$PLAYER~I]
  if ($PLAYER~RED_ADJ > 10)
    send "m "&$PLAYER~RED_ADJ&"* y"
    settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
    settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
    settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
    settextlinetrigger TWARPADJ :TWARPADJ "<Set NavPoint>"
    pause
    :PLAYER~TWARPADJ
    killtrigger TWARPBLIND
    killtrigger TWARPLOCKED
    killtrigger TWARPVOIDED
    killtrigger TWARPADJ
    send " * "
    return
    :PLAYER~TWARPVOIDED

    killtrigger TWARPBLIND
    killtrigger TWARPLOCKED
    killtrigger TWARPVOIDED
    killtrigger TWARPADJ
    send " N N "
    goto :TRYINGNEXTADJ
    :PLAYER~TWARPLOCKED

    killtrigger TWARPBLIND
    killtrigger TWARPLOCKED
    killtrigger TWARPVOIDED
    killtrigger TWARPADJ
    goto :SECTORLOCKED
    :PLAYER~TWARPBLIND

    killtrigger TWARPBLIND
    killtrigger TWARPLOCKED
    killtrigger TWARPVOIDED
    killtrigger TWARPADJ
    send " N "
  end
  :PLAYER~TRYINGNEXTADJ
  add $PLAYER~I 1
end
:PLAYER~NOADJSFOUND

setvar $PLAYER~RED_ADJ 0
return
:PLAYER~SECTORLOCKED

if ($PLAYER~TARGET = $MAP~STARDOCK)
  setvar $MAP~BACKDOOR $PLAYER~RED_ADJ
  savevar $MAP~BACKDOOR
end
return
:PLAYER~MOW


if ($PROMPT~STARTINGLOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "c "
end
if ($PROMPT~STARTINGLOCATION = "Command")
  gosub :SHIP~GETSHIPSTATS
  setvar $PLAYER~MOW_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
elseif ($SHIP~SHIP_MAX_ATTACK <= 0)
  setvar $PLAYER~MOW_SHIP_MAX_ATTACK 99991111
else
  setvar $PLAYER~MOW_SHIP_MAX_ATTACK $SHIP~SHIP_MAX_ATTACK
end
setvar $PLAYER~DESTINATION $BOT~PARM1
isnumber $PLAYER~NUMBER $PLAYER~DESTINATION
if ($PLAYER~NUMBER <> 1)
  send "'{" $SWITCHBOARD~BOT_NAME "} - Sector entered is not a number, cannot mow!*"
  return
elseif (($PLAYER~DESTINATION <= 0) or ($PLAYER~DESTINATION > SECTORS))
  send "'{" $SWITCHBOARD~BOT_NAME "} - Sector entered is not valid, cannot mow!*"
  return
end
setvar $PLAYER~DESTINATION ($BOT~PARM1 + 0)
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $PLAYER~POS "kill"
if ($PLAYER~POS > 0)
  setvar $PLAYER~MOW_KILL TRUE
else
  setvar $PLAYER~MOW_KILL FALSE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $PLAYER~POS "saveme"
if ($PLAYER~POS > 0)
  setvar $PLAYER~MOW_SAVEME TRUE
else
  setvar $PLAYER~MOW_SAVEME FALSE
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $PLAYER~POS " p "
if ($PLAYER~POS > 0)
  setvar $PLAYER~ARE_WE_DOCKING TRUE
else
  setvar $PLAYER~ARE_WE_DOCKING FALSE
end
setvar $PLAYER~FIGSTODROP $BOT~PARM2
isnumber $PLAYER~NUMBER $PLAYER~FIGSTODROP
if ($PLAYER~NUMBER <> TRUE)
  setvar $PLAYER~FIGSTODROP 0
else
  if ($PLAYER~FIGSTODROP > 50000)
    send "'{" $SWITCHBOARD~BOT_NAME "} - Cannot drop more than 50,000 fighters per sector!*"
    return
  elseif ($PLAYER~FIGSTODROP > $PLAYER~FIGHTERS)
    send "'{" $SWITCHBOARD~BOT_NAME "} - Fighters to drop cannot exceed total ship fighters.*"
    return
  end
end
if ($PLAYER~MOW_SHIP_MAX_ATTACK > $PLAYER~FIGHTERS)
  setvar $PLAYER~MOW_SHIP_MAX_ATTACK 9999
end
if ($PLAYER~CURRENT_SECTOR <> CURRENTSECTOR)
  setvar $PLAYER~CURRENT_SECTOR 0
end
gosub :GETCOURSE
setvar $PLAYER~J 2
setvar $PLAYER~RESULT "q q q * "
while ($PLAYER~J <= $PLAYER~COURSELENGTH)
  if ($PLAYER~MOWCOURSE[$PLAYER~J] <> $PLAYER~CURRENT_SECTOR)
    setvar $PLAYER~RESULT $PLAYER~RESULT&"m  "&$PLAYER~MOWCOURSE[$PLAYER~J]&"*   "
    if (($PLAYER~MOWCOURSE[$PLAYER~J] > 10) and ($PLAYER~MOWCOURSE[$PLAYER~J] <> $MAP~STARDOCK))
      setvar $PLAYER~RESULT $PLAYER~RESULT&"za  "&$PLAYER~MOW_SHIP_MAX_ATTACK&"* *  "
    end
    if (($PLAYER~FIGSTODROP > 0) and (($PLAYER~MOWCOURSE[$PLAYER~J] > 10) and (($PLAYER~MOWCOURSE[$PLAYER~J] <> $MAP~STARDOCK) and ($PLAYER~J > 2))))
      setvar $PLAYER~RESULT $PLAYER~RESULT&"f "&$PLAYER~FIGSTODROP&" * c d "
      setvar $PLAYER~TARGET $PLAYER~MOWCOURSE[$PLAYER~J]
      gosub :ADDFIGTODATA
    end
    if (($PLAYER~J >= $PLAYER~COURSELENGTH) and (($PLAYER~MOW_SAVEME = TRUE) and ($PLAYER~FIGSTODROP = 0)))
      setvar $PLAYER~RESULT $PLAYER~RESULT&"f 1 * c d "
      setvar $PLAYER~TARGET $PLAYER~MOWCOURSE[$PLAYER~J]
      gosub :ADDFIGTODATA
    end
    if (($PLAYER~CALLED = FALSE) and (($PLAYER~MOW_SAVEME = TRUE) and ($PLAYER~J >= ($PLAYER~COURSELENGTH - 2))))
      setvar $PLAYER~RESULT $PLAYER~RESULT&"'"&$PLAYER~DESTINATION&"=saveme*  "
      setvar $PLAYER~CALLED TRUE
    end
  end
  add $PLAYER~J 1
end
setvar $PLAYER~DOCKING_INSTRUCTIONS ""
if ($PLAYER~ARE_WE_DOCKING)
  setvar $PLAYER~DOCKING_INSTRUCTIONS " p z t *"
  if ($PLAYER~DESTINATION = $MAP~STARDOCK)
    setvar $PLAYER~DOCKING_INSTRUCTIONS " p z s g y g q h *"
  end
  setvar $PLAYER~RESULT $PLAYER~RESULT&$PLAYER~DOCKING_INSTRUCTIONS
elseif (($PLAYER~MOW_SAVEME = TRUE) and ($PLAYER~STARTINGLOCATION = "Citadel"))
  setvar $PLAYER~I 0
  while ($PLAYER~I < 8)
    add $PLAYER~I 1

    setvar $PLAYER~RESULT $PLAYER~RESULT&"l j"&#8&$PLANET~PLANET&"*  *  j  c  *  *  "
  end
end
send $PLAYER~RESULT
gosub :QUIKSTATS
if (($PLAYER~CURRENT_PROMPT = "Command") and ($PLAYER~MOW_KILL = TRUE))
  setvar $PLAYER~STARTINGLOCATION "Command"
  gosub :SECTOR~GETSECTORDATA
  gosub :FASTATTACK
elseif ($PLAYER~CURRENT_PROMPT = "Planet")
  send "m * * * c "
  if ($PLAYER~MOW_KILL = FALSE)
    send "s* "
  else
    setvar $PROMPT~STARTINGLOCATION "Citadel"
    gosub :SCANIT_CIT_KILL
  end
elseif ($PLAYER~ARE_WE_DOCKING = FALSE)
  send "*"
end
return
:PLAYER~TOPOFF
:PLAYER~DO_TOPOFF_AGAIN


killtrigger TOPOFF_SUCCESS
killtrigger TOPOFF_FAILURE1
killtrigger TOPOFF_FAILURE2
send " F"
waiton "Your ship can support up to"
getword CURRENTLINE $PLAYER~FTRS_TO_LEAVE 10
striptext $PLAYER~FTRS_TO_LEAVE ","
striptext $PLAYER~FTRS_TO_LEAVE " "
if ($PLAYER~FTRS_TO_LEAVE < 1)
  setvar $PLAYER~FTRS_TO_LEAVE 1
end
send " "&$PLAYER~FTRS_TO_LEAVE&" * c d"
settextlinetrigger TOPOFF_SUCCESS :TOPOFF_SUCCESS "Done. You have "
settextlinetrigger TOPOFF_FAILURE1 :DO_TOPOFF_AGAIN "You don't have that many fighters available."
settextlinetrigger TOPOFF_FAILURE2 :DO_TOPOFF_AGAIN "Too many fighters in your fleet!  You are limited to"
pause
:PLAYER~TOPOFF_SUCCESS
return
:PLAYER~TURNOFFANSI


send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $PLAYER~ANSISTATUS 5
waiton "(2) Animation display"
getword CURRENTLINE $PLAYER~ANIMATIONSTATUS 5
if ($PLAYER~ANIMATIONSTATUS = "On")
  send 2
end
if ($PLAYER~ANSISTATUS = "On")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return
:PLAYER~TURNONANSI

send "c n"
killalltriggers
waiton "(1) ANSI graphics"
getword CURRENTLINE $PLAYER~ANSISTATUS 5
if ($PLAYER~ANSISTATUS = "Off")
  send "1 q q"
else
  send "q q"
end
waiton "<Computer deactivated>"
return
