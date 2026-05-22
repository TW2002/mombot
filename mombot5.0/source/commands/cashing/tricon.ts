gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Plays tricon for you"
setvar $help~help[2] $help~tab&"  - Must be started at stardock"
gosub :help~helpfile

if ($bot~parm1 <> "")
	setvar $games $bot~parm1
end
setvar $gamestoplay $games
setvar $games_played 0
gosub :player~quikstats
if ((stardock = "") and (stardock = 0) and ($map~stardock = "0"))
	setvar $switchboard~message "Tri-Conn - StarDock's Not In TWX DBase!*"
	gosub :switchboard~switchboard
	halt
end
if (($player~current_sector <> stardock) and ($player~current_sector <> $map~stardock))
	setvar $switchboard~message "Tri-Conn Must Be Started at StarDock!*"
	gosub :switchboard~switchboard
	halt
end
setvar $initcredits $player~credits
setvar $prompt $player~current_prompt
if ($bot~parm1 = "")
	setvar $towin "YES"
end
if ($player~current_prompt = "<Tavern>")
	goto :start
elseif ($player~current_prompt = "<StarDock>")
	send "t"
	goto :start
elseif ($player~current_prompt = "Command")
	#Added Scrub Buffer
	send "psgygqt"
	goto :start
else
	setvar $switchboard~message "Unknown Prompt.*"
	gosub :switchboard~switchboard
	halt
end

:start
#send "g"
send "gny"

:nextround
killtrigger 1
killtrigger 2
killtrigger 3
killtrigger 4
settexttrigger 1 :done "Play again?"
settextlinetrigger 2 :round "Round "
settextlinetrigger 3 :won "C o n g r a t u l a t i o n s ! ! ! !"
settextlinetrigger 4 :nocred "You ain't got the creds"
pause

:round
send "231"
goto :nextround

:done
add $games_played 1
subtract $games 1
if (($games = 0) and ($towin <> "YES"))
	gosub :player~quikstats
	subtract $player~credits $initcredits
	setvar $switchboard~message "Tri-Conn Played Winning "&$player~credits&" in "&$games_played&" Games.*"
	gosub :switchboard~switchboard
	send "n"
	goto :end
end
send "y"
goto :nextround

:won
subtract $games 1
add $games_played 1
if (($games = 0) and ($towin <> "YES"))
	gosub :player~quikstats
	subtract $player~credits $initcredits
	setvar $switchboard~message "Tri-Conn Played Winning "&$player~credits&" in "&$games_played&" Games.*"
	gosub :switchboard~switchboard
	send "n"
	goto :end
end
if ($towin = "YES")
	gosub :player~quikstats
	subtract $player~credits $initcredits
	setvar $switchboard~message "Tri-Conn Won.  I won "&$player~credits&" by playing "&$games_played&" Games.*"
	gosub :switchboard~switchboard
	goto :end
end
goto :start

:nocred
gosub :player~quikstats
subtract $player~credits $initcredits
setvar $switchboard~message "Out of Credits.  Tri-Conn Games played Winning "&$player~credits&" in "&$games_played&" Games.*"
gosub :switchboard~switchboard
send "n"

:end
if ($prompt = "Command")
	send "qqqzn"
elseif ($prompt = "<StarDock>")
	send "q"
else
end
halt

#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
