# ----------------------------------------------------------------------------
# Dnyarri's "Holo killa" ... Holoscans, goes adj and kills enemy before trying
# to retreat to safety. A bit dangerous, but hey... so is life.
# ----------------------------------------------------------------------------
gosub :help~initialize
setvar $help~help[1] $help~tab&"Holoscans and attacks adjacent enemy traders, then retreats."
setvar $help~help[2] $help~tab&"Run from Command with a holo scanner."
gosub :help~helpfile

reqrecording

:init
send "*  "
waitfor "(?="
getword currentline $location 1
if ($location <> "Command")
	clientmessage "This script must be run from the Command Prompt"
	halt
end

send " c ;q"
waitfor "Max Fighters:"
setvar $line currentline
replacetext $line ":" " "
getword $line $max_figs 7
striptext $max_figs ","
waitfor "Max Figs Per Attack:"
setvar $line currentline
replacetext $line ":" " "
getword $line $max_fig_wave 5
striptext $max_fig_wave ","
if ($max_fig_wave = $max_figs)
	setvar $max_fig_wave ($max_fig_wave - 100)
end
setvar $waves_to_send ($max_figs / $max_fig_wave)

:kill_check
killtrigger noscan1
killtrigger noscan2
killtrigger scanned
settextlinetrigger noscan1 :noscanner "Handle which mine type, 1 Armid or 2 Limpet"
settextlinetrigger noscan2 :noscanner "You don't have a long range scanner."
settextlinetrigger scanned :scandone  "Select (H)olo Scan or (D)ensity Scan or (Q)uit? [D] H"
send " sh*  "
pause

:noscanner
killtrigger noscan1
killtrigger noscan2
killtrigger scanned
clientmessage "You don't have a HoloScanner!"
send " *  "
halt
include "source\include\help"

:scandone
killtrigger noscan1
killtrigger noscan2
killtrigger scanned
waitfor "Warps to Sector(s) :"

:get_prompt
waitfor "Command [TL="
gettext currentline $current_sector "]:[" "] (?="
isnumber $result $current_sector
if ($result < 1)
	send " *  "
	goto :get_prompt
end
if ($current_sector < 1) or ($current_sector > sectors)
	send " *  "
	goto :get_prompt
end

setvar $killsector 0
setvar $idx 1
while ($idx <= sector.warpcount[$current_sector])
	setvar $test_sector sector.warps[$current_sector][$idx]
	if ($test_sector <> stardock) and ($test_sector > 10) and (sector.tradercount[$test_sector] > 0)
		setvar $killsector $test_sector
		goto :killem
	end
	add $idx 1
end

:killem
if ($killsector > 10) and ($killsector <> stardock)
	# Send SS alert
	send "'Dnyarri's HoloKilla - Attacking sector " & $test_sector & ".*"

	# Build the no string
	setvar $no_str ""
	setvar $no_cnt sector.shipcount[$killsector]
	setvar $no_idx 1
	while ($no_idx <= $no_cnt)
		setvar $no_str $no_str & "n"
	end

	# Clear any avoids.
	send " c v 0 * y n " & $test_sector & " * q "

	# Move there, drop a fig.
	send " m " & $test_sector & " *   z  a  99999  *  R  *  f  z  1  *  z  c  d  *   "

	# Kill em
	setvar $kill_idx 1
	while ($kill_idx <= $waves_to_send)
		send " a " & $no_cnt & " y n y q z " & $max_fig_wave & " * "
		add $kill_idx 1
	end

	# Try to retreat back
	send " DZ N  R  *  <  N  N  *  Z  A  99999  *  "

	# Kill again?
	goto :kill_check
else
	clientmessage "No targets found adj!"
	send " dz n  "
	halt
end
halt
