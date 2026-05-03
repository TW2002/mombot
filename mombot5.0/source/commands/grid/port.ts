	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
	loadvar $game~port_max

	setVar $HELP~HELP[1]   $HELP~TAB&"  port {build/create} {destroy/kill} {upgrade/max}                "
	setVar $HELP~HELP[2]   $HELP~TAB&"  Options:"
	setVar $HELP~HELP[3]   $HELP~TAB&"     port build {port name} "
	setVar $HELP~HELP[4]   $HELP~TAB&"       - create sbb port in sector if possible"
	setVar $HELP~HELP[5]   $HELP~TAB&"         {port name} - Name of port to create "
	setVar $HELP~HELP[6]   $HELP~TAB&"                   default: Mind ()ver Matter "
	setVar $HELP~HELP[7]   $HELP~TAB&"      "
	setVar $HELP~HELP[8]   $HELP~TAB&"     port destroy "
	setVar $HELP~HELP[9]   $HELP~TAB&"       - blow up port in sector if possible"
	setVar $HELP~HELP[10]  $HELP~TAB&"      "
	setVar $HELP~HELP[11]  $HELP~TAB&"     port upgrade {f} {o} {e} {a} {b} {noexp}"
	setVar $HELP~HELP[12]  $HELP~TAB&"       - upgrade port if possible, using treasury if available"
	setVar $HELP~HELP[13]  $HELP~TAB&"             {f} - upgrade fuel"
	setVar $HELP~HELP[14]  $HELP~TAB&"             {o} - upgrade organics"
	setVar $HELP~HELP[15]  $HELP~TAB&"             {e} - upgrade equipment"
	setVar $HELP~HELP[16]  $HELP~TAB&"             {a} - upgrade all products"
	setVar $HELP~HELP[17]  $HELP~TAB&"             {b} - upgrade products that port buys"
	setVar $HELP~HELP[18]  $HELP~TAB&"         {noexp} - upgrade without experience increase"
	setVar $HELP~HELP[19]  $HELP~TAB&"                   default: s/b/b upgraded"
	gosub :HELP~HELPFILE


	setVar $bot~bot_name $SWITCHBOARD~bot_name
	
	gosub :PLAYER~quikstats
	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if (($startingLocation <> "Citadel") AND ($startingLocation <> "Command"))
		setVar $SWITCHBOARD~message "You must run port helper from command or citadel prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
	loadVar $planet~planet
	
	setvar $i 1
	setvar $line $bot~user_command_line
	setvar $bot~user_command_line ""
	setvar $nothing "<>!<>junk<>!<>!"
	getword $line $word 1 $nothing

	while ($word <> $nothing)
		getword $line $word $i $nothing
		if (($word = "?") or ($word = "help"))
			setvar $bot~parm1 "?"
			gosub :HELP~HELPFILE
			halt
		end
		if ($word <> $nothing)
			setvar $bot~user_command_line $bot~user_command_line&" "&$word
		end
		add $i 1
	end

	if (($bot~parm1 = "build") OR ($bot~parm1 = "create"))
		gosub :port~buildport
		halt
	elseif (($bot~parm1 = "destroy") or ($bot~parm1 = "kill"))
		gosub :port~destroyport
		halt
	elseif (($bot~parm1 = "max") or ($bot~parm1 = "upgrade"))
		gosub :port~upgradeport
		halt
	else
		setVar $SWITCHBOARD~message "Option used for port helper not recognized.  Try build/create/destroy/kill/upgrade/max options.*"
		gosub :SWITCHBOARD~switchboard
		halt	
	end

halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\port"
include "source\include\help"
