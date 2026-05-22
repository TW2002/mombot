gosub :loadvars~loadvars
loadvar $bot~folder

#=============================================  DOCK SHOPPER MENU  ==================================================
:dock_shopper
# ============================ START DOCK SHOPPER VARIABLES ==========================
setvar $lsd_curent_version "4.0"
setvar $lsd_taglineb "LSDv" & $lsd_curent_version
setvar $lsd_shipdata_valid      false
setvar $lsd_ships_names         "][LSD]["
setvar $lsd_ships_file          $bot~folder&"/LSD_" & gamename & ".ships"
setvar $lsd_shiplistmax         50
setvar $lsd_botting         $bot~bot_name
setvar $lsd__pad            "@"
setarray $lsd_shiplist          $lsd_shiplistmax 3
# ============================ END DOCK SHOPPER VARIABLES ==========================

setvar $isdockshopper true
setvar $lsd__atomics ""
setvar $lsd__beacons ""
setvar $lsd__corbo ""
setvar $lsd__cloak ""
setvar $lsd__probe ""
setvar $lsd__pscan ""
setvar $lsd__limps ""
setvar $lsd__mines ""
setvar $lsd__photon ""
setvar $lsd__lrscan ""
setvar $lsd__disrupt ""
setvar $lsd__gentorp ""
setvar $lsd__t2twarp ""
setvar $lsd__holds ""
setvar $lsd__figs ""
setvar $lsd__shields ""
setvar $lsd__trickster ""
setvar $lsd_numberofship ""
setvar $lsd__total 0
setvar $lsd_tow 0
setvar $lsd_order ""
setvar $switchboard~bot_name $bot~bot_name
setvar $switchboard~self_command $self_command
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
setvar $bot~validprompts "Command Citadel"
setvar $bot~startinglocation $startinglocation
gosub :player~checkstartingprompt
if ($startinglocation = "Citadel")
	send " Q DC  "
	waitfor "Planet #"
	getword currentline $planet~planet 2
	striptext $planet~planet "#"
	isnumber $lsd_tst $planet~planet
	if ($lsd_tst = 0)
		setvar $planet~planet 0
	end
end
gosub :loadshipdata
gosub :getclass0costs
gosub :checkcosts

:start
:topofmenu
echo #27 & "[2J"

:topofmenu_noclear
gosub :setmenuechos
echo "***"
echo ("     "&ansi_15&#196&#196&ansi_7&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_7&#196&ansi_15&#196&#196)
echo ansi_14 & "*        LoneStar's StarDock Shopper"
echo ansi_9 & "*         Mind ()ver Matter Edition"
echo ansi_15 & "*          Emporium Daily Specials"
echo ansi_14 & "*                Version " & $lsd_curent_version & "*"
echo ("     "&ansi_15&#196&#196&ansi_7&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_7&#196&ansi_15&#196&#196)
echo "*"
setvar $lsd_padthiscost $game~lsd_atomiccost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "A" & ansi_5 & ">" & ansi_9 & " Atomic Detonators      " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_atomics
setvar $lsd_padthiscost $game~lsd_beacon
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "B" & ansi_5 & ">" & ansi_9 & " Marker Beacons         " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_beacons
setvar $lsd_padthiscost $game~lsd_corbocost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "C" & ansi_5 & ">" & ansi_9 & " Corbomite Devices      " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_corbo
setvar $lsd_padthiscost $game~lsd_cloakcost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "D" & ansi_5 & ">" & ansi_9 & " Cloaking Devices       " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_cloak
setvar $lsd_padthiscost $game~lsd_eprobe
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "E" & ansi_5 & ">" & ansi_9 & " SubSpace Ether Probes  " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_probe
setvar $lsd_padthiscost $game~lsd_pscan
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "F" & ansi_5 & ">" & ansi_9 & " Planet Scanners        " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_pscan
setvar $lsd_padthiscost $game~lsd_limpcost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "L" & ansi_5 & ">" & ansi_9 & " Limpet Tracking Mines  " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_limps
setvar $lsd_padthiscost $game~lsd_armidcost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "M" & ansi_5 & ">" & ansi_9 & " Space Mines            " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_mines
setvar $lsd_padthiscost $game~lsd_photoncost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "P" & ansi_5 & ">" & ansi_9 & " Photon Missiles        " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_photon
setvar $lsd_padthiscost $game~lsd_holocost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "R" & ansi_5 & ">" & ansi_9 & " Long Range Scanners    " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_lrscan
setvar $lsd_padthiscost $game~lsd_disruptcost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "S" & ansi_5 & ">" & ansi_9 & " Mine Disruptors        " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_disrupt
setvar $lsd_padthiscost $game~lsd_gencost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "T" & ansi_5 & ">" & ansi_9 & " Genesis Torpedoes      " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_gentorp
setvar $lsd_padthiscost $game~lsd_twarpiicost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "W" & ansi_5 & ">" & ansi_9 & " T2 TransWarp Drives    " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_t2twarp
setvar $lsd_padthiscost $lsd_holdcost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "1" & ansi_5 & ">" & ansi_9 & " Holds                  " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_holds
setvar $lsd_padthiscost $lsd_fightercost
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "2" & ansi_5 & ">" & ansi_9 & " Figs                   " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_figs
setvar $lsd_padthiscost $lsd_shield
gosub :paditemcosts
echo ansi_5 & "*    <" & ansi_2 & "3" & ansi_5 & ">" & ansi_9 & " Shields                " & $lsd_padthiscost & ansi_14 & ": " & $lsd_echo_shields
if ($lsd__total <> 0)
	setvar $lsd_cashamount $lsd__total
	gosub :commasize
	echo "*                                 " & ansi_15 & " TOTAL (" & ansi_7 & "$" & $lsd_cashamount & ansi_15 & ")"
	setvar $lsd__total 0
end
echo "*    " #27 "[1m" ansi_4 #196 #196 #196 #196 #196 #196  #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196
if ($lsd_shipdata_valid)
	echo ansi_5 & "*    <" & ansi_8 & "G" & ansi_5 & ">" & ansi_5 & " Buy Ship(s): " & ansi_8 & $lsd_echo_trickster
else
	echo ansi_5 & "*    <" & ansi_8 & "G" & ansi_5 & ">" & ansi_5 & " Buy Ship(s): " & ansi_8 & "Must Run StandAlone Version"
	setvar $lsd__trickster ""
end
if ($lsd__trickster = "")
	echo ansi_5 & "*    <" & ansi_8 & "Y" & ansi_5 & ">" & ansi_5 & " Tow & Outfit Another Ship   "  & ansi_8
	if ($lsd_tow > 0)
		echo ansi_15 & "#" & $lsd_tow
	end
else
	setvar $lsd_tow 0
end
echo ansi_5 & "*    <" & ansi_8 & "Z" & ansi_5 & ">" & ansi_5 & " Max Out Ship On Everything!"
echo ansi_5 & "*    <" & ansi_15 & "V" & ansi_5 & ">" & ansi_5 & " Name Of Bot To Command " & ansi_14&": "
if ($lsd_botting = "") or ($lsd_botting = "0")
	setvar $lsd_botting $bot~bot_name
end
echo ansi_15 & $lsd_botting
echo "*        " #27 "[1m" ansi_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196
echo "*        " & ansi_14 & "X" & ansi_15 & " - Execute    " & ansi_14 & "Q" & ansi_15 & " - Quit**"
getconsoleinput $lsd_selection singlekey
uppercase $lsd_selection
setvar $yes_no false
setvar $item_max 1000
if ($lsd_selection = "Q")
	echo "**" & ansi_12 "  Script Halted" & ansi_15 & "**"
	halt
elseif ($lsd_selection = "A")
	setvar $item_name "Atomics"
	setvar $item_max 100
	gosub :getiteminput
	setvar $lsd__atomics $lsd_selection
elseif ($lsd_selection = "B")
	setvar $item_name "Marker Beacons"
	setvar $item_max 100
	gosub :getiteminput
	setvar $lsd__beacons $lsd_selection
elseif ($lsd_selection = "C")
	setvar $item_name "Coromite Devices"
	setvar $item_max 100000
	gosub :getiteminput
	setvar $lsd__corbo $lsd_selection
elseif ($lsd_selection = "D")
	setvar $item_name "Cloaking Devices"
	gosub :getiteminput
	setvar $lsd__cloak $lsd_selection
elseif ($lsd_selection = "E")
	setvar $item_name "SubSpace Ether Probe Devices"
	gosub :getiteminput
	setvar $lsd__probe $lsd_selection
elseif ($lsd_selection = "F")
	setvar $item_name "Install Planet Scanner (Y/N)?"
	setvar $yes_no true
	gosub :getiteminput
	setvar $lsd__pscan $lsd_selection
elseif ($lsd_selection = "L")
	setvar $item_name "Limpet Tracking Devices"
	gosub :getiteminput
	setvar $lsd__limps $lsd_selection
elseif ($lsd_selection = "M")
	setvar $item_name "Armid Mines To Buy"
	gosub :getiteminput
	setvar $lsd__mines $lsd_selection
elseif ($lsd_selection = "P")
	setvar $item_name "Photon Devices To Buy"
	gosub :getiteminput
	setvar $lsd__photon $lsd_selection
elseif ($lsd_selection = "R")
	setvar $item_name "Holo Scanner (Y/N)?"
	setvar $yes_no true
	gosub :getiteminput
	setvar $lsd__lrscan $lsd_selection
elseif ($lsd_selection = "S")
	setvar $item_name "Mine Disruptors"
	gosub :getiteminput
	setvar $lsd__disrupt $lsd_selection
elseif ($lsd_selection = "T")
	setvar $item_name "Genesis Torpedoes"
	gosub :getiteminput
	setvar $lsd__gentorp $lsd_selection
elseif ($lsd_selection = "W")
	setvar $item_name "Install Trans Warp 2 Drive (Y/N)?"
	setvar $yes_no true
	gosub :getiteminput
	setvar $lsd__t2twarp $lsd_selection
elseif ($lsd_selection = "Y")
	#-------------------------------------------- Tow a Ship
	if ($player~twarp_type = 2)
		getinput $lsd_selection ansi_15 & #27 & "[1A" & #27 & "[K" & ansi_14 & "*Tow and Outfit a Ship (0 to Cancel)?"
		isnumber $lsd_tst $lsd_selection
		if ($lsd_tst <> 0)
			if (($lsd_selection < 0) or ($lsd_selection > 250))
				setvar $lsd_tow 0
			else
				setvar $lsd_tow $lsd_selection
			end
		else
			setvar $lsd_tow 0
		end
	end
elseif ($lsd_selection = "Z")
	#-------------------------------------------- Buy Max ship on everything
	setvar $lsd__photon "Max"

	:buyphotonenthoughthereshaz2
	setvar $lsd__total 0
	setvar $lsd__atomics "Max"
	setvar $lsd__beacons "Max"
	setvar $lsd__corbo "Max"
	setvar $lsd__cloak "Max"
	setvar $lsd__probe "Max"
	setvar $lsd__pscan "Yes"
	setvar $lsd__limps "Max"
	setvar $lsd__mines "Max"
	setvar $lsd__lrscan "Yes"
	setvar $lsd__disrupt "Max"
	setvar $lsd__gentorp "Max"
	setvar $lsd__t2twarp "Yes"
	setvar $lsd__holds "Max"
	setvar $lsd__figs "Max"
	setvar $lsd__shields "Max"
elseif ($lsd_selection = "V")
	getinput $lsd_botting ("  " & ansi_5 & "Enter the Bot Name To Issue LSD Command Too? ")
	if ($lsd_botting = $lsd__pad)
		setvar $lsd_botting $bot~bot_name
	end
elseif ($lsd_selection = "1")
	setvar $item_name "Cargo Holds"
	setvar $item_max 255
	gosub :getiteminput
	setvar $lsd__holds $lsd_selection
elseif ($lsd_selection = "2")
	setvar $item_name "Fighters"
	setvar $item_max 400000
	gosub :getiteminput
	setvar $lsd__figs $lsd_selection
elseif ($lsd_selection = "3")
	setvar $item_name "Shields"
	setvar $item_max 16000
	gosub :getiteminput
	setvar $lsd__shields $lsd_selection
elseif (($lsd_selection = "G") and ($lsd_shipdata_valid))
	gosub :displaymenu
elseif ($lsd_selection = "X")
	if (($lsd__atomics = "") and ($lsd__beacons = "") and ($lsd__corbo = "") and ($lsd__cloak = "") and ($lsd__probe = "") and ($lsd__pscan = "") and   ($lsd__limps = "") and ($lsd__mines = "") and ($lsd__photon = "") and ($lsd__lrscan = "") and ($lsd__disrupt = "") and  ($lsd__gentorp = "") and ($lsd__t2twarp = "") and ($lsd__buffers = "") and ($lsd__holds = "") and ($lsd__figs = "") and ($lsd__shields = ""))
		if ($lsd__trickster = "")
			echo "**" & ansi_14 & $lsd_taglineb & ansi_15 & " - Nothing Was Selected From The Menu**"
			goto :topofmenu_noclear
		end
	end
	if (($lsd_botting = "") or ($lsd_botting = $lsd__pad))
		echo "****" & ansi_14 & $lsd_taglineb & ansi_15 & " - Please specify name of Bot to address!"
		goto :topofmenu_noclear
	end
	echo "**" ansi_15
	setvar $item_type $lsd__atomics
	gosub :prepareorder
	setvar $item_type $lsd__beacons
	gosub :prepareorder
	setvar $item_type $lsd__corbo
	gosub :prepareorder
	setvar $item_type $lsd__cloak
	gosub :prepareorder
	setvar $item_type $lsd__probe
	gosub :prepareorder
	setvar $item_type $lsd__pscan
	setvar $yes_no true
	gosub :prepareorder
	setvar $item_type $lsd__limps
	gosub :prepareorder
	setvar $item_type $lsd__mines
	gosub :prepareorder
	setvar $item_type $lsd__photon
	gosub :prepareorder
	setvar $item_type $lsd__lrscan
	setvar $yes_no true
	gosub :prepareorder
	setvar $item_type $lsd__disrupt
	gosub :prepareorder
	setvar $item_type $lsd__gentorp
	gosub :prepareorder
	setvar $item_type $lsd__t2twarp
	setvar $yes_no true
	gosub :prepareorder
	setvar $item_type $lsd__holds
	gosub :prepareorder
	setvar $item_type $lsd__figs
	gosub :prepareorder
	setvar $item_type $lsd__shields
	gosub :prepareorder

	if (($lsd_tow <> "") and ($lsd_tow <> 0))
		setvar $lsd_order ($lsd_order & $lsd_tow)
	else
		setvar $lsd_order ($lsd_order & 0)
	end
	setvar $lsd_order ($lsd_order & $lsd__pad)
	if ($lsd__trickster <> "")
		getwordpos $lsd__trickster $lsd_pos "^^"
		cuttext $lsd__trickster $lsd__trickster 1 ($lsd_pos - 1)
		striptext $lsd__trickster " "
		striptext $lsd__trickster "^"
	end
	if ($lsd__trickster <> "")
		setvar $lsd_order ($lsd_order & $lsd__trickster)
	else
		setvar $lsd_order ($lsd_order & 0)
	end
	setvar $lsd_order ($lsd_order & $lsd__pad)
	if ($lsd_numberofship <> "")
		setvar $lsd_order ($lsd_order & $lsd_numberofship)
	else
		setvar $lsd_order ($lsd_order & 0)
	end
	setvar $lsd_order ($lsd_order & $lsd__pad)
	if ($lsd_customshipname <> "")
		setvar $lsd_order ($lsd_order & $lsd_customshipname)
	else
		setvar $lsd_order ($lsd_order & $lsd_ships_names)
	end
	if ($lsd_botting = $bot~bot_name)
		setvar $lsd_order ($lsd_order & "              ")
		setvar $bot~user_command_line "lsd " & $lsd_order
		gosub :doaddhistory
	end
	setvar $lsd_attempt 1

	:lsd_login_loop
	killalltriggers
	settextlinetrigger  needtologin     :needtologin    "Send a corporate memo to login."
	settextlinetrigger  botsbusy        :botsbusy       "- Time Left   = "
	settextlinetrigger  botsnotbusy     :botsnotbusy    "Bot Mode :"
	settextlinetrigger  botsnotbusy3    :botsnotbusy    "Bot Mode :General"
	setdelaytrigger     botnotthere     :botnotthere    4000
	send ("'" & $lsd_botting & " Status*")
	pause

	:botnotthere
	killalltriggers
	echo "**" & ansi_14 & $lsd_taglineb & ansi_15 & " - " & $lsd_botting & "-bot Is Not Responding**"
	halt

	:needtologin
	killalltriggers
	if ($lsd_attempt <= 3)
		if ($startinglocation = "Command")
			send " T T Login***"
		elseif ($startinglocation = "Citadel")
			send " X T Login***"
		else
			echo "**" & ansi_14 & $lsd_taglineb & ansi_15 & " - Please Login to Bots!**"
			halt
		end
		setdelaytrigger     areweloggedin   :areweloggedin  4000
		settextlinetrigger  weloggedin1     :weloggedin     "- User Verified -"
		settextlinetrigger  weloggedin2     :weloggedin     "- You are logged into this bot"
		echo "**" & ansi_14 & $lsd_taglineb & ansi_15 & " - Waiting For Response (Attempt #"&$lsd_attempt&") ...**"
		pause

		:areweloggedin
		killalltriggers
		add $lsd_attempt 1
		goto :lsd_login_loop

		:weloggedin
		killalltriggers
		#Looping Back to get bot's status
		goto :lsd_login_loop
	else
		echo "**" & ansi_14 & $lsd_taglineb & ansi_15 & " - Unable To Login to Bot!!**"
		halt
	end

	:botsbusy
	killalltriggers
	echo "**" & ansi_14 & $lsd_taglineb & ansi_15 & " - Bot must be in General Mode**"
	halt

	:botsnotbusy
	killalltriggers
	if ($lsd_botting = $bot~bot_name)
		goto :mode_reset
	end
	settextlinetrigger  mode_reset  :mode_reset "All non-system scripts and modules killed, and modes reset."
	setdelaytrigger     mode_issue  :mode_issue 4000
	echo "**" & ansi_14 & $lsd_taglineb & ansi_15 & " - Waiting 4 Seconds For Response...**"
	send ("'" & $lsd_botting & " StopAll*")
	pause

	:mode_issue
	killalltriggers
	echo "**" & ansi_14 & $lsd_taglineb & ansi_15 & " - StopAll Timed Out. Please Try Again!**"
	halt

	:mode_reset
	killalltriggers
	send ("'" & $lsd_botting & " LSD " & $lsd_order & "*")
	halt
end
goto :topofmenu

:pad_this
if ($lsd_str_pad < 10)
	setvar $lsd_str_pad "     " & $lsd_str_pad
elseif ($lsd_str_pad < 100)
	setvar $lsd_str_pad "    " & $lsd_str_pad
elseif ($lsd_str_pad < 1000)
	setvar $lsd_str_pad "   " & $lsd_str_pad
elseif ($lsd_str_pad < 10000)
	setvar $lsd_str_pad "  " & $lsd_str_pad
elseif ($lsd_str_pad < 100000)
	setvar $lsd_str_pad " " & $lsd_str_pad
end
return

:commasize
if ($lsd_cashamount < 1000)
elseif ($lsd_cashamount < 1000000)
	getlength $lsd_cashamount $lsd_len
	setvar $lsd_len ($lsd_len - 3)
	cuttext $lsd_cashamount $lsd_tmp 1 $lsd_len
	cuttext $lsd_cashamount $lsd_tmp1 ($lsd_len + 1) 999
	setvar $lsd_tmp $lsd_tmp & "," & $lsd_tmp1
	setvar $lsd_cashamount $lsd_tmp
elseif ($lsd_cashamount <= 999999999)
	getlength $lsd_cashamount $lsd_len
	setvar $lsd_len ($lsd_len - 6)
	cuttext $lsd_cashamount $lsd_tmp 1 $lsd_len
	setvar $lsd_tmp $lsd_tmp & ","
	cuttext $lsd_cashamount $lsd_tmp1 ($lsd_len + 1) 3
	setvar $lsd_tmp $lsd_tmp & $lsd_tmp1 & ","
	cuttext $lsd_cashamount $lsd_tmp1 ($lsd_len + 4) 999
	setvar $lsd_tmp $lsd_tmp & $lsd_tmp1
	setvar $lsd_cashamount $lsd_tmp
end
return

:getiteminput
if ($yes_no)
	echo #27 & "[1A" & #27 & "[K" & ansi_14 & "*" & $item_name & "                         *"
	getconsoleinput $lsd_selection singlekey
else
	getinput $lsd_selection ansi_15 & #27 & "[1A" & #27 & "[K" & ansi_14 & "*" & $item_name & " To Buy (M for Maximum)?"
end
uppercase $lsd_selection
if ($lsd_selection = "M")
	setvar $lsd_selection "Max"
elseif ($lsd_selection = "Y")
	setvar $lsd_selection "Yes"
elseif ($lsd_selection = "N")
	setvar $lsd_selection ""
else
	if ($yes_no)
		setvar $lsd_selection ""
	else
		isnumber $lsd_tst $lsd_selection
		if ($lsd_tst <> 0)
			if ($lsd_selection = 0)
				setvar $lsd_selection ""
			elseif ($lsd_selection > $item_max)
				setvar $lsd_selection $item_max
			else
				setvar $lsd_selection $lsd_selection
			end
		end
	end
end
return

:prepareorder
if ($yes_no)
	if ($item_type <> "")
		setvar $lsd_order ($lsd_order & "Y")
	else
		setvar $lsd_order ($lsd_order & "N")
	end
else
	if ($item_type <> "")
		if ($item_type = "Max")
			setvar $lsd_order ($lsd_order & "M")
		else
			setvar $lsd_order ($lsd_order & $item_type)
		end
	else
		setvar $lsd_order ($lsd_order & 0)
	end
end
setvar $lsd_order ($lsd_order & $lsd__pad)
setvar $yes_no false
return

:checkcosts
setvar $lsd_costsaregood true
loadvar $game~lsd_limpremovalcost
loadvar $game~lsd_gencost
loadvar $game~lsd_armidcost
loadvar $game~lsd_limpcost
loadvar $game~lsd_beacon
loadvar $game~lsd_twarpicost
loadvar $game~lsd_twarpiicost
loadvar $game~lsd_twarpupcost
loadvar $game~lsd_pscan
loadvar $game~lsd_atomiccost
loadvar $game~lsd_corbocost
loadvar $game~lsd_eprobe
loadvar $game~lsd_photoncost
loadvar $game~lsd_cloakcost
loadvar $game~lsd_disruptcost
loadvar $game~lsd_holocost
loadvar $game~lsd_dscancost
loadvar $game~lsd_reregistercost
if (($game~lsd_limpremovalcost = 0) or ($game~lsd_gencost = 0) or ($game~lsd_armidcost = 0) or ($game~lsd_limpcost = 0) or ($game~lsd_beacon = 0) or ($game~lsd_twarpicost = 0) or ($game~lsd_twarpiicost = 0) or ($game~lsd_twarpupcost = 0) or ($game~lsd_pscan = 0) or ($game~lsd_atomiccost = 0) or ($game~lsd_corbocost = 0) or ($game~lsd_eprobe = 0) or ($game~lsd_photoncost = 0) or ($game~lsd_cloakcost = 0) or ($game~lsd_disruptcost = 0) or ($game~lsd_holocost = 0) or ($game~lsd_dscancost = 0) or ($game~lsd_reregistercost = 0))
	gosub :game~gamestats
end
return

:paditemcosts
getlength $lsd_padthiscost $lsd_len
if ($lsd_len = 1)
	setvar $lsd_padthiscost "      " & $lsd_padthiscost
elseif ($lsd_len = 2)
	setvar $lsd_padthiscost "     " & $lsd_padthiscost
elseif ($lsd_len = 3)
	setvar $lsd_padthiscost "    " & $lsd_padthiscost
elseif ($lsd_len = 4)
	setvar $lsd_padthiscost "   " & $lsd_padthiscost
elseif ($lsd_len = 5)
	setvar $lsd_padthiscost "  " & $lsd_padthiscost
elseif ($lsd_len = 6)
	setvar $lsd_padthiscost " " & $lsd_padthiscost
else

end
return

:getclass0costs
send "CR1*Q  "
waitfor "Commerce report for:"
settextlinetrigger lsd_cargoholds   :lsd_cargoholds "A  Cargo holds     : "
settextlinetrigger lsd_fighters     :lsd_fighters "B  Fighters        : "
settextlinetrigger lsd_shields      :lsd_shields "C  Shield Points   : "
settexttrigger lsd_fini1        :lsd_fini "Command [TL="
settexttrigger lsd_fini2        :lsd_fini "Citadel command (?"
pause

:lsd_cargoholds
killtrigger lsd_cargoholds
getword currentline $lsd_holdcost 5
isnumber $lsd_tst $lsd_holdcost
if ($lsd_tst = 0)
	setvar $lsd_holdcost 0
end
pause

:lsd_fighters
killtrigger lsd_fighters
getword currentline $lsd_fightercost 4
isnumber $lsd_tst $lsd_fightercost
if ($lsd_tst = 0)
	setvar $lsd_fightercost 0
end
pause

:lsd_shields
killtrigger lsd_shields
getword currentline $lsd_shield 5
isnumber $lsd_tst $lsd_shield
if ($lsd_tst = 0)
	setvar $lsd_shield 0
end
pause

:lsd_fini
killalltriggers
setvar $lsd_cashamount $lsd_holdcost
gosub :commasize
setvar $lsd_lsd_holdcost $lsd_cashamount
setvar $lsd_cashamount $lsd_fightercost
gosub :commasize
setvar $lsd_fightercost $lsd_cashamount
setvar $lsd_cashamount $lsd_shield
gosub :commasize
setvar $lsd_shield  $lsd_cashamount
return

:setmenuechos
isnumber $lsd_tst $lsd_numberofship
if ($lsd_tst <> 0)
	if ($lsd_numberofship > 0)
		gettext $lsd__trickster $lsd_cost "^^" "@@"
		striptext $lsd_cost ","
		striptext $lsd_cost "."
		striptext $lsd_cost " "
		gettext $lsd__trickster $lsd_temp "@@" "!!"
		striptext $lsd_reregistercost ","
		striptext $lsd_reregistercost "."
		setvar $lsd_cost ($lsd_cost + $lsd_reregistercost)
		setvar $lsd_mathout ($lsd_numberofship * $lsd_cost)
		setvar $lsd__total ($lsd__total + $lsd_mathout)
		setvar $lsd_cashamount $lsd_mathout
		gosub :commasize
		setvar $lsd_echo_trickster ansi_15 & $lsd_numberofship & " " & $lsd_temp & ansi_7 & "  ($" & $lsd_cashamount & ")"
	else
		setvar $lsd_echo_trickster ""
	end
else
	setvar $lsd_echo_trickster ""
end
setvar $item_number $lsd__atomics
setvar $lsd_cost $game~lsd_atomiccost
gosub :dosetmenuecho
setvar $lsd_echo_atomics $item_echo
setvar $item_number $lsd__beacons
setvar $lsd_cost $game~lsd_beacon
gosub :dosetmenuecho
setvar $lsd_echo_beacons $item_echo
setvar $item_number $lsd__corbo
setvar $lsd_cost $game~lsd_corbocost
gosub :dosetmenuecho
setvar $lsd_echo_corbo $item_echo
setvar $item_number $lsd__cloak
setvar $lsd_cost $game~lsd_cloakcost
gosub :dosetmenuecho
setvar $lsd_echo_cloak $item_echo
setvar $item_number $lsd__probe
setvar $lsd_cost $game~lsd_eprobe
gosub :dosetmenuecho
setvar $lsd_echo_probe $item_echo
if ($lsd__pscan = "Yes")
	setvar $lsd_cost $game~lsd_pscan
	striptext $lsd_cost ","
	striptext $lsd_cost "."
	setvar $lsd_mathout $lsd_cost
	isnumber $lsd_tst $lsd_numberofship
	if ($lsd_tst <> 0)
		setvar $lsd_mathout ($lsd_mathout * $lsd_numberofship)
		setvar $lsd_multiplier ansi_8 & "(X" & $lsd_numberofship & ")"
	else
		setvar $lsd_multiplier ""
	end
	setvar $lsd__total ($lsd__total + $lsd_mathout)
	setvar $lsd_cashamount $lsd_mathout
	gosub :commasize
	setvar $lsd_echo_pscan ansi_15 & $lsd__pscan & "  " & $lsd_multiplier & ansi_7 & "($" & $lsd_cashamount & ")"
else
	setvar $lsd_echo_pscan ""
end
setvar $item_number $lsd__limps
setvar $lsd_cost $game~lsd_limpcost
gosub :dosetmenuecho
setvar $lsd_echo_limps $item_echo
setvar $item_number $lsd__mines
setvar $lsd_cost $game~lsd_armidcost
gosub :dosetmenuecho
setvar $lsd_echo_mines $item_echo
setvar $item_number $lsd__photon
setvar $lsd_cost $game~lsd_photoncost
gosub :dosetmenuecho
setvar $lsd_echo_photon $item_echo
if ($lsd__lrscan = "Yes")
	setvar $lsd_cost $game~lsd_holocost
	striptext $lsd_cost ","
	striptext $lsd_cost "."
	setvar $lsd_mathout $lsd_cost
	isnumber $lsd_tst $lsd_numberofship
	if ($lsd_tst <> 0)
		setvar $lsd_mathout ($lsd_mathout * $lsd_numberofship)
		setvar $lsd_multiplier ansi_8 & "(X" & $lsd_numberofship & ")"
	else
		setvar $lsd_multiplier ""
	end
	setvar $lsd__total ($lsd__total + $lsd_mathout)
	setvar $lsd_cashamount $lsd_mathout
	gosub :commasize
	setvar $lsd_echo_lrscan ansi_15 & $lsd__lrscan & "  " & $lsd_multiplier & ansi_7 & "($" & $lsd_cashamount & ")"
else
	setvar $lsd_echo_lrscan ""
end
setvar $item_number $lsd__disrupt
setvar $lsd_cost $game~lsd_disruptcost
gosub :dosetmenuecho
setvar $lsd_echo_disrupt $item_echo
setvar $item_number $lsd__gentorp
setvar $lsd_cost $game~lsd_gencost
gosub :dosetmenuecho
setvar $lsd_echo_gentorp $item_echo
if ($lsd__t2twarp = "Yes")
	setvar $lsd_cost $game~lsd_twarpiicost
	striptext $lsd_cost ","
	striptext $lsd_cost "."
	setvar $lsd_mathout $lsd_cost
	isnumber $lsd_tst $lsd_numberofship
	if ($lsd_tst <> 0)
		setvar $lsd_mathout ($lsd_mathout * $lsd_numberofship)
		setvar $lsd_multiplier ansi_8 & "(X" & $lsd_numberofship & ")"
	else
		setvar $lsd_multiplier ""
	end
	setvar $lsd__total ($lsd__total + $lsd_mathout)
	setvar $lsd_cashamount $lsd_mathout
	gosub :commasize
	setvar $lsd_echo_t2twarp ansi_15 & $lsd__t2twarp & "  " & $lsd_multiplier & ansi_7 & "($" & $lsd_cashamount & ")"
else
	setvar $lsd_echo_t2twarp ""
end
setvar $item_number $lsd__holds
setvar $lsd_cost $lsd_holdcost
gosub :dosetmenuecho
setvar $lsd_echo_holds $item_echo
setvar $item_number $lsd__figs
setvar $lsd_cost $game~lsd_fightercost
gosub :dosetmenuecho
setvar $lsd_echo_figs $item_echo
setvar $item_number $lsd__shields
setvar $lsd_cost $game~lsd_shield
gosub :dosetmenuecho
setvar $lsd_echo_shields $item_echo
return

:dosetmenuecho
isnumber $lsd_tst $item_number
if ($lsd_tst <> 0)
	striptext $lsd_cost ","
	striptext $lsd_cost "."
	setvar $lsd_mathout ($item_number * $lsd_cost)
	isnumber $lsd_tst $lsd_numberofship
	if ($lsd_tst <> 0)
		setvar $lsd_mathout ($lsd_mathout * $lsd_numberofship)
		setvar $lsd_multiplier ansi_8 & "(X" & $lsd_numberofship & ")"
	else
		setvar $lsd_multiplier ""
	end
	setvar $lsd__total ($lsd__total + $lsd_mathout)
	setvar $lsd_cashamount $lsd_mathout
	gosub :commasize
	setvar $item_echo ansi_15 & $item_number & "  " & $lsd_multiplier & ansi_7 & "($" & $lsd_cashamount & ")"
elseif ($item_number  = "Max")
	setvar $item_echo "Max"
else
	setvar $item_echo ""
end
return

:loadshipdata
fileexists $lsd_test $lsd_ships_file
if ($lsd_test)
	setvar $lsd_i 1
	read $lsd_ships_file $lsd_line $lsd_i
	while (($lsd_line <> eof) and ($lsd_i <= $lsd_shiplistmax))
		getwordpos $lsd_line $lsd_pos #9
		if ($lsd_pos <> 2)
			setvar $lsd_shipdata_valid false
			return
		end
		cuttext $lsd_line $lsd_temp 1 1
		setvar $lsd_shiplist[$lsd_i] $lsd_temp
		cuttext $lsd_line $lsd_line2 3 999
		setvar $lsd_line $lsd_line2
		getwordpos $lsd_line $lsd_pos #9
		if ($lsd_pos = 0)
			setvar $lsd_shipdata_valid false
			return
		end
		cuttext $lsd_line $lsd_temp1 1 ($lsd_pos - 1)
		setvar $lsd_shiplist[$lsd_i][1] $lsd_temp1
		striptext $lsd_line $lsd_temp1 & #9
		getwordpos $lsd_line $lsd_pos #9
		if ($lsd_pos = 0)
			setvar $lsd_shipdata_valid false
			return
		end
		cuttext $lsd_line $lsd_temp2 1 ($lsd_pos - 1)
		setvar $lsd_shiplist[$lsd_i][2] $lsd_temp2
		striptext $lsd_line $lsd_temp2 & #9
		setvar $lsd_shiplist[$lsd_i][3] $lsd_line

		:nextrealline
		add $lsd_i 1
		read $lsd_ships_file $lsd_line $lsd_i
	end
	setvar $lsd_shipdata_valid true
else
	setvar $lsd_shipdata_valid false
end
return

:parseshipdata
delete $lsd_ships_file
setvar $lsd_i 0
send "S B N Y ?"
waitfor "Which ship are you interested in "
settextlinetrigger nextpage     :nextpage "<+> Next Page"

:nextpagereset
settextlinetrigger quit2leave   :quit2leave "<Q> To Leave"

:linetrignext
settextlinetrigger linetrig     :linetrig
pause

:nextpage
killalltriggers
add $lsd_i 1
setvar $lsd_shiplist[$lsd_i] "+"
setvar $lsd_shiplist[$lsd_i][1] "This Inidcates"
setvar $lsd_shiplist[$lsd_i][2] "Another"
setvar $lsd_shiplist[$lsd_i][3] "Page is availble for display"
send "+"
waitfor "Which ship are you interested in "
settextlinetrigger linetrig     :linetrig
settextlinetrigger nextpage     :quit2leave "<+> Next Page"
settextlinetrigger quit2leave   :quit2leave "<Q> To Leave"
pause

:quit2leave
killalltriggers
send " Q Q "
waitfor "<StarDock> Where to? (?="
delete $lsd_tstfile
setvar $lsd_ii 1
while ($lsd_ii <= $lsd_i)
	write $lsd_ships_file $lsd_shiplist[$lsd_ii] & #9 & $lsd_shiplist[$lsd_ii][1] & #9 & $lsd_shiplist[$lsd_ii][2] & #9 & $lsd_shiplist[$lsd_ii][3]
	add $lsd_ii 1
end
return

:linetrig
setvar $lsd_temp currentline & "@@@"
if ($lsd_temp <> "@@@")
	getwordpos $lsd_temp $lsd_pos "<"
	if ($lsd_pos = 1)
		getwordpos $lsd_temp $lsd_pos "<Q>"
		if ($lsd_pos = 0)
			add $lsd_i 1
			gettext $lsd_temp $lsd_shiplist[$lsd_i] "<" ">"
			gettext $lsd_temp $lsd_shiplist[$lsd_i][1] "> " "   "
			gettext $lsd_temp $lsd_shiplist[$lsd_i][2] "   " "@@@"
			striptext $lsd_shiplist[$lsd_i][2] " "
			if ($lsd_shiplist[$lsd_i][2] = "")
				setvar $lsd_shiplist[$lsd_i][2] "999,999,999"
			end
			gettext currentansiline  $lsd_shiplist[$lsd_i][3] "[35m> " "    "
		end
	end
end
goto :linetrignext

:displaymenu
setvar $lsd_linewidthmax 45
setvar $lsd_pages_exist false
setvar $lsd_numberofship ""
setvar $lsd_i 1

:nextpageplease
echo #27 & "[2J"
echo "***"
if ($isdockshopper)
	echo ("     "&ansi_15&#196&#196&ansi_7&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_7&#196&ansi_15&#196&#196)
	echo ansi_14 & "*        LoneStar's StarDock Shopper"
	echo ansi_9 & "*         Mind ()ver Matter Edition"
	echo ansi_15 & "*          Emporium Daily Specials"
	echo ansi_8 & "*                Version " & $lsd_curent_version & "*"
	echo ("     "&ansi_15&#196&#196&ansi_7&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_8&#196&ansi_7&#196&ansi_15&#196&#196)
	echo "*"
end
setarray $lsd_menuselections $lsd_shiplistmax
while ($lsd_shiplist[$lsd_i] <> 0)
	if ($lsd_shiplist[$lsd_i] <> "+")
		setvar $lsd_spaces $lsd_linewidthmax
		setvar $lsd_ansi_line "  " & ansi_5 & "<" & ansi_6 & $lsd_shiplist[$lsd_i] & ansi_5 & "> "
		setvar $lsd_temp $lsd_shiplist[$lsd_i][2]
		striptext $lsd_temp ","
		striptext $lsd_temp "."
		striptext $lsd_temp " "
		getlength $lsd_shiplist[$lsd_i][1] $lsd_len
		if ($lsd_len > ($lsd_linewidthmax - 10))
			subtract $lsd_len 10
			cuttext $lsd_shiplist[$lsd_i][3] $lsd_temp 1 $lsd_len
		else
			setvar $lsd_temp $lsd_shiplist[$lsd_i][3]
		end
		setvar $lsd_ansi_line $lsd_ansi_line & $lsd_temp
		subtract $lsd_spaces $lsd_len
		getlength $lsd_shiplist[$lsd_i][2] $lsd_len
		subtract $lsd_spaces $lsd_len
		setvar $lsd_spacer ""
		while ($lsd_spaces > 0)
			setvar $lsd_spacer $lsd_spacer & " "
			subtract $lsd_spaces 1
		end
		setvar $lsd_ansi_line $lsd_ansi_line & $lsd_spacer & ansi_14 & $lsd_shiplist[$lsd_i][2] & "*"
		setvar $lsd_menuselections[$lsd_i] $lsd_shiplist[$lsd_i]
		echo $lsd_ansi_line
	else
		setvar $lsd_pages_exist true
		setvar $lsd_pageidx $lsd_i
		goto :pagedone
	end
	add $lsd_i 1
end

:pagedone
echo "   " #27 "[1m" ansi_4 #196 #196 #196 #196 #196 #196  #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196
echo "*"
if ($lsd_pages_exist)
	echo "  " & ansi_5 & "<" & ansi_6 & "+" & ansi_5 & ">" & ansi_6 & " NextPage*"
end
echo "  " & ansi_5 & "<" & ansi_6 & "Q" & ansi_5 & ">" & ansi_6 & " To Leave*"
echo "*"

:makinganotherslection
echo "  " & ansi_5 & "Which ship are you interested in? "
getconsoleinput $lsd_selection singlekey
uppercase $lsd_selection
if ($lsd_selection = "Q")
	return
elseif (($lsd_pages_exist) and ($lsd_selection = "+"))
	if ($lsd_i = $lsd_pageidx)
		setvar $lsd_pagetwoselected true
		add $lsd_i 1
	else
		setvar $lsd_pagetwoselected false
		setvar $lsd_i 1
	end
	goto :nextpageplease
else
	setvar $lsd_ptr 1
	while ($lsd_ptr <= $lsd_shiplistmax)
		if ($lsd_menuselections[$lsd_ptr] <> 0)
			if ($lsd_menuselections[$lsd_ptr] = $lsd_selection)
				setprecision 0
				setvar $lsd_numberofship ""

				:inputanotheramount
				getinput $lsd_numberofship "  " & ansi_5 & "How Many " & $lsd_shiplist[$lsd_ptr][1] & "'s ?"
				isnumber $lsd_test $lsd_numberofship
				if ($lsd_test = 0)
					goto :inputanotheramount
				end
				if (($lsd_numberofship < 0))
					setvar $lsd_numberofship 0
					setvar $lsd__trickster ""
					goto :inputanotheramount
				end
				if ($lsd_numberofship = 0)
					setvar $lsd__trickster ""
				else
					if ($lsd_pagetwoselected)
						setvar $lsd__trickster "+" & $lsd_selection & "^^" & $lsd_shiplist[$lsd_ptr][2] & "@@" & $lsd_shiplist[$lsd_ptr][3] & "!!"
					else
						setvar $lsd__trickster $lsd_selection & "^^" & $lsd_shiplist[$lsd_ptr][2] & "@@" & $lsd_shiplist[$lsd_ptr][3] & "!!"
					end
					getinput $lsd_customshipname "  " & ansi_5 & "What do you want to name this ship? (30 chars) "
					if ($lsd_customshipname = "")
						setvar $lsd_customshipname $lsd_ships_names
					else
						setvar $lsd_customshipnametest $lsd_customshipname
						striptext $lsd_customshipnametest " "
						if ($lsd_customshipnametest = "")
							setvar $lsd_customshipname $lsd_ships_names
						else
							getlength $lsd_customshipname $lsd_len
							if ($lsd_len > 30)
								cuttext $lsd_customshipname $lsd_customshipname 1 30
							end
						end
					end
				end
				return
			end
		end
		add $lsd_ptr 1
	end
end
echo "*"
echo #27 & "[1A" & #27 & "[2K"
goto :makinganotherslection
return

:doaddhistory
loadvar $bot~historystring
setvar $bot~history[1] $bot~user_command_line
setvar $bot~historystring $bot~history[1]&"<<|HS|>>"&$bot~historystring
savevar $bot~historystring
return
#============================================= END DOCK SHOPPER MENU  ==================================================

#INCLUDES:
include "source\include\game"
include "source\include\loadvars"
