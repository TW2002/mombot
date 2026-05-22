gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"tow [ship number | list]"
setvar $help~help[2]  $help~tab&"      "
setvar $help~help[3]  $help~tab&"  Tow ships and display tow list"
setvar $help~help[4]  $help~tab&"      "
setvar $help~help[5]  $help~tab&"    {ship number}  ship number to tow"
setvar $help~help[6]  $help~tab&"           {list}  list all tow ships in sector"
gosub :help~helpfile

if ($bot~parm1 = "list")
	goto :tow_list
end
# ============================== START TOW (TOW) ==============================
:tow
gosub :player~quikstats
setvar $bot~validprompts "Command"
gosub :player~checkstartingprompt
isnumber $test $bot~parm1
if ($test = false)
	setvar $switchboard~message "Ship to tow must be entered as a number*"
	gosub :switchboard~switchboard
	goto :wait_for_command
elseif ($bot~parm1 < 1)
	setvar $switchboard~message "Ship to tow must be entered as a number*"
	gosub :switchboard~switchboard
	goto :wait_for_command
else
	setvar $shiptotow $bot~parm1
end

:towcheck
killalltriggers
send "w"
settexttrigger towoffcontinue   :towcheck "You shut off your Tractor Beam."
settexttrigger towoff           :towcontinue "Do you wish to tow a manned ship? (Y/N)"
pause

:towcontinue
killalltriggers
send "*"
settexttrigger townogo          :townogo "You do not own any other ships in this sector!"
settexttrigger towready         :towoff "Choose which ship to tow (Q=Quit)"
pause

:towoff
killalltriggers
send $shiptotow & "*"
settexttrigger townogo2           :townogo2 "Command [TL="
settexttrigger tow_password   :tow_password "Enter the password for"
settextlinetrigger waitontow      :goodtow "You lock your Tractor Beam on "
pause

:tow_password
killalltriggers
send "*"
setvar $switchboard~message "That ship has a PassWord Set.*"
gosub :switchboard~switchboard
goto :wait_for_command

:townogo
killalltriggers
setvar $switchboard~message "There are no ships in the sector I can tow.*"
gosub :switchboard~switchboard
goto :wait_for_command

:townogo2
killalltriggers
setvar $switchboard~message "That ship number is not in the sector.*"
gosub :switchboard~switchboard
goto :wait_for_command

:goodtow
killalltriggers
setvar $switchboard~message "Tow locked onto ship number " & $shiptotow & "*"
gosub :switchboard~switchboard
goto :wait_for_command
# ============================== END TOW (TOW) ==============================
:wait_for_command
halt

:tow_list
:slist
setvar $scan_macro "w** * "
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
	add $idx 1
	setvar $scan_array[$idx] $current_line
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
