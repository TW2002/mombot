gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Checks whether a sector is an MSL or lists all MSL sectors."
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"msl [sector|all]"
setvar $help~help[4]  $help~tab&" "
setvar $help~help[5]  $help~tab&"Options:"
setvar $help~help[6]  $help~tab&"   {sector}    Checks one sector"
setvar $help~help[7]  $help~tab&"      {all}    Outputs all MSL sectors to subspace"
setvar $help~help[8]  $help~tab&"Rylos and Alpha Centauri must be known."
gosub :help~helpfile

loadvar $bot_name

loadvar $unlimitedgame

loadvar $bot_turn_limit

loadvar $user_command_line

loadvar $parm1
loadvar $player~current_sector

if (($parm1 = "") or ($parm1 = 0))
	setvar $parm1 $player~current_sector
end

isnumber $test $parm1
if (($test = false) and ($parm1 <> "all"))
	setvar $switchboard~message "Invalid Sector. Please enter a Sector number or 'all'.*"
	gosub :switchboard~switchboard
	halt
end

send "'Zarkahn's MSL Check, Processing Data, Stand By*"
gosub :zmsl

if ($parm1 = "all")
	goto :reportall
end

getsector $parm1 $chksector
getsectorparameter $parm1 "MSLSEC" $msl
isnumber $result $msl
if ($result > 0)
	send "'MSL Check Completed*"
	send "'Sector " $parm1 " IS A MSL*"
	halt
end

send "'MSL Check Completed*"
send "'Sector " $parm1 " Is NOT a MSL*"
halt

:reportall
setvar $start 1

while ($start <= sectors)
	getsector $start $chksector
	getsectorparameter $start "MSLSEC" $msl
	isnumber $result $msl
	if ($result > 0)
		send "'Sector " $start " is MSL*"
	end
	add $start 1
end
send "'MSL Output Completed, Halting*"
halt

:zmsl
setvar $forsure 1

while ($forsure < 11)
	setsectorparameter $forsure "MSLSEC" true
	add $forsure 1
end

:check_ac
if (alphacentauri = 0)
	send "'AC is not known, Shutting Down*"
	halt
end
setsectorparameter alphacentauri "MSLSEC" true

:check_rylos
if (rylos = 0)
	send "'Rylos not Known, Shutting Down*"
	halt
end
setsectorparameter rylos "MSLSEC" true

:run_terra1
setvar $from 1
getcourse $warp $from stardock
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_terra2
getcourse $warp $from alphacentauri
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_terra3
getcourse $warp $from rylos
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_dock1
setsectorparameter stardock "MSLSEC" true
setvar $from stardock
getcourse $warp $from 1
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_dock2
getcourse $warp $from alphacentauri
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_dock3
getcourse $warp $from rylos
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_ac1
setvar $from alphacentauri
getcourse $warp $from 1
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_ac2
getcourse $warp $from stardock
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_ac3
getcourse $warp $from rylos
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_rylos1
setvar $from rylos
getcourse $warp $from 1
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_rylos2
getcourse $warp $from stardock
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

:run_rylos3
getcourse $warp $from alphacentauri
setvar $c 1
while ($c <= $warp)
	setsectorparameter $warp[$c] "MSLSEC" true
	add $c 1
end

send "'MSL Search Complete Sector Parameters Set*"
return
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
