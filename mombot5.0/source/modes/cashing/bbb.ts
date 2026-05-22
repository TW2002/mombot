gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]  $help~tab&"       Buys minimum Ore/Org/Equip and dumps to planet "
setvar $help~help[2]  $help~tab&"       of jets to gain experience from a SSS Port.  "
setvar $help~help[3]  $help~tab&"       "
setvar $help~help[4]  $help~tab&" bbb [expstop] {upport}"
setvar $help~help[5]  $help~tab&"       "
setvar $help~help[6]  $help~tab&" Options:"
setvar $help~help[7]  $help~tab&"    [expstop]     STOP when you get to this exp."
setvar $help~help[8]  $help~tab&"	   {upport}      When port empties upgrades the minimum "
setvar $help~help[9]  $help~tab&"                  to continue  "
setvar $help~help[9]  $help~tab&"     "
setvar $help~help[9]  $help~tab&"    Script uses internal Haggle. "
setvar $help~help[10] $help~tab&"    Start from planet to dump to planet. Start in sector"
setvar $help~help[10] $help~tab&"    and it will jettison."
gosub :help~helpfile

setvar $switchboard~message "Buy Buy Buy starting up!*"
gosub :switchboard~switchboard

setvar $useplanet true

gosub :player~quikstats

setvar $startexp $player~experience
setvar $startturns $player~turns

setvar $startinglocation $player~current_prompt
if ($startinglocation = "Command")
	setvar $useplanet false
elseif ($startinglocation = "Planet")
	setvar $useplanet true
else
	setvar $switchboard~message "Start at command or planet prompt.*"
	gosub :switchboard~switchboard
	halt
end

setvar $halt_exp $bot~parm1
isnumber $number $halt_exp

if ($number <> 1)
	setvar $switchboard~message "Please select what experience to halt at.*"
	gosub :switchboard~switchboard
	halt

end

if ($halt_exp <= 0)
	setvar $switchboard~message "Halt experience must be greater than 0.*"
	gosub :switchboard~switchboard
	halt
end

setvar $oreholds 12
setvar $org_holds 6
setvar $equip_holds 3
setvar $rebuy 0

getwordpos $bot~user_command_line $pos "upport"
if ($pos > 0)
	setvar $rebuy 1
	setvar $switchboard~message "Upgrading port if it runs low on any product.*"
	gosub :switchboard~switchboard

else
	setvar $rebuy 0
end

if ($useplanet = true)
	send "snl1*snl2*snl3*tnl1*tnl2*tnl3*"
else
	send "J    y    *"
end

if ($useplanet = true)
	send "d"
	waitfor "Planet #"
	getword currentline $pnum 2
	striptext $pnum "#"
	send "q"
end

gosub :sector~voidadjacent

setvar $i 1

# just put this in because it should probably stop eventually, particularly when I program in a infinite loop... 10 times in a row... painful
setvar $trips 1000
setvar $notifyi 0
setvar $notifyi1st 1
while ($y < $trips)

	setvar $cred1 $player~credits

	send "p t"
	waitfor "Items     Status  Trading"

	:portwaitagain
	settextlinetrigger ore1 :ore1 "Fuel Ore"
	settextlinetrigger org1 :org1 "Organics"
	settextlinetrigger equ1 :equ1 "Equipment"
	pause

	:ore1
	killalltriggers
	getword currentline $oreleft 5
	goto :portwaitagain

	:org1
	killalltriggers
	getword currentline $orgleft 4
	goto :portwaitagain

	:equ1
	killalltriggers
	getword currentline $equipleft 4

	striptext $oreleft "%"
	striptext $orgleft "%"
	striptext $equipleft "%"

	if ($oreleft <= 2)
		setvar $restockore 1
	end
	if ($orgleft <= 2)
		setvar $restockorg 1
	end
	if ($equipleft <= 2)
		setvar $restockequ 1
	end

	setvar $quant 0
	gosub :weareselling

	send $oreholds "*"

	if (haggle = false)
		gosub :haggle~starthaggle
		setvar $cred2 $player~ncredits
	else
		killalltriggers
		settextlinetrigger oredone :oredone "credits and"
		pause

		:oredone
		getword currentline $cred2 3
		striptext $cred2 ","
		isnumber $isnum $cred2
		if ($isnum <> 1)
			setvar $cred2 $cred1
		end
	end

	send $org_holds "*"

	if (haggle = false)
		gosub :haggle~starthaggle
		setvar $cred3 $player~ncredits
	else
		killalltriggers
		settextlinetrigger orgdone :orgdone "credits and"
		pause

		:orgdone
		getword currentline $cred3 3
		striptext $cred3 ","
		isnumber $isnum $cred3
		if ($isnum <> 1)
			setvar $cred3 $cred2
		end
	end

	send $equip_holds "*"

	if (haggle = false)
		gosub :haggle~starthaggle
		setvar $cred4 $player~ncredits
	else
		killalltriggers
		settextlinetrigger equdone :equdone "credits and"
		pause

		:equdone
		getword currentline $cred4 3
		striptext $cred4 ","
		isnumber $isnum $cred4
		if ($isnum <> 1)
			setvar $cred4 $cred3
		end
	end

	gosub :checksizing
	gosub :player~quikstats

	setvar $totalholds ($oreholds + $org_holds + $equip_holds)
	setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))

	if ($empty_holds < $totalholds)

		if ($useplanet = true)
			send "l" $pnum "*tnl1*tnl2*tnl3*q"
		else
			send "j  y  *  "
		end
	end

	add $notifyi 1
	if (($notifyi1st > 0) and ($notifyi = 5))
		add $notifyi1st 1
		gosub :calcstats
		setvar $notifyi 0
		if ($notifyi1st = 4)
			setvar $notifyi1st 0
		end
	end
	if ($notifyi > 30)
		gosub :calcstats
		setvar $notifyi 0
	end
	if ($player~credits < 5000)
		setvar $switchboard~message "Low on cash, Halting...*"
		gosub :switchboard~switchboard
		gosub :sector~clearvoidadjacent
		halt
	end
	if ($player~turns < 50)
		setvar $switchboard~message "Turns low.. keeping a few up our sleeve.. halting*"
		gosub :switchboard~switchboard
		gosub :sector~clearvoidadjacent
		halt
	end
	if ($player~experience > $halt_exp)
		setvar $switchboard~message "Experience target met.. halting*"
		gosub :switchboard~switchboard
		gosub :sector~clearvoidadjacent
		halt
	end

	if ($rebuy = 0)
		if ($restockore = 1)
			setvar $switchboard~message "Low on available fuel ore, Halting...*"
			gosub :switchboard~switchboard
			gosub :sector~clearvoidadjacent
			halt
		end

		if ($restockorg = 1)
			setvar $switchboard~message "Low on available Organics, Halting...*"
			gosub :switchboard~switchboard
			gosub :sector~clearvoidadjacent
			halt
		end

		if ($restockequ = 1)
			setvar $switchboard~message "Low on available Equipment, Halting...*"
			gosub :switchboard~switchboard
			gosub :sector~clearvoidadjacent
			halt
		end
	else
		if ($restockore = 1)
			setvar $restockore 0
			getsectorparameter $player~current_sector "FUELL" $lowproductivity
			getsectorparameter $player~current_sector "FUELH" $highproductivity
			setvar $a ($highproductivity/100)
			send "o   1" $a "*  q  "
			add $lowproductivity $a
			add $highproductivity $a
			setsectorparameter $player~current_sector "FUELL" $lowproductivity
			setsectorparameter $player~current_sector "FUELH" $highproductivity

		end
		if ($restockorg = 1)
			setvar $restockorg 0
			getsectorparameter $player~current_sector "ORGANICSL" $lowproductivity
			getsectorparameter $player~current_sector "ORGANICSH" $highproductivity
			setvar $a ($highproductivity/100)
			send "o   2" $a "*  q  "
			add $lowproductivity $a
			add $highproductivity $a
			setsectorparameter $player~current_sector "ORGANICSL" $lowproductivity
			setsectorparameter $player~current_sector "ORGANICSH" $highproductivity
		end
		if ($restockequ = 1)
			setvar $restockequ 0
			getsectorparameter $player~current_sector "EQUIPMENTL" $lowproductivity
			getsectorparameter $player~current_sector "EQUIPMENTH" $highproductivity
			setvar $a ($highproductivity/100)
			send "o   3" $a "*  q  "
			add $lowproductivity $a
			add $highproductivity $a
			setsectorparameter $player~current_sector "EQUIPMENTL" $lowproductivity
			setsectorparameter $player~current_sector "EQUIPMENTH" $highproductivity
		end
	end

end

halt

:checksizing
# maths just has to be rough

setvar $orecost (0 - ($cred2 - $cred1))
setvar $orgcost (0 - ($cred3 - $cred2))
setvar $equcost (0 - ($cred4 - $cred3))

if (($orecost = 0) or ($orgcost = 0) or ($equcost = 0))
	return
end
setvar $oreunit ($orecost/$oreholds)
setvar $orgunit ($orgcost/$org_holds)
setvar $equunit ($equcost/$equip_holds)

if ($orecost < 100)
	setvar $min_ore $oreholds
	setvar $unitprice $oreunit
	setvar $currentcost $orecost
	gosub :getadd
	add $oreholds $unitstoadd
else
	setvar $test ($orecost - $oreunit)
	if ($test > 100)
		#if (($oreholds - 1) > $min_ore)
		subtract $oreholds 1
		#end
	end
end

if ($orgcost < 100)
	setvar $min_org $org_holds

	setvar $unitprice $orgunit
	setvar $currentcost $orgcost
	gosub :getadd
	add $org_holds $unitstoadd
else
	setvar $test ($orgcost - $orgunit)
	if ($test > 100)
		#if (($org_holds - 1) > $min_org)
		subtract $org_holds 1
		#end
	end
end

if ($equcost < 100)
	setvar $min_equip $equip_holds
	setvar $unitprice $equunit
	setvar $currentcost $equcost
	gosub :getadd
	add $equip_holds $unitstoadd
else

	setvar $test ($equcost - $equunit)
	if ($test > 100)
		#if (($equip_holds - 1) > $min_equip)
		subtract $equip_holds 1
		#end
	end
end

return

:getadd
setvar $v 1
setvar $go 1
while ($go = 1)
	setvar $newcost ($currentcost + ($v * $unitprice))
	if ($newcost > 100)
		setvar $go 0
		setvar $unitstoadd $v
	else
		add $v 1
	end

end

return

:weareselling
waitfor "We are selling up to"
getword currentline $quant 6
striptext $quant "."
return

:calcstats
setvar $expdiff ($player~experience - $startexp)
setvar $turndiff ($startturns - $player~turns)
if ($turndiff <= 0)
	send "'Experience gained: " $expdiff "; exp @ " $player~experience "*"
	return
end
setprecision 2
setvar $expperturn ($expdiff/$turndiff)
setprecision 0

send "'We are making " $expperturn " per turn; exp @ " $player~experience "*"

return

halt

#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\haggle"
include "source\include\help"
include "source\include\sector"
include "source\include\switchboard.ts"
