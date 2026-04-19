:GAME~GAMESTATS
setvar $GAME~DID_GAMESTATS FALSE
if (($PLAYER~STARTINGLOCATION = "0") OR ($PLAYER~STARTINGLOCATION = ""))
  if (($PLAYER~CURRENT_PROMPT = "Command") OR ($PLAYER~CURRENT_PROMPT = "Citadel"))
    setvar $PLAYER~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
  end
end







if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "qqzn"
end
if (($PLAYER~STARTINGLOCATION = "Command") or ($PLAYER~STARTINGLOCATION = "Citadel"))
  setvar $GAME~DID_GAMESTATS TRUE
  send "vqyn"
  send #42 "*"
  settextlinetrigger SETTINGS1 :FINDGOLD "Gold Enabled="
  settextlinetrigger SETTINGS2 :FINDMBBS "MBBS Compatibility="
  settextlinetrigger SETTINGS3 :FINDALIENS "Internal Aliens="
  settextlinetrigger SETTINGS4 :FINDFERRENGI "Internal Ferrengi="
  settextlinetrigger SETTINGS5 :FINDMAXCOMMANDS "Max Commands="
  settextlinetrigger SETTINGS6 :FINDINACTIVE "Inactive Time="
  settextlinetrigger SETTINGS7 :FINDCOLOREGEN "Colonist Regen Rate="
  settextlinetrigger SETTINGS8 :FINDPHOTONDUR "Photon Missile Duration="
  settextlinetrigger SETTINGS9 :FINDDEBRIS "Debris Loss Percent="
  settextlinetrigger SETTINGS10 :FINDTRADEPERCENT "Trade Percent="
  settextlinetrigger SETTINGS11 :FINDPRODUCTIONRATE "Production Rate="
  settextlinetrigger SETTINGS12 :FINDMAXPRODUCTIONRATE "Max Production Regen="
  settextlinetrigger SETTINGS13 :FINDMULTIPLEPHOTONS "Multiple Photons="
  settextlinetrigger SETTINGS14 :FINDCLEARBUSTS "Clear Bust Days="
  settextlinetrigger SETTINGS15 :FINDSTEALFACTOR "Steal Factor="
  settextlinetrigger SETTINGS16 :FINDROBFACTOR "Rob Factor="
  settextlinetrigger SETTINGS17 :FINDPORTMAX "Port Production Max="
  settextlinetrigger SETTINGS18 :FINDRADIATION "Radiation Lifetime="
  settextlinetrigger REREGISTER :REREGISTER "Reregister Ship="
  settextlinetrigger SETTINGS37 :FINDLIMPETREMOVAL "Limpet Removal="
  settextlinetrigger SETTINGS20 :FINDGENESIS "Genesis Torpedo="
  settextlinetrigger SETTINGS21 :FINDARMID "Armid Mine="
  settextlinetrigger SETTINGS22 :FINDLIMPET "Limpet Mine="
  settextlinetrigger SETTINGS23 :FINDBEACON "Beacon="
  settextlinetrigger SETTINGS24 :FINDTWARPI "Type I TWarp="
  settextlinetrigger SETTINGS25 :FINDTWARPII "Type II TWarp="
  settextlinetrigger SETTINGS26 :FINDTWARPUPGRADE "TWarp Upgrade="
  settextlinetrigger SETTINGS27 :FINDPSYCHIC "Psychic Probe="
  settextlinetrigger SETTINGS28 :FINDPLANETSCANNER "Planet Scanner="
  settextlinetrigger SETTINGS29 :FINDATOMIC "Atomic Detonator="
  settextlinetrigger SETTINGS30 :FINDCORBO "Corbomite="
  settextlinetrigger SETTINGS31 :FINDETHER "Ether Probe="
  settextlinetrigger SETTINGS32 :FINDPHOTON "Photon Missile="
  settextlinetrigger SETTINGS33 :FINDCLOAK "Cloaking Device="
  settextlinetrigger SETTINGS34 :FINDDISRUPTOR "Mine Disruptor="
  settextlinetrigger SETTINGS35 :FINDHOLOSCANNER "Holographic Scanner="
  settextlinetrigger SETTINGS36 :FINDDENSITYSCAN "Density Scanner="
  settextlinetrigger SETTINGS38 :FINDMAXPLANETS "Max Planet Sector="
  settextlinetrigger SETTINGS39 :FINDMAXGAMEPLANETS ", sectors"
  settextlinetrigger SETTINGS40 :FINDFEDSPACEPHOTONS "FedSpace Photons="
  settextlinetrigger SETTINGS41 :FINDLATENCY "Latency="
  settextlinetrigger SETTINGS42 :FINDDELAYSHIPMOVE "Ship Delay="
  settextlinetrigger SETTINGS43 :FINDDELAYPLANETMOVE "Planet Delay="
  settextlinetrigger SETTINGS44 :FINDDELAYOTHERATTACKS "Other Attacks Delay="
  settextlinetrigger SETTINGS45 :FINDDELAYSHIPTRANSPORTER "Ship Transporter Delay="
  settextlinetrigger SETTINGS46 :FINDDELAYPLANETTRANSPORTER "Planet Transporter Delay="
  settextlinetrigger SETTINGS47 :FINDDELAYEPROBE "EProbe Delay="
  settextlinetrigger SETTINGS48 :FINDDELAYPHOTONLAUNCH "Photon Launch Delay="
  settextlinetrigger SETTINGS49 :FINDDELAYPHOTONWAVE "Photon Wave Delay="
  pause
  :GAME~FINDLATENCY
  getword CURRENTLINE $GAME~LATENCY 1
  striptext $GAME~LATENCY "Latency="
  savevar $GAME~LATENCY
  pause
  :GAME~FINDDELAYSHIPMOVE
  setvar $GAME~DELAY 0
  setvar $GAME~DELAYWORD 2
  gosub :CONVERTDELAY
  setvar $GAME~DELAYSHIP $GAME~DELAY
  savevar $GAME~DELAYSHIP
  pause
  :GAME~FINDDELAYPLANETMOVE
  setvar $GAME~DELAY 0
  setvar $GAME~DELAYWORD 2
  gosub :CONVERTDELAY
  setvar $GAME~DELAYPLANET $GAME~DELAY
  savevar $GAME~DELAYPLANET
  pause
  :GAME~FINDDELAYOTHERATTACKS
  setvar $GAME~DELAY 0
  setvar $GAME~DELAYWORD 3
  gosub :CONVERTDELAY
  setvar $GAME~DELAYOTHERATTACK $GAME~DELAY
  savevar $GAME~DELAYOTHERATTACK
  pause
  :GAME~FINDDELAYSHIPTRANSPORTER
  setvar $GAME~DELAY 0
  setvar $GAME~DELAYWORD 3
  gosub :CONVERTDELAY
  setvar $GAME~DELAYSHIPTRANSPORTER $GAME~DELAY
  savevar $GAME~DELAYSHIPTRANSPORTER
  pause
  :GAME~FINDDELAYPLANETTRANSPORTER
  setvar $GAME~DELAY 0
  setvar $GAME~DELAYWORD 3
  gosub :CONVERTDELAY
  setvar $GAME~DELAYPLANETTRANSPORTER $GAME~DELAY
  savevar $GAME~DELAYPLANETTRANSPORTER
  pause
  :GAME~FINDDELAYEPROBE
  setvar $GAME~DELAY 0
  setvar $GAME~DELAYWORD 2
  gosub :CONVERTDELAY
  setvar $GAME~DELAYEPROBE $GAME~DELAY
  savevar $GAME~DELAYEPROBE
  pause
  :GAME~FINDDELAYPHOTONLAUNCH
  setvar $GAME~DELAY 0
  setvar $GAME~DELAYWORD 3
  gosub :CONVERTDELAY
  setvar $GAME~DELAYPHOTONLAUNCH $GAME~DELAY
  savevar $GAME~DELAYPHOTONLAUNCH
  pause
  :GAME~FINDDELAYPHOTONWAVE
  setvar $GAME~DELAY 0
  setvar $GAME~DELAYWORD 3
  gosub :CONVERTDELAY
  setvar $GAME~DELAYPHOTONDELAY $GAME~DELAY
  savevar $GAME~DELAYPHOTONDELAY
  pause
  :GAME~FINDGOLD
  getword CURRENTLINE $GAME~CHECK 2
  striptext $GAME~CHECK "Enabled="
  if ($GAME~CHECK = "True")
    setvar $GAME~GOLDENABLED TRUE
    savevar $GAME~GOLDENABLED
  else
    setvar $GAME~GOLDENABLED FALSE
    savevar $GAME~GOLDENABLED
  end
  pause
  :GAME~FINDFEDSPACEPHOTONS
  getword CURRENTLINE $GAME~CHECK 2
  striptext $GAME~CHECK "Photons="
  if ($GAME~CHECK = "True")
    setvar $GAME~FEDSPACEPHOTONS TRUE
    savevar $GAME~FEDSPACEPHOTONS
  else
    setvar $GAME~FEDSPACEPHOTONS FALSE
    savevar $GAME~FEDSPACEPHOTONS
  end
  pause
  :GAME~FINDMAXPLANETS

  getword CURRENTLINE $GAME~CHECK 3
  striptext $GAME~CHECK "Sector="
  setvar $GAME~MAX_PLANETS_PER_SECTOR $GAME~CHECK
  savevar $GAME~MAX_PLANETS_PER_SECTOR
  pause
  :GAME~FINDMAXGAMEPLANETS
  getword CURRENTLINE $GAME~CHECK 9
  striptext $GAME~CHECK "."
  setvar $GAME~MAX_PLANETS_IN_GAME $GAME~CHECK
  savevar $GAME~MAX_PLANETS_IN_GAME
  pause
  :GAME~FINDMBBS
  getword CURRENTLINE $GAME~MBBS_CK 2
  striptext $GAME~MBBS_CK "Compatibility="
  if ($GAME~MBBS_CK = "True")
    setvar $GAME~MBBS TRUE
    savevar $GAME~MBBS
  elseif ($GAME~MBBS_CK = "False")
    setvar $GAME~MBBS FALSE
    savevar $GAME~MBBS
  end
  pause
  :GAME~FINDALIENS
  getword CURRENTLINE $GAME~CHECK 2
  striptext $GAME~CHECK "Aliens="
  if ($GAME~CHECK = "True")
    setvar $GAME~INTERNALALIENS TRUE
    savevar $GAME~INTERNALALIENS
  elseif ($GAME~CHECK = "False")
    setvar $GAME~INTERNALALIENS FALSE
    savevar $GAME~INTERNALALIENS
  end
  pause
  :GAME~FINDFERRENGI
  getword CURRENTLINE $GAME~CHECK 2
  striptext $GAME~CHECK "Ferrengi="
  if ($GAME~CHECK = "True")
    setvar $GAME~INTERNALFERRENGI TRUE
    savevar $GAME~INTERNALFERRENGI
  elseif ($GAME~CHECK = "False")
    setvar $GAME~INTERNALFERRENGI FALSE
    savevar $GAME~INTERNALFERRENGI
  end
  pause
  :GAME~FINDMAXCOMMANDS
  getword CURRENTLINE $GAME~CHECK 2
  striptext $GAME~CHECK "Commands="
  setvar $GAME~MAX_COMMANDS $GAME~CHECK
  savevar $GAME~MAX_COMMANDS
  pause
  :GAME~FINDINACTIVE
  getword CURRENTLINE $GAME~CHECK 2
  striptext $GAME~CHECK "Time="
  setvar $GAME~INACTIVE_TIME $GAME~CHECK
  savevar $GAME~INACTIVE_TIME
  pause
  :GAME~FINDCOLOREGEN
  setvar $GAME~LINE CURRENTLINE
  striptext $GAME~LINE "Colonist Regen Rate="
  striptext $GAME~LINE ","
  lowercase $GAME~LINE
  replacetext $GAME~LINE "m" 000000
  replacetext $GAME~LINE "k" 000
  setvar $GAME~COLONIST_REGEN $GAME~LINE
  savevar $GAME~COLONIST_REGEN
  pause
  :GAME~FINDPHOTONDUR
  getword CURRENTLINE $GAME~CHECK 3
  striptext $GAME~CHECK "Duration="
  setvar $GAME~PHOTON_DURATION $GAME~CHECK
  savevar $GAME~PHOTON_DURATION
  if ($GAME~PHOTON_DURATION <= 0)
    setvar $GAME~PHOTONS_ENABLED FALSE
  else
    setvar $GAME~PHOTONS_ENABLED TRUE
  end
  savevar $GAME~PHOTONS_ENABLED
  pause
  :GAME~FINDDEBRIS
  getword CURRENTLINE $GAME~CHECK 3
  striptext $GAME~CHECK "Percent="
  striptext $GAME~CHECK "%"
  setvar $GAME~DEBRIS_LOSS $GAME~CHECK
  savevar $GAME~DEBRIS_LOSS
  pause
  :GAME~FINDTRADEPERCENT
  getword CURRENTLINE $GAME~PTRADESETTING 2
  striptext $GAME~PTRADESETTING "Percent="
  striptext $GAME~PTRADESETTING "%"
  savevar $GAME~PTRADESETTING
  pause
  :GAME~FINDPRODUCTIONRATE
  getword CURRENTLINE $GAME~PRODUCTION_RATE 2
  striptext $GAME~PRODUCTION_RATE "Rate="
  savevar $GAME~PRODUCTION_RATE
  pause
  :GAME~FINDMAXPRODUCTIONRATE
  getword CURRENTLINE $GAME~PRODUCTION_REGEN 3
  striptext $GAME~PRODUCTION_REGEN "Regen="
  savevar $GAME~PRODUCTION_REGEN
  pause
  :GAME~FINDMULTIPLEPHOTONS
  getword CURRENTLINE $GAME~MULTIPLE_PHOTONS 2
  striptext $GAME~MULTIPLE_PHOTONS "Photons="
  if ($GAME~MULTIPLE_PHOTONS = "True")
    setvar $GAME~MULTIPLE_PHOTONS TRUE
  else
    setvar $GAME~MULTIPLE_PHOTONS FALSE
  end
  savevar $GAME~MULTIPLE_PHOTONS
  pause
  :GAME~FINDCLEARBUSTS
  getword CURRENTLINE $GAME~CLEAR_BUST_DAYS 3
  striptext $GAME~CLEAR_BUST_DAYS "Days="
  savevar $GAME~CLEAR_BUST_DAYS
  pause
  :GAME~FINDSTEALFACTOR
  getword CURRENTLINE $GAME~STEAL_FACTOR 2
  striptext $GAME~STEAL_FACTOR "Factor="
  striptext $GAME~STEAL_FACTOR "%"
  setvar $GAME~ACTUAL_STEAL_FACTOR $GAME~STEAL_FACTOR
  savevar $GAME~ACTUAL_STEAL_FACTOR
  savevar $GAME~STEAL_FACTOR
  pause
  :GAME~FINDROBFACTOR
  getword CURRENTLINE $GAME~ROB_FACTOR 2
  striptext $GAME~ROB_FACTOR "Factor="
  striptext $GAME~ROB_FACTOR "%"
  setvar $GAME~ACTUAL_ROB_FACTOR $GAME~ROB_FACTOR
  savevar $GAME~ACTUAL_ROB_FACTOR
  savevar $GAME~ROB_FACTOR
  pause
  :GAME~FINDPORTMAX
  setvar $GAME~LINE CURRENTLINE
  striptext $GAME~LINE "Port Production Max="
  setvar $GAME~PORT_MAX $GAME~LINE
  savevar $GAME~PORT_MAX
  pause
  :GAME~FINDRADIATION
  getword CURRENTLINE $GAME~RADIATION_LIFETIME 2
  striptext $GAME~RADIATION_LIFETIME "Lifetime="
  savevar $GAME~RADIATION_LIFETIME
  pause
  :GAME~FINDLIMPETREMOVAL
  getword CURRENTLINE $GAME~LIMPET_REMOVAL_COST 2
  striptext $GAME~LIMPET_REMOVAL_COST "Removal="
  striptext $GAME~LIMPET_REMOVAL_COST ","
  striptext $GAME~LIMPET_REMOVAL_COST "$"
  savevar $GAME~LIMPET_REMOVAL_COST
  setvar $GAME~LSD_LIMPREMOVALCOST $GAME~LIMPET_REMOVAL_COST
  savevar $GAME~LSD_LIMPREMOVALCOST
  pause
  :GAME~FINDGENESIS
  getword CURRENTLINE $GAME~GENESIS_COST 2
  striptext $GAME~GENESIS_COST "Torpedo="
  striptext $GAME~GENESIS_COST ","
  striptext $GAME~GENESIS_COST "$"
  savevar $GAME~GENESIS_COST
  setvar $GAME~LSD_GENCOST $GAME~GENESIS_COST
  savevar $GAME~LSD_GENCOST
  pause
  :GAME~FINDARMID
  getword CURRENTLINE $GAME~ARMID_COST 2
  striptext $GAME~ARMID_COST "Mine="
  striptext $GAME~ARMID_COST ","
  striptext $GAME~ARMID_COST "$"
  savevar $GAME~ARMID_COST
  setvar $GAME~LSD_ARMIDCOST $GAME~ARMID_COST
  savevar $GAME~LSD_ARMIDCOST
  pause
  :GAME~FINDLIMPET
  getword CURRENTLINE $GAME~LIMPET_COST 2
  striptext $GAME~LIMPET_COST "Mine="
  striptext $GAME~LIMPET_COST ","
  striptext $GAME~LIMPET_COST "$"
  savevar $GAME~LIMPET_COST
  setvar $GAME~LSD_LIMPCOST $GAME~LIMPET_COST
  savevar $GAME~LSD_LIMPCOST
  pause
  :GAME~FINDBEACON
  getword CURRENTLINE $GAME~BEACON_COST 1
  striptext $GAME~BEACON_COST "Beacon="
  striptext $GAME~BEACON_COST ","
  striptext $GAME~BEACON_COST "$"
  savevar $GAME~BEACON_COST
  setvar $GAME~LSD_BEACON $GAME~BEACON_COST
  savevar $GAME~LSD_BEACON
  pause
  :GAME~FINDTWARPI
  getword CURRENTLINE $GAME~TWARPI_COST 3
  striptext $GAME~TWARPI_COST "TWarp="
  striptext $GAME~TWARPI_COST ","
  striptext $GAME~TWARPI_COST "$"
  savevar $GAME~TWARPI_COST
  setvar $GAME~LSD_TWARPICOST $GAME~TWARPI_COST
  savevar $GAME~LSD_TWARPICOST
  pause
  :GAME~FINDTWARPII
  getword CURRENTLINE $GAME~TWARPII_COST 3
  striptext $GAME~TWARPII_COST "TWarp="
  striptext $GAME~TWARPII_COST ","
  striptext $GAME~TWARPII_COST "$"
  savevar $GAME~TWARPII_COST
  setvar $GAME~LSD_TWARPIICOST $GAME~TWARPII_COST
  savevar $GAME~LSD_TWARPIICOST
  pause
  :GAME~FINDTWARPUPGRADE
  getword CURRENTLINE $GAME~TWARP_UPGRADE_COST 2
  striptext $GAME~TWARP_UPGRADE_COST "Upgrade="
  striptext $GAME~TWARP_UPGRADE_COST ","
  striptext $GAME~TWARP_UPGRADE_COST "$"
  savevar $GAME~TWARP_UPGRADE_COST
  setvar $GAME~LSD_TWARPUPCOST $GAME~TWARP_UPGRADE_COST
  savevar $GAME~LSD_TWARPUPCOST
  pause
  :GAME~FINDPSYCHIC
  getword CURRENTLINE $GAME~PSYCHIC_COST 2
  striptext $GAME~PSYCHIC_COST "Probe="
  striptext $GAME~PSYCHIC_COST ","
  striptext $GAME~PSYCHIC_COST "$"
  savevar $GAME~PSYCHIC_COST
  pause
  :GAME~FINDPLANETSCANNER
  getword CURRENTLINE $GAME~PLANET_SCANNER_COST 2
  striptext $GAME~PLANET_SCANNER_COST "Scanner="
  striptext $GAME~PLANET_SCANNER_COST ","
  striptext $GAME~PLANET_SCANNER_COST "$"
  savevar $GAME~PLANET_SCANNER_COST
  setvar $GAME~LSD_PSCAN $GAME~PLANET_SCANNER_COST
  savevar $GAME~LSD_PSCAN
  pause
  :GAME~FINDATOMIC
  getword CURRENTLINE $GAME~ATOMIC_COST 2
  striptext $GAME~ATOMIC_COST "Detonator="
  striptext $GAME~ATOMIC_COST ","
  striptext $GAME~ATOMIC_COST "$"
  savevar $GAME~ATOMIC_COST
  setvar $GAME~LSD_ATOMICCOST $GAME~ATOMIC_COST
  savevar $GAME~LSD_ATOMICCOST
  pause
  :GAME~REREGISTER
  killtrigger REREGISTER
  gosub :GETCOST
  setvar $GAME~LSD_REREGISTERCOST $GAME~LSD_COST
  savevar $GAME~LSD_REREGISTERCOST
  pause
  :GAME~FINDCORBO
  getword CURRENTLINE $GAME~CORBO_COST 1
  striptext $GAME~CORBO_COST "Corbomite="
  striptext $GAME~CORBO_COST ","
  striptext $GAME~CORBO_COST "$"
  savevar $GAME~CORBO_COST
  setvar $GAME~LSD_CORBOCOST $GAME~CORBO_COST
  savevar $GAME~LSD_CORBOCOST
  pause
  :GAME~FINDETHER
  getword CURRENTLINE $GAME~PROBE_COST 2
  striptext $GAME~PROBE_COST "Probe="
  striptext $GAME~PROBE_COST ","
  striptext $GAME~PROBE_COST "$"
  savevar $GAME~PROBE_COST
  setvar $GAME~LSD_EPROBE $GAME~PROBE_COST
  savevar $GAME~LSD_EPROBE
  pause
  :GAME~FINDPHOTON
  getword CURRENTLINE $GAME~PHOTON_COST 2
  striptext $GAME~PHOTON_COST "Missile="
  striptext $GAME~PHOTON_COST ","
  striptext $GAME~PHOTON_COST "$"
  savevar $GAME~PHOTON_COST
  setvar $GAME~LSD_PHOTONCOST $GAME~PHOTON_COST
  savevar $GAME~LSD_PHOTONCOST
  pause
  :GAME~FINDCLOAK
  getword CURRENTLINE $GAME~CLOAK_COST 2
  striptext $GAME~CLOAK_COST "Device="
  striptext $GAME~CLOAK_COST ","
  striptext $GAME~CLOAK_COST "$"
  savevar $GAME~CLOAK_COST
  setvar $GAME~LSD_CLOAKCOST $GAME~CLOAK_COST
  savevar $GAME~LSD_CLOAKCOST
  pause
  :GAME~FINDDISRUPTOR
  getword CURRENTLINE $GAME~DISRUPTOR_COST 2
  striptext $GAME~DISRUPTOR_COST "Disruptor="
  striptext $GAME~DISRUPTOR_COST ","
  striptext $GAME~DISRUPTOR_COST "$"
  savevar $GAME~DISRUPTOR_COST
  setvar $GAME~LSD_DISRUPTCOST $GAME~DISRUPTOR_COST
  savevar $GAME~LSD_DISRUPTCOST
  pause
  :GAME~FINDHOLOSCANNER
  getword CURRENTLINE $GAME~HOLO_COST 2
  striptext $GAME~HOLO_COST "Scanner="
  striptext $GAME~HOLO_COST ","
  striptext $GAME~HOLO_COST "$"
  savevar $GAME~HOLO_COST
  setvar $GAME~LSD_HOLOCOST $GAME~HOLO_COST
  savevar $GAME~LSD_HOLOCOST
  pause
  :GAME~FINDDENSITYSCAN

  getword CURRENTLINE $GAME~DENSITY_COST 2
  striptext $GAME~DENSITY_COST "Scanner="
  striptext $GAME~DENSITY_COST ","
  striptext $GAME~DENSITY_COST "$"
  savevar $GAME~DENSITY_COST
  setvar $GAME~LSD_DSCANCOST $GAME~DENSITY_COST
  savevar $GAME~LSD_DSCANCOST
  setvar $GAME~FILEHEADINGS "MBBS     COLO_REGEN     PTRADE     SF     RF     PORTMAX"
  setvar $GAME~FILEOUTPUT $GAME~MBBS&"     "&$GAME~COLONIST_REGEN&"     "&$GAME~PTRADESETTING&"     "&$GAME~STEAL_FACTOR&"     "&$GAME~ROB_FACTOR&"     "&$GAME~PORT_MAX
  delete $GAME~GAME_SETTINGS_FILE
  write $GAME~GAME_SETTINGS_FILE $GAME~FILEHEADINGS
  write $GAME~GAME_SETTINGS_FILE $GAME~FILEOUTPUT
  setvar $GAME~STEAL_FACTOR ((30 * $GAME~STEAL_FACTOR) / 100)
  savevar $GAME~STEAL_FACTOR
  setvar $GAME~ROB_FACTOR ((3 * 100) / $GAME~ROB_FACTOR)
  savevar $GAME~ROB_FACTOR

  send "x*"

  settexttrigger PROMPT :ALLPROMPTSCATCH ""
  setdelaytrigger PROMPT_DELAY :CURRENT_PROMPT_DELAY 2000
  send "?"
  pause
  :GAME~CURRENT_PROMPT_DELAY

  killtrigger PROMPT
  goto :WHISTLEWHILEYOUWORKSETTINGS
  :GAME~ALLPROMPTSCATCH

  setvar $GAME~VALID_GAME_MENU_PROMPT FALSE
  if ((CURRENTLINE = "Selection (? for menu):") or (CURRENTLINE = "Selection (? for menu): ") or (CURRENTLINE = "Enter your choice:") or (CURRENTLINE = "Enter your choice: "))
    setvar $GAME~VALID_GAME_MENU_PROMPT TRUE
  end
  if ($GAME~VALID_GAME_MENU_PROMPT = TRUE)
    setvar $GAME~GAME_MENU_PROMPT CURRENTLINE
    setvar $GAME~GAME_MENU_PROMPT_ANSI CURRENTANSILINE
    savevar $GAME~GAME_MENU_PROMPT
    savevar $GAME~GAME_MENU_PROMPT_ANSI
  end
  settexttrigger PROMPT :ALLPROMPTSCATCH ""
  pause
  :GAME~TRYAGAINSETTINGS

  killalltriggers
  settextlinetrigger GAMECLOSED1 :CONNECTIVITY~GAMECLOSED "I'm sorry, but this is a closed game."
  settextlinetrigger GAMECLOSED2 :CONNECTIVITY~GAMECLOSED "www.tradewars.com                                   Epic Interactive Strategy"
  settextlinetrigger GAMECLOSED3 :CONNECTIVITY~GAMECLOSED " day(s) to get back in."
  settexttrigger PHEW :BACK_TO_GAME "Command [TL"
  setdelaytrigger DELAY_CLOSE :GAMECLOSEDSETTINGS 5000
  loadvar $BOT~PASSWORD
  send "T***"&$BOT~PASSWORD&"*    *    *    "
  pause
  :GAME~GAMECLOSEDSETTINGS
  killalltriggers
  if (CONNECTED <> TRUE)
    load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\relog.cts"
    seteventtrigger RELOGENDED :RELOGENDED "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\general\relog.cts"
    pause
    :GAME~RELOGENDED
    goto :TRYAGAINSETTINGS
  end
  setdelaytrigger WHISTLEWHILEYOUWORKSETTINGS :WHISTLEWHILEYOUWORKSETTINGS 1500
  settextlinetrigger AT_GAME_MENU :TRYAGAINSETTINGS "T - Play Trade Wars 2002"
  pause
  :GAME~WHISTLEWHILEYOUWORKSETTINGS
  loadvar $BOT~LETTER
  send $BOT~LETTER&"*"
  settexttrigger REFRESHPAUSE :REFRESHPAUSE "[Pause]"
  goto :GAMECLOSEDSETTINGS
  :GAME~REFRESHPAUSE

  send "*  "
  pause
  :GAME~BACK_TO_GAME
  killalltriggers
  if ($GAME~FEDSPACEPHOTONS = "")

    setvar $GAME~FEDSPACEPHOTONS FALSE
    savevar $GAME~FEDSPACEPHOTONS
  end
  send "  *  *  zaz*z*za9999*z*"



  gosub :PLAYER~QUIKSTATS
end
killtrigger SETTINGS5
if ($GAME~DID_GAMESTATS = TRUE)
  setvar $GAME~GAMESTATS TRUE
else
  setvar $GAME~GAMESTATS FALSE
end
savevar $GAME~GAMESTATS
return
:GAME~CONVERTDELAY

getword CURRENTLINE $GAME~CHECK1 $GAME~DELAYWORD
striptext $GAME~CHECK1 "Delay="
if ($GAME~CHECK1 = "Constant")
  getword CURRENTLINE $GAME~CHECK2 ($GAME~DELAYWORD + 1)
  striptext $GAME~CHECK2 "("
  getword CURRENTLINE $GAME~CHECK3 ($GAME~DELAYWORD + 2)
  striptext $GAME~CHECK3 ")"
  if ($GAME~CHECK3 = "s")
    setvar $GAME~DELAY ($GAME~CHECK2 * 1000)
  else
    setvar $GAME~DELAY $GAME~CHECK2
  end
elseif ($GAME~CHECK1 = "None")

  setvar $GAME~DELAY 0
else

  setvar $GAME~DELAY $GAME~CHECK1
end
return
:GAME~GETCOST



setvar $GAME~LSD_COST 0
getwordpos CURRENTLINE $GAME~LSD_POS "="
if ($GAME~LSD_POS <> 0)
  cuttext CURRENTLINE $GAME~LSD_COST ($GAME~LSD_POS + 1) 999
  striptext $GAME~LSD_COST " cr"
end
return
