:PWARP~PWARP
send "p" $PWARP~WARPTO "*y"
settextlinetrigger PWARP_LOCK :PWARP_LOCK "Locating beam pinpointed"
settextlinetrigger NO_PWARP_LOCK :NO_PWARP_LOCK "Your own fighters must be"
settextlinetrigger ALREADY :ALREADY "You are already in that sector!"
settextlinetrigger NO_ORE :NO_ORE "You do not have enough Fuel Ore"
pause
:PWARP~NO_PWARP_LOCK

killtrigger PWARP_LOCK
killtrigger ALREADY
killtrigger NO_ORE
killtrigger NO_PWARP_LOCK


send "'{" $PWARP~BOT_NAME "} - No fighter down at that location!*"
return
:PWARP~NO_ORE

killtrigger PWARP_LOCK
killtrigger NO_ORE
killtrigger ALREADY
killtrigger NO_PWARP_LOCK
send "'{" $PWARP~BOT_NAME "} - Not enough fuel for that pwarp.*"
return
:PWARP~PWARP_LOCK


killtrigger NO_PWARP_LOCK
killtrigger PWARP_LOCK
killtrigger ALREADY
killtrigger NO_ORE
waitfor "Planet is now in sector"
send "'{" $PWARP~BOT_NAME "} - Planet moved to sector "&$PWARP~WARPTO&".*"
return
:PWARP~ALREADY

killtrigger NO_PWARP_LOCK
killtrigger PWARP_LOCK
killtrigger ALREADY
killtrigger NO_ORE
send "'{" $PWARP~BOT_NAME "} - Planet already in that sector!.*"

return
