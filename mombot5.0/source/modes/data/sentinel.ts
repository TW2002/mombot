# Copyright (C) 2005  Remco Mulder
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
#
# For source notes please refer to Notes.txt
# For license terms please refer to GPL.txt.
#
# These files should be stored in the root of the compression you
# received this source in.

#set values for starters
#if at dock/terra send info
#write

reqrecording
logging off
gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&" sentinel {cim} {clv} {cycletime}"
setvar $help~help[2] $help~tab&" Sentinel - Originally written by Xide"
setvar $help~help[3] $help~tab&" Options:"
setvar $help~help[4] $help~tab&"    - {cim}    - does cim hunting - Default off"
setvar $help~help[5] $help~tab&"    - {clv}    - checks clv for changes - Default off"
setvar $help~help[6] $help~tab&"    - {cycletime}    - How long between cycles; def 30secs"

gosub :help~helpfile

setvar $switchboard~message "Sentinel starting up!*"
gosub :switchboard~switchboard

# get defaults
#loadVar $SentinelSaved

setvar $sentinel_performcim 0
setvar $sentinel_performclv 1
setvar $sentinel_performonline 1
setvar $sentinel_broadcastss 1
setvar $sentinel_clvdetail 1
setvar $sentinel_clvcorp 0
setvar $sentinel_inactivity 0
setvar $sentinel_cycletime 30000
loadvar $bot~folder
setvar $sentinel_logfile $bot~folder&"/"&gamename & "_SENTINAL.txt"

if ($bot~parm1 = "")
	setvar $switchboard~message "Must at least select CLV*"
	gosub :switchboard~switchboard
	halt
end
if (($bot~parm1 = "cim") or ($bot~parm2 = "cim") or ($bot~parm3 = "cim"))
	setvar $sentinel_performcim 1
end
if (($bot~parm1 = "clv") or ($bot~parm2 = "clv") or ($bot~parm3 = "clv"))
	setvar $sentinel_performclv 1
end

setvar $cycleerror 0
isnumber $test $bot~parm1
if (($test) and ($bot~parm1 <> 0))
	if ($bot~parm1 > 5)
		setvar $sentinel_cycletime (1000 * $bot~parm1)
	else
		setvar $cycleerror 1
	end
end

isnumber $test $bot~parm2
if (($test) and ($bot~parm2 <> 0))
	if ($bot~parm2 > 5)
		setvar $sentinel_cycletime (1000 * $bot~parm2)
	else
		setvar $cycleerror 1
	end

end

isnumber $test $bot~parm3
if (($test) and ($bot~parm3 <> 0))

	if ($bot~parm3 > 5)
		setvar $sentinel_cycletime (1000 * $bot~parm3)
	else
		setvar $cycleerror 1
	end

end

if ($cycleerror = 1)
	setvar $switchboard~message "Cycle Time should be a number 5 or greater.*"
	gosub :switchboard~switchboard
	halt
end

setvar $s "Starting Sentinel with: "
if ($sentinel_performclv = 1)
	setvar $s $s & "CLV Check "
end
if ($sentinel_performcim = 1)
	setvar $s $s & "CIM Check "
end
setvar $d ($sentinel_cycletime/1000)
setvar $s $s & " Every "  & $d & " Seconds."

if (connected = 0)
	# jump to inactivity mode
	clientmessage "No connection detected - jumping to inactivity mode with last used settings"
	goto :inactivity
end

setvar $switchboard~message  $s & "*"
gosub :switchboard~switchboard

if ($sentinel_logfile = "")
	setvar $sentinel_logfile "0"
end

if ($sentinel_inactivity)

	:inactivityreset
	killtrigger cycledelay
	settextlinetrigger inactivity :inactivity "INACTIVITY WARNING"
	pause

	:inactivity
	getword currentline $test 1
	if ($test <> "INACTIVITY")
		goto :inactivityreset
	end

	settextouttrigger inactivitytextout :inactivitytextout
	goto :activate

	:inactivitytextout
	getouttext $text
	processout $text
	goto :inactivityreset
end

:activate
if ($sentinel_performclv)
	# check if we're at the command prompt or in a citadel
	getword currentline $test 1

	if ($test = "Command") or ($test = "Citadel")
		setvar $checkclvlogfile $sentinel_logfile
		setvar $checkclvbroadcast $sentinel_broadcastss
		setvar $checkclvdetail $sentinel_clvdetail
		setvar $checkclvfigcorp $sentinel_clvcorp
		send "clvq"
		gosub :checkclv
	end
end

if ($sentinel_performonline)
	setvar $checkonlinelogfile $sentinel_logfile
	setvar $checkonlinebroadcast $sentinel_broadcastss
	gosub :checkonline
end

if ($sentinel_performcim)
	setvar $checkcimlogfile $sentinel_logfile
	setvar $checkcimcimlogfile $bot~folder&"/"&gamename&"_SENTINAL_CIM.txt"
	setvar $checkcimcimtempfile $bot~folder&"/_"&gamename&"_SENTINAL_CIM.txt"
	setvar $checkcimbroadcast $sentinel_broadcastss
	gosub :checkcim
end

setdelaytrigger cycledelay :activate $sentinel_cycletime
pause

:sub_setmenu
if ($sentinel_performcim)
	setmenuvalue "PerformCIM" yes
else
	setmenuvalue "PerformCIM" no
end

if ($sentinel_performclv)
	setmenuvalue "PerformCLV" yes
else
	setmenuvalue "PerformCLV" no
end

if ($sentinel_performonline)
	setmenuvalue "PerformOnline" yes
else
	setmenuvalue "PerformOnline" no
end

if ($sentinel_broadcastss)
	setmenuvalue "BroadcastSS" yes
else
	setmenuvalue "BroadcastSS" no
end

if ($sentinel_clvdetail = 0)
	setmenuvalue "CLVDetail" low
elseif ($sentinel_clvdetail = 2)
	setmenuvalue "CLVDetail" medium
else
	setmenuvalue "CLVDetail" high
end

if ($sentinel_inactivity)
	setmenuvalue "Inactivity" on
else
	setmenuvalue "Inactivity" off
end

setmenuvalue "CLVCorp" $sentinel_clvcorp
setmenuvalue "LogFile" $sentinel_logfile
setmenuvalue "CycleTime" $sentinel_cycletime

return

# includes:
:checkclv
# sys_check

getdate $date
gettime $time
setvar $date $date & " "

if ($checkclvpod = "0")
	setvar $checkclvpod #42 & #42 & #42 & " Escape Pod " & #42 & #42 & #42
end

setvar $clvfigshit 0

settextlinetrigger clvbegincheck :clvbegincheck "--- ---------------------"
pause

:clvbegincheck
settextlinetrigger clvcheck :clvcheck
pause

:clvcheck
getlength currentline $clvlen

if ($clvlen >= 61)
	cuttext currentline $clvplyr 30 31

	# shave the spaces off the name
	setvar $clvplayer ""
	setvar $clvword 1

	:clvword
	getword $clvplyr $clvpword $clvword
	if ($clvpword <> 0)
		if ($clvword = 1)
			setvar $clvplayer $clvpword
		else
			setvar $clvplayer $clvplayer & " " & $clvpword
		end
		add $clvword 1
		goto :clvword
	end

	setvar $clvlrank[$clvplayer] $clvrank[$clvplayer]
	setvar $clvlalign[$clvplayer] $clvalign[$clvplayer]
	setvar $clvlcorp[$clvplayer] $clvcorp[$clvplayer]
	setvar $clvlship[$clvplayer] $clvship[$clvplayer]

	getword currentline $clvrank[$clvplayer] 2
	getword currentline $clvalign[$clvplayer] 3
	getword currentline $clvcorp[$clvplayer] 4
	cuttext currentline $clvship[$clvplayer] 61 999

	striptext $clvrank[$clvplayer] ","
	striptext $clvalign[$clvplayer] ","

	if ($clvcorp[$clvplayer] <> #42 & #42)
		add $clvcorpnum[$clvcorp[$clvplayer]] 1

		add $clvcorpbasealign[$clvcorp[$clvplayer]] $clvalign[$clvplayer]

		if ($clvcorp[$clvplayer] > $clvhighestcorp)
			setvar $clvhighestcorp $clvcorp[$clvplayer]
		end
	end

	setvar $clvrawname $clvplayer & "(" & $clvcorp[$clvplayer] & ")"

	if ($colour = "1")
		if ($clvalign[$clvplayer] < 0)
			setvar $clvclr #3 & "4" & $clvplayer & #3 & "6(" & $clvcorp[$clvplayer] & ")"
		else
			setvar $clvclr #3 & "12" & $clvplayer & #3 & "6(" & $clvcorp[$clvplayer] & ")"
		end
	else
		setvar $clvclr $clvrawname
	end

	if ($clvinit = 0)
		# first check pass, don't report - just save stuff
		setvar $clv[$clvcount] $clvplayer
		add $clvcount 1
	else
		# check pass - compare and report

		if ($clvship[$clvplayer] <> $clvlship[$clvplayer])
			# ship has changed
			if ($checkclvlogfile <> "0")
				write $checkclvlogfile $date & $time & " - CLV: " & $clvclr & " is now in " & $clvship[$clvplayer]
			end
			if ($checkclvbroadcast = "1")
				send "'CLV: " & $clvrawname & " is now in " & $clvship[$clvplayer] & "*"
			end
		end
		if ($clvcorp[$clvplayer] <> $clvlcorp[$clvplayer])
			# corp has changed
			if ($checkclvlogfile <> "0")
				write $checkclvlogfile $date & $time & " - CLV: " & $clvclr & " has jumped from corp " & $clvlcorp[$clvplayer]
			end
			if ($checkclvbroadcast = "1")
				send "'CLV: " & $clvrawname & " has jumped from corp " & $clvlcorp[$clvplayer] & "*"
			end
		end
		if ($clvrank[$clvplayer] <> $clvlrank[$clvplayer]) or ($clvalign[$clvplayer] <> $clvlalign[$clvplayer])
			if ($clvrank[$clvplayer] < $clvlrank[$clvplayer]) and ($clvlalign[$clvplayer] < "-100") and ($clvship[$clvplayer] <> "# Ship Destroyed #") and ($clvship[$clvplayer] <> $pod)
				# player busted
				if ($checkclvdetail = "1")
					if ($checkclvlogfile <> "0")
						write $checkclvlogfile $date & $time & " - CLV: " & $clvclr & " has busted"
					end
					if ($checkclvbroadcast = "1")
						send "'CLV: " & $clvrawname & " has busted" & "*"
					end
				end
			else
				setvar $clvcashing 0

				if ($clvrank[$clvplayer] > $clvlrank[$clvplayer]) and ($clvalign[$clvplayer] < $clvlalign[$clvplayer]) and ($clvlalign[$clvplayer] < "-100")
					setvar $clvrchange $clvrank[$clvplayer]
					subtract $clvrchange $clvlrank[$clvplayer]
					setvar $clvchange $clvalign[$clvplayer]
					subtract $clvchange $clvlalign[$clvplayer]

					# player is cashing
					setvar $clvcashing 1
					if ($checkclvdetail = "1")
						if ($checkclvlogfile <> "0")
							write $checkclvlogfile $date & $time & " - CLV: " & $clvclr & " is cashing (+" & $clvrchange & " xp, " & $clvchange & " algn)"
						end
						if ($checkclvbroadcast = "1")
							send "'CLV: " & $clvrawname & " is cashing (+" & $clvrchange & " xp, " & $clvchange & " algn)*"
						end
					end
				end

				if ($clvrank[$clvplayer] <> $clvlrank[$clvplayer]) and ($clvcashing = 0)
					# experience has changed
					setvar $clvchange $clvrank[$clvplayer]
					subtract $clvchange $clvlrank[$clvplayer]
					if (($checkclvdetail = "1") or (($checkclvdetail = "2") and (($clvchange >= "25") or ($clvchange <= "-25"))))
						if ($clvchange > 0)
							setvar $clvchange "+" & $clvchange
						end
						if ($checkclvlogfile <> "0")
							write $checkclvlogfile $date & $time & " - CLV: " & $clvclr & " has changed experience (" & $clvchange & ")"
						end
						if ($checkclvbroadcast = "1")
							send "'CLV: " & $clvrawname & " has changed experience (" & $clvchange & ")*"
						end
					end
				end
				if ($clvalign[$clvplayer] <> $clvlalign[$clvplayer]) and ($clvcashing = 0)
					# align has changed
					setvar $clvchange $clvalign[$clvplayer]
					subtract $clvchange $clvlalign[$clvplayer]

					setvar $clvfigcorp 0

					if ($checkclvfigcorp > 0) and ($clvcorpalign[$checkclvfigcorp] > 0)
						# find an alignment match with corp figs
						setvar $clvx $clvchange
						multiply $clvx 100
						divide $clvx $clvcorpalign[$checkclvfigcorp]
						setvar $clvz $clvx
						divide $clvz 100
						multiply $clvz 100
						subtract $clvx $clvz

						if ($clvx < 0)
							multiply $clvx "-1"
						end

						if (($clvx <= 1) or ($clvx >= 99)) and ((($clvcorpalign[6] < 0) and ($clvchange < 0)) or (($clvcorpalign[6] > 0) and ($clvchange > 0))) and ($clvz > 0)
							setvar $clvfigcorp 1
						end
					end

					if ($clvfigcorp = 0)
						if (($checkclvdetail = "1") or (($checkclvdetail = "2") and (($clvchange >= "25") or ($clvchange <= "-25"))))
							if ($clvchange > 0)
								setvar $clvchange "+" & $clvchange
							end

							if ($checkclvlogfile <> "0")
								write $checkclvlogfile $date & $time & " - CLV: " & $clvclr & " has shifted alignment (" & $clvchange & ")"
							end
							if ($checkclvbroadcast = "1")
								send "'CLV: " & $clvrawname & " has shifted alignment (" & $clvchange & ")*"
							end
						end
					else
						setvar $figshit 1

						if ($clvchange > 0)
							setvar $clvchange "+" & $clvchange
						end

						if ($checkclvlogfile <> "0")
							write $checkclvlogfile $date & $time & " - CLV: " & $clvclr & " may be shooting our figs (" & $clvchange & " align)"
						end
						if ($checkclvbroadcast = "1")
							send "'CLV: " & $clvrawname & " may be shooting corp " & $checkclvfigcorp & " figs (" & $clvchange & " align)"
						end
					end
				end
			end
		end
	end
else
	getword currentline $clvtest 1
	if ($clvtest = "==--") or ($clvtest = "Computer")
		setvar $clvcorp $clvhighestcorp

		:clvnextcorp
		if ($clvcorp > 0)
			if ($clvcorpnum[$clvcorp] > 0)
				divide $clvcorpbasealign[$clvcorp] $clvcorpnum[$clvcorp]
				setvar $clvcorpalign[$clvcorp] $clvcorpbasealign[$clvcorp]
				divide $clvcorpalign[$clvcorp] 10000
				multiply $clvcorpalign[$clvcorp] "-1"
				setvar $clvcorpbasealign[$clvcorp] 0
				setvar $clvcorpnum[$clvcorp] 0
			end
			subtract $clvcorp 1
			goto :clvnextcorp
		end

		setvar $clvinit 1
		return
	end
end

goto :clvbegincheck

# SUB:       ClearData
# Purpose:   Clears all CLV data for a clean re-check
:cleardata
# sys_check

setvar $count 1

:next
if ($lastplayer[$count] <> 0)
	setvar $lastplayer[$count] 0
	add $count 1
	goto :next
end
return

# Copyright (C) 2005  Remco Mulder
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
#
# For source notes please refer to Notes.txt
# For license terms please refer to GPL.txt.
#
# These files should be stored in the root of the compression you
# received this source in.

# SUB:       CheckOnline (template)
# Passed:    $CheckOnlineLogFile - Name of file to log changes to ("0" for no logging)
#            $CheckOnlineBroadcast - "1" to broadcast changes on sub-space
#            $CheckOnlineInit - "0" if CheckOnline subroutine has not been run, or is to be cleared
# Triggered: Anywhere the "#" global will work
:checkonline
# sys_check

send "#"
settextlinetrigger pause5 :pause5 "     Who's Playing     "
pause

:pause5
killtrigger checkfailed
setvar $count 1
settextlinetrigger getplayer :getplayer
pause

:getplayer
if (currentline = "")
	if ($count = 1)
		settextlinetrigger getplayer :getplayer
		pause
	else
		goto :gotplayers
	end
end

setvar $striprankplayer currentline
gosub :striprank

setvar $stripcorpplayer $striprankplayer
gosub :stripcorp

setvar $player $stripcorpplayer

# see if the player exists
setvar $i 1
setvar $found 0

:nextplayer
if ($lastplayers[$i] <> 0)
	if ($lastplayers[$i] = $player)
		setvar $found 1
	end
	add $i 1
	goto :nextplayer
end

if ($found = 0) and ($checkonlineinit = 1)
	getdate $date
	gettime $time

	if ($checkonlinebroadcast = "1")
		send "'ONLINEUPDATE: " $player " has entered the game*"
	end
	if ($checkonlinelogfile <> "0")
		write $checkonlinelogfile $date & " " & $time & " - " & "#: " & $player & " has entered the game"
	end
end

setvar $players[$count] $player
add $count 1
settextlinetrigger getplayer :getplayer
pause

:gotplayers
setvar $players[$count] 0

# check for missing players
setvar $count 1

:checknextplayer
if ($lastplayers[$count] <> 0)
	setvar $i 1
	setvar $found 0

	:checknextplayer2
	if ($players[$i] <> 0)
		if ($players[$i] = $lastplayers[$count])
			setvar $found 1
		end
		add $i 1
		goto :checknextplayer2
	end

	if ($found = 0)
		getdate $date
		gettime $time

		if ($checkonlinebroadcast = "1")
			send "'ONLINEUPDATE: " $lastplayers[$count] " has left the game*"
		end
		if ($checkonlinelogfile <> "0")
			write $checkonlinelogfile $date & " " & $time & " - " & "#: " & $lastplayers[$count] & " has left the game"
		end
	end

	add $count 1
	goto :checknextplayer
end

# copy old new list over old one
setvar $count 1

:getnextplayer
if ($players[$count] <> 0)
	setvar $lastplayers[$count] $players[$count]
	add $count 1
	goto :getnextplayer
end

setvar $lastplayers[$count] 0
setvar $checkonlineinit 1
return

:striprank
# sys_check

cuttext $striprankplayer $rank 1 6
if ($rank = "Robber")
	cuttext $striprankplayer $striprankplayer 8 999
	return
end
if ($rank = "Pirate")
	cuttext $striprankplayer $striprankplayer 8 999
	return
end
if ($rank = "Ensign")
	cuttext $striprankplayer $striprankplayer 8 999
	return
end

cuttext $striprankplayer $rank 1 7
if ($rank = "Captain")
	cuttext $striprankplayer $striprankplayer 9 999
	return
end
if ($rank = "Admiral")
	cuttext $striprankplayer $striprankplayer 9 999
	return
end

cuttext $striprankplayer $rank 1 8
if ($rank = "Civilian")
	cuttext $striprankplayer $striprankplayer 10 999
	return
end
if ($rank = "Corporal")
	cuttext $striprankplayer $striprankplayer 10 999
	return
end

cuttext $striprankplayer $rank 1 9
if ($rank = "Annoyance")
	cuttext $striprankplayer $striprankplayer 11 999
	return
end
cuttext $striprankplayer $rank 1 9
if ($rank = "Terrorist")
	cuttext $striprankplayer $striprankplayer 11 999
	return
end
if ($rank = "Commander")
	cuttext $striprankplayer $striprankplayer 11 999
	return
end
if ($rank = "Commodore")
	cuttext $striprankplayer $striprankplayer 11 999
	return
end

cuttext $striprankplayer $rank 1 10
if ($rank = "Prime Evil")
	cuttext $striprankplayer $striprankplayer 12 999
	return
end

cuttext $striprankplayer $rank 1 12
if ($rank = "1st Sergeant")
	cuttext $striprankplayer $striprankplayer 14 999
	return
end
if ($rank = "Rear Admiral")
	cuttext $striprankplayer $striprankplayer 14 999
	return
end
if ($rank = "Vice Admiral")
	cuttext $striprankplayer $striprankplayer 14 999
	return
end
if ($rank = "Dread Pirate")
	cuttext $striprankplayer $striprankplayer 14 999
	return
end

cuttext $striprankplayer $rank 1 13
if ($rank = "Fleet Admiral")
	cuttext $striprankplayer $striprankplayer 15 999
	return
end

cuttext $striprankplayer $rank 1 14
if ($rank = "Lance Corporal")
	cuttext $striprankplayer $striprankplayer 16 999
	return
end
if ($rank = "Sergeant Major")
	cuttext $striprankplayer $striprankplayer 16 999
	return
end
if ($rank = "Staff Sergeant")
	cuttext $striprankplayer $striprankplayer 16 999
	return
end

cuttext $striprankplayer $rank 1 15
if ($rank = "Warrant Officer")
	cuttext $striprankplayer $striprankplayer 17 999
	return
end
if ($rank = "Lieutenant J.G.")
	cuttext $striprankplayer $striprankplayer 17 999
	return
end
if ($rank = "Smuggler Savant")
	cuttext $striprankplayer $striprankplayer 17 999
	return
end
if ($rank = "Infamous Pirate")
	cuttext $striprankplayer $striprankplayer 17 999
	return
end

cuttext $striprankplayer $rank 1 16
if ($rank = "Gunnery Sergeant")
	cuttext $striprankplayer $striprankplayer 18 999
	return
end
if ($rank = "Menace 3rd Class")
	cuttext $striprankplayer $striprankplayer 18 999
	return
end
if ($rank = "Menace 2nd Class")
	cuttext $striprankplayer $striprankplayer 18 999
	return
end
if ($rank = "Menace 1st Class")
	cuttext $striprankplayer $striprankplayer 18 999
	return
end
if ($rank = "Notorious Pirate")
	cuttext $striprankplayer $striprankplayer 18 999
	return
end
if ($rank = "Galactic Scourge")
	cuttext $striprankplayer $striprankplayer 18 999
	return
end
if ($rank = "Heinous Overlord")
	cuttext $striprankplayer $striprankplayer 18 999
	return
end

cuttext $striprankplayer $rank 1 17
if ($rank = "Private 1st Class")
	cuttext $striprankplayer $striprankplayer 19 999
	return
end

cuttext $striprankplayer $rank 1 18
if ($rank = "Nuisance 3rd Class")
	cuttext $striprankplayer $striprankplayer 20 999
	return
end
if ($rank = "Nuisance 2nd Class")
	cuttext $striprankplayer $striprankplayer 20 999
	return
end
if ($rank = "Nuisance 1st Class")
	cuttext $striprankplayer $striprankplayer 20 999
	return
end
if ($rank = "Smuggler 3rd Class")
	cuttext $striprankplayer $striprankplayer 20 999
	return
end
if ($rank = "Smuggler 2nd Class")
	cuttext $striprankplayer $striprankplayer 20 999
	return
end
if ($rank = "Smuggler 1st Class")
	cuttext $striprankplayer $striprankplayer 20 999
	return
end
if ($rank = "Enemy of the State")
	cuttext $striprankplayer $striprankplayer 20 999
	return
end
if ($rank = "Enemy of Humankind")
	cuttext $striprankplayer $striprankplayer 20 999
	return
end

cuttext $striprankplayer $rank 1 19
if ($rank = "Enemy of the People")
	cuttext $striprankplayer $striprankplayer 21 999
	return
end

cuttext $striprankplayer $rank 1 20
if ($rank = "Lieutenant Commander")
	cuttext $striprankplayer $striprankplayer 22 999
	return
end

cuttext $striprankplayer $rank 1 21
if ($rank = "Chief Warrant Officer")
	cuttext $striprankplayer $striprankplayer 23 999
	return
end

cuttext $striprankplayer $rank 1 7
if ($rank = "Private")
	cuttext $striprankplayer $striprankplayer 9 999
	return
end
cuttext $striprankplayer $rank 1 8
if ($rank = "Sergeant")
	cuttext $striprankplayer $striprankplayer 10 999
	return
end
cuttext $striprankplayer $rank 1 10
if ($rank = "Lieutenant")
	cuttext $striprankplayer $striprankplayer 12 999
	return
end

return

:stripcorp
# sys_check

getlength $striprankplayer $len

if ($len < 3)
	return
end

cuttext $striprankplayer $player~corpdata $len 1

if ($player~corpdata = "]")
	subtract $len 3
	cuttext $striprankplayer $player~corpdata $len 99
	getword $player~corpdata $player~corpdata 1
	striptext $striprankplayer " " & $player~corpdata
	striptext $player~corpdata "["
	striptext $player~corpdata "]"
end

return

# Copyright (C) 2005  Remco Mulder
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
#
# For source notes please refer to Notes.txt
# For license terms please refer to GPL.txt.
#
# These files should be stored in the root of the compression you
# received this source in.

# SUB:       CheckCIM
# Passed:    $CheckCIMLogFile - Name of file to log changes to ("0" for no logging)
#            $CheckCIMCIMLogFile - Name of file to write CIM to
#            $CheckCIMBroadcast - "1" to broadcast changes on sub-space
#            $Init - "0" if first check
# Triggered: Anywhere the "^" global will work
# Returned:  $FoundChange - "1" if change found
:checkcim
# sys_check

send "^rq"
setvar $i 1
setvar $foundchange 0

:redopause
settexttrigger pause2 :pause2 ": "
pause

:pause2
getword currentline $test 1
if ($test <> ":")
	goto :redopause
end
settextlinetrigger saveport :saveport "%"
pause

:saveport
setvar $line currentline
striptext $line "-"
striptext $line "%"
getword $line $sector 1
getword $line $product1 3
getword $line $product2 5
getword $line $product3 7
setvar $line $sector & " " & $product1 & " " & $product2 & " " & $product3
write $checkcimcimlogfile $line
getdate $date
gettime $time

if ($init = 1)
	read $checkcimcimtempfile $oldport $i
	getword $oldport $oldsector 1
	getword $oldport $oldproduct1 2
	getword $oldport $oldproduct2 3
	getword $oldport $oldproduct3 4
	setvar $line ""

	setvar $repsector $sector

	if ($oldsector <> $sector) and ($oldsector <> "EOF")
		# someones dropped or picked up a fig
		setvar $sound 1
		if ($oldsector > $sector)
			# someone picked up a fig
			setvar $line "CIM: Port query opened to " & $sector
			setvar $foundchange 1
			subtract $i 1
		else
			# someone put down a fig
			setvar $line "CIM: Port query closed to " & $oldsector
			setvar $repsector $oldsector
			setvar $foundchange 1
			add $i 1
		end

		goto :add
	end

	if ($product1 < $oldproduct1)
		setvar $line "CIM: Fuel ore reduced from " & $oldproduct1 & " to " & $product1 & " in " & $sector
		setvar $sound 1
	end
	if ($product2 < $oldproduct2)
		setvar $line "CIM: Organics reduced from " & $oldproduct2 & " to " & $product2 & " in " & $sector
		setvar $sound 1
	end
	if ($product3 < $oldproduct3)
		setvar $line "CIM: Equipment reduced from " & $oldproduct3 & " to " & $product3 & " in " & $sector
		setvar $sound 1
	end

	:add
	if ($line <> "")
		if (port.buyfuel[$repsector])
			setvar $line $line & " (B"
		else
			setvar $line $line & " (S"
		end

		if (port.buyorg[$repsector])
			setvar $line $line & "B"
		else
			setvar $line $line & "S"
		end

		if (port.buyequip[$repsector])
			setvar $line $line & "B)"
		else
			setvar $line $line & "S)"
		end

		if ($checkcimbroadcast = "1")
			send "'" $line "*"
		end
		if ($checkcimlogfile <> "0")
			write $checkcimlogfile $date & " " & $time & " - " & $line
		end

		setvar $foundchange 1
	end

	add $i 1
end

killtrigger portssaved
settextlinetrigger saveport :saveport "%"
settexttrigger portssaved :portssaved ": "
pause

:portssaved
killtrigger checkfailed
killtrigger saveport

if ($sound = 1)
	sound baseuse.wav
end

setvar $init 1
setvar $sound 0
delete $checkcimcimtempfile
rename $checkcimcimlogfile $checkcimcimtempfile
return

# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
