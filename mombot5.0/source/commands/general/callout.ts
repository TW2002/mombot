gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~bot_team_name
setvar $help~help[1] $help~tab&"Reports team name and current sector."
gosub :help~helpfile

gosub :player~quikstats
if ($bot~bot_team_name = false)
	setvar $bot~bot_team_name "None"
end

send "'" & "Team: " & $bot~bot_team_name & " Sec: "&$player~current_sector&" Exp: "&$player~experience&" Aln: "&$player~alignment&" Creds: "&$player~credits&" Ship: "&$player~ship_number&" Turns: "&$player~turns&"*"

:wait_for_command
halt

#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
