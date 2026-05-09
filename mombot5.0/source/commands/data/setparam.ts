	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE


	setVar $HELP~HELP[1]  $HELP~TAB&"Set sector parameters"
	setVar $HELP~HELP[2]  $HELP~TAB&"      setparam [parameter] [value] {sector} "
	setVar $HELP~HELP[3]  $HELP~TAB&"       "
	setVar $HELP~HELP[4]  $HELP~TAB&"Usage: "
	setVar $HELP~HELP[5]  $HELP~TAB&"       >setparam BUSTED 1 45"
	setVar $HELP~HELP[6]  $HELP~TAB&"       >setparam FIGSEC 1 "
	setVar $HELP~HELP[7]  $HELP~TAB&"        "
	setVar $HELP~HELP[8]  $HELP~TAB&"       Note: assumes current sector if sector isn't entered"
	setVar $HELP~HELP[9]  $HELP~TAB&"       "
	setVar $HELP~HELP[10] $HELP~TAB&"       Original Author: Deign"
	gosub :HELP~HELPFILE


setVar $name $bot~parm1
upperCase $name
if ($name = "")
	setvar $switchboard~message "The name of the parameter to set must be defined.*"
	gosub :switchboard~switchboard
	halt
end

setVar $value $bot~parm2
uppercase $value
if ($value = "TRUE")
	setvar $value true
end
if ($value = "FALSE")
	setvar $value false
end


IF ($bot~parm3 <> "")
     setVar $hub $bot~parm3
ELSE
     setVar $hub CURRENTSECTOR
END

setSectorParameter $hub $name $value
setvar $switchboard~message "Parameter "&$name&" has been set to "&$value&" in sector "&$hub&".*"
gosub :switchboard~switchboard

halt
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
