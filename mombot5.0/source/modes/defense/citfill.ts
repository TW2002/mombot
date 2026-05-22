gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1]   $help~tab&"citfill {number of fighters to refill} {auto}"
setvar $help~help[2]   $help~tab&"              "
setvar $help~help[3]   $help~tab&"      Refills any corpie above a planet who "
setvar $help~help[4]   $help~tab&"      attacks/is attacked or deploys fighters."
setvar $help~help[5]   $help~tab&"         "
setvar $help~help[6]   $help~tab&"       Options:"
setvar $help~help[7]   $help~tab&"           {auto} - auto refill every five minutes"
setvar $help~help[8]   $help~tab&"         "
setvar $help~help[9]   $help~tab&"       Examples: "
setvar $help~help[10]  $help~tab&"           >citfill 25000 auto"
setvar $help~help[11]  $help~tab&"           >citfill"
setvar $help~help[12]  $help~tab&"           >citfill auto "
gosub :help~helpfile

setvar $rankslength 	47
setarray $traders 	200
setarray $ranks 	$rankslength
setvar $ranks[1] 	"36mCivilian"
setvar $ranks[2] 	"36mPrivate 1st Class"
setvar $ranks[3] 	"36mPrivate"
setvar $ranks[4] 	"36mLance Corporal"
setvar $ranks[5] 	"36mCorporal"
setvar $ranks[6] 	"36mStaff Sergeant"
setvar $ranks[7] 	"36mGunnery Sergeant"
setvar $ranks[8] 	"36m1st Sergeant"
setvar $ranks[9] 	"36mSergeant Major"
setvar $ranks[10]	"36mSergeant"
setvar $ranks[11] 	"31mAnnoyance"
setvar $ranks[12] 	"31mNuisance 3rd Class"
setvar $ranks[13] 	"31mNuisance 2nd Class"
setvar $ranks[14] 	"31mNuisance 1st Class"
setvar $ranks[15] 	"31mMenace 3rd Class"
setvar $ranks[16] 	"31mMenace 2nd Class"
setvar $ranks[17] 	"31mMenace 1st Class"
setvar $ranks[18] 	"31mSmuggler 3rd Class"
setvar $ranks[19] 	"31mSmuggler 2nd Class"
setvar $ranks[20] 	"31mSmuggler 1st Class"
setvar $ranks[21] 	"31mSmuggler Savant"
setvar $ranks[22] 	"31mRobber"
setvar $ranks[23] 	"31mTerrorist"
setvar $ranks[24] 	"31mInfamous Pirate"
setvar $ranks[25] 	"31mNotorious Pirate"
setvar $ranks[26] 	"31mDread Pirate"
setvar $ranks[27] 	"31mPirate"
setvar $ranks[28] 	"31mGalactic Scourge"
setvar $ranks[29] 	"31mEnemy of the State"
setvar $ranks[30] 	"31mEnemy of the People"
setvar $ranks[31] 	"31mEnemy of Humankind"
setvar $ranks[32] 	"31mHeinous Overlord"
setvar $ranks[33] 	"31mPrime Evil"
setvar $ranks[34] 	"36mChief Warrant Officer"
setvar $ranks[35] 	"36mWarrant Officer"
setvar $ranks[36] 	"36mEnsign"
setvar $ranks[37] 	"36mLieutenant J.G."
setvar $ranks[38] 	"36mLieutenant Commander"
setvar $ranks[39] 	"36mLieutenant"
setvar $ranks[40] 	"36mCommander"
setvar $ranks[41] 	"36mCaptain"
setvar $ranks[42] 	"36mCommodore"
setvar $ranks[43] 	"36mRear Admiral"
setvar $ranks[44] 	"36mVice Admiral"
setvar $ranks[45] 	"36mFleet Admiral"
setvar $ranks[46] 	"36mAdmiral"
setvar $endline 	"_ENDLINE_"
setvar $startline 	"_STARTLINE_"
setvar $lasttarget 	""

:figme
killalltriggers
gosub :player~quikstats
setvar $startinglocation $player~current_prompt
if ($startinglocation <> "Citadel")
	setvar $switchboard~message "This mode must be run from the Citadel Prompt*"
	gosub :switchboard~switchboard
	halt
end
if ($bot~parm1 = "on")
	setvar $bot~parm1 $bot~parm2
end
gosub :ship~getshipstats

isnumber $test $bot~parm1
if ($test <> true)
	setvar $bot~parm1 $ship~ship_max_attack
end
if ($bot~parm1 <= 0)
	setvar $figstorefill $ship~ship_max_attack
else
	setvar $figstorefill $bot~parm1
end
setvar $ship~shipstats false
gosub :ship~loadshipinfo

getwordpos " "&$bot~user_command_line&" " $pos " auto "
if ($pos > 0)
	setvar $auto true
else
	setvar $auto false
end

:start_cit_fill
setvar $switchboard~message "Citadel Ship Re-Filler :: Powering Up!*"
gosub :switchboard~switchboard

:warning_cit_fill
send "\"
waitfor "Online Auto Flee"
getword currentline $fleetest 5
if ($fleetest = "enabled.")
	send "\"
end

send "q m***"
gosub :planet~getplanetinfo
send "c "

setvar $switchboard~message "Citadel Ship Re-Filler :: Running on Planet "&$planet~planet&" :: "&$planet~planet_fighters&" Fighters available on surface.*"
gosub :switchboard~switchboard
setvar $switchboard~message "Citadel Ship Re-Filler now active! Script will re-fig an ally in the sector over planet " & $planet~planet & ".*"
gosub :switchboard~switchboard
if ($auto = true)
	setvar $switchboard~message " Doing auto refill every five minutes.*"
	gosub :switchboard~switchboard
end
goto :settriggers

:settriggers
killalltriggers
settextlinetrigger 1 :reloadfigme "launches a wave of fighters"
settextlinetrigger 2 :reloadfigme "deploys some fighters"
if ($auto = true)
	setdelaytrigger 3 :reloadfigme 300000
end
settexttrigger 		pause 	:pausing 		"Planet command (?="
settexttrigger 		pause2 	:pausing 		"Computer command ["
settexttrigger 		pause3 	:pausing 		"Corporate command ["
pause

:pausing
killalltriggers
echo ansi_6 "*[" ansi_14 "Citadel Filler paused. To restart, re-enter citadel prompt" ansi_6 "]*" ansi_7
settexttrigger restart :restarting "Citadel command ("
pause

:restarting
killalltriggers
echo ansi_6 "*[" ansi_14 "Citadel Filler restarted" ansi_6 "]*" ansi_7
goto :settriggers

:reloadfigme
killalltriggers
# Kaboom launches a wave of fighters at the blarg
# Kaboom deploys some fighters.
getword currentline $test 1
setvar $whodidit " "&currentline&" "
lowercase $whodidit
if ($test = "F") or ($test = "R") or ($test = "P") or ($test = "'") or ($test = "`")
	goto :settriggers
end
gosub :getsectordata
setvar $targetstring ""
if ($realtradercount > 0)
	setvar $c 1
	setvar $isfound false
	setvar $targettrader ""
	setvar $targettradercorp 0
	setvar $targettraderfighters 0
	setvar $targettradershiptype ""
	while (($c <= $realtradercount) and ($isfound <> true))
		if ($traders[$c][1] = $player~corp)
			lowercase $traders[$c]
			getwordpos $whodidit $pos " "&$traders[$c]&" "
			getwordpos $whodidit $pos2 " "&$traders[$c]&". "
			if ((($pos > 0) or ($pos2 > 0)) or ($auto = true))
				setvar $targetstring $targetstring&"y "
				setvar $targettrader $traders[$c]
				setvar $targettradercorp $traders[$c][1]
				setvar $targettraderfighters $traders[$c][3]
				setvar $targettradershiptype $traders[$c][4]
				setvar $isfound true
			else
				setvar $targetstring $targetstring&"* "
			end
		end
		add $c 1
	end

else
	echo ansi_12 "*No corpie to refurb.*" ansi_7
	goto :settriggers
end
if ($isfound <> true)
	goto :settriggers
end
gosub :getrefillamount
if ($refillamount > 0)
	gosub :sendsinglerefill
elseif ($unknownship = true)
	gosub :sendunknownshiprefill
end
gosub :player~quikstats
goto :settriggers

:getrefillamount
setvar $unknownship true
setvar $refillamount 0
if ($targettradershiptype = "")
	return
end
if ($ship~shipstats <> true)
	return
end
setvar $normalizedtradershiptype $targettradershiptype
lowercase $normalizedtradershiptype
striptext $normalizedtradershiptype ""
striptext $normalizedtradershiptype "["
striptext $normalizedtradershiptype "0m"
striptext $normalizedtradershiptype "1m"
striptext $normalizedtradershiptype "0;"
striptext $normalizedtradershiptype "1;"
striptext $normalizedtradershiptype "34m"
striptext $normalizedtradershiptype "35m"
striptext $normalizedtradershiptype "36m"
striptext $normalizedtradershiptype "40m"
striptext $normalizedtradershiptype "47m"
striptext $normalizedtradershiptype "  "
striptext $normalizedtradershiptype "unknown "
setvar $shiplookup 1
while ($shiplookup <= $ship~shipcounter)
	setvar $shiplookupname $ship~shiplist[$shiplookup]
	lowercase $shiplookupname
	striptext $shiplookupname ""
	striptext $shiplookupname "["
	striptext $shiplookupname "0m"
	striptext $shiplookupname "1m"
	striptext $shiplookupname "0;"
	striptext $shiplookupname "1;"
	striptext $shiplookupname "34m"
	striptext $shiplookupname "35m"
	striptext $shiplookupname "36m"
	striptext $shiplookupname "40m"
	striptext $shiplookupname "47m"
	striptext $shiplookupname "  "
	getwordpos $normalizedtradershiptype $shipmatch1 $shiplookupname
	getwordpos $shiplookupname $shipmatch2 $normalizedtradershiptype
	if (($shiplookupname = $normalizedtradershiptype) or ($shipmatch1 > 0) or ($shipmatch2 > 0))
		setvar $unknownship false
		setvar $targetmaxfighters $ship~shiplist[$shiplookup][5]
		setvar $refillamount ($targetmaxfighters - $targettraderfighters)
		if ($refillamount > $figstorefill)
			setvar $refillamount $figstorefill
		end
		if ($refillamount < 0)
			setvar $refillamount 0
		end
		return
	end
	add $shiplookup 1
end
return

:sendsinglerefill
setvar $requestedrefillamount $refillamount
gosub :enterunknownshiptransfer
killalltriggers
settextlinetrigger knownshipcounts :knownshipcounts "You have "
settexttrigger knownshipamount :knownshipamount "How many to transfer?"
send "f "&$targetstring&" * "
pause
return

:knownshipcounts
setvar $knownshipline currentline
replacetext $knownshipline "," ""
getword $knownshipline $liveplayerfighters 3
getword $knownshipline $livetargetfighters 8
pause

:knownshipamount
killtrigger knownshipcounts
killtrigger knownshipamount
setvar $liverefillamount ($targetmaxfighters - $livetargetfighters)
if ($liverefillamount > $requestedrefillamount)
	setvar $liverefillamount $requestedrefillamount
end
if ($liverefillamount > $liveplayerfighters)
	setvar $liverefillamount $liveplayerfighters
end
if ($liverefillamount <= 0)
	send "q q c "
	return
end
killalltriggers
settextlinetrigger knownshiptoomany :knownshiptoomany "can only carry"
settexttrigger knownshipdone :knownshipdone "Corporate command ["
send $liverefillamount "* "
pause

:knownshiptoomany
pause

:knownshipdone
killalltriggers
send "* l " & $planet~planet & "* m * * * c "
return

:sendunknownshiprefill
setvar $remainingrefill $figstorefill
gosub :enterunknownshiptransfer
while ($remainingrefill > 0)
	if ($remainingrefill > 1000)
		setvar $refillamount 1000
	else
		setvar $refillamount $remainingrefill
	end
	gosub :sendunknownshipchunk
	if ($targetshipfull = true)
		goto :finishunknownshiprefill
	end
	subtract $remainingrefill $refillamount
end

:finishunknownshiprefill
send "* l " & $planet~planet & "* m * * * c "
return

:enterunknownshiptransfer
send "q q t "
waitfor "Corporate command ["
return

:sendunknownshipchunk
setvar $targetshipfull false
killalltriggers
settextlinetrigger unknownshipchunkfull :unknownshipchunkfull "can only carry"
settexttrigger unknownshipchunkdone :unknownshipchunkdone "Corporate command ["
send "f "&$targetstring&" * z"&$refillamount&"* "
pause

:unknownshipchunkfull
setvar $targetshipfull true
pause

:unknownshipchunkdone
killalltriggers
return

:findcurrenttargettrader
setvar $targetstillhere false
setvar $scantrader 1
while ($scantrader <= $realtradercount)
	if (($traders[$scantrader] = $targettrader) and ($traders[$scantrader][1] = $targettradercorp))
		setvar $targettraderfighters $traders[$scantrader][3]
		setvar $targettradershiptype $traders[$scantrader][4]
		setvar $targetstillhere true
		return
	end
	add $scantrader 1
end
return

:gettraders
getwordpos $sectordata $postrader "[0m[33mTraders [1m:"
if ($postrader > 0)
	gettext $sectordata $traderdata "[0m[33mTraders [1m:" "[0m[1;32mWarps to Sector(s) [33m:"
	setvar $traderdata $startline&$traderdata
	gettext $traderdata $temp $startline $endline
	setvar $realtradercount 0
	setvar $player~corpiecount 0
	while ($temp <> "")
		getlength $startline&$temp&$endline $length
		cuttext $traderdata $traderdata ($length+1) 9999
		striptext $temp $startline
		striptext $temp $endline
		striptext $temp "[0m          "
		striptext $temp "[0m[33mTraders [1m:"
		setvar $j 1
		setvar $isfound false
		while (($j < $rankslength) and ($isfound = false))
			getwordpos $temp $pos $ranks[$j]
			if ($pos > 0)
				getlength $ranks[$j] $length
				cuttext $temp $temp ($pos+$length+1) 9999
				if ($j <= 10)
					setvar $traders[($realtradercount+1)][2] true
				else
					setvar $traders[($realtradercount+1)][2] false
				end
				setvar $isfound true
			end
			add $j 1
		end
		getwordpos $temp $pos "[0;32m w/"
		getwordpos $temp $pos2 "[0;35m[[31mOwned by[35m]"
		if (($pos > 0) and ($pos2 <= 0))
			getwordpos $temp $pos "[[1;36m"
			if ($pos > 0)
				gettext $temp $tempcorp "[[1;36m" "[0;34m]"
				striptext $tempcorp ""
			else
				setvar $tempcorp 99999
			end
			setvar $rawtraderline $temp
			replacetext $temp "[0;34m" "[34m"
			getwordpos $temp $pos "[34m"
			cuttext $temp $temp 1 $pos
			striptext $temp ""
			lowercase $temp
			setvar $traders[($realtradercount+1)][3] 0
			setvar $fighterline $rawtraderline
			replacetext $fighterline "," ""
			getwordpos $fighterline $fighterpos "w/"
			if ($fighterpos > 0)
				gettext $fighterline $traders[($realtradercount+1)][3] "w/ " " ftrs"
				striptext $traders[($realtradercount+1)][3] "[1;36m"
				striptext $traders[($realtradercount+1)][3] "[0;32m"
				striptext $traders[($realtradercount+1)][3] " "
			end
			isnumber $fighterok $traders[($realtradercount+1)][3]
			if ($fighterok <> true)
				setvar $traders[($realtradercount+1)][3] 0
			end
			gettext $traderdata $shipline $startline $endline
			striptext $shipline $startline
			striptext $shipline $endline
			striptext $shipline "  "
			setvar $tempshiptype ""
			setvar $traders[($realtradercount+1)][4] $shipline
			getwordpos $shipline $shippos " ("
			if ($shippos > 0)
				gettext $shipline $tempshiptype " (" ")"
				if ($tempshiptype <> "")
					setvar $traders[($realtradercount+1)][4] $shipline&" "&$tempshiptype
				end
			end
			setvar $traders[($realtradercount+1)] $temp
			setvar $traders[($realtradercount+1)][1] $tempcorp
			#echo "*" $traders[($realTraderCount+1)] "   " $traders[($realTraderCount+1)][1] "   " $traders[($realTraderCount+1)][2] "*"
			add $realtradercount 1
			if ($tempcorp = $player~corp)
				add $player~corpiecount 1
			end
		end
		gettext $traderdata $temp $startline $endline
	end
else
	setvar $realtradercount 0
	setvar $player~corpiecount 0
end
return

:getemptyships
getwordpos $sectordata $posships "[0m[33mShips   [1m:"
if ($posships > 0)
	gettext $sectordata $shipdata "[0m[33mShips   [1m:" "[0m[1;32mWarps to Sector(s) [33m:"
	setvar $shipdata $startline&$shipdata
	gettext $shipdata $temp $startline $endline
	setvar $emptyshipcount 0
	while ($temp <> "")
		getlength $startline&$temp&$endline $length
		cuttext $shipdata $shipdata ($length+1) 9999
		striptext $temp $startline
		striptext $temp "  "
		striptext $temp $endline
		getwordpos $temp $pos2 "[0;35m[[31mOwned by[35m]"
		if ($pos2 > 0)
			cuttext $temp $temp $pos2 9999
			striptext $temp "[0;35m[[31mOwned by[35m] "
			getwordpos $temp $pos3 ",[0;32m w/"
			cuttext $temp $temp 0 $pos3
			getwordpos $temp $pos4 "[34m[[1;36m"
			striptext $temp "[1;33m,"
			if ($pos4 > 0)
				cuttext $temp $temp $pos4 9999
				striptext $temp "[34m[[1;36m"
				striptext $temp "[0;34m]"
			end
			setvar $emptyships[($emptyshipcount+1)] $temp
			add $emptyshipcount 1
		end
		gettext $shipdata $temp $startline $endline
	end
else
	setvar $emptyshipcount 0
end
return

:getfaketraders
getwordpos $sectordata $posships "[0m[33mShips   [1m:"
getwordpos $sectordata $postraders "[0m[33mTraders [1m:"

if ($postraders > 0)
	gettext $sectordata $fakedata "[1;32mSector  [33m:" "[0m[33mTraders [1m:"
	setvar $fakedata $startline&$fakedata
	gettext $fakedata $temp $startline $endline
	setvar $faketradercount 0
	while ($temp <> "")
		getlength $startline&$temp&$endline $length
		cuttext $fakedata $fakedata ($length+1) 9999
		striptext $temp $startline
		striptext $temp "  "
		striptext $temp $endline
		getwordpos $temp $pos "33m,[0;32m w/ "
		if ($pos <= 0)
			getwordpos $temp $pos "[0;32mw/ "
		end
		getwordpos $temp $pos2 "[33m, [0;32mwith"
		getwordpos $temp $pos3 "[0;35m[[31mOwned by[35m]"
		if ((($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
			#setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
			add $faketradercount 1
		end
		gettext $fakedata $temp $startline $endline

	end

elseif ($posships > 0)
	gettext $sectordata $fakedata "[1;32mSector  [33m:" "[0m[33mShips   [1m:"
	setvar $fakedata $startline&$fakedata
	gettext $fakedata $temp $startline $endline
	setvar $faketradercount 0
	while ($temp <> "")
		getlength $startline&$temp&$endline $length
		cuttext $fakedata $fakedata ($length+1) 9999
		striptext $temp $startline
		striptext $temp "  "
		striptext $temp $endline
		getwordpos $temp $pos "33m,[0;32m w/ "
		getwordpos $temp $pos2 "[33m, [0;32mwith"
		getwordpos $temp $pos3 "[0;35m[[31mOwned by[35m]"
		if ((($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
			#setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
			add $faketradercount 1
		end
		gettext $fakedata $temp $startline $endline

	end
else
	gettext $sectordata $fakedata "[1;32mSector  [33m:" "[0m[1;32mWarps to Sector(s) [33m:"
	setvar $fakedata $startline&$fakedata
	gettext $fakedata $temp $startline $endline
	setvar $faketradercount 0
	while ($temp <> "")
		getlength $startline&$temp&$endline $length
		cuttext $fakedata $fakedata ($length+1) 9999
		striptext $temp $startline
		striptext $temp "  "
		striptext $temp $endline
		getwordpos $temp $pos "33m,[0;32m w/ "
		getwordpos $temp $pos2 "[33m, [0;32mwith"
		getwordpos $temp $pos3 "[0;35m[[31mOwned by[35m]"
		if ((($pos > 0) or ($pos2 > 0)) and ($pos3 <= 0))
			#setVar $FAKETRADERS[($fakeTraderCount+1)] $temp
			add $faketradercount 1
		end
		gettext $fakedata $temp $startline $endline
	end
end
return

:getsectordata
killalltriggers
gosub :player~quikstats
if ($player~current_prompt = "Citadel")
	send "s* "
else
	send "** "
end
setvar $sectordata ""

:sectorsline_cit_kill
killtrigger getline
setvar $line currentansiline
setvar $line $startline&$line&$endline
setvar $sectordata $sectordata&$line
getwordpos $line $pos "Warps to Sector(s) "
if ($pos > 0)
	goto :gotsectordata
else
	settextlinetrigger getline :sectorsline_cit_kill
end
pause

:gotsectordata
killalltriggers
gosub :gettraders
gosub :getemptyships
gosub :getfaketraders
return

#INCLUDES:
include "source\include\planet"
include "source\include\ship"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
