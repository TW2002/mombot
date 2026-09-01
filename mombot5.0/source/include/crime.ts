#
# Crime functions for sst, sdt, and rob
#

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:steal
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if (($isbusted1 <> true) and ($isbusted2 <> true))
		setvar $maxsteal (($player~experience / $game~steal_factor) - 1)
		setvar $send ""
		if ($inship1)
			if ($ship1totalholds < $maxsteal)
				setvar $steal $ship1totalholds
			else
				setvar $steal $maxsteal
			end
			if (($seededmaxedport[$ship1sector] = true) and (($ship1equipment > 0) and ($ship1equipment < $steal)))
				setvar $steal $ship1equipment
			end

			if ($ship1equipment > 0)
				setvar $send $send&"p t * * 0* 0* "
				add $equipatport[$ship1sector] $ship1equipment
				setvar $ship1equipment 0
			end

			while ($equipatport[$ship1sector] < ($steal + 20))
				if ($seededmaxedport[$ship1sector] = true)
					goto :doneupgradeship1
				end
				setvar $upgrade ($steal - $equipatport[$ship1sector])
				divide $upgrade 10
				add $upgrade 4
				setvar $send $send&"o 3"&$upgrade&"* * "
				add $equipatport[$ship1sector] ($upgrade * 10)
			end

:doneupgradeship1
setvar $send $send&"p r* s   z3  "&$steal&"*  x    "
setvar $ship1equipment $steal
setvar $stealship $psst_ship2
setvar $inship1 false
setvar $laststeal $ship1sector
		else
				if ($ship2totalholds < $maxsteal)
					setvar $steal $ship2totalholds
				else
				setvar $steal $maxsteal
			end
			if (($seededmaxedport[$ship2sector] = true) and (($ship2equipment > 0) and ($ship2equipment < $steal)))
				setvar $steal $ship2equipment
			end

			if ($ship2equipment > 0)

				setvar $send $send&"p t * * 0* 0* "
				add $equipatport[$ship2sector] $ship2equipment
				setvar $ship2equipment 0
			end

			while ($equipatport[$ship2sector] < ($steal + 20))
				if ($seededmaxedport[$ship2sector] = true)
					goto :doneupgradeship2
				end
				setvar $upgrade ($steal - $equipatport[$ship2sector])
				divide $upgrade 10
				add $upgrade 4
				setvar $send $send&"o 3"&$upgrade&"* * "
				add $equipatport[$ship2sector] ($upgrade * 10)
			end
:doneupgradeship2
setvar $send $send&"p r* s   z3  "&$steal&"*  x    "
setvar $ship2equipment $steal
setvar $stealship $psst_ship1
setvar $inship1 true
setvar $laststeal $ship2sector
			end
		end

		setvar $stake (($steal - 1) / 11)

settextlinetrigger success :success "Success!"
settextlinetrigger busted :busted "Suddenly you're Busted!"
settextlinetrigger portmaxxed :badstealport "There aren't that many holds of Equipment at this port!"
settextlinetrigger fakebust :badstealport "Do you want instructions (Y/N) [N]?"
send $send&$stealship&"*  * "
pause

:badstealport
killalltriggers
setvar $invalidsstport[$laststeal] true
setvar $busted 1
if ($inship1)
	setvar $ship2equipment 0
else
	setvar $ship1equipment 0
end
gosub :transport
if ($inship1)
	setvar $ship1needsport true
else
	setvar $ship2needsport true
end
return

	:success
	add $player~experience $stake
	if ($inship1)
		setvar $ship2equipment $steal
	else
		setvar $ship1equipment $steal
	end
killalltriggers
return

:busted
if ($inship1)
	subtract $ship2totalholds $stake
	setvar $lastbustsector $ship2sector
	setvar $ship2equipment 0
else
	subtract $ship1totalholds $stake
	setvar $lastbustsector $ship1sector
	setvar $ship1equipment 0
end
add $numberbusted 1
setvar $busted 1
gosub :transport
if ($inship1)
	setvar $ship1needsport true
else
	setvar $ship2needsport true
end
send "'<"&$subspace&">[Busted:"&$lastbustsector&"]<"&$subspace&">* c"
setsectorparameter $lastbustsector "BUSTED" true
savevar $lastbustsector
waiton "<Computer activated>"
send "tq"
settextlinetrigger am :getbuststamp " AM "
settextlinetrigger pm :getbuststamp " PM "
pause

:getbuststamp
killalltriggers
if ($inship1)
	if (($bust_file <> "") and ($bust_file <> 0))
		write $bust_file $ship1sector&"  "&currentline
	end
else
	if (($bust_file <> "") and ($bust_file <> 0))
		write $bust_file $ship2sector&"  "&currentline
	end
end
waiton "<Computer deactivated>"
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:rob
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
killalltriggers
gosub :player~quikstats
setvar $startinglocation $player~current_prompt

cuttext $player~alignment $neg_ck 1 1

striptext $player~alignment "-"
if (($player~alignment < 100) and ($neg_ck = "-"))
	setvar $switchboard~message "Need -100 Alignment Minimum*"
	gosub :switchboard~switchboard
	halt
elseif ($neg_ck <> "-")
	setvar $switchboard~message "Need -100 Alignment Minimum*"
	gosub :switchboard~switchboard
	halt
end
send "q q pr * r"
settextlinetrigger valid :rob_continue "<R> Rob this Port"
settextlinetrigger notvalid :rob_not_valid "<Q> Quit, nevermind"
pause

:rob_continue
killtrigger notvalid
settextlinetrigger fake :rob_fake "Busted!"
settextlinetrigger mega :rob_ok "port has in excess of"
pause

:rob_fake
killalltriggers
if ($startinglocation = "Citadel")
	gosub :landingsub
end
setsectorparameter $player~current_sector "BUSTED" true
setvar $switchboard~message "Fake Busted*"
gosub :switchboard~switchboard
return

:rob_ok
killalltriggers

setvar $rob ($game~rob_factor * $player~experience)
getword currentline $port_cash 11
striptext $port_cash ","
setvar $original_port_cash $port_cash
multiply $port_cash 10
divide $port_cash 9

if ($port_cash < $minimumport)
	echo "*Port has less than "&$minimumport&" credits on it.*"
	send "0*"
	setvar $rob 0
elseif ($port_cash >= $rob)
	send $rob "*"
elseif ($port_cash < $rob)
	setvar $rob $port_cash
	send $rob "*"
end
if ($port_cash < $minimumport)
	setvar $checkedports[$player~current_sector] true
	setvar $empty_grid[$player~current_sector] true
	write $no_credits_file $player~current_sector
end
settextlinetrigger port_empty :rob_suc "Maybe some other day, eh?"
settextlinetrigger mega_suc :rob_suc "Success!"
settextlinetrigger mega_bust :rob_bust "Busted!"
pause

:rob_bust
killalltriggers
if ($startinglocation = "Citadel")
	gosub :landingsub
end
setsectorparameter $player~current_sector "BUSTED" true
send "'<"&$subspace&">[Busted:"&$player~current_sector&"]<"&$subspace&">* "
return

:rob_ready_to_mega
killalltriggers
send "0*  "
if ($startinglocation = "Citadel")
	gosub :landingsub
end
return

:rob_not_valid
killalltriggers
setvar $checkedports[$player~current_sector] true
setvar $empty_grid[$player~current_sector] true
write $no_credits_file $player~current_sector
setvar $rob 0
setvar $original_port_cash 0

:rob_suc
killalltriggers
if ($startinglocation = "Citadel")
	send "l " $planet "* c t t " $rob "* "
end
if ($rob > $original_port_cash)
	setvar $checkedports[$player~current_sector] true
	setvar $empty_grid[$player~current_sector] true
	write $no_credits_file $player~current_sector
end
if ($rob > 0)
	setvar $laststeal $player~current_sector
	setvar $switchboard~message "Success! - " $rob " credits robbed*"
	gosub :switchboard~switchboard
end
return
