:PLANET~LANDONPLANETENTERCITADEL
send "l "&$PLANET~PLANET&"*tnl1*tnl2*tnl3*snl1*snl2*snl3*c "
waiton "Fuel Ore"
getword CURRENTLINE $PLANET~PLANETFUEL 6
striptext $PLANET~PLANETFUEL ","
getword CURRENTLINE $PLANET~PLANET_FUEL 6
striptext $PLANET~PLANET_FUEL ","
send "/"
waiton "Creds"
getword CURRENTLINE $PLAYER~CREDITS 4
striptext $PLAYER~CREDITS "³Figs"
striptext $PLAYER~CREDITS ","
return
