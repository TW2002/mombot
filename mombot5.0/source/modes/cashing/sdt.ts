reqrecording

:load_variables
loadvar $switchboard~bot_name
loadvar $bot~user_command_line
loadvar $player~unlimitedgame
loadvar $bot~subspace

gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~subspace

loadvar $game~steal_factor
loadvar $bot~bot_turn_limit
loadvar $game~ptradesetting

setvar $help~help[1]  $help~tab&" sdt {resetlra} [ship1] [ship2] [planet1] [planet2]*"
setvar $help~help[2]  $help~tab&"     {swap}*"
setvar $help~help[3]  $help~tab&"    "
setvar $help~help[4]  $help~tab&"    Do NOT need to start in Ship 1 or Ship 2."
setvar $help~help[5]  $help~tab&"    First Steal will be from Ship 1."
setvar $help~help[6]  $help~tab&"    Checks last rob and busts from Sec Params"
setvar $help~help[7]  $help~tab&"     "
setvar $help~help[8]  $help~tab&"    Options: "
setvar $help~help[9]  $help~tab&"     {resetlra} will reset last rob sector and exit"
setvar $help~help[10] $help~tab&"     "
setvar $help~help[11] $help~tab&"    Will use EP Haggle if running in bot"
setvar $help~help[12] $help~tab&"    Created by Cherokee"
gosub :help~helpfile

setvar $switchboard~message "SDT - Steal Dump Transport 2.1 starting up!*"
gosub :switchboard~switchboard

if ($bot~parm1 = "resetlra")
	setsectorparameter 1 "LRA" 1
	setvar $switchboard~message "Last rob sector reset.... Halting....*"
	gosub :switchboard~switchboard
	halt
end

getwordpos " "&$bot~user_command_line&" " $pos " resetlra"
if ($pos > 0)
	setsectorparameter 1 "LRA" 1
	setvar $switchboard~message "Last rob sector reset.*"
	gosub :switchboard~switchboard
end

getwordpos " "&$bot~user_command_line&" " $pos " swap "
setvar $swap false
if ($pos > 0)
	setvar $swap true
end

setvar $cksdtquiet "OFF"
setvar $beamfurbing "n"
setvar $ship_1 $bot~parm1
setvar $ship_2 $bot~parm2
setvar $planet~planet[$ship_1] $bot~parm3
setvar $planet~planet[$ship_2] $bot~parm4

isnumber $test $bot~parm1
if ($test)
else
	setvar $switchboard~message "Ship 1 Must Be a Number.*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $bot~parm2
if ($test)
else
	setvar $switchboard~message "Ship 2 Must Be a Number.*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $bot~parm3
if ($test)
else
	setvar $switchboard~message "Planet 1 Must Be a Number.*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $bot~parm4
if ($test)
else
	setvar $switchboard~message "Planet 2 Must Be a Number.*"
	gosub :switchboard~switchboard
	halt
end

getwordpos " "&$bot~user_command_line&" " $pos " noavoid "
setvar $noavoid false
if ($pos > 0)
	setvar $noavoid true
end
if ($game~steal_factor = 0)
	setvar $game~steal_factor 21
	setvar $switchboard~message "No Steal factor!! assuming 21, you need to ensure bot has refreshed!*"
	gosub :switchboard~switchboard
end

# ----- make sure we are at a good prompt -----
:verifyprompt
gosub :player~quikstats
setvar $location $player~current_prompt
if ($location <> "Command")
	setvar $exit_message "Must start at Command Prompt for SDT"
	goto :exit
end

logging off
gosub :startcnsettings

getsectorparameter 1 "LRA" $last_rob_attempt
setvar $switchboard~message "last rob attempt: "&$last_rob_attempt&"*"
gosub :switchboard~switchboard
send "czq"
waiton "-----------------------------------------------------------------------------"
settextlinetrigger     shipnumber     :getshipnumber "Corp"
setslinetrigger     doneships      :init "Computer command ["
pause

:getshipnumber
getword currentline $shiptest 1
getword currentline $shiplocation 2
isnumber $is_a_number $shiplocation
if ($is_a_number)
	if ($ship_1 = $shiptest)
		if ($shiplocation = $last_rob_attempt)
			setvar $temp $ship_1
			setvar $ship_1 $ship_2
			setvar $ship_2 $temp
			goto :init
		end
	end
end
settextlinetrigger     shipnumber     :getshipnumber "Corp"
pause

:init
killalltriggers

:verifyship
gosub :player~quikstats
if ($player~ship_number <> $ship_1)
	send "x   " $ship_1 "*  q z *   "
end
gosub :player~quikstats
if ($player~ship_number <> $ship_1)
	setvar $exit_message "Cannot Xport to Ship 1.  Check Xport Range.  Halting.*"
	goto :exit
end

# ----- INIT VARIABLES
setvar $current_ship $ship_1
setvar $low_turns "NO"
setvar $skip_ships "NO"
setvar $shipvoidsset[$ship_1] false
setvar $shipvoidsset[$ship_2] false

# ----------------------------------------
setvar $maxcycles 8
setvar $maxbadsells 3
setvar $debugdelay 0
# ----------------------------------------

# ----- SHIP 1 INIT
setvar $total_revenue[$current_ship] 0
setvar $equ_sold[$current_ship] 0
gosub :getinfo
setvar $sector[$current_ship] $player~current_sector

# CHECK BUSTED SECTOR
getsectorparameter $player~current_sector "BUSTED" $bustthissec
if ($bustthissec = true)
	setvar $switchboard~message "According to my data i've busted here - ending*"
	gosub :switchboard~switchboard
	if (($shipvoidsset[$current_ship] = true) and ($noavoid <> true))
		gosub :sector~clearvoidadjacent
		setvar $shipvoidsset[$current_ship] false
	end
	gosub :endcnsettings
	halt
end

setvar $holds[$current_ship] $holds
setvar $init_credits $player~credits
setvar $init_exp $exp
setvar $init_turns $player~turns
setvar $player~turns_used 0
setvar $switchboard~message "running ships " & $ship_1 & " / " & $ship_2 "*"
gosub :switchboard~switchboard
setvar $switchboard~message "Starting with Credits: " & $init_credits & " Exp: " & $init_exp & " Turns: " & $init_turns & ".*"
gosub :switchboard~switchboard
send "*"
waitfor "(?=Help)?"
if ($noavoid <> true)
	gosub :sector~voidadjacent
	setvar $shipvoidsset[$current_ship] true
end
gosub :checkplanet
gosub :checkport
gosub :checkupgrade
gosub :stealdump
gosub :xport

# ----- SHIP 2 INIT
setvar $total_revenue[$current_ship] 0
setvar $equ_sold[$current_ship] 0
gosub :getinfo
setvar $sector[$current_ship] $player~current_sector
getsectorparameter $player~current_sector "BUSTED" $bustthissec
if ($bustthissec = true)
	setvar $switchboard~message "According to my data i've busted here - ending*"
	gosub :switchboard~switchboard
	if (($shipvoidsset[$current_ship] = true) and ($noavoid <> true))
		gosub :sector~clearvoidadjacent
		setvar $shipvoidsset[$current_ship] false
	end
	gosub :endcnsettings
	halt
end
setvar $holds[$current_ship] $holds
send "*"
waitfor "(?=Help)?"
if ($noavoid <> true)
	gosub :sector~voidadjacent
	setvar $shipvoidsset[$current_ship] true
end
gosub :checkplanet
gosub :checkport
gosub :checkupgrade
gosub :stealdump
gosub :xport
setvar $skip_ships "YES"

# ----- MAIN PROGRAM LOOP
:sdtloop
gosub :checkupgrade
gosub :stealdump
setvar $player~turns $init_turns
subtract $player~turns $player~turns_used
if ($player~turns > $bot~bot_turn_limit)
	gosub :xport
	goto :sdtloop
else
	setvar $switchboard~message "Low Turns, Halting Script*"
	gosub :switchboard~switchboard
	setvar $low_turns "YES"
	goto :finish
end

# ----- FINISH
:finish
if (($shipvoidsset[$current_ship] = true) and ($noavoid <> true))
	gosub :sector~clearvoidadjacent
	setvar $shipvoidsset[$current_ship] false
end
if ($current_ship = $ship_1)
	setvar $other_ship $ship_2
	setvar $player~current_sector $sector[$ship_2]
else
	setvar $other_ship $ship_1
	setvar $player~current_sector $sector[$ship_1]
end
if (($shipvoidsset[$other_ship] = true) and ($player~current_sector <> 0) and ($noavoid <> true))
	gosub :sector~clearvoidadjacent
	setvar $shipvoidsset[$other_ship] false
end
gosub :endcnsettings
setvar $cash_made $player~credits
subtract $cash_made $init_credits
setvar $exp_made $exp
subtract $exp_made $init_exp
if ($equ_sold[$ship_1] <> 0)
	setvar $credsperunit[$ship_1] $total_revenue[$ship_1]
	divide $credsperunit[$ship_1] $equ_sold[$ship_1]
else
	setvar $credsperunit[$ship_1] 0
end
if ($equ_sold[$ship_2] <> 0)
	setvar $credsperunit[$ship_2] $total_revenue[$ship_2]
	divide $credsperunit[$ship_2] $equ_sold[$ship_2]
else
	setvar $credsperunit[$ship_2] 0
end
if ($player~turns_used <> 0)
	setvar $credsperturn $cash_made
	divide $credsperturn $player~turns_used
else
	setvar $credsperturn 0
end
format $total_revenue[$ship_1] $ship1money number
format $total_revenue[$ship_2] $ship2money number
format $equ_sold[$ship_1] $ship1equ number
format $equ_sold[$ship_2] $ship2equ number
format $cash_made $cashformat number
format $credsperturn $credsperturnformat number
setvar $switchboard~message "   - Ship " & $ship_1 & " - " & $ship1money & " cr - " & $ship1equ & " units (" & $credsperunit[$ship_1] & "/unit) - MCIC " & $mcic[$ship_1] & "*   - Ship " & $ship_2 & " - " & $ship2money & " cr - " & $ship2equ & " units (" & $credsperunit[$ship_2] & "/unit) - MCIC " & $mcic[$ship_2] & "*   - Net " & $cashformat & " credits in " & $player~turns_used & " turns (" & $credsperturnformat & "/turn).*  *"
#gosub :switchboard~switchboard

if ($low_turns <> "YES")
	if ($beamfurbing = "n")
		setvar $switchboard~message  $switchboard~message & "Busted in ship " & $current_ship & ", FURB please, I still have " & $player~turns & " turns to run.*"

	else
		setvar $switchboard~message  $switchboard~message &  "Furb Ship " & $current_ship & " I still have " & $player~turns & " turns to run.*"

		gosub :xport
	end
else
	setvar $switchboard~message  $switchboard~message &  "NO Bust, stopping because I'm down to " & $player~turns & " turns.*"

end
gosub :switchboard~switchboard
goto :exit

# ----- BEGIN SUBROUTINES SECTION -----

# ----- SUB :checkPlanet
:checkplanet
settextlinetrigger noplanet :noplanet "There isn't a planet in this sector."
settextlinetrigger planetnum :planetnum "Registry# and Planet Name"
settextlinetrigger landing :landing "Landing sequence engaged..."
send "L"
pause
pause

:noplanet
killalltriggers
gosub :endcnsettings
setvar $exit_message "There isn't a planet in this sector."
goto :exit

:planetnum
killalltriggers
if ($planet~planet[$current_ship] <> 0)
	send $planet~planet[$current_ship] & "*"
end
settextlinetrigger wrongplanet :wrongplanet "That planet is not in this sector."
settextlinetrigger wrongplanet2 :wrongplanet "Invalid registry number, landing aborted."
settextlinetrigger landing :landing "Landing sequence engaged..."
pause
pause

:wrongplanet
killalltriggers
send "Q*"
gosub :endcnsettings
setvar $exit_message "That planet is not in this sector."
goto :exit

:landing
killalltriggers
send "SNL1*TNL1*TNL2*TNL3*"
waitfor "How many holds of Equipment do you want to leave"
waitfor "Planet command"
gosub :planet~getplanetinfo
setvar $planet~planet[$current_ship] $planet~planet
setvar $planet~planet[$current_ship].equ $planet~planetequip
send "QJY"
waitfor "Are you sure you want to jettison"
return

# ----- SUB :checkPort
:checkport
send "D"
waitfor "<Re-Display>"
settextlinetrigger getport :getport "Ports   :"
setstrigger noport :noport "Command [TL="
pause
pause

:getport
killalltriggers
gettext currentline $port[$current_ship] ", Class " " ("
if ($port[$current_ship] <> 2) and ($port[$current_ship] <> 3) and ($port[$current_ship] <> 4) and ($port[$current_ship] <> 8)
	gosub :endcnsettings
	setvar $exit_message "This is not an equipment buying port, you can't SDT here!"
	goto :exit
else
	send "CR*Q"
	settextlinetrigger getequonport :getequonport "Equipment  Buying"
	pause
	pause

	:getequonport
	killalltriggers
	getword currentline $port[$current_ship].equ_amount 3
	getword currentline $port[$current_ship].equ_pct 4
	striptext $port[$current_ship].equ_pct "%"
	add $port[$current_ship].equ_pct 1
	setvar $port[$current_ship].equ_max $port[$current_ship].equ_amount
	multiply $port[$current_ship].equ_max 100
	divide $port[$current_ship].equ_max $port[$current_ship].equ_pct
	setvar $port[$current_ship].equ_on_port $port[$current_ship].equ_max
	subtract $port[$current_ship].equ_on_port $port[$current_ship].equ_amount
	return
end

:noport
killalltriggers
gosub :endcnsettings
setvar $exit_message "There is no port, you can't SDT here!"
goto :exit

# ----- SUB :checkUpgrade
# ----- USED WITHIN MAIN PROGRAM LOOP
:checkupgrade
setvar $steal_holds $exp
divide $steal_holds $game~steal_factor
if ($steal_holds < 10)
	gosub :endcnsettings
	setvar $exit_message "You need more experience to SDT!!!"
	goto :exit
elseif ($holds[$current_ship] < 10)
	gosub :endcnsettings
	setvar $exit_message "You need more cargo holds to SDT!!!"
	goto :exit
end
if ($steal_holds > $holds[$current_ship])
	setvar $steal_holds $holds[$current_ship]
end

:calcsectorequ
setvar $sector_equ[$current_ship] $planet~planet[$current_ship].equ
add $sector_equ[$current_ship] $port[$current_ship].equ_on_port
setvar $sector_equ_needed[$current_ship] $steal_holds
multiply $sector_equ_needed[$current_ship] $maxcycles
add $sector_equ_needed[$current_ship] 10

if ($port[$current_ship].equ_on_port >= $steal_holds)
	return
else
	if ($sector_equ[$current_ship] >= $sector_equ_needed[$current_ship])
		gosub :sell
		return
	else
		setvar $upgrade_amount $steal_holds
		subtract $upgrade_amount $port[$current_ship].equ_on_port
		divide $upgrade_amount 10
		add $upgrade_amount 5
		setvar $cash_needed $upgrade_amount
		multiply $cash_needed 900
		if ($player~credits >= $cash_needed)
			send "o  3" & $upgrade_amount & "*  *"
			multiply $upgrade_amount 10
			add $port[$current_ship].equ_on_port $upgrade_amount
			if ($cksdtquiet = "OFF")
				setvar $switchboard~message "Ship " & $current_ship & " - port upgraded " & $upgrade_amount & " units.*"
				gosub :switchboard~switchboard
			end
			setvar $upgrade_amount 0
			subtract $player~credits $cash_needed
		else
			if ($planet~planet[$current_ship].equ >= $steal_holds)
				setvar $switchboard~message "Not enough credits to upgrade, selling early.*"
				gosub :switchboard~switchboard
				gosub :sell
			else
				gosub :endcnsettings
				setvar $exit_message "Not enough credits on hand to upgrade the port."
				goto :exit
			end
		end
		return
	end
end

# ----- SUB :sell
# ----- USED WITHIN MAIN PROGRAM LOOP
:sell
if ($planet~planet[$current_ship].equ > 0)

	add $player~turns_used 1
	send "PN" & $planet~planet[$current_ship] & "*"

	:getpercts
	settextlinetrigger equpct :equpct "Equipment  Buying"
	pause
	pause

	:equpct
	getword currentline $player~current_sector.equpercent 4
	striptext $player~current_sector.equpercent "%"

	:sellproduct
	setstrigger sellfuel :sellfuel "How many units of Fuel Ore"
	setstrigger sellorg :sellorg "How many units of Organics"
	setstrigger sellequ :sellequ "How many units of Equipment"
	setstrigger noequ :noequ "Command ["

	pause
	pause

	:sellfuel
	send "0*"
	pause

	:sellorg
	send "0*"
	pause

	:sellequ
	killalltriggers
	send "*"
	if (haggle)
		setvar $nativeplanettradeactive 0
		setvar $nativesellamount 0
		setvar $nativetradecreditsbefore $player~credits
		gosub :nativeplanettradewait
		gosub :getinfo
		if ($nativesellamount <= 0)
			goto :sellhagglefailed
		end
		getsectorparameter $player~current_sector "EQUMCIC" $mcic[$current_ship]
		if ($mcic[$current_ship] = "")
			setvar $mcic[$current_ship] 0
		end
		setvar $nativerevenuemade $player~credits
		subtract $nativerevenuemade $nativetradecreditsbefore
		if ($nativerevenuemade < 0)
			setvar $nativerevenuemade 0
		end
		subtract $planet~planet[$current_ship].equ $nativesellamount
		if ($planet~planet[$current_ship].equ < 0)
			setvar $planet~planet[$current_ship].equ 0
		end
		add $port[$current_ship].equ_on_port $nativesellamount
		add $equ_sold[$current_ship] $nativesellamount
		add $total_revenue[$current_ship] $nativerevenuemade
		setvar $perunit 0
		if ($nativesellamount > 0)
			setvar $perunit $nativerevenuemade
			divide $perunit $nativesellamount
		end
		if ($cksdtquiet = "OFF")
			setvar $switchboard~message "Ship " & $current_ship & " - " & $nativesellamount & " EQU haggled for " & $nativerevenuemade & " credits (" & $perunit & " per unit).*"
			gosub :switchboard~switchboard
		end
		return
	end
	settextlinetrigger equamount :equamount "Agreed,"
	pause
	pause

	:equamount
	getword currentline $portbuying 2
	striptext $portbuying ","

	:sellhaggle
	settextlinetrigger sellfirstoffer :sellfirstoffer "We'll buy them for"
	pause

	:sellfirstoffer
	killalltriggers
	getword currentline $offer 5
	striptext $offer ","
	gosub :swathoff
	if ($swathoff = 0)
		setvar $exit_message $message
		goto :exit
	end

	# ----- CALCULATE the port's "quality" -----
	setvar $perunitinitoffer $offer

	#NEW CODE ADDED TO SUPPORT NON-100% PTRADES
	multiply $perunitinitoffer 100
	divide $perunitinitoffer $game~ptradesetting

	# multiply by 100 to increase accuracy of results, we'll need to divide by 100 later
	multiply $perunitinitoffer 100

	# divide by the number of units you are selling
	divide $perunitinitoffer $portbuying

	#initialize portmaxinit
	setvar $portmaxinit $perunitinitoffer

	# return to 10 scale
	divide $perunitinitoffer 10

	# port max init  =(($perunitinitoffer-90.6281)/($percent-10.98921))*(89.01079)+90.6281
	setvar $basevalue 906281000
	setvar $basepercent 10989
	setvar $basepercentinverse 89010
	setvar $percentfrombase $player~current_sector.equpercent

	if ($percentfrombase >= 15)
		# multiply by 100,000 for precision
		multiply $portmaxinit 100000

		# subtract basevalue (in 10,000,000 scale)
		subtract $portmaxinit $basevalue

		# multiply by 1000 for precision
		multiply $percentfrombase 1000

		# subtract equ base percent (1,000 scale)
		subtract $percentfrombase $basepercent

		# calculate PMI/PFB
		divide $portmaxinit $percentfrombase

		# multiply by inverse of equ base percent (1,000 scale)
		multiply $portmaxinit $basepercentinverse

		# add the basevalue (in 10,000,000 scale)
		add $portmaxinit $basevalue

		# return to 10 scale
		divide $portmaxinit 1000000

	else
		setvar $portmaxinit 1063
	end

	# ----- LOOKUP the counteroffer percentage to use at this "quality" port -----
	if ($portmaxinit >= 1393)
		setvar $mcic "-65"
		setvar $multiple 1347

	elseif ($portmaxinit >= 1386)
		setvar $mcic "-64"
		setvar $multiple 1341

	elseif ($portmaxinit >= 1379)
		setvar $mcic "-63"
		setvar $multiple 1336

	elseif ($portmaxinit >= 1372)
		setvar $mcic "-62"
		setvar $multiple 1330

	elseif ($portmaxinit >= 1365)
		setvar $mcic "-61"
		setvar $multiple 1324

	elseif ($portmaxinit >= 1358)
		setvar $mcic "-60"
		setvar $multiple 1319

	elseif ($portmaxinit >= 1351)
		setvar $mcic "-59"
		setvar $multiple 1313

	elseif ($portmaxinit >= 1344)
		setvar $mcic "-58"
		setvar $multiple 1307

	elseif ($portmaxinit >= 1337)
		setvar $mcic "-57"
		setvar $multiple 1302

	elseif ($portmaxinit >= 1329)
		setvar $mcic "-56"
		setvar $multiple 1296

	elseif ($portmaxinit >= 1323)
		setvar $mcic "-55"
		setvar $multiple 1291

	elseif ($portmaxinit >= 1315)
		setvar $mcic "-54"
		setvar $multiple 1285

	elseif ($portmaxinit >= 1308)
		setvar $mcic "-53"
		setvar $multiple 1279

	elseif ($portmaxinit >= 1301)
		setvar $mcic "-52"
		setvar $multiple 1274

	elseif ($portmaxinit >= 1294)
		setvar $mcic "-51"
		setvar $multiple 1268

	elseif ($portmaxinit >= 1287)
		setvar $mcic "-50"
		setvar $multiple 1262

	elseif ($portmaxinit >= 1279)
		setvar $mcic "-49"
		setvar $multiple 1254

	elseif ($portmaxinit >= 1272)
		setvar $mcic "-48"
		setvar $multiple 1247

	elseif ($portmaxinit >= 1265)
		setvar $mcic "-47"
		setvar $multiple 1246

	elseif ($portmaxinit >= 1258)
		setvar $mcic "-46"
		setvar $multiple 1241

	elseif ($portmaxinit >= 1251)
		setvar $mcic "-45"
		setvar $multiple 1235

	elseif ($portmaxinit >= 1243)
		setvar $mcic "-44"
		setvar $multiple 1229

	elseif ($portmaxinit >= 1236)
		setvar $mcic "-43"
		setvar $multiple 1224

	elseif ($portmaxinit >= 1229)
		setvar $mcic "-42"
		setvar $multiple 1218

	elseif ($portmaxinit >= 1221)
		setvar $mcic "-41"
		setvar $multiple 1213

	elseif ($portmaxinit >= 1214)
		setvar $mcic "-40"
		setvar $multiple 1208

	elseif ($portmaxinit >= 1206)
		setvar $mcic "-39"
		setvar $multiple 1201

	elseif ($portmaxinit >= 1199)
		setvar $mcic "-38"
		setvar $multiple 1196

	elseif ($portmaxinit >= 1192)
		setvar $mcic "-37"
		setvar $multiple 1190

	elseif ($portmaxinit >= 1184)
		setvar $mcic "-36"
		setvar $multiple 1185

	elseif ($portmaxinit >= 1177)
		setvar $mcic "-35"
		setvar $multiple 1180

	elseif ($portmaxinit >= 1169)
		setvar $mcic "-34"
		setvar $multiple 1174

	elseif ($portmaxinit >= 1162)
		setvar $mcic "-33"
		setvar $multiple 1169

	elseif ($portmaxinit >= 1154)
		setvar $mcic "-32"
		setvar $multiple 1164

	elseif ($portmaxinit >= 1147)
		setvar $mcic "-31"
		setvar $multiple 1158

	elseif ($portmaxinit >= 1139)
		setvar $mcic "-30"
		setvar $multiple 1152

	elseif ($portmaxinit >= 1132)
		setvar $mcic "-29"
		setvar $multiple 1149

	elseif ($portmaxinit >= 1124)
		setvar $mcic "-28"
		setvar $multiple 1144

	elseif ($portmaxinit >= 1116)
		setvar $mcic "-27"
		setvar $multiple 1136

	elseif ($portmaxinit >= 1109)
		setvar $mcic "-26"
		setvar $multiple 1132

	elseif ($portmaxinit >= 1101)
		setvar $mcic "-25"
		setvar $multiple 1126

	elseif ($portmaxinit >= 1093)
		setvar $mcic "-24"
		setvar $multiple 1122

	elseif ($portmaxinit >= 1086)
		setvar $mcic "-23"
		setvar $multiple 1117

	elseif ($portmaxinit >= 1078)
		setvar $mcic "-22"
		setvar $multiple 1110

	elseif ($portmaxinit >= 1071)
		setvar $mcic "-21"
		setvar $multiple 1105

	elseif ($portmaxinit >= 1063)
		setvar $mcic "-20"
		setvar $multiple 1102

	else
		setvar $mcic "0"
		setvar $multiple 1102

	end

	setvar $counter $offer
	divide $counter 10
	multiply $counter $multiple
	# divide by 1000 instead of 100 because the multiple is in 10 scale
	divide $counter 100
	send $counter & "*"
	setvar $midhaggles 0

	:sellofferloop
	settextlinetrigger sellprice :sellprice "We'll buy them for"
	settextlinetrigger sellfinaloffer :sellfinaloffer "Our final offer"
	settextlinetrigger sellnotinterested :sellnotinterested "We're not interested."
	settextlinetrigger sellexperience :sellexperience "experience point(s)"
	settextlinetrigger sellyouhave :sellyouhave "You have"

	settextlinetrigger sellscrewup1 :sellscrewup "Get real ion-brain, make me a real offer."
	settextlinetrigger sellscrewup2 :sellscrewup "This is the big leagues Jr.  Make a real offer."
	settextlinetrigger sellscrewup3 :sellscrewup "My patience grows short with you."
	settextlinetrigger sellscrewup4 :sellscrewup "I have much better things to do than waste my time.  Try again."
	settextlinetrigger sellscrewup5 :sellscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
	settextlinetrigger sellscrewup6 :sellscrewup "Quit playing around, you're wasting my time!"
	settextlinetrigger sellscrewup7 :sellscrewup "Make a real offer or get the h*ll out of here!"
	settextlinetrigger sellscrewup8 :sellscrewup "WHAT?!@!? you must be crazy!"
	settextlinetrigger sellscrewup9 :sellscrewup "So, you think I'm as stupid as you look? Make a real offer."
	settextlinetrigger sellscrewup10 :sellscrewup "What do you take me for, a fool?  Make a real offer!"
	pause
	pause

	:sellscrewup
	killalltriggers
	multiply $counter 98
	divide $counter 100
	send $counter & "*"
	goto :sellofferloop

	:sellprice
	killalltriggers
	add $midhaggles 1
	setvar $old_offer $offer
	setvar $old_counter $counter
	getword currentline $offer 5
	striptext $offer ","

	# new method
	setvar $offer_change $offer
	subtract $offer_change $old_offer
	if ($mcic > "-50")
		multiply $offer_change 65
		divide $offer_change 100
		subtract $counter $offer_change
		subtract $counter 25
	else
		multiply $offer_change 60
		divide $offer_change 100
		subtract $counter $offer_change
		subtract $counter 10
	end
	send $counter & "*"
	goto :sellofferloop

	:sellfinaloffer
	killalltriggers
	setvar $old_offer $offer
	setvar $old_counter $counter
	getword currentline $offer 5
	striptext $offer ","
	setvar $offer_change $offer
	subtract $offer_change $old_offer
	multiply $offer_change 25
	divide $offer_change 10
	subtract $counter $offer_change
	subtract $counter 10
	send $counter & "*"
	goto :sellofferloop

	:sellnotinterested
	killalltriggers
	goto :sellhagglefailed

	:sellexperience
	killalltriggers
	getword currentline $exp_bonus 7
	add $exp $exp_bonus
	goto :sellofferloop

	:sellyouhave
	killalltriggers
	setvar $oldcredits $player~credits
	getword currentline $player~credits 3
	striptext $player~credits ","
	if ($oldcredits = $player~credits)
		setvar $currenthaggle "failed"
		goto :sellhagglefailed
	else
		setvar $currenthaggle "succeeded"
		goto :sellhagglesucceeded
	end

	:sellhagglefailed
	add $sell_failures 1
	add $total_sell_failures 1
	# echo "*haggle failed - " & $sell_failures & "**"
	# send "' Failed Haggle (" & $perunitinitoffer & " init offer).*"
	if ($sell_failures >= $maxbadsells)
		setvar $switchboard~message "I'm having problems selling my equipment to the port (" & $perunitinitoffer & "). Script Halting*"
		gosub :switchboard~switchboard
		goto :finish
	end
	goto :sell

	:sellhagglesucceeded
	# echo "*haggle succeeded*"
	setvar $mcic[$current_ship] $mcic
	subtract $planet~planet[$current_ship].equ $portbuying
	add $port[$current_ship].equ_on_port $portbuying
	add $equ_sold[$current_ship] $portbuying
	add $total_revenue[$current_ship] $counter
	setvar $perunit $counter
	divide $perunit $portbuying
	if ($cksdtquiet = "OFF")
		setvar $switchboard~message "Ship " & $current_ship & " - " & $portbuying & " EQU haggled for " & $counter & " credits (" & $perunit & " per unit).*"
		gosub :switchboard~switchboard
	end
else

	:noequ
	killalltriggers
	setvar $switchboard~message "There is no equ to sell at this port*"
	gosub :switchboard~switchboard
end

return

:nativeplanettradewait
settextlinetrigger nativeplanetstart1 :nativeplanettradeprogress "<Port>"
settextlinetrigger nativeplanetstart2 :nativeplanettradeprogress "Docking..."
settexttrigger nativeplanetstart3 :nativeplanettradeprogress "Your offer ["
settexttrigger nativeplanetstart4 :nativeplanettradeprogress "Our final offer"
settextlinetrigger nativeplanetstart5 :nativeplanettradeagreed "Agreed,"
setstrigger nativeplanetqty :nativeplanettradeqty "How many units of "
if ($nativeplanettradeactive = 1)
	setstrigger nativeplanetdone1 :nativeplanettradedone "Planet command"
	setstrigger nativeplanetdone2 :nativeplanettradedone "Command [TL="
	setstrigger nativeplanetdone3 :nativeplanettradedone "Citadel command"
	setstrigger nativeplanetdone4 :nativeplanettradedone "Corporate command [TL="
end
pause

:nativeplanettradeprogress
killalltriggers
setvar $nativeplanettradeactive 1
goto :nativeplanettradewait

:nativeplanettradeagreed
killalltriggers
setvar $nativeplanettradeactive 1
getword currentline $nativesellamount 2
striptext $nativesellamount ","
goto :nativeplanettradewait

:nativeplanettradeqty
killalltriggers
setvar $nativeplanettradeactive 1
setvar $nativeline currentline
gosub :handlenativeplanetqty
goto :nativeplanettradewait

:nativeplanettradedone
killalltriggers
return

:handlenativeplanetqty
setvar $nativetradeproduct "None"
getwordpos $nativeline $nativex "Fuel"
if ($nativex > 0)
	setvar $nativetradeproduct "Fuel"
else
	getwordpos $nativeline $nativex "Organics"
	if ($nativex > 0)
		setvar $nativetradeproduct "Organics"
	else
		getwordpos $nativeline $nativex "Equipment"
		if ($nativex > 0)
			setvar $nativetradeproduct "Equipment"
		end
	end
end

if ($nativetradeproduct = "Equipment")
	send "*"
else
	send "0*"
end
return

# ----- SUB :stealdump
# ----- USED WITHIN MAIN PROGRAM LOOP
:stealdump
:stealagain
add $player~turns_used 1
send "PR*SZ3"
send $steal_holds & "*"
waitfor "furtively about"
settextlinetrigger equonport :equonport "Equipment  Buying"
settextlinetrigger fake :fake "Suddenly you're Busted!"
pause
pause

:equonport
killalltriggers
getword currentline $port[$current_ship].equ_on_port 4

:dothedeed
settextlinetrigger bust :bust "For getting caught"
settextlinetrigger noprod :noprod "There aren't that many holds of Equipment at this port!"
settextlinetrigger good :good "and you receive"
pause
pause

:noprod
killalltriggers
send "'Not enough equipment at port, upgrading and resuming*"
send "o31*q"
goto :stealagain

:bust
killalltriggers
setsectorparameter 1 "LRA" $sector[$current_ship]
setvar $cklra $sector[$current_ship]
savevar $cklra
setsectorparameter $sector[$current_ship] "BUSTED" true
send "'<"&$bot~subspace&">[Busted:"&$sector[$current_ship]&"]<"&$bot~subspace&">*"
#gosub :sell
gosub :getinfo
gosub :player~quikstats

setvar $sendstring "L " & $planet~planet[$current_ship] & "*  TNL3*c t t"& ($player~credits-500000)&"*qqq * * "
send $sendstring

goto :finish

:fake
killalltriggers
setsectorparameter $sector[$current_ship] "FAKEBUST" true
send "  "
send "N  N  *  *"
gosub :endcnsettings
setvar $exit_message "FAKE Busted in Ship " & $current_ship & ", need a super furb"
goto :exit

:good
killalltriggers
setsectorparameter 1 "LRA" $sector[$current_ship]
setvar $cklra $sector[$current_ship]
savevar $cklra
getword currentline $exp_bonus 4
add $exp $exp_bonus
setvar $sendstring "L " & $planet~planet[$current_ship] & "*  TNL3*Q"
send $sendstring
add $planet~planet[$current_ship].equ $steal_holds
subtract $port[$current_ship].equ_on_port $steal_holds
if ($debugdelay <> 0)
	setdelaytrigger testing :testing $debugdelay
	pause
	pause
end

:testing
return

# ----- SUB :xport
# ----- USED WITHIN MAIN PROGRAM LOOP
:xport
if ($ship_1 = $current_ship)
	setvar $current_ship $ship_2
else
	setvar $current_ship $ship_1
end
add $player~turns_used 1
if ($skip_ships = "YES")
	setvar $xportstring "X  " & $current_ship & "*  Q"
	send $xportstring
	return
else
	setvar $xportstring "X  " & $current_ship & "*  Q"
	send $xportstring
	gosub :player~quikstats

	if ($player~ship_number <> $current_ship)
		setvar $exit_message "Cannot Xport to Ship "&$current_ship&".  Check Xport Range.  Halting.*"
		goto :exit
	end
	return
	#        setTextLineTrigger noxportship :noxportship "That is not an available ship"
	#        setTextLineTrigger noxportrange :noxportrange "only has a transport range"
	#        setTextLineTrigger noxportpassword :noxportpassword "Enter the password for"
	#        setTextLineTrigger xportsuccess :xportsuccess "Security code accepted"
	#        pause
	#        pause
	#        :noxportship
	#            killalltriggers
	#            gosub :endCNsettings
	#            setVar $exit_message "That is not an available ship, Script Halting."
	#            goto :exit
	#        :noxportrange
	#            killalltriggers
	#            gosub :endCNsettings
	#            setVar $exit_message "Not enough transport range, Script Halting."
	#            goto :exit
	#        :noxportpassword
	#            killalltriggers
	#            gosub :endCNsettings
	#            setVar $exit_message "Transport ship requires a password, Script Halting."
	#            goto :exit
	#        :xportsuccess
	#            killalltriggers
	#            return
end

:exit
if ($exit_message <> 0)
	setvar $switchboard~message "" & $exit_message & "*"
	gosub :switchboard~switchboard
end
halt

# ----- SUB: Start CN settings -----
:startcnsettings
send "CN"

settextlinetrigger ansi0 :ansi0 "(1) ANSI graphics            - Off"
settextlinetrigger ansi1 :ansi1 "(1) ANSI graphics            - On"
pause

:ansi0
killalltriggers
setvar $cn1 0
goto :cn1done

:ansi1
killalltriggers
setvar $cn1 1

:cn1done
settextlinetrigger anim0 :anim0 "(2) Animation display        - Off"
settextlinetrigger anim1 :anim1 "(2) Animation display        - On"
pause

:anim0
killalltriggers
setvar $cn2 0
goto :cn2done

:anim1
killalltriggers
setvar $cn2 1

:cn2done
settextlinetrigger page0 :page0 "(3) Page on messages         - Off"
settextlinetrigger page1 :page1 "(3) Page on messages         - On"
pause

:page0
killalltriggers
setvar $cn3 0
goto :cn3done

:page1
killalltriggers
setvar $cn3 1

:cn3done
settextlinetrigger silence0 :silence0 "(7) Silence ALL messages     - No"
settextlinetrigger silence1 :silence1 "(7) Silence ALL messages     - Yes"
pause

:silence0
killalltriggers
setvar $cn7 0
goto :cn7done

:silence1
killalltriggers
setvar $cn7 1

:cn7done
settextlinetrigger abortdisplay0 :abortdisplay0 "(9) Abort display on keys    - SPACE"
settextlinetrigger abortdisplay1 :abortdisplay1 "(9) Abort display on keys    - ALL KEYS"
pause

:abortdisplay0
killalltriggers
setvar $cn9 0
goto :cn9done

:abortdisplay1
killalltriggers
setvar $cn9 1

:cn9done
settextlinetrigger messagedisplay0 :messagedisplay0 "(A) Message Display Mode     - Compact"
settextlinetrigger messagedisplay1 :messagedisplay1 "(A) Message Display Mode     - Long"
pause

:messagedisplay0
killalltriggers
setvar $cna 0
goto :cnadone

:messagedisplay1
killalltriggers
setvar $cna 1

:cnadone
settextlinetrigger screenpauses0 :screenpauses0 "(B) Screen Pauses            - No"
settextlinetrigger screenpauses1 :screenpauses1 "(B) Screen Pauses            - Yes"
pause

:screenpauses0
killalltriggers
setvar $cnb 0
goto :cnbdone

:screenpauses1
killalltriggers
setvar $cnb 1

:cnbdone
#        waitfor "Settings command (?=Help)"
gosub :sendcnstring
#        send "?"
#        waitfor "Settings command (?=Help)"
send "QQ"
setstrigger substartcncontinue1 :substartcncontinue "Command [TL="
setstrigger substartcncontinue2 :substartcncontinue "Citadel command (?=help)"
pause

:substartcncontinue
killalltriggers
return

# ----- SUB: end CN settings -----
:endcnsettings
send "CN"
waitfor "Settings command (?=Help)"
gosub :sendcnstring
send "?"
waitfor "Settings command (?=Help)"
send "QQ"
setstrigger subendcncontinue1 :subendcncontinue "Command [TL="
setstrigger subendcncontinue2 :subendcncontinue "Citadel command (?=help)"
pause

:subendcncontinue
killalltriggers
return

# ----- SUB: send CN string -----
:sendcnstring
if ($cn1 = 0)
	send "1  "
end
if ($cn2 = 1)
	send "2  "
end
if ($cn3 = 1)
	send "3  "
end
if ($cn7 = 1)
	send "7  "
end
if ($cn9 = 1)
	send "9  "
end
if ($cna = 1)
	send "A  "
end
if ($cnb = 1)
	send "B  "
end
return

# ----- SUB :getInfo
:getinfo
setvar $player~photons 0
setvar $player~scan_type "None"
setvar $player~twarp_type 0
setvar $player~corpstring "[0]"
send "I"
waitfor "<Info>"

:waitforinfo
settextlinetrigger gettradername :gettradername "Trader Name    :"
settextlinetrigger getexpandalign :getexpandalign "Rank and Exp"
settextlinetrigger getcorp :getcorp "Corp           #"
settextlinetrigger getshiptype :getshiptype "Ship Info      :"
settextlinetrigger gettpw :gettpw "Turns to Warp  :"
settextlinetrigger getsect :getsect "Current Sector :"
settextlinetrigger getturns :getturns "Turns left"
settextlinetrigger getholds :getholds "Total Holds"
settextlinetrigger getfighters :getfighters "Fighters       :"
settextlinetrigger getshields :getshields "Shield points  :"
settextlinetrigger getphotons :getphotons "Photon Missiles:"
settextlinetrigger getscantype :getscantype "LongRange Scan :"
settextlinetrigger gettwarptype1 :gettwarptype1 "  (Type 1 Jump):"
settextlinetrigger gettwarptype2 :gettwarptype2 "  (Type 2 Jump):"
settextlinetrigger getcredits :getcredits "Credits"
setstrigger getinfodone :getinfodone "Command [TL="
setstrigger getinfodone2 :getinfodone "Citadel command"
pause
pause

:gettradername
killalltriggers
setvar $tradername currentline
striptext $tradername "Trader Name    : "
striptext $tradername "3rd Class "
striptext $tradername "2nd Class "
striptext $tradername "1st Class "
striptext $tradername "Nuisance "
striptext $tradername "Menace "
striptext $tradername "Smuggler Savant "
striptext $tradername "Smuggler "
striptext $tradername "Robber "
striptext $tradername "Private "
striptext $tradername "Lance Corporal "
striptext $tradername "Corporal "
striptext $tradername "Staff Sergeant "
striptext $tradername "Gunnery Sergeant "
striptext $tradername "1st Sergeant "
striptext $tradername "Sergeant Major "
striptext $tradername "Sergeant "
striptext $tradername "Chief Warrant Officer "
striptext $tradername "Warrant Officer "
striptext $tradername "Terrorist "
striptext $tradername "Infamous Pirate "
striptext $tradername "Notorious Pirate "
striptext $tradername "Dread Pirate "
striptext $tradername "Pirate "
striptext $tradername "Galactic Scourge "
striptext $tradername "Enemy of the State "
striptext $tradername "Enemy of the People "
striptext $tradername "Enemy of Humankind "
striptext $tradername "Heinous Overlord "
striptext $tradername "Prime Evil "
striptext $tradername "Ensign "
striptext $tradername "Lieutenant J.G. "
striptext $tradername "Lieutenant Commander "
striptext $tradername "Lieutenant "
striptext $tradername "Commander "
striptext $tradername "Captain "
striptext $tradername "Commodore "
striptext $tradername "Rear Admiral "
striptext $tradername "Vice Admiral "
striptext $tradername "Fleet Admiral "
striptext $tradername "Admiral "
striptext $tradername "Civilian "
striptext $tradername "Annoyance "
goto :waitforinfo

:getexpandalign
killalltriggers
getword currentline $exp 5
getword currentline $align 7
striptext $exp ","
striptext $align ","
striptext $align "Alignment="
goto :waitforinfo

:getcorp
killalltriggers
getword currentline $player~corp 3
striptext $player~corp ","
setvar $player~corpstring "[" & $player~corp & "]"
goto :waitforinfo

:getshiptype
killalltriggers
getwordpos currentline $shiptypeend "Ported="
subtract $shiptypeend 18
cuttext currentline $shiptype 18 $shiptypeend
goto :waitforinfo

:gettpw
killalltriggers
getword currentline $tpw 5
goto :waitforinfo

:getsect
killalltriggers
getword currentline $player~current_sector 4
goto :waitforinfo

:getturns
killalltriggers
getword currentline $player~turns 4
if ($player~turns = "Unlimited")
	setvar $player~turns 65000
end
goto :waitforinfo

:getholds
killalltriggers
setvar $line currentline
getword $line $holds 4
getwordpos $line $textpos "Ore="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $oreholds 1
	striptext $oreholds "Ore="
else
	setvar $oreholds 0
end
getwordpos $line $textpos "Organics="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $orgholds 1
	striptext $orgholds "Organics="
else
	setvar $orgholds 0
end
getwordpos $line $textpos "Equipment="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $equholds 1
	striptext $equholds "Equipment="
else
	setvar $equholds 0
end
getwordpos $line $textpos "Colonists="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $coloholds 1
	striptext $coloholds "Colonists="
else
	setvar $coloholds 0
end
getwordpos $line $textpos "Empty="
if ($textpos <> 0)
	cuttext currentline $temp $textpos 100
	getword $temp $emptyholds 1
	striptext $emptyholds "Empty="
else
	setvar $emptyholds 0
end
goto :waitforinfo

:getfighters
killalltriggers
getword currentline $figs 3
striptext $figs ","
goto :waitforinfo

:getshields
killalltriggers
getword currentline $player~shields 4
striptext $player~shields ","
goto :waitforinfo

:getphotons
killalltriggers
getword currentline $player~photons 3
goto :waitforinfo

:getscantype
killalltriggers
getword currentline $player~scan_type 4
goto :waitforinfo

:gettwarptype1
killalltriggers
getword currentline $twarp_1_range 4
setvar $player~twarp_type 1
goto :waitforinfo

:gettwarptype2
killalltriggers
getword currentline $twarp_2_range 4
setvar $player~twarp_type 2
goto :waitforinfo

:getcredits
killalltriggers
getword currentline $player~credits 3
striptext $player~credits ","
goto :waitforinfo

:getinfodone
killalltriggers
return

# ----- SUB :planet~getplanetinfo -----
:planet~getplanetinfo
send "*"
settextlinetrigger planetinfo :planetinfo "Planet #"
pause

:planetinfo
killalltriggers
setvar $planet~citadel 0
setvar $planet~citadelcredits 0
getword currentline $planet~planet 2
striptext $planet~planet "#"
getword currentline $player~current_sector 5
striptext $player~current_sector ":"
waitfor "2 Build 1   Product    Amount     Amount     Maximum"

:getplanetstuff
settextlinetrigger fuelstart :fuelstart "Fuel Ore"
settextlinetrigger orgstart :orgstart "Organics"
settextlinetrigger equipstart :equipstart "Equipment"
settextlinetrigger figstart :figstart "Fighters        N/A"
settextlinetrigger citadelstart :citadelstart "Planet has a level"
setstrigger planetinfodone :planetinfodone "Planet command (?=help)"
pause

:fuelstart
killalltriggers
getword currentline $planet~planetfuel 6
getword currentline $planet~planetfuelmax 8
striptext $planet~planetfuel ","
striptext $planet~planetfuelmax ","
goto :getplanetstuff

:orgstart
killalltriggers
getword currentline $planet~planetorg 5
getword currentline $planet~planetorgmax 7
striptext $planet~planetorg ","
striptext $planet~planetorgmax ","
goto :getplanetstuff

:equipstart
killalltriggers
getword currentline $planet~planetequip 5
getword currentline $planet~planetequipmax 7
striptext $planet~planetequip ","
striptext $planet~planetequipmax ","
goto :getplanetstuff

:figstart
killalltriggers
getword currentline $planet~planetfig 5
getword currentline $planet~planetfigmax 7
striptext $planet~planetfig ","
striptext $planet~planetfigmax ","
goto :getplanetstuff

:citadelstart
killalltriggers
getword currentline $planet~citadel 5
getword currentline $planet~citadelcredits 9
striptext $planet~citadelcredits ","

:planetinfodone
return

:swathoff
loadvar $swathoff
if ($swathoff = 0)
	setstrigger swathison :swathison "Command [TL="
	setdelaytrigger swathisoff :swathisoff 2000
	pause

	:swathison
	killalltriggers
	setvar $message "Detected SWATH Autohaggle"
	setvar $swathoff 0
	savevar $swathoff
	return

	:swathisoff
	killalltriggers
	setvar $swathoff 1
	savevar $swathoff
end
return

include "source\include\planet"
include "source\include\player"
include "source\include\sector"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
