gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~safe_ship
setvar $help~help[1]  $help~tab&"xport [ship number | list] [password]"
setvar $help~help[2]  $help~tab&"      "
setvar $help~help[3]  $help~tab&"  xports into ship or display xport list "
setvar $help~help[4]  $help~tab&"      "
setvar $help~help[5]  $help~tab&"    {ship number}  ship number to tow"
setvar $help~help[6]  $help~tab&"           {list}  list all xport ships in range"
setvar $help~help[7]  $help~tab&"       {password}  if ship has password"
gosub :help~helpfile

if ($bot~parm1 = "list")
	goto :xlist
end
#============================== XPORT (XPORT) ==============================
:x
:xport
killalltriggers
gosub :player~quikstats

if (($player~unlimitedgame = false) and ($player~turns = 0))
	setvar $switchboard~message "I don't have any turns left!*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
setvar $bot~validprompts "Citadel Command Planet"
gosub :player~checkstartingprompt
setvar $player~startinglocation $player~current_prompt
isnumber $result $bot~parm1
isnumber $safeship_result $bot~safe_ship
if ($result < 1)
	setvar $switchboard~message "xport [ship number] [password]*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
if (($bot~parm1 < 1) and ($safeship_result >= 1))
	if ($bot~safe_ship > 0)
		setvar $bot~parm1 $bot~safe_ship
	else
		setvar $switchboard~message "Safeship parameter not defined correctly.*"
		gosub :switchboard~switchboard
		goto :wait_for_command
	end
end
if ($player~startinglocation = "Citadel")
	if ($planet~planet = 0)
		send " q "
		gosub :planet~getplanetinfo
		send " q "
	else
		send "qq   "
	end
elseif ($player~startinglocation = "Planet")
	if ($planet~planet = 0)
		gosub :planet~getplanetinfo
	end
	send " q "
else
	setvar $planet~planet 0
end
settextlinetrigger bad_ship_trig    :ship_not_available     "That is not an available ship."
settextlinetrigger bad_range_trg    :out_of_range           "only has a transport range of"
settextlinetrigger cannot_xport     :cannot_xport           "Access denied!"
setstrigger     xport_passw      :xport_password         "Enter the password for"
settextlinetrigger xport_good       :xport_good             "Security code accepted, engaging transporter control."
if ($bot~parm2 = "")
	send "x   " & $bot~parm1 & "*    "
else
	send "x  " & $bot~parm1 & "*"
end
pause

:ship_not_available
setvar $switchboard~message "That ship is not available.*"
goto :out_of_xport

:out_of_range
setvar $switchboard~message "That ship is out of range.*"
goto :out_of_xport

:xport_good
setvar $switchboard~message "Xport complete.*"
if ($command = "x")
	setvar $bot~safe_ship $player~ship_number
	savevar $bot~safe_ship
	echo "*" ansi_14 "[" ansi_15 "Safe ship auto-set to last ship: " $player~ship_number ansi_14 "]*" ansi_7
end
goto :out_of_xport

:xpass_bad
setvar $switchboard~message "Incorrect ship password!*"
waitfor "Choose which ship to beam to"
goto :out_of_xport

:cannot_xport
setvar $switchboard~message "Cannot xport to that ship!*"
goto :out_of_xport

:xport_password
killalltriggers
settextlinetrigger xport_ok  :xport_good "Security code accepted, engaging transporter control."
settextlinetrigger xpass_bad :xpass_bad "SECURITY BREACH! Invalid Password, unable to link transporters."
send $bot~parm2 & "*   "
pause

:out_of_xport
killalltriggers
send "    *    "
if ((($player~startinglocation = "Citadel") or ($player~startinglocation = "Planet")) and $planet~planet <> 0)
	gosub :planet~landingsub
end
echo "**"
gosub :switchboard~switchboard
goto :wait_for_command
#============================== END XPORT (XPORT) SUB ==============================
:wait_for_command
halt

:xlist
setvar $scan_macro "x** * "
gosub :player~quikstats
setarray $scan_array 1000
setvar $player~startinglocation $player~current_prompt
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
if ($player~startinglocation = "Citadel")
	send " q "
	gosub :planet~getplanetinfo
	send " q "
end
setvar $idx 0
send $scan_macro
settextlinetrigger no_range  :no_range " can only beam intrasector."
settextlinetrigger range :range " has a transport range of "
pause

:no_range
killtrigger range
setvar $ship_range 0
goto :done_range

:range
killtrigger no_range
gettext currentline $ship_range " has a transport range of " "hops."

:done_range
add $idx 1
setvar $scan_array[$idx] currentline

waiton "Ship  Sect Name                  Fighters Shields Hops Type"
waiton "--------------------------------------------------------------------------"

settexttrigger end_of_line4 :end_of_lines "<I> Ship details"
add $idx 1
setvar $scan_array[$idx] "                 --<  Available Ship Scan  >--"
add $idx 1
setvar $scan_array[$idx] "Ship  Sect Name                  Fighters Shields Hops Type"
add $idx 1
setvar $scan_array[$idx] "-----------------------------------------------------------------"

settextlinetrigger line_trig :parse_scan_line
pause

:parse_scan_line
setvar $current_line currentline
if ($idx >= 1000)
	goto :end_of_lines
end
getwordpos $current_line $em_end "(?=Help)? :"
if ($em_end > 0)
	goto :end_of_lines
end
getwordpos $current_line $em_end "<I> Ship details"
if ($em_end > 0)
	goto :end_of_lines
end
getlength $current_line $length
if ($length > 70)
	cuttext $current_line $current_line 1 70
end
if ($current_line <> "")
	cuttext $current_line $range 52 3
	trim $range
	if ($range <= $ship_range)
		add $idx 1
		setvar $scan_array[$idx] $current_line
	end
end
settextlinetrigger line_trig :parse_scan_line
pause

:end_of_lines
killalltriggers
if ($player~startinglocation = "Citadel")
	send " l " & $planet~planet & "* c s* "
end
gosub :spititout
halt

:spititout
setvar $switchboard~message ""
setvar $i 1
while ($i <= $idx)
	if ($scan_array[$i] <> "0")
		setvar $switchboard~message $switchboard~message & $scan_array[$i] & "*"
	end
	add $i 1
end
gosub :switchboard~switchboard

:continuecommpscan2
return

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
