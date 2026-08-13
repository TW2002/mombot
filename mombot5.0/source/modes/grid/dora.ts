# We can go down one ways when sectors have 2 or more warps - this could potenially get us stuck
#   do we want an option to not have this occur?
#
#   Currently not doing port reports
#	Faind good ports, then do report?
#
#   MCIC - surround good ports?
#   - Request move - when figs between 40 and 20, onc at SXX port, request figs

#   TWarp - Ore Management - not an issue just not put in yet
#     - Do we cart ore around or get stuck, find nearest ore, warp elsehere?
#     - i.e. hard to be both trader + twarp gridder
#   Known Issues
#
#    - We aren't doing port reports, so trading poor sectors at least once. In theory da 1 script
#   - When just testing MCIC - Looks like when it holos, finds a PPT, it then skips the test mcic
#
#     - normal move through one way - did the m to no where, at 12 -

gosub :loadvars~loadvars
gosub :help~initialize

loadvar $game~port_max
loadvar $game~ptradesetting
loadvar $game~max_planets_in_game
loadvar $bot~folder
loadvar $player~surroundfigs
loadvar $player~surroundlimp;
loadvar $player~surroundmine
loadvar $map~stardock
loadvar $bot~limp_file
loadvar $bot~armid_file
loadvar $bot~bot_name

# ORE

setvar $help~help[1]  $help~tab&" Dora the Explorer"
setvar $help~help[2]  $help~tab&" Expores universe, no ZTM required, optional trades."
setvar $help~help[3]  $help~tab&" "
setvar $help~help[4]  $help~tab&" dora [turnsstop] {all/org/buys/none} {ports/warps} "
setvar $help~help[5]  $help~tab&"                    {mcicsell/mcicbuy/mcicboth}"
setvar $help~help[6]  $help~tab&" - [turnsstop] - Will stop exploring once we reach these turns."
setvar $help~help[7]  $help~tab&" - {all}       - All fuel<>equip org<>equip options"
setvar $help~help[8]  $help~tab&" - {org}       - All org<>equip options"
setvar $help~help[9]  $help~tab&" - {buys}      - BSB<>BSB combos"
setvar $help~help[10]  $help~tab&" - {none}      - No trading"
setvar $help~help[11]  $help~tab&"               When any trades applied, script will trade any port"
setvar $help~help[12]  $help~tab&"               it passes where it can sell a full load."
setvar $help~help[13]  $help~tab&" "
setvar $help~help[14]  $help~tab&" - {ports}     - Priortises gridding ports"
setvar $help~help[15]  $help~tab&" - {warps}     - Priortises gridding high warp density"
setvar $help~help[16]  $help~tab&" "
setvar $help~help[17]  $help~tab&" - {mcicsell}  - Test XXS ports for MCIC "
setvar $help~help[18]  $help~tab&" - {mcicbuy}   - Test XXB ports for MCIC "
setvar $help~help[19]  $help~tab&" - {mcicboth}  - Test all ports for MCIC "
setvar $help~help[20]  $help~tab&" "
setvar $help~help[21]  $help~tab&" - {deldata }  Deletes explored sectors "

gosub :help~helpfile

setvar $switchboard~message "Hola - Lets take a looksie! starting up!*"
gosub :switchboard~switchboard

gosub :player~quikstats
setvar $startcredits $player~credits
setvar $startturns $player~turns
setvar $unlimitedgame false
if (($player~unlimitedgame = true) or (unlimitedgame = true))
	setvar $unlimitedgame true
end

setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Command")
	setvar $switchboard~message "must be started from Command prompt.*"
	gosub :switchboard~switchboard
	halt
end

if (($player~twarp_type = 1) or ($player~twarp_type = 2))
	setvar $movetwarp 1
end

if ($player~fighters < 21)
	setvar $switchboard~message "Dora - Need more than 20 figs!*"
	gosub :switchboard~switchboard
	halt
end

setvar $stardock $map~stardock
if ($stardock = 0)
	send "v"
	settextlinetrigger getbackdockcrazy :getbackdockcrazy "The StarDock is located in sector"
	pause

	:getbackdockcrazy
	killalltriggers
	getword currentline $stardock 7
	striptext $stardock "."
end
# FUTURE VARS
# Limps/Mines bot vars
setvar $restock 0
# Figs - Mines - Limps - maybe even figs called in?
setvar $callinfigs 0

setvar $cashpause 0

setvar $halt_turns $bot~parm1
if ($unlimitedgame = true)
	setvar $halt_turns 0
	setvar $switchboard~message "Unlimited game detected - skipping turn limit checks.*"
	gosub :switchboard~switchboard
else
	isnumber $number $halt_turns

	if ($number <> 1)
		setvar $switchboard~message "Please select what turns to halt at.*"
		gosub :switchboard~switchboard
		halt

	end

	if ($halt_turns <= 0)
		setvar $switchboard~message "Halt turns must be greater than 0.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $switchboard~message "We will stop when we reach " & $halt_turns & " turns.*"
		gosub :switchboard~switchboard
	end
end

getwordpos $bot~user_command_line $pos "deldata"
if ($pos > 0)
	setvar $deletedata true
else
	setvar $deletedata false
end

# pair trading options - ppt
#  "all" all pairs
#  "org" all Org-Equ
#  "buys" org - equip not selling ore
#  "none"  skip this step
setvar $ppttradingoption "buys"
setvar $singletrades 1

# grid prority
#  "ports" SBS SSB ports  - I think this doesn't work because we end up with not enough buys!
#  "warps" - default - grid best option for exploring
setvar $gridpriority "ports"

# use the 'Trade' command to testMCIC and generall trade

# Trade every port where MCIC is needed OR have a viable trade for cash
#     Actually many options here
#      - Trading for cash
#      - MCIC Buys - i.e. none megarob options
#      - MCIC All - when wanting XXS ports for mega robs
#       - combo of them
#     Just making three options
#  just looking at mcic ports - all B S

setvar $testmcicsell 0
setvar $testmcicbuy 0

getwordpos $bot~user_command_line $pos "mcicsell"
if ($pos > 0)
	setvar $testmcicsell 1
	setvar $testmcicbuy 0
	setvar $msg $msg&"Testing MCIC XXS Ports only*"
	striptext $bot~user_command_line "mcicsell"

end

getwordpos $bot~user_command_line $pos "mcicbuy"
if ($pos > 0)
	setvar $testmcicbuy 1
	setvar $testmcicsell 0
	setvar $msg $msg&"Testing MCIC XXB Ports only*"
	striptext $bot~user_command_line "mcicbuy"
end

getwordpos $bot~user_command_line $pos "mcicboth"
if ($pos > 0)
	setvar $testmcicbuy 1
	setvar $testmcicsell 1
	setvar $msg $msg&"Testing MCIC XXS and XXB Ports*"
	striptext $bot~user_command_line "mcicboth"
end

getwordpos $bot~user_command_line $pos "all"
if ($pos > 0)
	setvar $ppttradingoption "all"
	setvar $msg $msg&"Trading All Pairs*"
else
	getwordpos $bot~user_command_line $pos "org"
	if ($pos > 0)
		setvar $ppttradingoption "org"
		setvar $msg $msg&"Trading Organic - Equipment Ports*"
	else
		getwordpos $bot~user_command_line $pos "buys"
		if ($pos > 0)
			setvar $ppttradingoption "buys"
			setvar $msg $msg&"Trading Org - Equip at BXXs only"
		else
			getwordpos $bot~user_command_line $pos "none"
			if ($pos > 0)
				setvar $ppttradingoption "none"
				setvar $msg $msg&"We are not trading at ports*"
				setvar $singletrades 0
			end
		end
	end
end

setvar $msg $msg&"Prioritising sectors with SBS or SSB ports*"
getwordpos $bot~user_command_line $pos "ports"
if ($pos > 0)
	setvar $gridpriority "ports"
	setvar $msg $msg&"Prioritising sectors with SBS or SSB ports*"
else
	getwordpos $bot~user_command_line $pos "warps"
	if ($pos > 0)
		setvar $gridpriority "warps"
		setvar $msg $msg&"Prioritising sectors with best gridding option*"
	end
end

setvar $switchboard~message $msg
gosub :switchboard~switchboard

setvar $alllimps 0
setvar $allarmids 0

fileexists $limpchk $bot~limp_file
if ($limpchk = false)
	setvar $bot~command "update"
	setvar $bot~user_command_line "update"
	setvar $bot~parm1 "update"

	savevar $bot~parm1

	savevar $bot~command
	savevar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\commands\data\update.cts"
	seteventtrigger        limpchkend        :limpchkend "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\data\update.cts"
	pause

	:limpchkend
	killalltriggers
	readtoarray $bot~limp_file $alllimps
else
	readtoarray $bot~limp_file $alllimps
end

setvar $stat_turnsused 0
setvar $stat_figsdown 0
setvar $stat_moves 0
setvar $stat_trades 0
setvar $stat_refurbs 0

setvar $stat_dollarsppt 0
setvar $stat_dollarsnet 0
setvar $stat_dollarstrade 0

window dora 300 300 "Explore and Trade"

setvar $stuff "Turns: " & $stat_turnsused & "*Figs Down: " & $stat_figsdown & "*Ports Traded: " & $stat_trades & "*Moves Made: " & $stat_moves & "**Gross Cash:" & $stat_dollarsppt & "**Net Cash:" & $stat_dollarsnet
setvar $stuff $stuff & "**Refurbs: " & $stat_refurbs
setwindowcontents dora $stuff

#logging off
#reqRecording

loadvar $bot~folder
setvar $doraexploredfile $bot~folder&"/dora_explored_" &  gamename  & ".txt"
# Good POrts - tehse are those we can come back and explore - if we have twarp
# if we don't, we'll just grid them as we go
setvar $dangeroussectorlogfile $bot~folder&"/Grid_Warnings_" &  gamename & "_" & $date & ".txt"

setarray $explored sectors

# This will be my stack for storing back out
#   when we hit a dead end, we work back looking for another option.
#
#		    Max Sectors we'll keep in path back
setvar $maxpathback 25
setarray $pathback $maxpathback
setvar $pathbacki 0
# Before going back, check we are not locked in.
setarray $pathbackhasoptions $maxpathback

# Store this from warp data rather than the density scan.
setarray $warpcount sectors

setvar $futuredestsadded 0
setvar $futureportsadded 0

fileexists $figlchk $doraexploredfile
if ($figlchk = 1)

	if ($deletedata = true)
		echo "*###########"
		echo "*# DELETED #"
		echo "*###########"
		setvar $switchboard~message "Deleting Previous Data.*"
		gosub :switchboard~switchboard
		delete $doraexploredfile
	else
		if ($figlchk = 1)

			readtoarray $doraexploredfile $voidslist
			setvar $i 1
			while ($i <= $voidslist)
				setvar $explored[$voidslist[$i]] 1
				#echo "* adding: " $voidsList[$i]
				add $i 1
			end
		end
	end
end

# Block Tunnel Bubble Doors
setvar $i 11
while ($i <= sectors)

	getsectorparameter $i "BUBBLEDOOR" $blocksec
	isnumber $test $blocksec
	if ($test = 1)
		if ($blocksec > 0)
			setvar $explored[$i] 1
			echo "Blocking Bubble Door: " $i "*"
		end
	end

	getsectorparameter $i "TUNNELDOOR" $blocksec
	isnumber $test $blocksec
	if ($test = 1)
		if ($blocksec > 0)
			setvar $explored[$i] 1
			echo "Blocking Tunnel Door: " $i "*"
		end
	end

	add $i 1
end

setvar $switchboard~message "Pause for effect....*"
gosub :switchboard~switchboard

setdelaytrigger delay :startpause 3000
pause

:startpause
setvar $switchboard~message "... and we are off!*"
gosub :switchboard~switchboard

gosub :player~quikstats

gosub :setvoidsectors

######################### MAIN LOOP
# Log Explored sectors so script can re-start

setvar $skipport 0
setvar $isayso 1
while ($isayso)

	:topofthegridloop
	setvar $freshsectors 0
	setvar $freshsectorsi 0
	setvar $freshsectorsnewports 0

	gosub :player~quikstats
	setvar $turnsnow $player~turns

	if ($cashpause = 1)
		if (port.exists[currentsector] = true)
			if (port.buyfuel[currentsector] = false)
				send "'[atm:" $switchboard~bot_name "=" currentsector "]*"
				waitfor "[atmdone]"
				send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
				setvar $cashpause 0
			end
		end
	end
	if (($unlimitedgame <> true) and ($turnsnow < $halt_turns))
		setvar $switchboard~message "Turn Limit Reached*"
		gosub :switchboard~switchboard
		clearallavoids
		gosub :subreport
		halt
	end
	if (($player~fighters < 21) and ($ice = 0))
		setvar $switchboard~message "Need more than 20 figs*"
		gosub :switchboard~switchboard
		clearallavoids
		gosub :subreport
		halt
	end
	gosub :updatestats

	setvar $doneholo 0
	#densityscan and store
	gosub :densityscan

	# check Trades
	if ((($ppttradingoption <> "none") or ($testmcicsell = 1) or ($testmcicbuy = 1)) and (port.exists[$player~current_sector]) and ($skipnexttrade = 0))
		if ($freshsectorsnewports > 0)
			gosub :holoscan
			setvar $doneholo 1
			#check warps (maybe reports?)
			gosub :updatefreshsectors
		end
		# check trade needs to use $pptTradingOption and return back here once done.
		# Check trade can also do $testMcic trade
		# do the trade also
		setvar $originsector $player~current_sector
		gosub :checktrade
		if ($originsector <> $player~current_sector)

			# Ok finished in other sector, lets push the previous onto the stack and go from here
			# Lets count if it had any neighbouring safe sectors, excluding ourselves!

			setvar $i 1
			setvar $safesectors 0
			while ($i <= $deni)

				setvar $danger 0
				setvar $dsector $nsector[$i]
				setvar $dindex $i
				getsectorparameter $dsector "FIGSEC" $hasfig
				if ($hasfig = "")
					setvar $hasfig 0
				end
				gosub :checkdanger

				if (($danger = 0) and ($explored[$dsector] = 0))
					if (($hasfig = 0) and ($dsector <> $player~current_sector))
						add $safesectors 1

					end
				end
				add $i 1
			end
			setvar $explored[$originsector] 1
			write $doraexploredfile $originsector
			setvar $stacksector $originsector
			gosub :pushpath
			# We've traded this sector, so we just want to go on to next one
			setvar $skipnexttrade 1
			goto :topofthegridloop
		end

	end
	setvar $skipnexttrade 0
	# Check ATM

	if ($cashpause = 1)
		if (port.exists[currentsector] = true)
			if (port.buyfuel[currentsector] = false)
				send "'[atm:" $switchboard~bot_name "=" currentsector "]*"
				waitfor "[atmdone]"
				send "'[atm]Spend it wisely, I'm out here risking my hide for peanuts!*"
				setvar $cashpause 0
			end
		end
	end

	# Trading Done

	if (($freshsectorsnewports > 0) and ($doneholo = 0))
		gosub :holoscan
		gosub :updatefreshsectors
	end

	gosub :getnextwarp
	if ($bestsector = 0)
		# We had to reposition and therefor not moving
		# need to rescan and move
		setvar $skipnexttrade 1
		goto :topofthegridloop
	end

	# Log These like ftr grid and reload to not duplicate
	setvar $explored[$player~current_sector] 1
	write $doraexploredfile $player~current_sector

	if ($gridsectorposttwarp > 0)
		# means we got something from previous options

		setvar $player~warpto $gridsector
		gosub :move~twarp
		add $stat_moves 1

		setvar $gridsectorposttwarp 0
		# Need to skip trading at next port as it'll be used
		# saves wasing time re checking
		setvar $skipport 1

	else
		gosub :gridnextsector
	end

end
######################### END LOOP
clearallavoids
halt

:updatefreshsectors
# just get all ports and single sectors plots back
# this is to make sure we don't go down a 1 way whether navigating or ppt

setvar $i 1
while ($i <= $deni)
	# only get warps of target ports
	setvar $cl port.class[$nsector[$i]]
	# only get paths of singles when no ppt'ing
	if (($ppttradingoption <> "none") or (($gridpriority = "ports") and (($cl = 4) or ($cl = 5) or ((($cl = 2) or ($cl = 1)) and ($nwarps[$i] > 2)))))
		if ((($nwarps[$i] = 1) and ($nnew[$i] = 1)) or (($ndensity[$i] = 100) and ($nnew[$i] = 1)))
			send "cf" $nsector[$i] "*" $player~current_sector "*q"
			waitfor "omputer deactivated"
		end
	else
		# Unsure if I want to test 1 ways..
		if (($nwarps[$i] = 1) and ($nnew[$i] = 1))
			#send "cf" $nSector[$i] "*" $PLAYER~CURRENT_SECTOR "*q"
			#waitfor "omputer deactivated"
		end
	end
	add $i 1
end
return

:getnextwarp
# COLLECT DATA - Some used in one routine and not the other
setvar $i 1
setvar $safesectors 0
setvar $safes 0
setvar $numsells 0
setvar $sells 0
setvar $numbuys 0
setvar $buys 0
setvar $bestsector 0

while ($i <= $deni)

	setvar $danger 0
	setvar $dsector $nsector[$i]
	setvar $dindex $i
	setvar $class port.class[$dsector]
	getsectorparameter $dsector "FIGSEC" $hasfig
	if ($hasfig = "")
		setvar $hasfig 0
	end
	gosub :checkdanger
	#echo "$danger:" $danger " $explored[$dSector]:" $explored[$dSector] " $class:" $class " $hasFig:" $hasFig "*"
	if (($danger = 0) and ($explored[$dsector] = 0))

		if ((($class = 4) or ($class = 5)) and ($hasfig = 0))
			#echo "Found NumSells*"
			add $numsells 1
			setvar $sells[$numsells] $dsector
		end

		# we'll store buys with 4+ as th next option they are twice as prevlant as Sxx's, so it'll work out even
		if ((($class = 1) or ($class = 2)) and ($hasfig = 0) and ($warpcount[$dsector] > 2))
			add $numbuys 1
			setvar $buys[$numbuys] $dsector
		end
		if (($hasfig = 0) or ($hasfig = ""))
			add $safesectors 1
			setvar $safes[$safesectors] $dsector
		end
	end
	add $i 1
end

# Chanse sell ports
if ($gridpriority = "ports")

	if ($numsells > 0)
		setvar $chkoptioni $numsells
		setvar $chkoption 0
		setvar $i 1
		while ($i <= $numsells)
			setvar $chkoption[$i] $sells[$i]
			add $i 1
		end

		gosub :getbestsectorfromlist
		if ($newoptions > 1)
			gosub :gogridotheroptions
		end
	end

	setvar $chkoptioni $numbuys
	setvar $chkoption 0
	setvar $i 1
	while ($i <= $numbuys)
		setvar $chkoption[$i] $buys[$i]
		add $i 1
	end

	if ($bestsector = 0)
		# we don't have a SELL ore pair, lets get a Buy Ore Pair port

		gosub :getbestsectorfromlist
		if ($newoptions > 1)
			gosub :gogridotheroptions
		end
	else
		# going to grid the buys now anyway - may remove this later
		# just testing ot see if we can increase number of trades post
		# - taking note, we are using the best sector routine to sort these
		# so need to save and restore
		setvar $temp_$bestsector $bestsector
		gosub :getbestsectorfromlist
		#restore it, and grid them all
		setvar $bestsector $temp_$bestsector
		if ($newoptions > 0)
			gosub :gogridotheroptions
		end

	end
	if ($bestsector = 0)
		# found no ports we wanted, lets just go best warps
		gosub :getbestwarps
	end

else
	gosub :getbestwarps
end

if ($bestsector = 0)

	gosub :checkoptions
	if ($safeoptionsback = 0)
		setvar $switchboard~message "Currently No safe path back - if have TWARP then we could move else where using DB *"
		gosub :switchboard~switchboard
		halt
	else

		setvar $chksec $player~current_sector
		setvar $adjsec $safeoptionsbackdirect
		gosub :checkadj
		if (($movetwarp = 1) and ($isadj = 0))

			:jumpagain
			setvar $player~warpto $safeoptionsbackdirect
			gosub :move~twarp
			gosub :player~quikstats
			if ($player~twarpsuccess = true)
				add $stat_moves 1
				setvar $tostacksector $safeoptionsbackdirect
				gosub :movestacktooption
			else
				setvar $pathi 1
				setvar $c_pathbacki $pathbacki
				while ($pathi <= $c_pathbacki)

					setvar $stacksector $pathback[1]
					gosub :poppath
					getsectorparameter $stacksector "FIGSEC" $hasfig
					if ($hasfig = "")
						setvar $hasfig 0
					end
					if ($hasfig = 1)
						add $stat_moves 1
						add $stat_retreats 1
						setvar $move~moveintosector $stacksector
						gosub :move~moveintosector
						gosub :player~quikstats
						if (port.buyore[$player~current_sector] = 0)
							send "jy"
							send "p t *  *  "
							gosub :player~quikstats
							goto :jumpagain
						else
							gosub :checkpassingtrading
						end

					else
						setvar $switchboard~message "Paths blocked finding a safe sector.*"
						gosub :switchboard~switchboard
						halt
					end

					if ($stacksector = $safeoptionsbackdirect)
						setvar $pathi 30001
						return
					end
					add $pathi 1
				end
			end
		else
			setvar $pathi 1
			setvar $c_pathbacki $pathbacki
			while ($pathi <= $c_pathbacki)

				setvar $stacksector $pathback[1]
				gosub :poppath
				getsectorparameter $stacksector "FIGSEC" $hasfig
				if ($hasfig = "")
					setvar $hasfig 0
				end
				if ($hasfig = 1)
					add $stat_moves 1
					add $stat_retreats 1
					setvar $move~moveintosector $stacksector
					gosub :move~moveintosector
					gosub :player~quikstats
					gosub :checkpassingtrading

				else
					setvar $switchboard~message "Paths blocked finding a safe sector.*"
					gosub :switchboard~switchboard
					halt
				end

				if ($stacksector = $safeoptionsbackdirect)
					setvar $pathi 30001
					return
				end
				add $pathi 1
			end
		end
	end

else
	# log warps back
end

return

:gogridotheroptions
setvar $returnsector $player~current_sector

if ($movetwarp = 11)
	# STORE OTHER OPTIONS HERE ? Undecided
	# do we still want to do this as we are using the stack and already pushing
else

	setvar $i 1
	while ($i <= $newoptions)
		if ($newi[$i] <> $bestsector)

			setvar $move~moveintosector $newi[$i]
			gosub :move~moveintosector
			setsectorparameter  $newi[$i] "FIGSEC" true
			gosub :player~quikstats
			send "sd"
			gosub :checkpassingtrading
			add $stat_moves 1
			add $stat_figsdown 1
			setvar $move~moveintosector $returnsector
			gosub :move~moveintosector
			gosub :player~quikstats
			add $stat_moves 1
		end
		add $i 1
	end

end
return

:checkadj
setvar $isadj 0
setvar $cc 1
while ($cc <= sector.warpcount[$chksec])
	if (sector.warps[$chksec][$cc] = $adjsec)

		setvar $isadj 1
		return
	end
	add $cc 1
end

return

:getbestsectorfromlist
setvar $newoptions 0
setvar $newi 0

setvar $i 1
while ($i <= $chkoptioni)
	setvar $chksec $chkoption[$i]
	setvar $adjsec $player~current_sector
	gosub :checkadj
	if ($isadj = 1)
		add $newoptions 1
		setvar $newi[$newoptions] $chksec
	else
	end
	add $i 1
end

if ($newoptions > 0)
	# select best
	setvar $dencount 0
	setvar $bestsector 0
	setvar $i 1
	while ($i <= $newoptions)
		if ($warpcount[$newi[$i]] > $dencount)
			setvar $bestsector $newi[$i]
			setvar $dencount $warpcount[$newi[$i]]
		end
		add $i 1
	end
end

return

:getbestwarps
setvar $i 1
setvar $dencount 0
setvar $bestsector 0
while ($i <= $safesectors)
	if ($warpcount[$safes[$i]] > $dencount)
		setvar $bestsector $safes[$i]
		setvar $dencount $warpcount[$safes[$i]]
	end
	add $i 1
end

return

:checktrade
# $pptTradingOption
#  "all" all pairs  (which still excludes fuel<>org
#  "org" all Org-Equ
#  "buys" org - equip not selling ore
#  "none"  skip this step
#	echo "$pptTradingOption: " $pptTradingOption "*"
setvar $trades 0
setvar $tradesi 0
setvar $tradestype 0

if (($ppttradingoption <> "none") and (port.exists[$player~current_sector] = 1))

	# get neighbours with a potenial trading port that warp back
	setvar $cport port.class[$player~current_sector]
	setvar $i 1
	while ($i <= $deni)
		setvar $danger 0
		setvar $dsector $nsector[$i]
		setvar $dindex $i

		gosub :checkdanger

		if ((port.exists[$nsector[$i]]) and ($danger = 0))
			setvar $nport port.class[$nsector[$i]]
			setvar $chksec $nsector[$i]
			setvar $adjsec $player~current_sector
			gosub :checkadj
			if ($isadj = 1)
				# all - i.e. 1 to 6
				if (($ppttradingoption = "all") and ($nport > 0) and ($nport < 7))
					gosub :isallpair
					if ($portcantrade = 1)
						add $tradesi 1
						setvar $trades[$tradesi] $chksec
						setvar $tradestype[$tradesi] $tradingtype
					end
				elseif (($ppttradingoption = "org") and (($nport = 1) or ($nport = 2) or ($nport = 4) or ($nport = 5)))
					gosub :isorgepair
					if ($portcantrade = 1)
						add $tradesi 1
						setvar $trades[$tradesi] $chksec
						setvar $tradestype[$tradesi] $tradingtype
					end
				elseif (($ppttradingoption = "buys") and (($nport = 1) or ($nport = 2)))
					gosub :isbuyspair
					if ($portcantrade = 1)
						add $tradesi 1
						setvar $trades[$tradesi] $chksec
						setvar $tradestype[$tradesi] $tradingtype
					end
				end
			end

		end

		add $i 1
	end

	if ($tradesi > 0)

		if ($tradesi > 1)
			setvar $i 1
			while ($i <= $tradesi)
				send "cr" $trades[$i] "*q"
				waitfor "Computer deactivated>"
				add $i 1
			end

			setvar $maxe 0
			setvar $tradeport 0
			setvar $i 1

			while ($i <= $tradesi)
				if (port.equip[$trades[$i]] > $maxe)
					setvar $maxe port.equip[$trades[$i]]
					setvar $tradeport $trades[$i]
				end
				add $i 1
			end
		else
			setvar $tradeport $trades[1]
		end

		setvar $originsector $player~current_sector
		setvar $prepptc $player~credits

		setvar $bot~command "ppt"
		setvar $bot~user_command_line $tradeport &" p:50 k:10"
		setvar $bot~parm1 $tradeport
		setvar $bot~parm2 "p:50"
		setvar $bot~parm3 "k:10"

		savevar $bot~parm1
		savevar $bot~parm2
		savevar $bot~parm3

		savevar $bot~command
		savevar $bot~user_command_line

		load "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"

		:backpptwait
		settextlinetrigger        pptpauseforcash        :pptpauseforcash "[atm:" & $switchboard~bot_name & "]"
		settextlinetrigger        pptmove        :pptmove "<Move>"
		seteventtrigger        pptended        :pptended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\ppt.cts"
		pause

		:pptpauseforcash
		killalltriggers
		setvar $cashpause 1
		send "'[atm:ack] Will pause at next SXB post trading.*"
		goto :backpptwait

		:pptmove
		killalltriggers
		add $stat_moves 1
		goto :backpptwait

		:pptended
		killalltriggers
		gosub :player~quikstats
		setvar $stat_dollarsppt ($stat_dollarsppt + ($player~credits - $prepptc))

		add $stat_ppts_done 1
		add $stat_figsdown 1
		setsectorparameter $tradeport "FIGSEC" true

		if ($originsector <> $player~current_sector)
			# Finished up next door, return

			return
		end
	else
		#echo "No Trade*"

	end

end
if (($tradesi = 0) and (port.exists[$player~current_sector] = 1))
	# Can we be more selective here?
	# maybe XXBs and those with a decent trade for cash?

	gosub :checksingletrading

end

return

:dosingletrade
if (($testmcicbuy = 0) and ($testmcicsell = 0))
	setvar $keepquant 0
else
	if ($ppttradingoption = "none")
		setvar $keepquant 15
	else
		setvar $keepquant 5
	end
end
setvar $pretradec $player~credits
setvar $bot~command "trade"
setvar $bot~user_command_line $keepquant
setvar $bot~parm1 $keepquant

savevar $bot~parm1

savevar $bot~command
savevar $bot~user_command_line
load "scripts\"&$bot~mombot_directory&"\commands\cashing\trade.cts"

:backtradewait
settextlinetrigger        tradepauseforcash        :tradepauseforcash "[atm:" & $switchboard~bot_name & "]"
seteventtrigger        tradeended        :tradeended "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\commands\cashing\trade.cts"
pause

:tradepauseforcash
killalltriggers
setvar $cashpause 1
send "'[atm:ack] Will pause at next SXB post trading.*"
goto :backtradewait

:tradeended
killalltriggers
add $stat_trades 1
gosub :player~quikstats

setvar $stat_dollarstrade ($stat_dollarstrade + ($player~credits - $pretradec))

return

:isallpair
# Any port combo returns a postitve
setvar $portcantrade 0
if ((($cport = 1) or ($cport = 5)) and (($nport = 2) or ($nport = 4)))
	setvar $portcantrade 1
	setvar $tradingtype 1
elseif ((($cport = 2) or ($cport = 4)) and (($nport = 1) or ($nport = 5)))
	setvar $portcantrade 1
	setvar $tradingtype 1
elseif ((($cport = 3) or ($cport = 4)) and (($nport = 1) or ($nport = 6)))
	setvar $portcantrade 1
	setvar $tradingtype 2
elseif ((($cport = 1) or ($cport = 6)) and (($nport = 3) or ($nport = 4)))
	setvar $portcantrade 1
	setvar $tradingtype 2
end

return

:isorgepair
# Any port combo returns a postitve
setvar $portcantrade 0

if (($cport = 1) or ($cport = 5))
	if (($nport = 2) or ($nport = 4))
		setvar $portcantrade 1
		setvar $tradingtype 1
	end
elseif (($cport = 2) or ($cport = 4))
	if (($nport = 1) or ($nport = 5))
		setvar $portcantrade 1
		setvar $tradingtype 1
	end
end

return

:isbuyspair
# Any port combo returns a postitve
setvar $portcantrade 0

if ($cport = 1)
	if ($nport = 2)
		setvar $portcantrade 1
		setvar $tradingtype 1
	end
elseif ($cport = 2)
	if ($nport = 1)
		setvar $portcantrade 1
		setvar $tradingtype 1
	end
end

return

:checkpassingtrading
# for sectors we've explored/tested MCIC - do we want to trade
if ($singletrades = 1)
	gosub :ensurecurrentportreport
	setvar $doquicktrade 0

	if (($player~ore_holds > 40) and (port.buyfuel[$player~current_sector] = 1) and (port.percentfuel[$player~current_sector] >= 20))
		setvar $doquicktrade 1
	elseif (($player~organic_holds > 40) and (port.buyorg[$player~current_sector] = 1) and (port.percentorg[$player~current_sector] >= 20))
		setvar $doquicktrade 1
	elseif (($player~equipment_holds > 40) and (port.buyequip[$player~current_sector] = 1) and (port.percentequip[$player~current_sector] >= 20))
		setvar $doquicktrade 1
	end
	if ($doquicktrade = 1)
		gosub :dosingletrade
	end
end

return

:checksingletrading
setvar $doquicktrade 0
setvar $empty_holds ($player~total_holds - ($player~ore_holds + $player~organic_holds + $player~equipment_holds + $player~colonist_holds))

if ($singletrades = 1)
	gosub :ensurecurrentportreport
	setvar $doquicktrade 0

	if (($player~ore_holds > 40) and (port.buyfuel[$player~current_sector] = 1) and (port.percentfuel[$player~current_sector] >= 20))
		setvar $doquicktrade 1
	elseif (($player~organic_holds > 40) and (port.buyorg[$player~current_sector] = 1) and (port.percentorg[$player~current_sector] >= 20))
		setvar $doquicktrade 1
	elseif (($player~equipment_holds > 40) and (port.buyequip[$player~current_sector] = 1) and (port.percentequip[$player~current_sector] >= 20))
		setvar $doquicktrade 1
	elseif (((port.buyfuel[$player~current_sector] = 0) and (port.percentfuel[$player~current_sector] >= 20)) or ((port.buyorg[$player~current_sector] = 0) and (port.percentorg[$player~current_sector] >= 20)) or ((port.buyequip[$player~current_sector] = 0) and (port.percentequip[$player~current_sector] >= 20)))
		if ($empty_holds > 10)
			setvar $doquicktrade 1
		end
	end

end
getsectorparameter $player~current_sector "EQUIPMENTH" $donemcic
if ($donemcic = "")
	setvar $donemcic 0
end
#echo "$singleTrades: " $singleTrades " $doneMCIC:" $doneMCIC " $testMcicBuy:" $testMcicBuy "PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR] : " PORT.BUYEQUIP[$PLAYER~CURRENT_SECTOR]  " $player~EQUIPMENT_HOLDS: " $player~EQUIPMENT_HOLDS "*"
# if we haven't done MCIC, and it buys equip, and we are testing eqip, and we have at least one hold
# TEST BUY PORT
if (($donemcic = 0) and (port.buyequip[$player~current_sector] = 1) and ($testmcicbuy = 1) and ($player~equipment_holds > 0))
	setvar $doquicktrade 1
end
# TEST SELL PORT
if (($donemcic = 0) and (port.buyequip[$player~current_sector] = 0) and ($testmcicsell = 1) and ($empty_holds > 0))
	setvar $doquicktrade 1
end

# OUT OF EQUIP BUY IT
if (($testmcicbuy = 1) and (port.buyequip[$player~current_sector] = 0) and ($player~equipment_holds < 2))
	setvar $doquicktrade 1
end

# NEED TO FREE UP EQUIP
if (($testmcicsell = 1) and (port.buyequip[$player~current_sector] = 1) and ($empty_holds < 2) and ($player~equipment_holds > 0))
	setvar $doquicktrade 1
end

if ($doquicktrade = 1)
	gosub :dosingletrade
end

return

:ensurecurrentportreport
if ((port.exists[$player~current_sector] = 1) and (port.updated[$player~current_sector] = ""))
	send "cr*q"
	waiton "Commerce report for "
	waiton "Command [TL="
end

return

:restock
gosub :player~quikstats
setvar $prestockcredits $player~credits
striptext $precredits ","

gosub :restockself

gosub :player~quikstats
setvar $poststockcredits $player~credits
striptext $poststockcredits ","
setvar $stat_dollarstrade ($precredits - $poststockcredits)

return

:checkcorpplanet
setvar $planetfound 0
setvar $checki 1
while (($checki <= sector.planetcount[$player~current_sector]) and ($planetfound = 0))
	getword sector.planets[$player~current_sector][$checki] $checkplanet 1
	if ($checkplanet <> "")
		setvar $planetfound 1
	end
	add $checki 1
end
return

:checkcorpatdock
setvar $corpnotatdock true
return

:restockself
add $stat_refurbs 1
send "d"
setvar $returnspot $player~current_sector

setvar $restockmakeplanet 0
if ($useguard = true)

	setvar $planetfound 0
	gosub :checkcorpplanet
	if ($planetfound = 0)
		setvar $restockmakeplanet 1
	else
		setvar $restockmakeplanet 0
	end

end

if ($corpcashdump = true)

	setvar $dodockcashdump false
	if ($player~credits > 1100000)
		setvar $corpnotatdock true
		gosub :checkcorpatdock
		if ($corpnotatdock = false)
			setvar $dodockcashdump true
		end

	end
end
send "m" $stardock "*y"
waitfor "Locating beam pinpointed, TransWarp"
send "y  "

send "p   sh"

send "a"
settexttrigger shipcheckbuyatomics :shipcheckbuyatomics "How many Atomic Detonators do you want"
pause

:shipcheckbuyatomics
killalltriggers
getword currentline $atomicssavail 9
striptext $atomicssavail ")"
if ($atomicssavail = 0)
	#waitfor "next@"
	send "*"
else
	send  "*a" $atomicssavail "*"
end

send "t"
settexttrigger shipcheckbuytorps :shipcheckbuytorps "How many Genesis Torpedoes do you want"
pause

:shipcheckbuytorps
killalltriggers
getword currentline $torpssavail 9
striptext $torpssavail ")"
if ($torpssavail = 0)
	waitfor "next@"
end
send $torpssavail "*"

gosub :player~quikstats
send "qsp"

settexttrigger refurbfigpricet :refurbfigpricet "credits per fighter"

:checkshields
settexttrigger refurbshields :refurbshields "Shield Points"
pause

:refurbfigpricet
killalltriggers
if ($furbfigs = true)
	getword currentline $figprice 4
	getword currentline $canbuy 8
	setvar $figstobuy $player~credits
	subtract $figstobuy 250000
	divide $figstobuy $figprice

	if ($figstobuy > $canbuy)
		setvar $figstobuy $canbuy
	end
	send "b" $figstobuy "*"
end
goto :checkshields

:refurbshields
killalltriggers
getword currentline $shieldprice 5
getword currentline $canbuy 9
setvar $shieldstobuy $player~credits
subtract $shieldstobuy 250000
divide $shieldstobuy $shieldprice

if ($shieldstobuy > $canbuy)
	setvar $shieldstobuy $canbuy
end
send "c" $shieldstobuy "*"

if ($corpcashdump = true)

	if ($dodockcashdump = true)
		gosub :player~quikstats
		if ($player~credits > 1100000)
			setvar $dumpcash ($player~credits - 150000)
		else
			setvar $dodockcashdump false
		end
	end
end

#send "qspb5000*c3000*q"
send "qqq    *   "
if ($restockmakeplanet = 1)
	send "u   y  n  .  n  *  c * *  "
end

if ($corpcashdump = true)
	if ($dodockcashdump = true)
		send "t  c  y  q   z   t" $dumpcash "*  *  *  "
	end
end
send "m  " $returnspot  "*   y   y  "
settextlinetrigger restockback1 :restockback1 "<Set NavPoint>"
settextlinetrigger restockback2 :restockback2  "Systems Ready, shall we engag"
pause

:restockback1
killalltriggers
send "q * q * * pss"
setvar $switchboard~message "Failed to leave dock!! Hopefully on dock..*"
gosub :switchboard~switchboard
halt

:restockback2
killalltriggers

return

######################################## END TRADE ROUTINES
:setvoidsectors
clearallavoids
# we don't really want to sit outside of SD.

setvar $explored[$stardock] 1
if ($player~current_sector <> $stardock)
	setvar $a 1
	while ($a <= sector.warpcount[$stardock])
		# Avoids warps out of StarDock unless we're launching from Dock.
		setvar $explored[sector.warps[$stardock][$a]] 1
		setavoid sector.warps[$stardock][$a]
		add $a 1
	end
end

setvar $domini 0
setvar $i 2
while ($i < 11)
	if (sector.warpcount[$i] = 0)
		setvar $domini 1
	end
	add $i 1
end
if ($domini = 1)
	gosub :domini
end

setvar $i 2
while ($i < 11)
	setvar $a 1
	while ($a <= sector.warpcount[$i])
		setvar $explored[sector.warps[$i][$a]] 1
		setavoid sector.warps[$i][$a]
		add $a 1
	end
	add $i 1
end

return

:domini
# we just want to check we have all warps out of fed
send "c"
setvar $i 10
while ($i > 1)
	send "f" $i "*1*"
	subtract $i 1
end

send "/"
waitfor "Shlds"

setvar $plot 1
while ($plot = 1)

	send "f1*" $stardock "*"
	settextlinetrigger pathgood :pathgood "he shortest path"
	settextlinetrigger pathbad :pathbad "No route within"
	pause

	:pathbad
	killalltriggers
	send "yq"
	setvar $plot 0
	goto :endplot

	:pathgood
	killalltriggers
	waitfor ">"
	getword currentline $sec1 3
	getword currentline $sec2 5
	getword currentline $sec3 7
	striptext $sec1 "("
	striptext $sec2 "("
	striptext $sec3 "("

	striptext $sec1 ")"
	striptext $sec2 ")"
	striptext $sec3 ")"

	if ($sec1 > 10)
		setvar $voids $sec1
	elseif ($sec2 > 10)
		setvar $voids $sec2
	elseif ($sec3 > 10)
		setvar $voids $sec3
	end
	send "v" $voids "*"
	waitfor "future navigation calc"

	:endplot
end

:subreport
setvar $stuff ""
gosub :calcstats
setvar $switchboard~message $stuff & "**"
gosub :switchboard~switchboard
return

:updatestats
setvar $stuff ""
gosub :calcstats

setwindowcontents dora $stuff
add $updatecount 1
if ($updatecount > 20)
	setvar $updatecount 1
	send "'Dora Update - Figs: " $stat_figsdown " Turns: " $stat_turnsused "*"
end
return

:calcstats
setvar $stat_dollarsnet ($stat_dollarsppt + $stat_dollarstrade)

setvar $stat_turnsused ($startturns - $player~turns)

setvar $stuff "Turns Used: " & $stat_turnsused & "*Figs Down: " & $stat_figsdown & "*Ports Traded: " & $stat_trades  & "*Pairs Traded: " & $stat_ppts_done  & "*Moves Made: " & $stat_moves& "*Backtracks Made: " & $stat_retreats

setvar $stuff $stuff & "*Cash Pairs:" & $stat_dollarsppt & "*Cash Trades:" & $stat_dollarstrade & "*Total Cash:" & $stat_dollarsnet & "*Refurbs: " & $stat_refurbs
return

:checkdanger
# Remove all known items and then compare
setvar $comparedensity $ndensity[$dindex]
if (port.exists[$dsector])
	subtract $comparedensity 100
end
getsectorparameter $dsector "FIGSEC" $hasfig
if ($hasfig = "")
	setvar $hasfig 0
end
if ($hasfig = 1)
	if (sector.figs.owner[$dsector] = "belong to your Corp")
		subtract $comparedensity (sector.figs.quantity[$dsector] * 5)
	end
end

if ($alllimps[$dsector] > 0)
	subtract $comparedensity (2 * $alllimps[$dsector])
	setvar $nanom[$dindex] 0
end

if ($allarmids[$dsector] > 0)
	subtract $comparedensity (10 * $allarmids[$dsector])
end

if ($comparedensity = 0)
	setvar $danger 0
else
	if ($dsector < 11)
		setvar $danger 0
		#echo "* ## Fed Safe so OK: " $dSector
	else
		#echo "* ## Odd Density - Avoiding: " $dSector
		setvar $danger 1
	end
end

if ($danger = 1)

	#echo "*#####################################################"
	#echo "*# Sector " $nDensity[$dIndex] " shows danger *"
	#echo "*#####################################################"

	write $dangeroussectorlogfile $dsector & " N:" & $player~current_sector & " D: " & $ndensity[$dindex] & " A: " & $nanom[$dindex]
	setvar $a 1
	while ($a <= sector.warpcount[$player~current_sector])

		if (sector.warps[$player~current_sector][$a] = $dsector)
			write $dangeroussectorlogfile $holodata[$a]
		end
		add $a 1
	end

end
return

#############END NEXT SECTOR STUFF

########################### GRID NEXT SECTOR
:gridnextsector
if (($bestsector < 11) or ($bestsector = $stardock))
	send "m" $bestsector "**"
	add $stat_moves 1
else
	setvar $origin $player~current_sector

	setvar $move~moveintosector $bestsector
	gosub :move~moveintosector
	setsectorparameter $bestsector "FIGSEC" true
	waitfor "Warps to S"
	waitfor "Command ["
	gosub :player~quikstats

	setvar $chksec $player~current_sector
	setvar $adjsec $origin
	gosub :checkadj
	if ($isadj = 1)
		setvar $stacksector $origin
		gosub :pushpath

	else
		# We may have moved through a one way or hit stale adjacency data.
		# Do not nuke the whole backtrack stack here; keep older retreat points.
		# We simply avoid pushing this immediate origin as a reversible step.
	end
	add $stat_figsdown 1
	add $stat_moves 1
end

return

############# PATH Stack
:movestacktooption
# if we twarp back to a spot on the path
# we should trim stack to there
# Takes - $toStackSector

setvar $movei 1
while ($movei <= $pathbacki)

	setvar $stacksector $pathback[$movei]
	gosub :poppath
	if ($stacksector = $tostacksector)
		setvar $movei 30001
		return
	end
	add $movei 1
end

return

:checkoptions
setvar $safeoptionsback 0
setvar $safeoptionsbackdirect 0
setvar $ii 1

while ($ii <= $pathbacki)
	if ($pathbackhasoptions[$ii] = 1)
		setvar $safeoptionsbackdirect $pathback[$ii]
		setvar $safeoptionsback 1
		setvar $ii 30001
		return
	end
	add $ii 1
end

return

:poppath
gosub :printpath
if ($pathbacki = 0)
	setvar $stacksector 0
	return
else
	setvar $stacksector $pathback[1]
	setvar $tempi 1
	while ($tempi < $pathbacki)
		setvar $tempy ($tempi + 1)
		setvar $pathback[$tempi] $pathback[$tempy]
		setvar $pathbackhasoptions[$tempi] $pathbackhasoptions[$tempy]
		add $tempi 1
	end
	setvar $pathback[$pathbacki] 0
	setvar $pathbackhasoptions[$pathbacki] 0
	subtract $pathbacki 1
end
gosub :printpath
return

:pushpath
#goSub :printPath

if ($maxpathback = $pathbacki)

	setvar $tempi ($maxpathback - 1)
	while ($tempi >= 1)
		# i.e. 50 = 49, then 49 = 48
		setvar $tempy ($tempi + 1)
		setvar $pathback[$tempy] $pathback[$tempi]
		setvar $pathbackhasoptions[$tempy] $pathbackhasoptions[$tempi]
		subtract $tempi 1
	end
	setvar $pathback[1] $stacksector
	# We are going to one of the safe sectors, so we need 2+ to have an option
	if ($safesectors > 1)
		setvar $pathbackhasoptions[1] 1
	else
		setvar $pathbackhasoptions[1] 0
	end
else
	setvar $tempi $pathbacki
	while ($tempi >= 1)
		# i.e. 50 = 49, then 49 = 48
		setvar $tempy ($tempi + 1)
		setvar $pathback[$tempy] $pathback[$tempi]
		setvar $pathbackhasoptions[$tempy] $pathbackhasoptions[$tempi]
		subtract $tempi 1
	end
	setvar $pathback[1] $stacksector
	# We are going to one of the safe sectors, so we need 2+ to have an option
	if ($safesectors > 1)
		setvar $pathbackhasoptions[1] 1
	else
		setvar $pathbackhasoptions[1] 0
	end
	add $pathbacki 1
end
#goSub :printPath

return

:printpath
# JUST FOR DEBUGGING
return
echo "Printing Stack Size:" $pathbacki "/" $maxpathback "*"
setvar $tempi 1
while ($tempi <= $maxpathback)
	echo "  " $tempi ": " $pathback[$tempi] " opt:" $pathbackhasoptions[$tempi] "*"
	add $tempi 1
end

return
###### END PATH STac
:holoscan
send "sh"
waitfor "Long Range Scan"
setvar $hindex 1
setvar $hdata ""

:holosectorstart
settextlinetrigger holoscanfirstsector :holoscanfirstsector "Sector  :"
pause

:holoscanfirstsector
killtrigger holoscanfirstsector
getword currentline $hsector 3
setvar $hdata "     " & currentline

:holoscancontinue
settextlinetrigger holoscandetails :holoscandetails ""
pause

:holoscandetails
killtrigger holoscandetails
getword currentline $firstword 1
if ($firstword = "Warps")
	return
elseif ($firstword = "Sector")
	setvar $holodata[$hindex] $hdata
	add $hindex 1
	setvar $hdata "     " & currentline
	goto :holoscancontinue
else
	setvar $hdata "     " & $hdata & "*" & currentline
	goto :holoscancontinue
end

return

:densityscan
send "sd"
waitfor "Relative Density Scan"

setvar $deni 0
setvar $ndensity 0
setvar $nsector 0
setvar $nwarps 0
setvar $nhaz 0
setvar $nanom 0
setvar $nnew 0

setvar $freshsectors 0
setvar $freshsectorsi 0
setvar $freshsectorsnewports 0

:densityscanning
settextlinetrigger densityscanline :densityscanline "Sector"
settexttrigger densityscanend :densityscanend "Help)?"
pause

:densityscanline
killtrigger densityscanline
killtrigger densityscanend

getword currentline $scansector 2
if ($scansector = "(")
	getword currentline $scansector 3
	getword currentline $secdensity 5
	getword currentline $secwarps 8
	getword currentline $nhaz 11
	getword currentline $scananom 14
else
	getword currentline $secdensity 4
	getword currentline $secwarps 7
	getword currentline $nhaz 10
	getword currentline $scananom 13
end

striptext $nhaz "%"

getlength $scansector $len

striptext $scansector ")"
striptext $scansector "("
getlength $scansector $len2

striptext $$secdensity ","

add $deni 1
if ($len2 < $len)
	add $freshsectorsi 1
	setvar $freshsectors[$freshsectorsi] $scansector
	if ($secdensity = 100)
		add $freshsectorsnewports 1
	end
	setvar $nnew[$deni] 1
else
	setvar $nnew[$deni] 0
end

striptext $secdensity ","
setvar $ndensity[$deni] $secdensity
setvar $nsector[$deni] $scansector
setvar $nwarps[$deni] $secwarps
setvar $warpcount[$scansector] $secwarps
setvar $nhaz[$deni] $nhaz
setvar $nanom[$deni] 0
if ($scananom = "Yes")
	setvar $anomoly[$scansector] 1
	setvar $nanom[$deni] 1
end

goto :densityscanning

:densityscanend
killtrigger densityscanline
killtrigger densityscanend
return

halt

:gotodock
send "y1*q"
send "m" $stardock "*y"
waitfor "All Systems Ready, shall we engage?"
send "y"
waitfor "TransWarp Drive Engaged!"
send "ps"
gosub :limpetcheck

return

:limpetcheck
settexttrigger limpetchecky :limpetchecky "A port official runs"
settexttrigger limpetcheckn :limpetcheckn "StarDock> Where to?"
pause

:limpetchecky
killalltriggers
send "y"
return

:limpetcheckn
killalltriggers
return

return

return

include "source\include\move"
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
