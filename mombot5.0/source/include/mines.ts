:deploy
	if ($personal)
		setVar $mine "p"
	else
		setVar $mine "c"
	end

	gosub :mineProtections
	if ($mines~ready <> TRUE)
		return
	end

	setVar $preDeployArmids $PLAYER~ARMIDS
	setVar $preDeployLimpets $PLAYER~LIMPETS
	if ($bot~startingLocation = "Citadel")
		send "s"
		setVar $start_mac "q q "
		setVar $end_mac "l "&$PLANET~PLANET&"* c s"
	else
		send "*"
		setVar $start_mac ""
		setVar $end_mac "*"
	end
	waitOn "Warps to Sector(s) :"
	send "* "

	setVar $armid_count SECTOR.MINES.QUANTITY[$PLAYER~CURRENT_SECTOR]
	setVar $limpet_count SECTOR.LIMPETS.QUANTITY[$PLAYER~CURRENT_SECTOR]
	setVar $limpetOwner SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR]
	setVar $armidOwner SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR]

	if (($PLAYER~ARMIDS <= 0) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
		setVar $SWITCHBOARD~message "Out of armids!*"
		gosub :SWITCHBOARD~switchboard
		return
	elseif ($amount > $PLAYER~ARMIDS)
		setVar $amount $PLAYER~ARMIDS
	end

	if (($PLAYER~LIMPETS <= 0) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
		setVar $SWITCHBOARD~message "Out of limpets!*"
		gosub :SWITCHBOARD~switchboard
		return
	elseif ($amount > $PLAYER~LIMPETS)
		setVar $amount $PLAYER~LIMPETS
	end

	if ((($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")) AND ($limpet_count >= $amount) AND ($armid_count >= $amount))
		setVar $SWITCHBOARD~message "Armid and limpet mines already deployed into this sector!*"
		gosub :SWITCHBOARD~switchboard
		return
	end

	send $start_mac "z n h 2 z " $amount "*  z" $mine "* h 1 z " $amount "*  z " $mine "* q q * " $end_mac
	waitOn "Warps to Sector(s) :"
	gosub :PLAYER~quikstats
	send "* "

	if ((($preDeployArmids > $PLAYER~ARMIDS) AND ($preDeployLimpets > $PLAYER~LIMPETS)) OR (($preDeployLimpets = $PLAYER~LIMPETS) AND (($limpetOwner = "belong to your Corp") OR ($limpetOwner = "yours")) AND ($preDeployArmids = $PLAYER~ARMIDS) AND (($armidOwner = "belong to your Corp") OR ($armidOwner = "yours"))))
		setVar $SWITCHBOARD~message $amount&" Armid and Limpet mines deployed into the sector!*"
		gosub :SWITCHBOARD~switchboard
		setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
		setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
	else
		if ($preDeployArmids > $PLAYER~ARMIDS)
			setVar $SWITCHBOARD~message $SWITCHBOARD~message&$amount&" Armid mine(s) deployed into the sector!*"
			setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
		end
		if ($preDeployLimpets > $PLAYER~LIMPETS)
			setVar $SWITCHBOARD~message $SWITCHBOARD~message&$amount&" Limpet mine(s) deployed into the sector!*"
			setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
		end
		gosub :SWITCHBOARD~switchboard
	end

	if ($preDeployArmids < $PLAYER~ARMIDS)
		setVar $SWITCHBOARD~message ($PLAYER~ARMIDS - $preDeployArmids)&" Armid mines picked up from sector!*"
	elseif (($preDeployArmids = $PLAYER~ARMIDS) AND (($armidOwner <> "belong to your Corp") AND ($armidOwner <> "yours")))
		setVar $SWITCHBOARD~message "Enemy armid(s) present in sector, cannot deploy!*"
	end
	gosub :SWITCHBOARD~switchboard

	if ($preDeployLimpets < $PLAYER~LIMPETS)
		setVar $SWITCHBOARD~message ($PLAYER~LIMPETS - $preDeployLimpets)&" Limpet mines picked up from sector!*"
	elseif (($preDeployLimpets = $PLAYER~LIMPETS) AND (($limpetOwner <> "belong to your Corp") AND ($limpetOwner <> "yours")))
		setVar $SWITCHBOARD~message "Enemy limpet(s) present in sector, cannot deploy!*"
	end
	gosub :SWITCHBOARD~switchboard
	return
# ============================== END MINES (ARMID AND LIMP) SUB ==============================

:deployArmid
	if ($personal)
		setVar $mine "p"
	else
		setVar $mine "c"
	end

	gosub :mineProtections
	if ($mines~ready <> TRUE)
		return
	end
	if ($PLAYER~ARMIDS <= 0)
		if ($PLAYER~startingLocation = "Citadel")
			send "s* "
			waitFor "Warps to Sector(s) :"
		elseif ($PLAYER~startingLocation = "Command")
			send "d* "
		end
		if ((SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR] = "belong to your Corp") OR (SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR] = "yours"))
			if ($amount > SECTOR.MINES.QUANTITY[$PLAYER~CURRENT_SECTOR])
				setVar $amount SECTOR.MINES.QUANTITY[$PLAYER~CURRENT_SECTOR]
			end
		else
			setVar $SWITCHBOARD~message "Out of Armid Mines!*"
			gosub :SWITCHBOARD~switchboard
			return
		end
	elseif ($amount > $PLAYER~ARMIDS)
		setVar $amount $PLAYER~ARMIDS
	end

:retryArmid
	killAllTriggers

	if ($PLAYER~startingLocation = "Citadel")
		send "q q z n h1 z " $amount "*  z" $mine " z n n  *l " $PLANET~PLANET "* c"
	else
		send "z n h1 z " $amount "*  z" $mine " z n"
	end
	setTextLineTrigger tooManyArmid :tooManyArmid "!  You are limited to "
	setTextLineTrigger armidDone :armidDone "Done. You have "
	setTextLineTrigger armidEnemy :armidEnemy "These mines are not under your control."
	setTextLineTrigger armidNotEnough :armidNotEnough "You don't have that many mines available."
	pause

:armidDone
	killAllTriggers
	setVar $isMined TRUE
	if ($PLAYER~startingLocation = "Citadel")
		waitOn "Citadel command (?=help)"
		send "s*"
	else
		waitOn "Command [TL="
		send "d*"
	end
	setTextLineTrigger armidPersonal :armidPersonal "(Type 1 Armid) (yours)"
	setTextLineTrigger armidCorp :armidCorp "(Type 1 Armid) (belong to your Corp)"
	setTextLineTrigger armidBlocked :armidBlocked "Citadel treasury contains"
	pause

:armidCorp
	setVar $SWITCHBOARD~message $amount&" Corporate Mines Deployed!*"
	gosub :SWITCHBOARD~switchboard
	goto :doneArmidDeploy

:armidPersonal
	setVar $SWITCHBOARD~message $amount&" Personal Mines Deployed!*"
	gosub :SWITCHBOARD~switchboard
	goto :doneArmidDeploy

:armidBlocked
	setVar $SWITCHBOARD~message "Sector already has enemy Armid Mines present!*"
	gosub :SWITCHBOARD~switchboard
	setVar $isMined FALSE
	goto :doneArmidDeploy

:tooManyArmid
	getWord CURRENTLINE $max_mines 11

	if ((SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR] = "belong to your Corp") OR (SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR] = "yours"))
		setVar $SWITCHBOARD~message "Your ship only holds "&$max_mines&", retrying!*"
		gosub :SWITCHBOARD~switchboard
		setVar $amount ((SECTOR.MINES.QUANTITY[$PLAYER~CURRENT_SECTOR] + $PLAYER~ARMIDS) - $max_mines)
		goto :retryArmid
	else
		setVar $SWITCHBOARD~message "Too many mines in the sector!*"
		gosub :SWITCHBOARD~switchboard
		goto :doneArmidDeploy
	end

:armidNotEnough
	setVar $SWITCHBOARD~message "You don't have that many available!*"
	gosub :SWITCHBOARD~switchboard

:doneArmidDeploy
	if ($isMined)
		setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
	else
		setSectorParameter $PLAYER~CURRENT_SECTOR "MINESEC" FALSE
	end
	killAllTriggers
	return

:deployLimp
	if ($personal)
		setVar $mine "p"
	else
		setVar $mine "c"
	end

	gosub :mineProtections
	if ($mines~ready <> TRUE)
		return
	end
	if ($PLAYER~LIMPETS <= 0)
		if ($PLAYER~startingLocation = "Citadel")
			send "s* "
			waitFor "Warps to Sector(s) :"
		elseif ($PLAYER~startingLocation = "Command")
			send "d* "
		end
		if ((SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR] = "belong to your Corp") OR (SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR] = "yours"))
			if ($amount > SECTOR.LIMPETS.QUANTITY[$PLAYER~CURRENT_SECTOR])
				setVar $amount SECTOR.LIMPETS.QUANTITY[$PLAYER~CURRENT_SECTOR]
			end
		else
			setVar $SWITCHBOARD~message "Out of limpets!*"
			gosub :SWITCHBOARD~switchboard
			return
		end
	elseif ($amount > $PLAYER~LIMPETS)
		setVar $amount $PLAYER~LIMPETS
	end

:retryLimp
	killAllTriggers

	if ($PLAYER~startingLocation = "Citadel")
		send "q q z* h2z" $amount "* z " $mine " z * * *l " $PLANET~PLANET "* c"
	else
		send "z* h2z" $amount "* z " $mine " z * *"
	end
	setTextLineTrigger tooManyLimp :tooManyLimp "!  You are limited to "
	setTextLineTrigger limpDone :limpDone "Done. You have "
	setTextLineTrigger limpEnemy :limpEnemy "These mines are not under your control."
	setTextLineTrigger limpNotEnough :limpNotEnough "You don't have that many mines available."
	pause

:limpDone
	killAllTriggers
	setVar $isLimped TRUE
	if ($PLAYER~startingLocation = "Citadel")
		waitOn "Citadel command (?=help)"
		send "s* "
	else
		send "d* "
	end
	setTextLineTrigger limpPersonal :limpPersonal "(Type 2 Limpet) (yours)"
	setTextLineTrigger limpCorp :limpCorp "(Type 2 Limpet) (belong to your Corp)"
	setTextLineTrigger limpBlocked :limpBlocked "Warps to Sector(s) :"
	pause

:limpCorp
	killAllTriggers
	setVar $SWITCHBOARD~message $amount&" Corporate Limpets Deployed!*"
	gosub :SWITCHBOARD~switchboard
	goto :doneLimpDeploy

:limpPersonal
	killAllTriggers
	setVar $SWITCHBOARD~message $amount&" Personal Limpet Deployed!*"
	gosub :SWITCHBOARD~switchboard
	goto :doneLimpDeploy

:limpBlocked
	killAllTriggers
	setVar $SWITCHBOARD~message "Sector already has enemy limpets present!*"
	gosub :SWITCHBOARD~switchboard
	setVar $isLimped FALSE
	goto :doneLimpDeploy

:tooManyLimp
	getWord CURRENTLINE $max_mines 11

	if ((SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR] = "belong to your Corp") OR (SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR] = "yours"))
		setVar $SWITCHBOARD~message "Your ship only holds "&$max_mines&", retrying!*"
		gosub :SWITCHBOARD~switchboard
		setVar $amount ((SECTOR.LIMPETS.QUANTITY[$PLAYER~CURRENT_SECTOR] + $PLAYER~LIMPETS) - $max_mines)
		goto :retryLimp
	else
		setVar $SWITCHBOARD~message "Too many mines in the sector!*"
		gosub :SWITCHBOARD~switchboard
		goto :doneLimpDeploy
	end

:limpNotEnough
	setVar $SWITCHBOARD~message "You don't have that many available!*"
	gosub :SWITCHBOARD~switchboard

:doneLimpDeploy
	if ($isLimped)
		setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
	else
		setSectorParameter $PLAYER~CURRENT_SECTOR "LIMPSEC" FALSE
	end
	killAllTriggers
	return

:updateArmids
	setVar $SWITCHBOARD~message "Loading current armid locations. . .*"
	gosub :SWITCHBOARD~switchboard
	fileExists $gfile_chk $BOT~ARMID_COUNT_FILE
	if ($gfile_chk = 1)
		read $BOT~ARMID_COUNT_FILE $previousCount 1
	else
		setVar $previousCount 0
	end
	setArray $pmines SECTORS

:readArmidList
	setVar $count 0
	setVar $personalCount 0
	send "k1"
	setVar $i 1
	setVar $limpetOutput ""
	setVar $personalOutput " "
	setVar $output " "

:keepCountingArmids
	killTrigger corporate
	killTrigger personal
	killTrigger doneCountingFigs
	killTrigger doneNoFigs
	setTextLineTrigger corporate :corpCountArmids " Corp"
	setTextLineTrigger personal :personalCountArmids "Personal "
	setTextLineTrigger doneCountingFigs :doneCountingArmids "Total"
	setTextLineTrigger doneNoFigs :doneCountingArmids "No mines deployed"
	pause

:personalCountArmids
	add $count 1
	add $personalCount 1
	getWord CURRENTLINE $sector 1
	getWord CURRENTLINE $numMines 2
	setVar $personalOutput $personalOutput&$sector&"  "
	setVar $pmines[$sector] $numMines
	setTextLineTrigger personal :personalCountArmids "Personal "
	pause

:corpCountArmids
	add $count 1
	add $player~corpCount 1
	getWord CURRENTLINE $sector 1
	getWord CURRENTLINE $numMines 2
	while ($i <= $sector)
		getWordPos $personalOutput $pos " "&$i&" "
		if (($sector = $i) OR ($pos > 0))
			if ($pos > 0)
				setVar $output $output&$pmines[$i]&"*"
			else
				setVar $output $output&$numMines&"*"
			end
			setSectorParameter $i "MINESEC" TRUE
		else
			setVar $output $output&"0*"
			setSectorParameter $i "MINESEC" FALSE
		end
		add $i 1
	end
	setTextLineTrigger corporate :corpCountArmids " Corp"
	pause

:doneCountingArmids
	killTrigger corporate
	killTrigger personal
	killTrigger doneCountingFigs
	killTrigger doneNoFigs

	while ($i <= SECTORS)
		getWordPos $personalOutput $pos " "&$i&" "
		if ($pos > 0)
			setVar $output $output&$numMines&"*"
			setSectorParameter $i "MINESEC" TRUE
		else
			setVar $output $output&"0*"
			setSectorParameter $i "MINESEC" FALSE
		end
		add $i 1
	end
	delete $BOT~ARMID_FILE
	write $BOT~ARMID_FILE $output
	delete $BOT~ARMID_COUNT_FILE
	write $BOT~ARMID_COUNT_FILE $count
	return

:reportArmids
	setVar $percent (($count * 100) / SECTORS)
	setVar $gridChange $count - $previousCount
	if ($gridChange > 0)
		setVar $gridChange "+"&$gridChange
	end
	setVar $SWITCHBOARD~message $SWITCHBOARD~message&"          - Armid Grid Report -*          - "&$count&" sectors, "&$personalCount&" personal. ("&$percent&"%) ("&$gridChange&" Change)**"
	return

:updateLimps
	setArray $plimps SECTORS

	setVar $SWITCHBOARD~message "Loading current limpet locations. . .*"
	gosub :SWITCHBOARD~switchboard
	fileExists $gfile_chk $BOT~LIMP_COUNT_FILE
	if ($gfile_chk = 1)
		read $BOT~LIMP_COUNT_FILE $previousCount 1
	else
		setVar $previousCount 0
	end

:readLimpList
	setVar $count 0
	setVar $personalCount 0
	send "k2"
	setVar $i 1
	setVar $limpetOutput ""
	setVar $personalOutput " "
	setVar $output " "

:keepCountingLimps
	killTrigger corporate
	killTrigger personal
	killTrigger doneCountingFigs
	killTrigger doneNoFigs
	setTextLineTrigger corporate :corpCountLimps " Corp"
	setTextLineTrigger personal :personalCountLimps "Personal "
	setTextLineTrigger doneCountingFigs :doneCountingLimps "Total"
	setTextLineTrigger doneNoFigs :doneCountingLimps "No Limpet mines deployed"
	pause

:personalCountLimps
	add $count 1
	add $personalCount 1
	getWord CURRENTLINE $sector 1
	getWord CURRENTLINE $numMines 2
	setVar $personalOutput $personalOutput&$sector&"  "
	setVar $plimps[$sector] $numMines
	setTextLineTrigger personal :personalCountLimps "Personal "
	pause

:corpCountLimps
	add $count 1
	add $player~corpCount 1
	getWord CURRENTLINE $sector 1
	getWord CURRENTLINE $numMines 2
	while ($i <= $sector)
		getWordPos $personalOutput $pos " "&$i&" "
		if (($sector = $i) OR ($pos > 0))
			if ($pos > 0)
				setVar $output $output& $plimps[$i] &"*"
			else
				setVar $output $output&$numMines&"*"
			end
			setSectorParameter $i "LIMPSEC" TRUE
		else
			setVar $output $output&"0*"
			setSectorParameter $i "LIMPSEC" FALSE
		end
		add $i 1
	end
	setTextLineTrigger corporate :corpCountLimps " Corp"
	pause

:doneCountingLimps
	killTrigger corporate
	killTrigger personal
	killTrigger doneCountingFigs
	killTrigger doneNoFigs
	setTextTrigger checkLimps :checkMarkedLimps "Activated  Limpet  Scan"
	pause

:checkMarkedLimps
	setTextLineTrigger donechecking :doneCheckingLimps "Total"
	setTextLineTrigger donecheckingtoo :doneCheckingLimps "No Active Limpet mines detected"
	setTextLineTrigger corporate :markLimpet " Corp"
	setTextLineTrigger personal :markLimpet "Personal "
	pause

:markLimpet
	killTrigger corporate
	killTrigger personal
	setVar $temp CURRENTLINE
	stripText $temp #42
	setVar $limpetOutput $limpetOutput&"             "&$temp&"*"
	killTrigger unfreezingTrigger
	setDelayTrigger unfreezingTrigger :unfreezebot 10000
	setTextLineTrigger corporate :markLimpet " Corp"
	setTextLineTrigger personal :markLimpet "Personal "
	pause

:doneCheckingLimps
	killTrigger donechecking
	killTrigger donecheckingtoo
	while ($i <= SECTORS)
		getWordPos $personalOutput $pos " "&$i&" "
		if ($pos > 0)
			setVar $output $output&$numMines&"*"
			setSectorParameter $i "LIMPSEC" TRUE
		else
			setVar $output $output&"0*"
			setSectorParameter $i "LIMPSEC" FALSE
		end
		add $i 1
	end
	delete $BOT~LIMP_FILE
	write $BOT~LIMP_FILE $output
	delete $BOT~LIMP_COUNT_FILE
	write $BOT~LIMP_COUNT_FILE $count
	return

:reportLimps
	setVar $percent (($count * 100) / SECTORS)
	setVar $gridChange ($count - $previousCount)
	if ($gridChange > 0)
		setVar $gridChange "+"&$gridChange
	end
	setVar $player~limpetsGridded TRUE
	setVar $switchboard~message $SWITCHBOARD~message&"          - Limpet Grid Report -*          - "&$count&" sectors, "&$personalCount&" personal. ("&$percent&"%) ("&$gridChange&" Change)*          - Activated  Limpet  Scan*            *             Sector    Personal/Corp*            ========================*"&$limpetOutput&"*"
	return

:mineProtections
	setVar $mines~ready FALSE
	killAllTriggers
	gosub :PLAYER~quikstats
	if (($PLAYER~CURRENT_SECTOR < 10) OR ($PLAYER~CURRENT_SECTOR = $MAP~stardock))
		setVar $SWITCHBOARD~message "Cannot deploy in FedSpace!*"
		gosub :SWITCHBOARD~switchboard
		return
	end
	if ($PLAYER~CURRENT_PROMPT = 0)
		gosub :PLAYER~CURRENTPROMPT
	end
	setVar $PLAYER~startingLocation $PLAYER~CURRENT_PROMPT
	isNumber $test $amount
	if (($test = FALSE) OR ($amount = 0))
		setVar $amount 1
	end
	setVar $bot~startingLocation $PLAYER~CURRENT_PROMPT
	setVar $bot~validPrompts "Command Citadel"
	getWordPos " "&$bot~validPrompts&" " $bot~pos $PLAYER~CURRENT_PROMPT
	if ($bot~pos <= 0)
		setVar $SWITCHBOARD~message "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$BOT~VALIDPROMPTS&"]*"
		gosub :SWITCHBOARD~switchboard
		return
	end
	if ($PLAYER~startingLocation = "Citadel")
		send "q"
		gosub :PLANET~getPlanetInfo
		send "c"
	end
	setVar $mines~ready TRUE
	return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:MINES~CLEAR
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $GAME~GAME_MENU_PROMPT
gosub :PLAYER~QUIKSTATS
setvar $MINES~STARTINGLOCATION $PLAYER~CURRENT_PROMPT
if ((CURRENTSECTOR = $MAP~STARDOCK) or (CURRENTSECTOR <= 10))
  setvar $SWITCHBOARD~MESSAGE "Can't clear fedspace.*"
  gosub :SWITCHBOARD~SWITCHBOARD
  return
end
setvar $BOT~VALIDPROMPTS "Command Citadel"
gosub :BOT~CHECKSTARTINGPROMPT

setvar $MINES~BWARP FALSE
if ($MINES~STARTINGLOCATION = "Citadel")
  send "q"
  gosub :PLANET~GETPLANETINFO
  send "c  s*"
  if (($PLANET~PLANET_TRANSPORT >= 1) and ($PLAYER~UNLIMITEDGAME = TRUE))
    setvar $MINES~BWARP TRUE
  end
else
  send "*"
end
getwordpos " "&$BOT~USER_COMMAND_LINE&" " $MINES~POS " bwarp "
if ($MINES~POS > 0)
  setvar $MINES~BWARP TRUE
end

setvar $MINES~BEFORELIMPETS $PLAYER~LIMPETS
setvar $MINES~BEFOREARMIDS $PLAYER~ARMIDS
setvar $MINES~PLACEDLIMPET FALSE
setvar $MINES~PLACEDARMID FALSE
waiton "Warps to Sector(s) :"
gosub :REFRESH_CLEAR_SECTOR_STATE
if ($MINES~SECTORCLEAR = TRUE)
  setvar $SWITCHBOARD~MESSAGE "Current Sector Already Clear of Enemy Mines!*"
  return
end
if (($PLAYER~LIMPETS <= 0) and ($MINES~LIMPETCOUNT > 0) and (($MINES~LIMPETOWNER <> "belong to your Corp") and ($MINES~LIMPETOWNER <> "yours")))
  setvar $SWITCHBOARD~MESSAGE "Need limpets to clear this sector*"
  return
end
if (($PLAYER~ARMIDS <= 0) and ($MINES~ARMIDCOUNT > 0) and (($MINES~ARMIDOWNER <> "belong to your Corp") and ($MINES~ARMIDOWNER <> "yours")))
  setvar $SWITCHBOARD~MESSAGE "Need armids to clear this sector*"
  return
end

gosub :ATTEMPTCLEARINGMINES
while (($MINES~PLACEDLIMPET = FALSE) or ($MINES~PLACEDARMID = FALSE))
  gosub :ATTEMPTCLEARINGMINES
end

setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
setvar $SWITCHBOARD~MESSAGE "Sector Cleared*"
return

:MINES~ATTEMPTCLEARINGMINES
killtrigger LAID_LIMP
killtrigger LAID_ARMID
setvar $MINES~LAID_ARMID $MINES~PLACEDARMID
setvar $MINES~LAID_LIMP $MINES~PLACEDLIMPET

if ($MINES~BWARP = TRUE)
  setvar $MINES~I 0
  setvar $MINES~BWARP_MOVE "b"&$PLAYER~CURRENT_SECTOR&"*"
  setvar $MINES~BWARP_CLEAR "y   *  l j"&#8&#8&#8&#8&#8&$PLANET~PLANET&"*  j  c  *  "

  if ($MINES~RECKLESS <> TRUE)
    while ($MINES~I <= 5)
      killtrigger 1
      killtrigger 2
      killtrigger 3
      killtrigger 4
      settexttrigger 1 :NO_BWARP_LOCK "Do you want to make this transport blind?"
      settexttrigger 2 :BWARP_LOCK "All Systems Ready, shall we engage?"
      settextlinetrigger 3 :BWARPNOFUEL "This planet does not have enough Fuel Ore to transport you."
      settexttrigger 4 :SWITCHTONONBWARP "Your ship was hit by a Photon and has been disabled."
      send $MINES~BWARP_MOVE
      pause
      :MINES~NO_BWARP_LOCK

      killalltriggers
      send "n "
      setvar $SWITCHBOARD~MESSAGE "Fighter is gone from sector!  Stopping, check for enemies!*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
      :MINES~BWARPNOFUEL

      killalltriggers
      setvar $SWITCHBOARD~MESSAGE "Not enough fuel on the planet! Stopping.*"
      gosub :SWITCHBOARD~SWITCHBOARD
      halt
      :MINES~BWARP_LOCK
      send $MINES~BWARP_CLEAR

      add $MINES~I 1
    end
  else
    send $MINES~BWARP_MOVE "  " $MINES~BWARP_CLEAR $MINES~BWARP_MOVE "  " $MINES~BWARP_CLEAR $MINES~BWARP_MOVE "  " $MINES~BWARP_CLEAR $MINES~BWARP_MOVE "  " $MINES~BWARP_CLEAR $MINES~BWARP_MOVE "  " $MINES~BWARP_CLEAR
  end

  killtrigger 1
  killtrigger 2
  killtrigger 3
  if ($PLAYER~SURROUNDMINE <= 0)
    setvar $PLAYER~SURROUNDMINE 3
  end
  if ($PLAYER~SURROUNDLIMP <= 0)
    setvar $PLAYER~SURROUNDLIMP 3
  end
  setvar $MINES~GRID_ARMIDS $PLAYER~SURROUNDMINE
  setvar $MINES~GRID_LIMPETS $PLAYER~SURROUNDLIMP
  if ($MINES~GRID_ARMIDS = 0)
    setvar $MINES~_ARMIDS_ " "
    setvar $MINES~PLACEDARMID TRUE
  else
    setvar $MINES~_ARMIDS_ " h 1 z "&$MINES~GRID_ARMIDS&"* z c * "
    settextlinetrigger LAID_ARMID :LAID_ARMID "Armid mine(s) on board."
  end
  if ($MINES~GRID_LIMPETS = 0)
    setvar $MINES~_LIMPS_ " "
    setvar $MINES~PLACEDLIMPET TRUE
  else
    setvar $MINES~_LIMPS_ "h 2 z "&$MINES~GRID_LIMPETS&"* z c * "
    settextlinetrigger LAID_LIMP :LAID_LIMP "Limpet mine(s) on board."
  end

  send "q  q  "&$MINES~_ARMIDS_&$MINES~_LIMPS_&" l "&$PLANET~PLANET&"*  c  "

  gosub :PLAYER~QUIKSTATS
  waiton "Citadel command"

else
  :MINES~SWITCHTONONBWARP
  setvar $MINES~MINESTODEPLOY $MINES~GRID_ARMIDS
  setvar $MINES~LIMPSTODEPLOY $MINES~GRID_LIMPETS
  gosub :PLAYER~QUIKSTATS
  if ($PLAYER~CURRENT_PROMPT = "Qcannon")
    send "s" $MINES~PERCENTTOSET "* "
    gosub :PLAYER~QUIKSTATS
  end
  gosub :CLEAR_SECTOR_ATTEMPTCLEARINGMINES
  gosub :PLAYER~QUIKSTATS
  setsectorparameter $PLAYER~CURRENT_SECTOR "MINESEC" TRUE
  setsectorparameter $PLAYER~CURRENT_SECTOR "LIMPSEC" TRUE
  setvar $MINES~LAID_ARMID TRUE
  setvar $MINES~LAID_LIMP TRUE
  setvar $MINES~PLACEDLIMPET TRUE
  setvar $MINES~PLACEDARMID TRUE
end
return
:MINES~LAID_ARMID
setvar $MINES~LAID_ARMID TRUE
setvar $MINES~PLACEDARMID TRUE
pause
:MINES~LAID_LIMP
setvar $MINES~LAID_LIMP TRUE
setvar $MINES~PLACEDLIMPET TRUE
pause
:MINES~REFRESH_CLEAR_SECTOR_STATE
setvar $MINES~LIMPETOWNER SECTOR.LIMPETS.OWNER[$PLAYER~CURRENT_SECTOR]
setvar $MINES~ARMIDOWNER SECTOR.MINES.OWNER[$PLAYER~CURRENT_SECTOR]
setvar $MINES~LIMPETCOUNT SECTOR.LIMPETS.QUANTITY[$PLAYER~CURRENT_SECTOR]
setvar $MINES~ARMIDCOUNT SECTOR.MINES.QUANTITY[$PLAYER~CURRENT_SECTOR]
setvar $MINES~SECTORCLEAR FALSE
if ((($MINES~LIMPETCOUNT <= 0) or (($MINES~LIMPETOWNER = "belong to your Corp") or ($MINES~LIMPETOWNER = "yours"))) and ((($MINES~ARMIDCOUNT <= 0) or (($MINES~ARMIDOWNER = "belong to your Corp") or ($MINES~ARMIDOWNER = "yours")))))
  setvar $MINES~SECTORCLEAR TRUE
end
return

:MINES~CLEAR_SECTOR_ATTEMPTCLEARINGMINES
setvar $MINES~I 0
gosub :REFRESH_CLEAR_SECTOR_STATE
while (($MINES~I < 10) and ($MINES~SECTORCLEAR <> TRUE))
  gosub :XENTER~XENTER
  add $MINES~I 1
  gosub :REFRESH_CLEAR_SECTOR_STATE
end
gosub :PLAYER~QUIKSTATS

if ($MINES~STARTINGLOCATION = "Citadel")
  send "q qq z n *  "
end
if ($PLAYER~SURROUNDMINE <= 0)
  setvar $PLAYER~SURROUNDMINE 3
end
if ($PLAYER~SURROUNDLIMP <= 0)
  setvar $PLAYER~SURROUNDLIMP 3
end
if ($MINES~MINESTODEPLOY <= 0)
  if ($PLAYER~ARMIDS < $PLAYER~SURROUNDMINE)
    setvar $MINES~MINESTODEPLOY $PLAYER~ARMIDS
  else
    setvar $MINES~MINESTODEPLOY $PLAYER~SURROUNDMINE
  end
end
if ($MINES~LIMPSTODEPLOY <= 0)
  if ($PLAYER~LIMPETS < $PLAYER~SURROUNDLIMP)
    setvar $MINES~LIMPSTODEPLOY $PLAYER~LIMPETS
  else
    setvar $MINES~LIMPSTODEPLOY $PLAYER~SURROUNDLIMP
  end
end
setvar $MINES~CLEARMAC ""
if (($MINES~ARMIDOWNER <> "belong to your Corp") and ($MINES~ARMIDOWNER <> "yours"))
  setvar $MINES~CLEARMAC $MINES~CLEARMAC&"h  1  z "&$MINES~MINESTODEPLOY&"*  z c  *  "
end
if (($MINES~LIMPETOWNER <> "belong to your Corp") and ($MINES~LIMPETOWNER <> "yours"))
  setvar $MINES~CLEARMAC $MINES~CLEARMAC&"h  2  z "&$MINES~LIMPSTODEPLOY&"*  z c  *   "
end
send $MINES~CLEARMAC
gosub :PLAYER~QUIKSTATS
if (($MINES~BEFORELIMPETS > $PLAYER~LIMPETS) or ($MINES~LIMPETOWNER = "belong to your Corp") or ($MINES~LIMPETOWNER = "yours"))
  setvar $MINES~PLACEDLIMPET TRUE
end
if (($MINES~BEFOREARMIDS > $PLAYER~ARMIDS) or ($MINES~ARMIDOWNER = "belong to your Corp") or ($MINES~ARMIDOWNER = "yours"))
  setvar $MINES~PLACEDARMID TRUE
end
if ($MINES~STARTINGLOCATION = "Citadel")
  send "l j"&#8&$PLANET~PLANET&"* c  "
end
return

include "source\include\xenter"
include "source\include\planet"
include "source\include\bot"
