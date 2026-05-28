gosub :help~initialize
setvar $help~help[1] $help~tab&"Finds nearby cashing ports with equipment volume."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  getnear {minimum equipment}"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   {minimum equipment} - minimum equipment units to list."
setvar $help~help[6] $help~tab&"                         Defaults to the game's port max."
setvar $help~help[7] $help~tab&"   Lists figged buying and selling ports nearest your current sector."
gosub :help~helpfile

gosub :player~quikstats
setvar $version "1.1a"
loadvar $bot~folder
setvar $mom $bot~folder&"/"&gamename&".nego"
setarray $port sectors
setvar $cnt 0
setvar $buyer 0
setvar $b 0
setvar $seller 0
setvar $s 0
loadvar $port_max
loadvar $game~port_max
loadvar $bot_name
loadvar $parm1

fileexists $mom_tst $mom
if ($mom_tst)
	readtoarray $mom $ports
	setvar $idx 1
	while ($idx <= $ports)
		setvar $ss $ports[$idx]
		getwordpos $ss $pos "Sector"
		if ($pos <> 0)
			getword $ss $sect 2
		end
		getwordpos $ss $pos "equ for"
		if (($pos <> 0) and ($sect <> 0))
			getword $ss $ss 13

			setvar $port[$sect] $ss
		end
		add $idx 1
	end
end

if (($port_max = 0) and ($game~port_max > 0))
	setvar $port_max $game~port_max
	savevar $port_max
end

if (($port_max = 0) and (($player~current_prompt = "Command") or ($player~current_prompt = "Citadel")))
	setvar $player~startinglocation $player~current_prompt
	gosub :game~gamestats
	loadvar $game~port_max
	if ($game~port_max > 0)
		setvar $port_max $game~port_max
		savevar $port_max
	end
end

if ($port_max = 0)
	setvar $switchboard~message "Unable To Determine Port Max From CFG File*"
	gosub :switchboard~switchboard
	halt
end

isnumber $tst $parm1
if ($tst = 0)
	setvar $parm1 $port_max
else
	if ($parm1 > $port_max)
		setvar $parm1 $port_max
	end
	if ($parm1 < 1)
		setvar $parm1 $port_max
	end
end

setvar $switchboard~message "GETNEAR "&$version&" - Searching For Ports BUYERS & SELLERS ...*"
gosub :switchboard~switchboard

getnearestwarps $lookup $player~current_sector
setvar $idx 1
while ($idx <= $lookup)
	setvar $focus $lookup[$idx]
	if (port.exists[$focus])
		if ((port.class[$focus] = 2) or (port.class[$focus] = 3) or (port.class[$focus] = 4) or (port.class[$focus] = 8))
			if (port.equip[$focus] >= $parm1)
				getsectorparameter $focus "FIGSEC" $fig
				if ($fig <> 0)
					getdistance $dist $player~current_sector $focus
					if ($dist = "-1")
						setvar $dist 0
					end
					if ($dist < 10)
						setvar $dist " "&$dist
					end
					add $b 1
					gosub :format
					if ($mom_tst)
						if ($port[$focus] <> 0)
							setvar $str $str&" "&$port[$focus]
						end
					end

					setvar $buyer[$b] $str
					add $cnt 1
				end
			end
		end
		if ((port.class[$focus] = 1) or (port.class[$focus] = 5) or (port.class[$focus] = 6) or (port.class[$focus] = 7))
			if (port.equip[$focus] >= $parm1)
				getsectorparameter $focus "FIGSEC" $fig
				if ($fig <> 0)
					getdistance $dist $player~current_sector $focus
					if ($dist = "-1")
						setvar $dist 0
					end
					if ($dist < 10)
						setvar $dist " "&$dist
					end
					add $s 1
					gosub :format

					if ($mom_tst)
						if ($port[$focus] <> 0)
							setvar $str $str&" "&$port[$focus]
						end
					end
					setvar $seller[$s] $str
					add $cnt 1
				end
			end
		end
	end
	if ($cnt >= 100)
		goto :_end_
	end
	add $idx 1
end

:_end_
setvar $idx 1
send "'*"
waiton "Type sub-space message"
send "{"&$bot_name&"} GETNEAREST CASHING PORT : "&$cnt&" Found >= "&$parm1&" units*"
getlength "{"&$bot_name&"}" $len
setvar $pad ""
setvar $i 1
while ($i <= $len)
	setvar $pad $pad&"-"
	add $i 1
end
send $pad&"-----------------------------------*"

if ($b <> 0)
	send "BUYERS*"
	while ($idx <= $b)
		send $buyer[$idx]&"*"
		add $idx 1
	end
end
send "    *"
if ($s <> 0)
	setvar $idx 1
	send "SELLERS*"
	while ($idx <= $s)
		send $seller[$idx]&"*"
		add $idx 1
	end
end
send "*"
waiton "Sub-space comm-link terminated"

halt

:format
setvar $num $focus
gosub :pad
setvar $str $pad&$focus&", "&$dist&" hops"
if (port.class[$focus] = 1)
	setvar $str $str&" BBS"
elseif (port.class[$focus] = 2)
	setvar $str $str&" BSB"
elseif (port.class[$focus] = 3)
	setvar $str $str&" SBB"
elseif (port.class[$focus] = 4)
	setvar $str $str&" SSB"
elseif (port.class[$focus] = 5)
	setvar $str $str&" SBS"
elseif (port.class[$focus] = 6)
	setvar $str $str&" BSS"
elseif (port.class[$focus] = 7)
	setvar $str $str&" SSS"
elseif (port.class[$focus] = 8)
	setvar $str $str&" BBB"

end
setvar $num port.fuel[$focus]
gosub :pad
setvar $str $str&" "&$pad&$num&" ("&port.percentfuel[$focus]&"%)"
if (port.percentfuel[$focus] < 10)
	setvar $str $str&"  "
elseif (port.percentfuel[$focus] < 100)
	setvar $str $str&" "
end

setvar $num port.org[$focus]
gosub :pad
setvar $str $str&$pad&$num&" ("&port.percentorg[$focus]&"%)"
if (port.percentorg[$focus] < 10)
	setvar $str $str&"  "
elseif (port.percentorg[$focus] < 100)
	setvar $str $str&" "
end

setvar $num port.equip[$focus]
gosub :pad
setvar $str $str&" "&$pad&$num&" ("&port.percentequip[$focus]&"%)"
return

# includes:
include "source\include\game"
include "source\include\switchboard.ts"
include "source\include\help"

:pad
setvar $pad ""
getlength $num $len
setvar $pad_i 1
while ($pad_i <= (5 - $len))
	setvar $pad $pad&" "
	add $pad_i 1
end
return
