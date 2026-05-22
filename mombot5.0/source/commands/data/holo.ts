gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"holo "
setvar $help~help[2]  $help~tab&"  Sends holoscan output to subspace"
gosub :help~helpfile

#=============================== SS SCANNING =============================================
:holo
setvar $scan_macro " sh"
goto :start_scan

:start_scan
gosub :player~getinfo
if ($player~unlimitedgame <> true)
	if (($scan_macro = " sh") and (($player~turns <= $bot_turn_limit) or ($player~turns = 0)))
		goto :no_turns_available1
	end
end
if (($scan_macro = " sh") and (($player~scan_type = "None") or ($player~scan_type = "Density")))
	goto :no_scanner_available1
end
gosub  :player~currentprompt
setarray $scan_array 1000
setvar $bot~startinglocation $player~current_prompt
if ($scan_macro = "") or ($scan_macro = 0)
	setvar $scan_macro " sd* "
end
setvar $bot~validprompts "Citadel Command"
gosub :player~checkstartingprompt
if ($player~startinglocation = "Citadel")
	if ($scan_macro = "d")
		setvar $scan_macro "s"
	else
		send " q "
		gosub :planet~getplanetinfo
		send " q "
	end
end
setvar $idx 0
settextlinetrigger noscanner_1 :no_scanner_available1 "You don't have a long range scanner."
send $scan_macro
if ($scan_macro = "d")
	waiton "<Re-Display>"
elseif ($scan_macro = "s")
	waiton "<Scan Sector>"
elseif ($scan_macro = " sd")
	settextlinetrigger noscanner_2 :no_scanner_available2 "Relative Density Scan"
	waiton "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] D"
	killtrigger noscanner_1
	killtrigger noscanner_2
elseif ($scan_macro = "x** * ")
	waiton "Ship  Sect Name                  Fighters Shields Hops Type"
	waiton "--------------------------------------------------------------------------"
else
	waiton "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
end
if ($scan_macro = "s")
	settexttrigger end_of_line2 :end_of_lines "Citadel command (?=help)"
	settexttrigger end_of_line3 :end_of_lines "Mined Sector: Do you wish to Avoid this sector in the future? (Y/N)"
elseif ($scan_macro = "x** * ")
	settexttrigger end_of_line4 :end_of_lines "<I> Ship details"
	add $idx 1
	setvar $scan_array[$idx] "                 --<  Available Ship Scan  >--"
	add $idx 1
	setvar $scan_array[$idx] "Ship  Sect Name                  Fighters Shields Hops Type"
	add $idx 1
	setvar $scan_array[$idx] "----------------------------------------------------------------------"
else
	settexttrigger end_of_line1 :end_of_lines "Command [TL="
end

settextlinetrigger line_trig :parse_scan_line
pause

:parse_scan_line
setvar $current_line currentline
if ($idx >= 1000)
	goto :end_of_lines
end
if ($scan_macro = "s") or ($scan_macro = "d")
	if ($idx = 0)
		setvar $current_line "-=-=-=-=-=-=-=-=-=-=-=-=-=| Display |=-=-=-=-=-=-=-=-=-=-=-=-=-"
	end
	getwordpos $current_line $pos1 "Citadel treasury contains"
	getwordpos $current_line $pos2 "(?=Help)? :"
	getwordpos $current_line $pos3 "<Re-Display>"
	if ($pos1 < 1) and ($pos2 < 1) and ($pos3 < 1)
		if ($current_line = "") or ($current_line = 0)
		elseif ($idx >= 5000)
		else
			add $idx 1
			replacetext $current_line "Warps to Sector(s) :  " "Warps To: "
			replacetext $current_line "Warps to Sector(s) : " "Warps To: "
			setvar $scan_array[$idx] $current_line
		end
	end
elseif ($scan_macro = "x** * ")
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
else
	getwordpos $current_line $em_end "(?=Help)? :"
	if ($em_end > 0)
		goto :end_of_lines
	end
	getwordpos $current_line $pos "One turn deducted,"
	if ($pos > 0)
		setvar $current_line "-=-=-=-=-=-=-=-=-=-=-=-=-| Holo Scan |-=-=-=-=-=-=-=-=-=-=-=-=-"
	end
	getwordpos $current_line $pos "Relative Density Scan"
	if ($pos > 0)
		setvar $current_line "-=-=-=-=-=-=-=-=-=-| Relative Density Scan |-=-=-=-=-=-=-=-=-=-"
	end
	if ($current_line = "") or ($current_line = 0)
		goto :bogus
	end
	getwordpos $current_line $pos "Sector  :"
	if ($pos > 0)
		add $idx 1
		setvar $scan_array[$idx] "    "
	end
	getwordpos $current_line $pos1 "-------"
	getwordpos $current_line $pos2 "Long Range Scan"
	getwordpos $current_line $pos3 "Select (H)olo Scan or (D)ensity Scan or (Q)uit?"
	getwordpos $current_line $pos4 "<Mine Control>"
	getwordpos $current_line $pos5 "(?=Help)? :"
	if ($pos1 < 1) and ($pos2 < 1) and ($pos3 < 1) and ($pos4 < 1) and ($pos5 < 1)
		replacetext $current_line "Warps to Sector(s) :  " "Warps To: "
		replacetext $current_line "Warps to Sector(s) : " "Warps To: "
		replacetext $current_line " ==>    " " => "
		replacetext $current_line "  Warps : " "  Warps: "
		replacetext $current_line "   NavHaz :   " " Haz: "
		replacetext $current_line "  Anom : " " Anom: "
		add $idx 1
		setvar $scan_array[$idx] $current_line
	end

	:bogus
end
settextlinetrigger line_trig :parse_scan_line
pause

:end_of_lines
killalltriggers
if ($player~startinglocation = "Citadel")
	if ($scan_macro = "d") or ($scan_macro = "s")
		send "* "
	else
		send " l " & $planet~planet & "* c s* "
	end
end
gosub :spititout
halt

:no_turns_available1
setvar $switchboard~message "No turns available.**"
gosub :switchboard~switchboard
halt

:no_scanner_available1
setvar $switchboard~message "No scanner available.**"
gosub :switchboard~switchboard
halt

:no_scanner_available2
setvar $current_line "-=-=-=-=-=-=-=-=-=-| Relative Density Scan |-=-=-=-=-=-=-=-=-=-"
add $idx 1
setvar $scan_array[$idx] $current_line
settextlinetrigger line_trig :parse_scan_line
pause

:handle_mines
send "*"
goto :end_of_lines

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
#================================ END SS SCANNER =======================================

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
