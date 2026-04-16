:START
loadvar $BOT_NAME

send "'{" $BOT_NAME "} - OZ Fed Monitor On Line!*"
:MAIN
killalltriggers
setdelaytrigger NOTICE :WARNING 300000
settexttrigger 0 :WARNING "INACTIVITY WARNING"
settexttrigger 1 :GRAB " is surrounded by a glowing corona of warp energies!"
settexttrigger 2 :GRAB " ship vanishes from scanners with a brilliant flash!"
settexttrigger 3 :GRAB " warps into the sector."
settexttrigger 4 :GRAB " warps out of the sector."
settexttrigger 5 :GRAB "Scanners detect a wormhole opening in this sector!"
settexttrigger 6 :GRAB " appears in a brilliant flash of warp energies!"
settexttrigger 7 :GRAB " lands on the StarDock."
settexttrigger 8 :GRAB " blasts off from the StarDock."
settexttrigger 9 :GRAB " lands on Terra."
settexttrigger 10 :GRAB " lifts off from Terra."
settexttrigger 11 :GRAB " enters the game"
settexttrigger 12 :GRAB " exits the game"
settexttrigger 13 :GRAB " docks at Sol"
settexttrigger 14 :GRAB " lifts off from Sol"
settexttrigger 15 :GRAB " is powering up weapons systems!"
settexttrigger 16 :GRAB " launches a wave of fighters at"
pause
:GRAB

killalltriggers
cuttext CURRENTLINE $SPOOF 1 2
if (($SPOOF = "P ") or ($SPOOF = "R ") or ($SPOOF = "F "))
  goto :MAIN
end
cuttext CURRENTLINE $SS 1 1
if ($SS = "'")
  goto :MAIN
end
setvar $LINE CURRENTLINE
send "'{" $BOT_NAME "} " $LINE "*"
goto :MAIN
:WARNING

killalltriggers
send "'{" $BOT_NAME "} - OZ Fed Monitor On Line!*"
goto :MAIN
