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
