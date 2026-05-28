gosub :help~initialize
setvar $help~help[1] $help~tab&"Reports nearest friendly fig after fighter hits."
setvar $help~help[2] $help~tab&"Daemon-style mode that watches fighter hit reports and posts"
setvar $help~help[3] $help~tab&"the nearest FIGSEC route back to the hit sector."
gosub :help~helpfile

loadvar $bot_name

:settriggers
settextlinetrigger findfig :findfig "Deployed Fighters Report Sector"
settextlinetrigger findfig2 :findfig2 "Your fighters in sector "
pause

:findfig2
killalltriggers
getword currentline $spoof 1
if ($spoof <> "Your")
	goto :settriggers
end
getword currentline $fighit 5
striptext $fighit ":"
setvar $near "f"
setvar $source $fighit
goto :near_hit

:findfig
killalltriggers
getword currentline $spoof 1
if ($spoof <> "Deployed")
	goto :settriggers
end
getwordpos currentline $pos " is attacking!"
if ($pos <= 0)
	goto :settriggers
end
getword currentline $fighit 5
striptext $fighit ":"
setvar $near "f"
setvar $source $fighit

:near_hit
getsectorparameter $source "FIGSEC" $isfigged
setvar $breadth_mode "forward"
gosub :breadth_search
if ($return_data <> "")
	send "'*{" $bot_name "}*  - "&$return_data&"**"
end
goto :settriggers

:breadth_search
setvar $i 1
getnearestwarps $neararray $source
while ($i <= $neararray)
	setvar $focus $neararray[$i]
	getsectorparameter $focus "FIGSEC" $isfigged2

	if (($isfigged2 = true) and ($source <> $focus))
		getcourse $course $source $focus
		setvar $i 1
		setvar $fcount 0
		setvar $directions ""
		if ($course = 1)
			while (sector.warps[$source][$i] > 0)
				setvar $tempcheck sector.warps[$source][$i]
				getsectorparameter $tempcheck "FIGSEC" $isfigged3
				if ($isfigged3)
					setvar $directions $directions&$tempcheck&" "
					add $fcount 1
				end
				add $i 1
			end
			if ($fcount > 1)
				setvar $return_data "Adjacent Figs to "&$source&" are [ "&$directions&"] "
			else
				setvar $return_data "Adjacent Fig to "&$source&" is [ "&$directions&"] "
			end
		else
			setvar $courselength ($course + 1)
			while ($i <= $courselength)
				setvar $directions $directions&$course[$i]&" "
				add $i 1
			end
			setvar $return_data "Nearest Fig to "&$source&" is "&$focus&" ("&$course&" hops)  << "&$directions&" >> "
		end
		return
	end

	add $i 1
end

setvar $return_data "Nothing found for that search."
return
include "source\include\help"
