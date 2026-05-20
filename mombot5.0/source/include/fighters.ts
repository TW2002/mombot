#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:FIGHTERS~DEPLOY
# Deploy fighters to sector.  Uses the following variables which can be set:
# $fighters~personal	Make fighters personal (TRUE/FALSE; default=corporate)
# $fighters~toll		Drop toll fighters (default=defensive)
# $fighters~offensive	Drop offensive fighters (default=defensive)
# $fighters~amount		Amount of fighters to deploy (required)
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $map~stardock
gosub :quikstats

if (($player~current_sector  < 11) or ($player~current_sector  = $map~stardock))
	setvar $switchboard~message "Can't deploy figs in fed*"
	gosub :switchboard~switchboard
	return
end

if ($bot~startingLocation = "Citadel")
	if ($PLAYER~CURRENT_PROMPT = "Citadel")
		send " q "
		gosub :PLANET~getPlanetInfo
		send " q "
	elseif ($PLAYER~CURRENT_PROMPT = "Planet")
		gosub :PLANET~getPlanetInfo
		send " q "
	end
end
if ($personal)
	setvar $owner "p"
	setvar $owner_label "personal"
else
	setvar $owner "c"
	setvar $owner_label "corporate"
end
if ($toll)
	setvar $type "t"
	setvar $type_label "toll"
elseif ($offensive)
	setvar $type "o"
	setvar $type_label "offensive"
else
	setvar $type "d"
	setvar $type_label "defensive"
end
send " f"

setTextLineTrigger nocontrol :nocontrol "These fighters are not under your control."
setTextLineTrigger abletodeploy :abletodeploy "fighters available."
setTextLineTrigger cansupport :cansupport "Your ship can support"
pause

:nocontrol
killalltriggers
setvar $switchboard~message "We don't control the figs in this sector!*"
gosub :switchboard~switchboardsend
gosub :xenter~run
return

:abletodeploy
killtrigger nocontrol
killtrigger abletodeploy
getWord CURRENTLINE $available_fighters 3
striptext $available_fighters ","
striptext $available_fighters " "
pause

:cansupport
getWord CURRENTLINE $ftrs_to_leave 10
getWord CURRENTLINE $ship_fighters 7
stripText $ftrs_to_leave ","
stripText $ftrs_to_leave " "
stripText $ship_fighters ","
stripText $ship_fighters " "

if ($available_fighters >= $amount)
	if ($available_fighters < $ship_fighters)
		setVar $ftrs_to_leave $amount
	else
		setVar $ftrs_to_leave ($available_fighters-($player~fighters-$amount))
	end
else
	setVar $ftrs_to_leave $available_fighters
end

send " " $ftrs_to_leave " * " $owner " " $type

gosub :player~currentprompt
if ($bot~startingLocation = "Citadel")
	if ($PLAYER~CURRENT_PROMPT = "Command")
		gosub :PLANET~landingSub
	elseif ($PLAYER~CURRENT_PROMPT = "Planet")
		send "c "
		waiton "Citadel command (?=help)"
	end
end

#setVar $SWITCHBOARD~message $ftrs_to_leave&" "&$owner_label&" "&$type_label&" fighters have been deployed.*"
#gosub :SWITCHBOARD~switchboard

return

include "source\include\planet"
include "source\include\switchboard"
