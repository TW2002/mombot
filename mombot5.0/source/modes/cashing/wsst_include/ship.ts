:ship~getshipstats
























































































































































send "c;"
settextlinetrigger GETSHIPOFFENSE :SHIPOFFENSEODDS "Offensive Odds: "
settextlinetrigger GETSHIPFIGHTERS :SHIPMAXFIGSPERATTACK " TransWarp Drive:   "
settextlinetrigger GETSHIPMINES :SHIPMAXMINES " Mine Max:  "
settextlinetrigger GETSHIPGENESIS :SHIPMAXGENESIS " Genesis Max:  "
settextlinetrigger GETSHIPSHIELDS :SHIPMAXSHIELDS "Maximum Shields:"
settextlinetrigger GETSHIPRANGE :SHIPTRANSPORTRANGE "Transport Range:"
pause
:ship~shipmaxshields

setvar $ship~shield_line CURRENTLINE
replacetext $ship~shield_line ":" "  "
replacetext $ship~shield_line "," ""
getword $ship~shield_line $ship~ship_shield_max 10
savevar $ship~ship_shield_max
pause
:ship~shipoffenseodds

getwordpos CURRENTANSILINE $ship~pos "[0;31m:[1;36m1"
if ($ship~pos > 0)
  gettext CURRENTANSILINE $ship~ship_offensive_odds "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
  striptext $ship~ship_offensive_odds "."
  striptext $ship~ship_offensive_odds " "
  gettext CURRENTANSILINE $ship~ship_fighters_max "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
  striptext $ship~ship_fighters_max ","
  striptext $ship~ship_fighters_max " "
  savevar $ship~ship_fighters_max
  savevar $ship~ship_offensive_odds
else
  getwordpos CURRENTLINE $ship~pos "Offensive Odds:"
  if ($ship~pos > 0)
    gettext CURRENTLINE $ship~ship_offensive_odds "Offensive Odds:" ":1"
    striptext $ship~ship_offensive_odds "."
    striptext $ship~ship_offensive_odds " "
    gettext CURRENTLINE $ship~ship_fighters_max "Max Fighters:" "Offensive Odds:"
    striptext $ship~ship_fighters_max ","
    striptext $ship~ship_fighters_max " "
    savevar $ship~ship_fighters_max
    savevar $ship~ship_offensive_odds
  end
end
pause
:ship~shipmaxmines

gettext CURRENTLINE $ship~ship_mines_max "Mine Max:" "Beacon Max:"
striptext $ship~ship_mines_max " "
savevar $ship~ship_mines_max
pause
:ship~shipmaxgenesis

gettext CURRENTLINE $ship~ship_genesis_max "Genesis Max:" "Long Range Scan:"
striptext $ship~ship_genesis_max " "
savevar $ship~ship_genesis_max
pause
:ship~shipmaxfigsperattack

getwordpos CURRENTANSILINE $ship~pos "[0m[32m Max Figs Per Attack[1;33m:[36m"
if ($ship~pos > 0)
  gettext CURRENTANSILINE $ship~ship_max_attack "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
  striptext $ship~ship_max_attack " "
else
  getwordpos CURRENTLINE $ship~pos "Max Figs Per Attack:"
  if ($ship~pos > 0)
    gettext CURRENTLINE $ship~ship_max_attack "Max Figs Per Attack:" "TransWarp Drive:"
    striptext $ship~ship_max_attack " "
  end
end
savevar $ship~ship_max_attack
pause
:ship~shiptransportrange

gettext CURRENTLINE $ship~ship_max_holds "Maximum Holds:" "Transport Range:"
striptext $ship~ship_max_holds " "
gettext CURRENTLINE $ship~ship_xport_range "Transport Range:" "Photon Missiles:"
striptext $ship~ship_xport_range " "
savevar $ship~ship_xport_range
send "q"
settexttrigger WAITON45 :GETSHIPSTATS_RETURNPROMPT "Command [TL="
settexttrigger WAITON45CITADEL :GETSHIPSTATS_RETURNPROMPT "Citadel command (?=help)"
pause
:ship~getshipstats_returnprompt

killalltriggers
return
