
gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE


	setVar $HELP~HELP[1]  $HELP~TAB&"       Buys minimum Ore/Org/Equip and dumps to planet "
	setVar $HELP~HELP[2]  $HELP~TAB&"       of jets to gain experience from a SSS Port.  "
	setVar $HELP~HELP[3]  $HELP~TAB&"       "
	setVar $HELP~HELP[4]  $HELP~TAB&" bbb [expstop] {upport}"
	setVar $HELP~HELP[5]  $HELP~TAB&"       "
	setVar $HELP~HELP[6]  $HELP~TAB&" Options:"
	setVar $HELP~HELP[7]  $HELP~TAB&"    [expstop]     STOP when you get to this exp."
	setVar $HELP~HELP[8]  $HELP~TAB&"	   {upport}      When port empties upgrades the minimum "
	setVar $HELP~HELP[9]  $HELP~TAB&"                  to continue  "
	setVar $HELP~HELP[9]  $HELP~TAB&"     "
	setVar $HELP~HELP[9]  $HELP~TAB&"    Script uses internal Haggle. "
	setVar $HELP~HELP[10] $HELP~TAB&"    Start from planet to dump to planet. Start in sector"
	setVar $HELP~HELP[10] $HELP~TAB&"    and it will jettison."
	gosub :HELP~HELPFILE

	setvar $SWITCHBOARD~MESSAGE "Buy Buy Buy starting up!*"
	gosub :SWITCHBOARD~SWITCHBOARD



	setVar $useplanet TRUE


	gosub :player~quikstats
	
	setvar $startexp $player~experience
	setvar $startturns $player~turns

	setVar $startingLocation $PLAYER~CURRENT_PROMPT
	if ($startingLocation = "Command")
		setVar $useplanet FALSE
	elseif ($startingLocation = "Planet")  
		setVar $useplanet TRUE
	else
		setVar $SWITCHBOARD~message "Start at command or planet prompt.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end

	
	setVar $halt_exp $bot~parm1
	isNumber $number $halt_exp

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

	setVar $oreholds 12
	setVar $org_holds 6
	setVar $equip_holds 3
	setVar $rebuy 0
	
	getWordPos $bot~user_command_line $pos "upport"
	if ($pos > 0)
		setVar $rebuy 1
		setvar $switchboard~message "Upgrading port if it runs low on any product.*"
		gosub :switchboard~switchboard
		
	else
		setVar $rebuy 0
	end

	if ($useplanet = TRUE)
		send "snl1*snl2*snl3*tnl1*tnl2*tnl3*"
	else
		send "J    y    *"
	end

if ($useplanet = TRUE)
	send "d"
	waitfor "Planet #"
	getword CURRENTLINE $pnum 2
	stripText $pnum "#"
	send "q"
end

gosub :PLAYER~voidAdjacent


setVar $i 1

# just put this in because it should probably stop eventually, particularly when I program in a infinite loop... 10 times in a row... painful
setvar $trips 1000
setVar $notifyi 0
setVar $notifyi1st 1
while ($y < $trips)
	

	setVar $cred1 $player~credits

	send "p t"
	waitfor "Items     Status  Trading"
	:portwaitagain
	setTextLineTrigger ore1 :ore1 "Fuel Ore"
	setTextLineTrigger org1 :org1 "Organics"
	setTextLineTrigger equ1 :equ1 "Equipment"
	pause
	:ore1
		killalltriggers
		getWord CURRENTLINE $oreLeft 5
		goto :portwaitagain
	:org1
		killalltriggers
		getWord CURRENTLINE $orgLeft 4
		goto :portwaitagain
	:equ1
		killalltriggers
		getWord CURRENTLINE $equipLeft 4
		
	striptext $oreLeft "%"
	striptext $orgLeft "%"
	striptext $equipLeft "%"

	if ($oreLeft <= 2)
		setVar $restockOre 1
	end
	if ($orgLeft <= 2)
		setVar $restockOrg 1
	end
	if ($equipLeft <= 2)
		setVar $restockEqu 1
	end

	setVar $quant 0
	gosub :weareselling
	
	send $oreholds "*"

	if (HAGGLE = FALSE)
		gosub :HAGGLE~startHaggle
		setVar $cred2 $PLAYER~nCredits
	else
		killalltriggers
		settextlinetrigger oredone :oredone "credits and"
		pause
		:oredone
		getword CURRENTLINE $cred2 3
		stripText $cred2 ","
		isNumber $isnum $cred2
		if ($isnum <> 1)
			setVar $cred2 $cred1
		end
	end

	send $org_holds "*"

	if (HAGGLE = FALSE)
		gosub :HAGGLE~startHaggle
		setVar $cred3 $PLAYER~nCredits
	else
		killalltriggers
		settextlinetrigger orgdone :orgdone "credits and"
		pause
		:orgdone
		getword CURRENTLINE $cred3 3
		stripText $cred3 ","
		isNumber $isnum $cred3
		if ($isnum <> 1)
			setVar $cred3 $cred2
		end
	end

	send $equip_holds "*"

	if (HAGGLE = FALSE)
		gosub :HAGGLE~startHaggle
		setVar $cred4 $PLAYER~nCredits
	else
		killalltriggers
		settextlinetrigger equdone :equdone "credits and"
		pause
		:equdone
		getword CURRENTLINE $cred4 3
		stripText $cred4 ","
		isNumber $isnum $cred4
		if ($isnum <> 1)
			setVar $cred4 $cred3
		end
	end

	goSub :checkSizing
	gosub :player~quikstats
	

	setVar $totalholds ($oreholds + $org_holds + $equip_holds)
	setVar $empty_holds ($PLAYER~TOTAL_HOLDS - ($player~ORE_HOLDS + $player~ORGANIC_HOLDS + $player~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS))
	
	if ($empty_holds < $totalholds)

		if ($useplanet = TRUE)
			send "l" $pnum "*tnl1*tnl2*tnl3*q"
		else
			send "j  y  *  "
		end 
	end
	
	
	add $notifyi 1
	if (($notifyi1st > 0) and ($notifyi = 5))
		add $notifyi1st 1
		gosub :calcstats
		setVar $notifyi 0
		if ($notifyi1st = 4)
			setvar $notifyi1st 0
		end
	end
	if ($notifyi > 30)
		gosub :calcstats
		setVar $notifyi 0
	end
	if ($player~credits < 5000)
		setvar $switchboard~message "Low on cash, Halting...*"
		gosub :switchboard~switchboard
		gosub :PLAYER~clearadjacent
		halt
	end
	if ($player~turns < 50)
		setvar $switchboard~message "Turns low.. keeping a few up our sleeve.. halting*"
		gosub :switchboard~switchboard
		gosub :PLAYER~clearadjacent
		halt
	end
	if ($player~EXPERIENCE > $halt_exp)
		setvar $switchboard~message "Experience target met.. halting*"
		gosub :switchboard~switchboard
		gosub :PLAYER~clearadjacent
		halt
	end

	if ($rebuy = 0)
		if ($restockOre = 1)
			setvar $switchboard~message "Low on available fuel ore, Halting...*"
			gosub :switchboard~switchboard
			gosub :PLAYER~clearadjacent
			halt
		end

		if ($restockOrg = 1)
			setvar $switchboard~message "Low on available Organics, Halting...*"
			gosub :switchboard~switchboard
			gosub :PLAYER~clearadjacent
			halt
		end

		if ($restockEqu = 1)
			setvar $switchboard~message "Low on available Equipment, Halting...*"
			gosub :switchboard~switchboard
			gosub :PLAYER~clearadjacent
			halt
		end
	else
		if ($restockOre = 1)
			setVar $restockOre 0
			getsectorparameter $PLAYER~current_sector "FUELL" $LOWPRODUCTIVITY
			getsectorparameter $PLAYER~current_sector "FUELH" $HIGHPRODUCTIVITY
			setVar $a ($HIGHPRODUCTIVITY/100)
			send "o   1" $a "*  q  "
			add $LOWPRODUCTIVITY $a
			add $HIGHPRODUCTIVITY $a
			setsectorparameter $PLAYER~current_sector "FUELL" $LOWPRODUCTIVITY
			setsectorparameter $PLAYER~current_sector "FUELH" $HIGHPRODUCTIVITY
			
		end
		if ($restockOrg = 1)
			setVar $restockOrg 0
			getsectorparameter $PLAYER~current_sector "ORGANICSL" $LOWPRODUCTIVITY
			getsectorparameter $PLAYER~current_sector "ORGANICSH" $HIGHPRODUCTIVITY
			setVar $a ($HIGHPRODUCTIVITY/100)
			send "o   2" $a "*  q  "
			add $LOWPRODUCTIVITY $a
			add $HIGHPRODUCTIVITY $a
			setsectorparameter $PLAYER~current_sector "ORGANICSL" $LOWPRODUCTIVITY
			setsectorparameter $PLAYER~current_sector "ORGANICSH" $HIGHPRODUCTIVITY
		end
		if ($restockEqu = 1)
			setVar $restockEqu 0
			getsectorparameter $PLAYER~current_sector "EQUIPMENTL" $LOWPRODUCTIVITY
			getsectorparameter $PLAYER~current_sector "EQUIPMENTH" $HIGHPRODUCTIVITY
			setVar $a ($HIGHPRODUCTIVITY/100)
			send "o   3" $a "*  q  "
			add $LOWPRODUCTIVITY $a
			add $HIGHPRODUCTIVITY $a
			setsectorparameter $PLAYER~current_sector "EQUIPMENTL" $LOWPRODUCTIVITY
			setsectorparameter $PLAYER~current_sector "EQUIPMENTH" $HIGHPRODUCTIVITY
		end
	end

end




halt

:checkSizing
	# maths just has to be rough

	setVar $oreCost (0 - ($cred2 - $cred1))
	setVar $orgCost (0 - ($cred3 - $cred2))
	setVar $equCost (0 - ($cred4 - $cred3))
	
	if (($oreCost = 0) or ($orgCost = 0) or ($equCost = 0))
		return
	end
	setVar $oreunit ($oreCost/$oreholds)
	setVar $orgunit ($orgCost/$org_holds)
	setVar $equunit ($equCost/$equip_holds)
	

	if ($oreCost < 100)
		setVar $min_ore $oreholds
		setVar $unitprice $oreunit
		setVar $currentcost $oreCost
		goSub :getAdd
		add $oreholds $unitsToAdd
	else
		setvar $test ($oreCost - $oreunit)
		if ($test > 100)
			#if (($oreholds - 1) > $min_ore)
				subtract $oreholds 1
			#end
		end
	end
	


	if ($orgCost < 100)
		setVar $min_org $org_holds
		
		setVar $unitprice $orgunit
		setVar $currentcost $orgCost
		goSub :getAdd
		add $org_holds $unitsToAdd
	else
		setvar $test ($orgCost - $orgunit)
		if ($test > 100)
			#if (($org_holds - 1) > $min_org)
				subtract $org_holds 1
			#end
		end
	end

	if ($equCost < 100)
		setVar $min_equip $equip_holds
		setVar $unitprice $equunit
		setVar $currentcost $equCost
		goSub :getAdd
		add $equip_holds $unitsToAdd
	else
		
		setvar $test ($equCost - $equunit)
		if ($test > 100)
			#if (($equip_holds - 1) > $min_equip)
				subtract $equip_holds 1
			#end
		end
	end

return

:getAdd
	setVar $v 1
	setVar $go 1
	while ($go = 1)
		setVar $newcost ($currentcost + ($v * $unitprice))
		if ($newcost > 100)
			setVar $go 0
			setVar $unitsToAdd $v
		else
			add $v 1
		end

	end

return


:weareselling
	waitfor "We are selling up to"
	getword CURRENTLINE $quant 6
	stripText $quant "."
return


:calcstats
	
	setVar $expdiff ($player~experience - $startexp)
	setVar $turndiff ($startturns - $player~turns)
	if ($turndiff <= 0)
		send "'Experience gained: " $expdiff "; exp @ " $player~experience "*"
		return
	end
	setPrecision 2
	setVar $expperturn ($expdiff/$turndiff)
	setPrecision 0

	send "'We are making " $expperturn " per turn; exp @ " $player~experience "*"

return




halt

#INCLUDES:
include "source\include\player"
include "source\include\loadvars"
include "source\include\haggle"
include "source\include\help"
