gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
loadVar $BOT~bot_team_name

if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
	goto :wait_for_command
end

gosub :PLAYER~quikstats
if ($BOT~bot_team_name = FALSE)
	setVar $BOT~bot_team_name "None"
end

send "'" & "Team: " & $BOT~bot_team_name & " Sec: "&$PLAYER~CURRENT_SECTOR&" Exp: "&$PLAYER~EXPERIENCE&" Aln: "&$PLAYER~ALIGNMENT&" Creds: "&$PLAYER~CREDITS&" Ship: "&$PLAYER~SHIP_NUMBER&" Turns: "&$PLAYER~TURNS&"*"

:wait_for_command
	setVar $HELP~HELP[1] $HELP~TAB&"Reports team name and current sector."
	gosub :HELP~HELPFILE
halt

#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
