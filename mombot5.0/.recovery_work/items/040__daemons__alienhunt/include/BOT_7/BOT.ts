:BOT~DISCONNECTTRIGGERS
settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
return
:BOT~PAUSING

killalltriggers
echo ANSI_14 "*[["&ANSI_15&$BOT~SCRIPT_TITLE&" paused. To restart, re-enter citadel prompt"&ANSI_14&"]]*"&ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause
:BOT~RESTARTING
killalltriggers
echo ANSI_14 "*[[" ANSI_15 "Alien Hunter restarted" ANSI_14 "]]*" ANSI_7
goto :RESTART
