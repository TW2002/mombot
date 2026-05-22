gosub :loadvars~loadvars
gosub :help~initialize

setarray $types 7
setvar $types[1] "General"
setvar $types[2] "Defense"
setvar $types[3] "Offense"
setvar $types[4] "Resource"
setvar $types[5] "Grid"
setvar $types[6] "Cashing"
setvar $types[7] "Data"

setvar $help~help[1] $help~tab&"help - displays help files for commands "
setvar $help~help[2] $help~tab&"   "
gosub :help~helpfile

setvar $helptargettext $bot~user_command_line
striptext $helptargettext " "

if ($helptargettext <> "")
	lowercase $bot~parm1
	setvar $i 1
	while ($i <= 7)
		setvar $temptype $types[$i]
		lowercase $temptype
		if ($bot~parm1 = $temptype)
			setvar $currentlist $bot~internalcommandlists[$i]
			goto :command_list
		end
		add $i 1
	end
	setvar $resolvedhelpcommand $bot~parm1
	fileexists $aliasesexist "scripts\"&$bot~mombot_directory&"\aliases.cfg"
	if ($aliasesexist)
		readtoarray "scripts\"&$bot~mombot_directory&"\aliases.cfg" $aliaslines
		setvar $aliasindex 1
		while ($aliasindex <= $aliaslines)
			setvar $aliasline $aliaslines[$aliasindex]
			cuttext $aliasline&" " $aliasfirstchar 1 1
			if ($aliasfirstchar <> "#")
				getwordpos $aliasline $aliaseqpos "="
				if ($aliaseqpos > 1)
					cuttext $aliasline $aliasname 1 ($aliaseqpos - 1)
					cuttext $aliasline $aliastarget ($aliaseqpos + 1) 9999
					lowercase $aliasname
					lowercase $aliastarget
					setvar $aliasnames ","&$aliasname&","
					striptext $aliasnames " "
					getwordpos $aliasnames $aliasnamepos ","&$resolvedhelpcommand&","
					if ($aliasnamepos > 0)
						setvar $resolvedhelpcommand $aliastarget
						goto :help_alias_resolved
					end
				end
			end
			add $aliasindex 1
		end
	end

	:help_alias_resolved
	setvar $bot~parm1 $resolvedhelpcommand
	fileexists $doesexist "scripts\"&$bot~mombot_directory&"\help\"&$bot~parm1&".txt"
	if ($doesexist)
		readtoarray "scripts\"&$bot~mombot_directory&"\help\"&$bot~parm1&".txt" $help~help
		gosub :help~displayhelp

	else
		setvar $switchboard~message "No help file available for "&$bot~parm1&".*"
		gosub :switchboard~switchboard
	end
	halt
else
	if ($switchboard~self_command)
		goto :echo_help
	else
		goto :ss_help
	end
end

#####==============================================  BOT HELP SECTION =================================================#####
:command_list
setvar $switchboard~helplist true
setvar $helplist true
setvar $switchboard~message ""
if ($bot~parm1 = 0)
	gosub :player~quikstats
	setvar $switchboard~message "  --------------Mind ()ver Matter Bot Help Categories------------*"
	setvar $switchboard~message $switchboard~message&"                          Version: "&$bot~major_version&"_"&$bot~minor_version&"*"
	setvar $switchboard~message $switchboard~message&" *"
	setvar $switchboard~message $switchboard~message&"                [OFFENSE]|[DEFENSE]|[DATA]|[CASHING]*"
	setvar $switchboard~message $switchboard~message&"                     [RESOURCE]|[GRID]|[GENERAL]*"
	setvar $switchboard~message $switchboard~message&" *"
	setvar $switchboard~message $switchboard~message&"  ---------------------------------------------------------------*"
else
	getfilelist $commandlist "scripts\"&$bot~mombot_directory&"\commands\"&$bot~parm1&"\*.cts"
	getfilelist $modelist "scripts\"&$bot~mombot_directory&"\modes\"&$bot~parm1&"\*.cts"
	getfilelist $localcommandlist "scripts\"&$bot~mombot_directory&"\local\commands\"&$bot~parm1&"\*.cts"
	if ($localcommandlist <= 0)
		getfilelist $localcommandlist "scripts/"&$bot~mombot_directory&"/local/commands/"&$bot~parm1&"/*.cts"
	end
	getfilelist $localmodelist "scripts\"&$bot~mombot_directory&"\local\modes\"&$bot~parm1&"\*.cts"
	if ($localmodelist <= 0)
		getfilelist $localmodelist "scripts/"&$bot~mombot_directory&"/local/modes/"&$bot~parm1&"/*.cts"
	end
	setvar $maxstringlength 34
	setvar $paddingdashes "                                 "
	uppercase $bot~parm1
	setvar $switchboard~message "  *  *                                   *"
	getlength "-="&$bot~parm1&"=-" $comlength
	setvar $sidelength (($maxstringlength-$comlength)/2)
	cuttext $paddingdashes $leftpad 1 $sidelength
	cuttext $paddingdashes $rightpad 1 (($maxstringlength-$comlength)-$sidelength)
	setvar $switchboard~message $switchboard~message&"  "&$leftpad&ansi_8&"-="&ansi_7&$bot~parm1&ansi_8&"=-"&ansi_15&$rightpad&" *"
	setvar $switchboard~message $switchboard~message&ansi_7&"  -"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"- *"&ansi_15
	uppercase $currentlist
	setvar $i 1
	while ($i <= $commandlist)
		setvar $tempcommand $commandlist[$i]&"###"
		striptext $tempcommand "scripts\"&$bot~mombot_directory&"\commands\"&$bot~parm1&"\"
		striptext $tempcommand ".cts###"
		uppercase $tempcommand
		cuttext $tempcommand&" " $hidden 1 1
		if ($hidden = "_")
			getlength $tempcommand $templength
			if (($switchboard~self_command = true) and ($templength > 1))
				cuttext $tempcommand $tempcommand 2 9999
				setvar $currentlist $currentlist&" [<><>HIDDEN<><>]"&$tempcommand&" "
			end
		else
			getwordpos $currentlist $pos " "&$tempcommand&" "
			if ($pos <= 0)
				setvar $currentlist $currentlist&" "&$tempcommand&" "
			end
		end
		add $i 1
	end
	setvar $i 1
	while ($i <= $localcommandlist)
		setvar $tempcommand $localcommandlist[$i]&"###"
		striptext $tempcommand "scripts\"&$bot~mombot_directory&"\local\commands\"&$bot~parm1&"\"
		striptext $tempcommand "scripts/"&$bot~mombot_directory&"/local/commands/"&$bot~parm1&"/"
		striptext $tempcommand ".cts###"
		uppercase $tempcommand
		cuttext $tempcommand&" " $hidden 1 1
		if ($hidden = "_")
			getlength $tempcommand $templength
			if (($switchboard~self_command = true) and ($templength > 1))
				cuttext $tempcommand $tempcommand 2 9999
				setvar $currentlist $currentlist&" [<><>HIDDEN<><>]"&$tempcommand&" "
			end
		else
			getwordpos $currentlist $pos " "&$tempcommand&" "
			if ($pos <= 0)
				setvar $currentlist $currentlist&" "&$tempcommand&" "
			end
		end
		add $i 1
	end
	setvar $switchboard~message $switchboard~message&"  *             "&ansi_2&"-="&ansi_10&"Commands"&ansi_2&"=-"&ansi_15&"            *"
	setvar $commandcount 0
	setvar $buffercount 0
	gosub :bufferlist
	if (($modelist > 0) or ($localmodelist > 0))
		setvar $switchboard~message $switchboard~message&"  *              "&ansi_2&"-="&ansi_10&"Modes"&ansi_2&"=-"&ansi_15&"              *"
		setvar $currentlist " "
		setvar $i 1
		while ($i <= $modelist)
			setvar $tempcommand $modelist[$i]&"###"
			striptext $tempcommand "scripts\"&$bot~mombot_directory&"\modes\"&$bot~parm1&"\"
			striptext $tempcommand ".cts###"
			uppercase $tempcommand
			cuttext $tempcommand&" " $hidden 1 1
			if ($hidden = "_")
				getlength $tempcommand $templength
				if (($switchboard~self_command = true) and ($templength > 1))
					cuttext $tempcommand $tempcommand 2 9999
					setvar $currentlist $currentlist&" [<><>HIDDEN<><>]"&$tempcommand&" "
				end
			else
				getwordpos $currentlist $pos " "&$tempcommand&" "
				if ($pos <= 0)
					setvar $currentlist $currentlist&" "&$tempcommand&" "
				end
			end
			add $i 1
		end
		setvar $i 1
		while ($i <= $localmodelist)
			setvar $tempcommand $localmodelist[$i]&"###"
			striptext $tempcommand "scripts\"&$bot~mombot_directory&"\local\modes\"&$bot~parm1&"\"
			striptext $tempcommand "scripts/"&$bot~mombot_directory&"/local/modes/"&$bot~parm1&"/"
			striptext $tempcommand ".cts###"
			uppercase $tempcommand
			cuttext $tempcommand&" " $hidden 1 1
			if ($hidden = "_")
				getlength $tempcommand $templength
				if (($switchboard~self_command = true) and ($templength > 1))
					cuttext $tempcommand $tempcommand 2 9999
					setvar $currentlist $currentlist&" [<><>HIDDEN<><>]"&$tempcommand&" "
				end
			else
				getwordpos $currentlist $pos " "&$tempcommand&" "
				if ($pos <= 0)
					setvar $currentlist $currentlist&" "&$tempcommand&" "
				end
			end
			add $i 1
		end
		gosub :bufferlist
	end
	setvar $switchboard~message $switchboard~message&ansi_7&"  *  -"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"-"&ansi_7&"-"&ansi_8&"- *"&ansi_15
end
if (($switchboard~self_command = true) or ($bot~silent_running = true))

else
	setvar $switchboard~self_command 2
end
gosub :switchboard~switchboard
halt

:bufferlist
setvar $i 1
getword $currentlist $test $i "[<><>NONE<><>]"
setvar $paddingdashes "                                "
while ($test <> "[<><>NONE<><>]")
	if ($test <> "0")
		setvar $tempcommand $test
		setvar $tempcommandhidden false
		setvar $nexthidden false
		setvar $next2hidden false
		getword $currentlist $next ($i+1)
		getword $currentlist $next2 ($i+2)
		getwordpos $tempcommand $pos "[<><>HIDDEN<><>]"
		if ($pos > 0)
			striptext $tempcommand "[<><>HIDDEN<><>]"
			setvar $tempcommandhidden true
			setvar $tempcommand2 ansi_14&$tempcommand&ansi_15
		else
			setvar $tempcommand2 $tempcommand
		end
		if ($next <> 0)
			getwordpos $next $pos "[<><>HIDDEN<><>]"
			striptext $next "[<><>HIDDEN<><>]"
			if ($pos > 0)
				setvar $nexthidden true
				setvar $tempcommand2 $tempcommand2&"   "&ansi_14&$next&ansi_15
			else
				setvar $tempcommand2 $tempcommand2&"   "&$next
			end
			setvar $tempcommand $tempcommand&"   "&$next
			add $i 1
		end
		if ($next2 <> 0)
			getwordpos $next2 $pos "[<><>HIDDEN<><>]"
			striptext $next2 "[<><>HIDDEN<><>]"
			if ($pos > 0)
				setvar $next2hidden true
				setvar $tempcommand2 $tempcommand2&"   "&ansi_14&$next2&ansi_15
			else
				setvar $tempcommand2 $tempcommand2&"   "&$next2
			end
			setvar $tempcommand $tempcommand&"   "&$next2
			add $i 1
		end
		getlength $tempcommand $comlength
		uppercase $tempcommand
		setvar $sidelength (($maxstringlength-$comlength)/2)
		cuttext $paddingdashes $leftpad 1 $sidelength
		cuttext $paddingdashes $rightpad 1 (($maxstringlength-$comlength)-$sidelength)
		if ($switchboard~self_command = true)
			setvar $switchboard~message $switchboard~message&"  "&$leftpad&$tempcommand2&$rightpad&" *"
		else
			setvar $switchboard~message $switchboard~message&"  "&$leftpad&$tempcommand&$rightpad&" *"
		end
		add $commandcount 1
	end
	add $i 1
	getword $currentlist $test $i "[<><>NONE<><>]"
end
return

:echo_help
loadvar $bot~major_version
loadvar $bot~minor_version

echo "*"
echo ansi_13 "  ----------------" ansi_14 "Mind " ansi_4 "()" ansi_14 "ver Matter Bot Help Categories" ansi_13 "---------------*"
echo ansi_13 "                            Version: "&$bot~major_version&"."&$bot~minor_version&"*"
echo ansi_13 "                  [OFFENSE]|[DEFENSE]|[DATA]|[CASHING]*"
echo ansi_13 "                      [RESOURCE]|[GRID]|[GENERAL]    *"
gosub :bot~load_hotkey_config
echo ansi_13 "  ----------------------------- "&ansi_14&"Hot Keys"&ansi_13&" -----------------------------*"
gosub :menus~echohotkeys

echo ansi_13 "  ----------------------------- "&ansi_14&"Daemons"&ansi_13&" ------------------------------*"
getfilelist $daemonlist "scripts\"&$bot~mombot_directory&"\daemons\*.cts"
if ($daemonlist <= 0)
	getfilelist $daemonlist "scripts/"&$bot~mombot_directory&"/daemons/*.cts"
end
getfilelist $localdaemonlist "scripts\"&$bot~mombot_directory&"\local\daemons\*.cts"
if ($localdaemonlist <= 0)
	getfilelist $localdaemonlist "scripts/"&$bot~mombot_directory&"/local/daemons/*.cts"
end
if (($daemonlist > 0) or ($localdaemonlist > 0))
	setvar $paddingdashes "                                 "
	setvar $currentlist ""
	setvar $maxstringlength 68
	setvar $i 1
	while ($i <= $daemonlist)
		setvar $tempcommand $daemonlist[$i]&"###"
		striptext $tempcommand "scripts\"&$bot~mombot_directory&"\daemons\"
		striptext $tempcommand "scripts/"&$bot~mombot_directory&"/daemons/"
		striptext $tempcommand ".cts###"
		setvar $currentlist $currentlist&" "&$tempcommand&" "
		add $i 1
	end
	setvar $i 1
	while ($i <= $localdaemonlist)
		setvar $tempcommand $localdaemonlist[$i]&"###"
		striptext $tempcommand "scripts\"&$bot~mombot_directory&"\local\daemons\"
		striptext $tempcommand "scripts/"&$bot~mombot_directory&"/local/daemons/"
		striptext $tempcommand ".cts###"
		getwordpos $currentlist $pos " "&$tempcommand&" "
		if ($pos <= 0)
			setvar $currentlist $currentlist&" "&$tempcommand&" "
		end
		add $i 1
	end
	setvar $switchboard~message ""
	gosub :bufferlist
	echo $switchboard~message
else
	echo ansi_15 "  *                      No daemons found.                            *"
end
echo ansi_13 "  ------------------------"&ansi_14&" Hints/Tips "&ansi_13&"--------------------------------  *"
gosub :get_hint_tips

echo ansi_15 "  *  "&$hint_tip&"*  *"
echo ansi_13 "  --------------------------------------------------------------------***"
halt

:ss_help
loadvar $bot~major_version
loadvar $bot~minor_version
setvar $helpstring "'*"
setvar $helpstring $helpstring&"  -----------------Mind ()ver Matter Bot Help Categories--------------*"
setvar $helpstring $helpstring&"                              Version: "&$bot~major_version&"."&$bot~minor_version&"*"
setvar $helpstring $helpstring&"                   [OFFENSE]|[DEFENSE]|[DATA]|[CASHING]*"
setvar $helpstring $helpstring&"                        [RESOURCE]|[GRID]|[GENERAL]    *"
setvar $helpstring $helpstring&"  --------------------------------------------------------------------**"
send $helpstring
halt
# ============================== END HELP FOR COMMANDS SUB ==============================
:get_hint_tips
setarray $hints 12
setvar $hints 12
setvar $hints[1] "You can run most commands silently by adding a 'silent' parameter*  to any command line.*  There is also a silent option in the bot preference menu to*  keep things quiet on the ss channel."
setvar $hints[2] "There are different surround options in the bot menu.*  Press tab-~ to see them. TAB-s will surround."
setvar $hints[3] "There are variables you can use in the command line as shortcuts:*    h - home sector*    r - rylos*    a - alpha centauri*    b - backdoor to stardock*    s - stardock*    x - safe ship*    l - safe planet*  *  If you place these into any script, the letter will be replaced*  with a sector number for each.*  *  (Except the safe ship, that will be replaced with the ship number.)"
setvar $hints[4] "Some commands have shortened names!  Examples are:*    twarp (t)         bwarp (b)*    mow (m)           pwarp (p)*    xport (x)         deposit (d)*    withdrawal (w)    land (l)"
setvar $hints[5] "TAB-TAB will stop all scripts, plus it will reset messages.*  Never doubt if you are deaf again!"
setvar $hints[6] "Hotkeys can be defined in the bot preference menu (TAB-~).*  You can fire almost any command with the click of the hotkey."
setvar $hints[7] "Don't forget the gridding menu!  Just press > >.*  The photon menu is one more >."
setvar $hints[8] "Always add new alien ships to your bot by using the storeship command.*  That will make capturing them easier."
setvar $hints[9] "Your bot will grab the planet number of the planet you are landing on.*  If you want to reland, just use the l command.  No number required!"
setvar $hints[10] "Need to restart a bot?  Try the 'reboot' command.*  It will kill your current bot and reload a new one."
setvar $hints[11] "If your bot doesn't seem to have the correct game info, try using*  the 'refresh' command."
setvar $hints[12] "You can scroll through your history of commands by*  pressing the up and down arrow in the self command prompt."
getrnd $selected_hint 1 $hints
setvar $hint_tip $hints[$selected_hint]

return

# includes:
include "source\include\loadvars"
include "source\include\switchboard"
include "source\include\player"
include "source\include\bot"
include "source\include\menus"
include "source\include\help"
