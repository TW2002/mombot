




setvar $SHIP~SHIP_OFFENSIVE_ODDS 0
setvar $SHIP~SHIP_FIGHTERS_MAX 0
setvar $SHIP~SHIP_MAX_ATTACK 0
setvar $SHIP~SHIP_MINES_MAX 0
setvar $SHIP~SHIP_SHIELD_MAX 0
setvar $SHIP~SHIP_XPORT_RANGE 0
:SHIP~GETSHIPSTATS


send "c;"
settextlinetrigger GETSHIPOFFENSE :SHIPOFFENSEODDS "Offensive Odds: "
settextlinetrigger GETSHIPFIGHTERS :SHIPMAXFIGSPERATTACK " TransWarp Drive:   "
settextlinetrigger GETSHIPMINES :SHIPMAXMINES " Mine Max:  "
settextlinetrigger GETSHIPGENESIS :SHIPMAXGENESIS " Genesis Max:  "
settextlinetrigger GETSHIPSHIELDS :SHIPMAXSHIELDS "Maximum Shields:"
settextlinetrigger GETSHIPRANGE :SHIPTRANSPORTRANGE "Transport Range:"
pause
:SHIP~SHIPMAXSHIELDS

setvar $SHIP~SHIELD_LINE CURRENTLINE
replacetext $SHIP~SHIELD_LINE ":" "  "
replacetext $SHIP~SHIELD_LINE "," ""
getword $SHIP~SHIELD_LINE $SHIP~SHIP_SHIELD_MAX 10
savevar $SHIP~SHIP_SHIELD_MAX
pause
:SHIP~SHIPOFFENSEODDS
getwordpos CURRENTANSILINE $SHIP~POS "[0;31m:[1;36m1"
if ($SHIP~POS > 0)
  gettext CURRENTANSILINE $SHIP~SHIP_OFFENSIVE_ODDS "Offensive Odds[1;33m:[36m " "[0;31m:[1;36m1"
  striptext $SHIP~SHIP_OFFENSIVE_ODDS "."
  striptext $SHIP~SHIP_OFFENSIVE_ODDS " "
  gettext CURRENTANSILINE $SHIP~SHIP_FIGHTERS_MAX "Max Fighters[1;33m:[36m" "[0;32m Offensive Odds"
  striptext $SHIP~SHIP_FIGHTERS_MAX ","
  striptext $SHIP~SHIP_FIGHTERS_MAX " "
  savevar $SHIP~SHIP_FIGHTERS_MAX
  savevar $SHIP~SHIP_OFFENSIVE_ODDS
end
pause
:SHIP~SHIPMAXMINES
gettext CURRENTLINE $SHIP~SHIP_MINES_MAX "Mine Max:" "Beacon Max:"
striptext $SHIP~SHIP_MINES_MAX " "
savevar $SHIP~SHIP_MINES_MAX
pause
:SHIP~SHIPMAXGENESIS

gettext CURRENTLINE $SHIP~SHIP_GENESIS_MAX "Genesis Max:" "Long Range Scan:"
striptext $SHIP~SHIP_GENESIS_MAX " "
savevar $SHIP~SHIP_GENESIS_MAX
pause
:SHIP~SHIPMAXFIGSPERATTACK

getwordpos CURRENTANSILINE $SHIP~POS "[0m[32m Max Figs Per Attack[1;33m:[36m"
if ($SHIP~POS > 0)
  gettext CURRENTANSILINE $SHIP~SHIP_MAX_ATTACK "[0m[32m Max Figs Per Attack[1;33m:[36m" "[0;32mTransWarp"
  striptext $SHIP~SHIP_MAX_ATTACK " "
end
savevar $SHIP~SHIP_MAX_ATTACK
pause
:SHIP~SHIPTRANSPORTRANGE
gettext CURRENTLINE $SHIP~SHIP_MAX_HOLDS "Maximum Holds:" "Transport Range:"
striptext $SHIP~SHIP_MAX_HOLDS " "
gettext CURRENTLINE $SHIP~SHIP_XPORT_RANGE "Transport Range:" "Photon Missiles:"
striptext $SHIP~SHIP_XPORT_RANGE " "
savevar $SHIP~SHIP_XPORT_RANGE
send "q "
return
