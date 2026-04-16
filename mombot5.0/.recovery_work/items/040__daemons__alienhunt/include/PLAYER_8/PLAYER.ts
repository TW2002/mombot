:PLAYER~GETPORTINFO

if ($PLAYER~STARTINGLOCATION = "Citadel")
  send "S*CR*"
else
  send "*CR*"
end
setvar $PLAYER~VALIDPORTFOUND FALSE
settextlinetrigger FOUNDPORT :FOUNDPORT2 "Items     Status  Trading % of max OnBoard"
settextlinetrigger NOPORT :NOPORT2 "I have no information about a port in that sector."
settextlinetrigger NOPORT2 :NOPORT2 "You have never visted sector"
settextlinetrigger NOPORT3 :NOPORT2 "credits / next hold"
settextlinetrigger NOPORT4 :NOPORT2 "A  Cargo holds     :"
pause
:PLAYER~NOPORT2

gosub :PORTKILLINGTRIGGERS
send "q"
return
:PLAYER~FOUNDPORT2

gosub :PORTKILLINGTRIGGERS
send "q"
setvar $PLAYER~FUELSELLING 0
setvar $PLAYER~ORGSELLING 0
setvar $PLAYER~EQUIPSELLING 0
setvar $PLAYER~VALIDPORTFOUND TRUE
:PLAYER~GETSELLING
settextlinetrigger PORTFUELINFO :PORTFUELINFO2 "Fuel Ore   Selling"
settextlinetrigger PORTORGINFO :PORTORGINFO2 "Organics   Selling"
settextlinetrigger PORTEQUIPINFO :PORTEQUIPINFO2 "Equipment  Selling"
settextlinetrigger GOTALLPORTINFO :GOTALLPORTINFO2 "<Computer deactivated>"
pause
:PLAYER~PORTFUELINFO2

getword CURRENTLINE $PLAYER~FUELSELLING 4
settextlinetrigger PORTFUELINFO :PORTFUELINFO2 "Fuel Ore   Selling"
pause
:PLAYER~PORTORGINFO2

getword CURRENTLINE $PLAYER~ORGSELLING 3
settextlinetrigger PORTORGINFO :PORTORGINFO2 "Organics   Selling"
pause
:PLAYER~PORTEQUIPINFO2

getword CURRENTLINE $PLAYER~EQUIPSELLING 3
settextlinetrigger PORTEQUIPINFO :PORTEQUIPINFO2 "Equipment  Selling"
pause
:PLAYER~GOTALLPORTINFO2

killtrigger PORTFUELINFO
killtrigger PORTORGINFO
killtrigger PORTEQUIPINFO
killtrigger GOTALLPORTINFO
return
:PLAYER~PORTKILLINGTRIGGERS


killtrigger FOUNDPORT
killtrigger NOPORT
killtrigger NOPORT2
killtrigger NOPORT3
killtrigger NOPORT4
return
