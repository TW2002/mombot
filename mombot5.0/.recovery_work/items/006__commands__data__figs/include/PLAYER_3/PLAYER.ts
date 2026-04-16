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
