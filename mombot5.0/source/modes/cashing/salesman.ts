gosub :loadvars~loadvars
gosub :help~initialize

setvar  $bot~no_credits_file $bot~folder&"/No_Credits.list"
savevar $bot~no_credits_file
loadvar $game~limpet_cost
loadvar $game~armid_cost
loadvar $game~limpet_removal_cost
loadvar $player~surroundavoidallplanets
loadvar $player~surroundavoidshieldedonly
loadvar $player~surroundoverwrite

setvar $help~help[1]  $help~tab&"Visits all ports in grid and trades product."
setvar $help~help[2]  $help~tab&"Buys/sells organics and equipment; fuel is optional."
setvar $help~help[3]  $help~tab&" "
setvar $help~help[4]  $help~tab&"salesman [min port product] ({neg}otiate OR {hold}byhold)"
setvar $help~help[5]  $help~tab&"{docim} {skipcim} {upgradefuel} {buyfuel}"
setvar $help~help[6]  $help~tab&"         "
setvar $help~help[7]  $help~tab&"Options: "
setvar $help~help[8]  $help~tab&"   {neg/hold}    Determines planet negotiate or hold selling"
setvar $help~help[9]  $help~tab&"   {docim}       Does cim before starting route"
setvar $help~help[10] $help~tab&"   {upgradefuel} Upgrades fuel ports selling fuel"
setvar $help~help[11] $help~tab&"     {haggle}    Uses native haggle for trading"
setvar $help~help[12] $help~tab&"   {nohaggle}    Doesn't haggle when buying product"
setvar $help~help[13] $help~tab&"    {buyfuel}    Buys fuel during travels"
setvar $help~help[14] $help~tab&"   {sellfuel}    Sells fuel during travels"
setvar $help~help[15] $help~tab&"       {grid}    Surround grid as you go"
setvar $help~help[16] $help~tab&"        {rob}    Rob ports after buying down"
setvar $help~help[17] $help~tab&"    {upgrade}    Slowly upgrade each port as it goes"
setvar $help~help[18] $help~tab&"    {skipcim}    Trusts database port data; skips remote port checks"
gosub :help~helpfile

gosub :player~quikstats
setvar $startinglocation $player~current_prompt
setvar $startingsector $player~current_sector
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "You must run Travelling Salesman command from a Citadel prompt.*"
	gosub :switchboard~switchboard
	halt
end

send "q"
waiton "Planet command (?"
gosub :planet~getplanetinfo
send "c"

if ($planet~citadel < 4)
	setvar $switchboard~message "You must run Travelling Salesman from at least a level 4 planet.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos $bot~user_command_line $pos "docim"
if ($pos > 0)
	setvar $merchant~docim true
else
	setvar $merchant~docim false
end

getwordpos $bot~user_command_line $pos "skipcim"
if ($pos > 0)
	setvar $merchant~skipcim true
else
	setvar $merchant~skipcim false
end

getwordpos $bot~user_command_line $pos "grid"
if ($pos > 0)
	setvar $merchant~grid true
else
	setvar $merchant~grid false
end

getwordpos $bot~user_command_line $pos "nohaggle"
if ($pos > 0)
	setvar $merchant~nohaggle true
else
	setvar $merchant~nohaggle false
end

getwordpos " "&$bot~user_command_line&" " $pos " haggle "
if ($pos > 0)
	setvar $merchant~nativehagglemode true
else
	setvar $merchant~nativehagglemode false
end

getwordpos " "&$bot~user_command_line&" " $pos " upgrade "
if ($pos > 0)
	setvar $merchant~upgrade true
	setvar $merchant~upfuel true
	setvar $merchant~uporg true
	setvar $merchant~upequ true
else
	setvar $merchant~upgrade false
	setvar $merchant~upfuel false
	setvar $merchant~uporg false
	setvar $merchant~upequ false
end

getwordpos $bot~user_command_line $pos "hold"
if ($pos > 0)
	setvar $planet~planetnegotiate false
else
	setvar $planet~planetnegotiate true
end

getwordpos $bot~user_command_line $pos "upgradefuel"
if ($pos > 0)
	setvar $merchant~upfuel_fuel true
	setvar $merchant~upfuel true
else
	setvar $merchant~upfuel_fuel false
end

getwordpos " "&$bot~user_command_line&" " $pos " buyfuel "
if ($pos > 0)
	setvar $merchant~buyfuel true
else
	setvar $merchant~buyfuel false
end

getwordpos $bot~user_command_line $pos "sellfuel"
if ($pos > 0)
	setvar $merchant~sellfuel true
else
	setvar $merchant~sellfuel false
end

getwordpos " "&$bot~user_command_line&" " $pos " mines "
if ($pos > 0)
	setvar $merchant~mines true
else
	setvar $merchant~mines false
end

getwordpos $bot~user_command_line $pos "rob"
if ($pos > 0)
	setvar $merchant~do_rob true
else
	setvar $merchant~do_rob false
end

setvar $merchant~minprod $bot~parm1
isnumber $number $merchant~minprod
if ($number <> 1)
	setvar $switchboard~message " Minimum Port Product entered is not a number!*"
	gosub :switchboard~switchboard
	halt
end
if ($merchant~minprod <= 0)
	setvar $switchboard~message "Minimum Port Product must be greater than 0.*"
	gosub :switchboard~switchboard
	halt
end

setvar $switchboard~message "Traveling Salesman starting up!*"
gosub :switchboard~switchboard

setvar $player~surroundnormal false
setvar $player~surroundpassive true
setvar $merchant~player~save true
setvar $merchant~sectorcount 10
setvar $merchant~totalholds 0
setvar $merchant~spentcredits 0
setvar $merchant~salesman true
setvar $merchant~checkmcic false
setvar $merchant~sellmcic 0
setvar $merchant~upmcic -60
setvar $merchant~minpct 15
setvar $merchant~sellingorg true
setvar $merchant~sellingequip true
setvar $merchant~sellingfuel $merchant~sellfuel

gosub :merchant~merchant
send "p"&$startingsector&"*y"
setvar $switchboard~message "Travelling Salesman completed.*"
gosub :switchboard~switchboard
gosub :haggle~restoreautohaggle
halt

#INCLUDES:
include "source\include\loadvars"
include "source\include\planethaggle"
include "source\include\sector"
include "source\include\haggle"
include "source\include\player"
include "source\include\planet"
include "source\include\help"
include "source\include\merchant"
include "source\include\switchboard.ts"
