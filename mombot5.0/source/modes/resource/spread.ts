logging off
gosub :loadvars~loadvars

gosub :help~initialize
setvar $help~help[1]  $help~tab&"SPREAD - Product Leveler"
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"    spread [type] [minimum]"
setvar $help~help[4]  $help~tab&" "
setvar $help~help[5]  $help~tab&"    [type] - use [f]uel, [o]rganics, or [e]quipment"
setvar $help~help[6]  $help~tab&"    [minimum] - amount each planet in the sector should have"
setvar $help~help[7]  $help~tab&" "
setvar $help~help[8]  $help~tab&"    Example: >spread f 925000"
gosub :help~helpfile

killalltriggers
gosub :player~quikstats
setvar $startlocation $player~current_prompt
if (($startlocation <> "Citadel") and ($startlocation <> "Planet"))
	setvar $switchboard~message "Spread must be run from Citadel or Planet prompt.*"
	gosub :switchboard~switchboard
	halt
end

if ($parm1 = "f")
	setvar $stuffmoved "Fuel"
	setvar $stuff 1
elseif ($parm1 = "o")
	setvar $stuffmoved "Organics"
	setvar $stuff 2
elseif ($parm1 = "e")
	setvar $stuffmoved "Equipment"
	setvar $stuff 3
else
	setvar $switchboard~message "Please use spread [f/o/e] [minimum] format.*"
	gosub :switchboard~switchboard
	halt
end

isnumber $test $parm2
if (($test = false) or ($parm2 <= 0))
	setvar $switchboard~message "Spread minimum must be a number greater than zero.*"
	gosub :switchboard~switchboard
	halt
end
setvar $spread_minimum $parm2

if ($startlocation = "Citadel")
	send "q"
	waiton "Planet command"
end

gosub :getplanetinfo
setvar $spread_startingplanet $planet
setvar $spread_sector $player~current_sector
setarray $spread_planet 2000
setarray $spread_amount 2000
setarray $spread_max 2000
setarray $spread_need 2000
setarray $spread_surplus 2000
setvar $spread_planetcount 0
setvar $spread_totalneed 0
setvar $spread_totalsurplus 0
setvar $spread_totalmoved 0
setvar $spread_movedplanets 0

gosub :planet~getplanets
setvar $i 1
while ($i <= $planet~planetlistcount)
	if ($planet~planetlist[$i][1] = $spread_sector)
		add $spread_planetcount 1
		setvar $spread_planet[$spread_planetcount] $planet~planetlist[$i]
	end
	add $i 1
end

if ($spread_planetcount <= 1)
	gosub :returnhome
	setvar $switchboard~message "Spread found no other planets in sector "&$spread_sector&".*"
	gosub :switchboard~switchboard
	halt
end

gosub :scanplanets
if ($spread_totalneed <= 0)
	gosub :returnhome
	setvar $switchboard~message "All "&$spread_planetcount&" planets already have at least "&$spread_minimum&" "&$stuffmoved&".*"
	gosub :switchboard~switchboard
	halt
end
if ($spread_totalsurplus <= 0)
	gosub :returnhome
	setvar $switchboard~message "No surplus "&$stuffmoved&" available to spread in sector "&$spread_sector&".*"
	gosub :switchboard~switchboard
	halt
end

setvar $source 1
while ($source <= $spread_planetcount)
	while ($spread_surplus[$source] > 0)
		gosub :finddeficit
		if ($destination <= 0)
			goto :spreaddone
		end
		if ($destination = $source)
			goto :sourceblocked
		end
		setvar $moveamount $spread_surplus[$source]
		if ($moveamount > $spread_need[$destination])
			setvar $moveamount $spread_need[$destination]
		end
		if ($moveamount <= 0)
			goto :sourceblocked
		end
		setvar $spread_targetplanet $spread_planet[$source]
		gosub :landplanet
		if ($spread_landed <> true)
			gosub :returnhome
			setvar $switchboard~message "Spread failed landing on source planet "&$spread_planet[$source]&".*"
			gosub :switchboard~switchboard
			halt
		end
		setvar $planet~planettofill $spread_planet[$destination]
		setvar $planet~moveholds 0
		setvar $planet~moveextra 0
		setvar $planet~moveamount $moveamount
		setvar $planet~type "t"
		setvar $planet~category $stuff
		gosub :planet~moveproduct
		if ($planet~movesuccess <> true)
			gosub :returnhome
			setvar $switchboard~message "Spread failed moving "&$stuffmoved&" from planet "&$spread_planet[$source]&" to "&$spread_planet[$destination]&": "&$planet~moveerror&"*"
			gosub :switchboard~switchboard
			halt
		end
		subtract $spread_surplus[$source] $moveamount
		subtract $spread_need[$destination] $moveamount
		subtract $spread_amount[$source] $moveamount
		add $spread_amount[$destination] $moveamount
		add $spread_totalmoved $moveamount
		add $spread_movedplanets 1
	end
	:sourceblocked
	add $source 1
end

:spreaddone
gosub :returnhome
gosub :remainingneed
if ($spread_totalneed <= 0)
	setvar $switchboard~message "Spread complete: moved "&$spread_totalmoved&" "&$stuffmoved&"; all planets have at least "&$spread_minimum&".*"
else
	setvar $switchboard~message "Spread moved "&$spread_totalmoved&" "&$stuffmoved&", but sector "&$spread_sector&" is still short "&$spread_totalneed&".*"
end
gosub :switchboard~switchboard
halt

:scanplanets
setvar $i 1
while ($i <= $spread_planetcount)
	setvar $spread_targetplanet $spread_planet[$i]
	gosub :landplanet
	if ($spread_landed <> true)
		gosub :returnhome
		setvar $switchboard~message "Spread failed landing on planet "&$spread_planet[$i]&" for product scan.*"
		gosub :switchboard~switchboard
		halt
	end
	gosub :getplanetinfo
	setvar $spread_amount[$i] $planet~amount[$stuff]
	setvar $spread_max[$i] $planet~max[$stuff]
	if ($spread_max[$i] < $spread_minimum)
		gosub :returnhome
		setvar $switchboard~message "Planet "&$spread_planet[$i]&" can only hold "&$spread_max[$i]&" "&$stuffmoved&"; cannot spread to "&$spread_minimum&".*"
		gosub :switchboard~switchboard
		halt
	end
	if ($spread_amount[$i] < $spread_minimum)
		setvar $spread_need[$i] ($spread_minimum - $spread_amount[$i])
		setvar $spread_surplus[$i] 0
		add $spread_totalneed $spread_need[$i]
	elseif ($spread_amount[$i] > $spread_minimum)
		setvar $spread_need[$i] 0
		setvar $spread_surplus[$i] ($spread_amount[$i] - $spread_minimum)
		add $spread_totalsurplus $spread_surplus[$i]
	else
		setvar $spread_need[$i] 0
		setvar $spread_surplus[$i] 0
	end
	add $i 1
end
return

:finddeficit
setvar $destination 0
setvar $i 1
while (($i <= $spread_planetcount) and ($destination <= 0))
	if (($spread_need[$i] > 0) and ($i <> $source))
		setvar $destination $i
	end
	add $i 1
end
return

:remainingneed
setvar $spread_totalneed 0
setvar $i 1
while ($i <= $spread_planetcount)
	if ($spread_need[$i] > 0)
		add $spread_totalneed $spread_need[$i]
	end
	add $i 1
end
return

:landplanet
setvar $spread_landed false
gosub :player~currentprompt
if ($player~current_prompt = "Citadel")
	send "q"
	waiton "Planet command"
	gosub :player~currentprompt
end
if ($player~current_prompt = "Planet")
	send "q "
	waiton "Command"
	gosub :player~currentprompt
end
if ($player~current_prompt <> "Command")
	return
end
setvar $planet~planet $spread_targetplanet
setvar $planet~nocit true
setvar $notakefigs true
gosub :planet~landingsub
if ($planet~successfulplanet = true)
	setvar $spread_landed true
end
return

:returnhome
setvar $spread_targetplanet $spread_startingplanet
gosub :landplanet
if (($spread_landed = true) and ($startlocation = "Citadel"))
	send "c"
	waiton "Citadel command"
end
return

:getplanetinfo
gosub :planet~getplanetinfo
setvar $planet $planet~planet
setvar $player~current_sector $planet~current_sector
return

include "source\include\planet"
include "source\include\loadvars.ts"
include "source\include\help.ts"
include "source\include\switchboard.ts"
