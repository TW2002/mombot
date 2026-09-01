gosub :help~initialize
setvar $help~help[1] $help~tab&"Scrubs limpets from empty ships at Stardock and reports results."
gosub :help~helpfile

gosub :player~quikstats
setvar $max 100
setarray $ships $max
loadvar $bot_name
loadvar $unlimitedgame
setvar $my_ship $player~ship_number
setvar $my_cred $player~credits

if ($player~current_prompt = "<StarDock>")
	setvar $idx 0
	send "ss"
	waiton "-----------------------------------------------------"
	settextlinetrigger noship :noship "You do not own any other ships orbiting the Stardock!"
	setstrigger done :done "Choose which ship to sell (Q=Quit)"
	settextlinetrigger line :line
	pause

	:noship
	killalltriggers
	setvar $switchboard~message "No Empty Ships Found. Nothing To Scrub!*"
	gosub :switchboard~switchboard
	halt

	:line
	setvar $temp currentline
	getword $temp $i 1
	isnumber $tst $i
	if ($tst)
		if ($i <> 0)
			if ($idx <= $max)
				add $idx 1
				cuttext $temp $temp 56 23
				setvar $ships[$idx] $i&" "&$temp
			end
		end
	end
	settextlinetrigger line :line
	pause

	:done
	killalltriggers
	send "qq"
	waiton "You leave the shipyards."
else
	setvar $switchboard~message "Must Start From StarDock Prompt!*"
	gosub :switchboard~switchboard
	halt
end
if ($idx <> 0)
	setvar $req (($idx * 2) + 2)
	if (($unlimitedgame = 0) and ($player~turns < $req))
		setvar $switchboard~message "Not Enough Turns to Scrub ("&$req&" Turns Required)*"
		gosub :switchboard~switchboard
		halt
	end
	setvar $str ""
	setvar $scrubbed 0
	setvar $failure 0
	setvar $i 1
	while ($i <= $idx)
		setvar $topoor false
		getword $ships[$i] $ship 1
		send "Q  X    "&$ship&"*   * P S G YG Q "
		settextlinetrigger limp_not :limp_not "The port official frowns at you"
		settextlinetrigger limp_yep :limp_yep "After an intensive scanning search"
		settextlinetrigger limp_don :limp_don "You leave the Galactic Bank."
		pause

		:limp_not
		setvar $topoor true
		add $failure 1
		pause

		:limp_yep
		setvar $topoor false
		add $scrubbed 1
		pause

		:limp_don
		killalltriggers
		if ($topoor)
			setvar $temp $ships[$i]
			striptext $temp $ship&" "
			setvar $str $str&"                        "&$ship&" "&$temp&"*"
		end
		add $i 1
	end
	send "Q  X    "&$my_ship&"*    * P S G YG Q"
	waiton "You leave the Galactic Bank."
	gosub :player~quikstats
	send "'*"
	waiton "Type sub-space message"
	send "{"&$bot_name&"} - Scrub-A-Dub-Dub*"
	send "          Ships Found : "&$idx&"*"
	send "             Scrubbed : "&$scrubbed&"*"
	if ($scrubbed <> 0)
		setvar $cashamount ($my_cred - $player~credits)
		gosub :commasize
		send "                Spent : $"&$cashamount&"*"
	end
	send "               Failed : "&$failure&"*"
	if ($failure <> 0)
		send $str
	end
	send "*"
	waiton "Sub-space comm-link terminated"
end

halt
include "source\include\player"

:commasize
if ($cashamount < 1000)

elseif ($cashamount < 1000000)
	getlength $cashamount $len
	setvar $len ($len - 3)
	cuttext $cashamount $tmp 1 $len
	cuttext $cashamount $tmp1 ($len + 1) 999
	setvar $tmp $tmp&","&$tmp1
	setvar $cashamount $tmp
elseif ($cashamount <= 999999999)
	getlength $cashamount $len
	setvar $len ($len - 6)
	cuttext $cashamount $tmp 1 $len
	setvar $tmp $tmp&","
	cuttext $cashamount $tmp1 ($len + 1) 3
	setvar $tmp $tmp&$tmp1&","
	cuttext $cashamount $tmp1 ($len + 4) 999
	setvar $tmp $tmp&$tmp1
	setvar $cashamount $tmp
end
return
include "source\include\switchboard.ts"
include "source\include\help"
