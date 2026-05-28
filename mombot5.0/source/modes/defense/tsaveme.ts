gosub :help~initialize
setvar $help~help[1] $help~tab&"Responds to =saveme calls by twarping/bwarping to help."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  tsaveme {scrub sector}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   {scrub sector} - optional sector to return/scrub after the save."
setvar $help~help[6] $help~tab&"   Run from Command for TWarp saves or Citadel for BWarp saves."
gosub :help~helpfile

loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $bot_name

:start
gosub :player~quikstats
setvar $location $player~current_prompt
if (($location <> "Command") and ($location <> "Citadel"))
	setvar $switchboard~message "T-warp Saveme must be run from the Command or Citadel Prompt*"
	gosub :switchboard~switchboard
	halt
end

:type
if ($location = "Command")
	setvar $type "TWarp"
	setvar $sector $player~current_sector
elseif ($location = "Citadel")
	setvar $type "BWarp"
	send "qd"
	waitfor "Planet #"
	getword currentline $planet 2
	striptext $planet "#"
	send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
	setvar $sector $player~current_sector
end

setvar $tsaveme_scrub $parm1

isnumber $number $tsaveme_scrub
if (($number < 1) or ($tsaveme_scrub = "") or ($tsaveme_scrub = 0))
	setvar $scrub $sector
else
	setvar $scrub $tsaveme_scrub
end

setvar $switchboard~message "" $type " Saveme Active - Awaiting Distress Call. Returns to: "&$scrub&"*"
gosub :switchboard~switchboard

:main
settextlinetrigger trigger :trigger "=saveme"
pause

:trigger
cuttext currentline $spoof 1 1
if ($spoof <> "R")
	goto :main
end
gettext currentline $line "R" "=saveme"
cuttext $line $corpy 2 6
striptext $line $corpy
striptext $line "R"
striptext $line "=saveme"
striptext $line " "
setvar $savesec $line
setvar $pos1 5

:pos_loop
cuttext $corpy $blank_ck $pos1 1
if ($blank_ck = " ")
	cuttext $corpy $corpy 1 $pos1
	subtract $pos1 1
	setvar $check2 1
	goto :pos_loop
end
if ($check2 = 1)
	cuttext $corpy $corpy 1 $pos1
end

:cut_zero
striptext $savesec " "
cuttext $savesec $zero_ck 1 1
if ($zero_ck = 0)
	cuttext $savesec $savesec 2 5
	goto :cut_zero
end

:save_em
if ($type = "TWarp")
	setvar $twarp_sector $savesec
	setvar $go 1
	goto :twarp
elseif ($type = "BWarp")
	setvar $bwarp_sector $savesec
	setvar $go 1
	goto :bwarp
end

:go1
send "f"
settextlinetrigger total_figs :total_figs "fighters available."
settextlinetrigger sec_figs :sec_figs "Your ship can support up to"
pause

:total_figs
getword currentline $total_figs 3
striptext $total_figs ","
pause

:sec_figs
getword currentline $sec_figs 10
striptext $sec_figs ","
if ($total_figs <= 50000)
	send $total_figs "*cdzn"
else
	send "50000*cd*"
end
send "tfyf"
settextlinetrigger corpy_figs :corpy_figs "fighters, and"
pause

:corpy_figs
setvar $current_line currentline

setvar $key_idx 1
while ($key_idx <= 20)
	getword $current_line $wordy $key_idx
	if ($wordy = "has")
		setvar $ftr_word ($key_idx + 1)
		goto :got_word_num
	end
	add $key_idx 1
end

:got_word_num
getword $current_line $corpy_figs $ftr_word
striptext $corpy_figs "."
striptext $corpy_figs ","

send $corpy_figs "*qzn"
send "wy" $corpy "*y*zn"
send "tfyt" $corpy_figs "*qzn"
send "f"
if ($sec_figs > 1)
	send $sec_figs
else
	send 1
end
send "*c d z n "

:go_scrub
setvar $twarp_sector $scrub
setvar $go 2
goto :twarp

:twarp
send "m" $twarp_sector "*y"
waitfor "To which Sector"
settextlinetrigger twarp_lock :twarp_lock "TransWarp Locked"
settextlinetrigger no_twrp_lock :no_twarp_lock "No locating beam found"
settextlinetrigger twarp_adj :twarp_adj "<Set NavPoint>"
settextlinetrigger no_ore :no_ore "You do not have enough Fuel Ore"
pause

:no_ore
send "'OZ " $type " Saveme - No ore!!*"
halt

:twarp_adj
send "**"
killalltriggers
if ($go = 1)
	goto :go1
elseif ($go = 2)
	goto :go2
end

:twarp_lock
killalltriggers
send "y*"
waitfor "Warps to Sector(s)"
if ($go = 1)
	goto :go1
elseif ($go = 2)
	goto :go2
end

:no_twarp_lock
killalltriggers
send "n*"
send "'OZ " $type " Saveme - Can't Get Lock! - Fig and Call Save!*"
goto :main

:bwarp
send "b" $bwarp_sector "*"
settextlinetrigger beam_lock :beam_lock "TransWarp Locked"
settextlinetrigger no_beam_lock :no_beam_lock "No locating beam found"
pause

:beam_lock
killalltriggers
send "y*"
waitfor "Warps to Sector(s)"
if ($go = 1)
	goto :go1
elseif ($go = 2)
	goto :go2
end

:no_beam_lock
killalltriggers
send "n*"
setvar $switchboard~message "" $type " Saveme - Can't Get Lock! - Fig and Call Save!*"
gosub :switchboard~switchboard
goto :main

:go2
send " w * * z q n z q n "
gosub :player~quikstats
if ($type = "BWarp")
	settextlinetrigger not_at_home :exit_completely "That planet is not in this sector."
	send " l "&$planet&"*"
	waitfor "Landing sequence engaged..."
	send " t n l 1* t n l 2* t n l 3* s n l 1* s n l 2* s n l 3* t n t 1* c s* "
	if ($player~current_sector = $sector)
		setvar $switchboard~message "" $type " Saveme - Arrived at Return Sector. Ready for another save.*"
		gosub :switchboard~switchboard
	end
	goto :main
else
	if ($tsaveme_scrub = $player~current_sector)
		setvar $switchboard~message "" $type " Saveme - Arrived at Scrub Sector.*"
		gosub :switchboard~switchboard
		setvar $switchboard~message "" $type " Saveme - Please Exit/Enter to Remove Limpet.*"
		gosub :switchboard~switchboard
	end
	setvar $switchboard~message "" $type " Saveme - Powering Down...*"
	gosub :switchboard~switchboard
	send "**"
	halt
end
halt

:exit_completely
setvar $switchboard~message "" $type " Saveme - Arrived at Scrub Sector.*"
gosub :switchboard~switchboard
setvar $switchboard~message "" $type " Saveme - Please Exit/Enter to Remove Limpet.*"
gosub :switchboard~switchboard
setvar $switchboard~message "Saveme - Powering Down...*"
gosub :switchboard~switchboard
send "**"
halt
include "source\include\player"
include "source\include\switchboard.ts"
include "source\include\help"
