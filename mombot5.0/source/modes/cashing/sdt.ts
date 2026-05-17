reqRecording
    
:load_variables

	loadVar $switchboard~bot_name
        loadVar $BOT~user_command_line
	loadvar $PLAYER~unlimitedGame
	loadvar $bot~subspace

	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE
	loadvar $bot~subspace
	
	loadVar $GAME~steal_factor
	loadVar $BOT~bot_turn_limit
	loadVar $game~ptradesetting

					      
	setVar $HELP~HELP[1]  $HELP~TAB&" sdt {resetlra} [ship1] [ship2] [planet1] [planet2]*"
	setVar $HELP~HELP[2]  $HELP~TAB&"     {swap}*"
	setVar $HELP~HELP[3]  $HELP~TAB&"    "
	setVar $HELP~HELP[4]  $HELP~TAB&"    Do NOT need to start in Ship 1 or Ship 2."
	setVar $HELP~HELP[5]  $HELP~TAB&"    First Steal will be from Ship 1."
	setVar $HELP~HELP[6]  $HELP~TAB&"    Checks last rob and busts from Sec Params"
	setVar $HELP~HELP[7]  $HELP~TAB&"     "
	setVar $HELP~HELP[8]  $HELP~TAB&"    Options: "
	setVar $HELP~HELP[9]  $HELP~TAB&"     {resetlra} will reset last rob sector and exit"
	setVar $HELP~HELP[10] $HELP~TAB&"     "
	setVar $HELP~HELP[11] $HELP~TAB&"    Will use EP Haggle if running in bot"
	setVar $HELP~HELP[12] $HELP~TAB&"    Created by Cherokee"
	gosub :HELP~HELPFILE

	setvar $SWITCHBOARD~MESSAGE "SDT - Steal Dump Transport 2.1 starting up!*"
	gosub :SWITCHBOARD~SWITCHBOARD

	
	if ($BOT~parm1 = "resetlra")
		setSectorParameter 1 "LRA" 1
		setVar $SWITCHBOARD~message "Last rob sector reset.... Halting....*"
		gosub :switchboard~switchboard
		halt
	end

	getWordPos " "&$bot~user_command_line&" " $pos " resetlra"
	if ($pos > 0)
		setSectorParameter 1 "LRA" 1
		setVar $SWITCHBOARD~message "Last rob sector reset.*"
		gosub :switchboard~switchboard
	end

	getWordPos " "&$bot~user_command_line&" " $pos " swap "
	setvar $swap false
	if ($pos > 0)
		setvar $swap true
	end

    setVar $ckSDTquiet "OFF"
    setVar $beamFurbing "n"
    setVar $ship_1 $BOT~parm1
    setVar $ship_2 $BOT~parm2
    setVar $planet~planet[$ship_1] $BOT~parm3
    setVar $planet~planet[$ship_2] $BOT~parm4
    
    isNumber $test $BOT~parm1
    IF ($test)
    ELSE
       setvar $switchboard~message "Ship 1 Must Be a Number.*"
       gosub :switchboard~switchboard
       HALT
    END
    isNumber $test $BOT~parm2
    IF ($test)
    ELSE
       setvar $switchboard~message "Ship 2 Must Be a Number.*"
       gosub :switchboard~switchboard
       HALT
    END
    isNumber $test $BOT~parm3
    IF ($test)
    ELSE
       setvar $switchboard~message "Planet 1 Must Be a Number.*"
       gosub :switchboard~switchboard
       HALT
    END
    isNumber $test $BOT~parm4
    IF ($test)
    ELSE
       setvar $switchboard~message "Planet 2 Must Be a Number.*"
       gosub :switchboard~switchboard
       HALT
    END

    getwordpos " "&$bot~user_command_line&" " $pos " noavoid "
    setvar $noavoid false
    if ($pos > 0)
    	setvar $noavoid true
    end
    if ($GAME~steal_factor = 0)
	setVar $GAME~steal_factor 21
	setvar $switchboard~message "No Steal factor!! assuming 21, you need to ensure bot has refreshed!*"
	gosub :switchboard~switchboard
    end

# ----- make sure we are at a good prompt -----
:verifyprompt
        gosub :player~quikstats
        setVar $location $player~current_prompt
        if ($location <> "Command")
               setVar $exit_message "Must start at Command Prompt for SDT"
               goto :exit
        end

logging off
gosub :startCNsettings

    getSectorParameter 1 "LRA" $last_rob_attempt
    setvar $switchboard~message "last rob attempt: "&$last_rob_attempt&"*"
    gosub :switchboard~switchboard
    send "czq"
    waitOn "-----------------------------------------------------------------------------"
    settextlinetrigger     shipnumber     :getshipnumber "Corp"
    settextlinetrigger     doneships      :init "Computer command ["
    pause
     
    :getshipnumber
        getword CURRENTLINE $shiptest 1
        getword CURRENTLINE $shiplocation 2
        isNumber $is_a_number $shiplocation
        if ($is_a_number)
            if ($ship_1 = $shiptest)
                if ($shiplocation = $last_rob_attempt)
                    setVar $temp $ship_1
                    setVar $ship_1 $ship_2
                    setVar $ship_2 $temp 
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
    IF ($player~ship_number <> $ship_1)
           send "x   " $ship_1 "*  q z *   "
    END
    gosub :player~quikstats
    IF ($player~ship_number <> $ship_1)
           setVar $exit_message "Cannot Xport to Ship 1.  Check Xport Range.  Halting.*"
           goto :exit
    END

# ----- INIT VARIABLES
setVar $current_ship $ship_1
setVar $low_turns "NO"
setVar $skip_ships "NO"
setVar $shipVoidsSet[$ship_1] FALSE
setVar $shipVoidsSet[$ship_2] FALSE

# ----------------------------------------
setVar $maxcycles 8
setVar $maxbadsells 3
setVar $debugdelay 0
# ----------------------------------------


# ----- SHIP 1 INIT
        setVar $total_revenue[$current_ship] 0
        setVar $equ_sold[$current_ship] 0
        gosub :getInfo
        setVar $sector[$current_ship] $player~current_sector
	
	# CHECK BUSTED SECTOR
	getSectorParameter $player~current_sector "BUSTED" $bustthissec
	if ($bustthissec = TRUE)
		setvar $switchboard~message "According to my data i've busted here - ending*"
		gosub :switchboard~switchboard
		if (($shipVoidsSet[$current_ship] = TRUE) and ($noavoid <> TRUE))
			gosub :SECTOR~CLEARVOIDADJACENT
			setVar $shipVoidsSet[$current_ship] FALSE
		end
		 gosub :endCNsettings
		halt
	end
	
        setVar $holds[$current_ship] $holds
        setVar $init_credits $player~credits
        setVar $init_exp $exp
        setVar $init_turns $player~turns
        setVar $player~turns_used 0
        setvar $switchboard~message "running ships " & $ship_1 & " / " & $ship_2 "*"
        gosub :switchboard~switchboard
        setvar $switchboard~message "Starting with Credits: " & $init_credits & " Exp: " & $init_exp & " Turns: " & $init_turns & ".*"
        gosub :switchboard~switchboard
        send "*"
        waitFor "(?=Help)?"
        if ($noavoid <> TRUE)
	        gosub :SECTOR~VOIDADJACENT
	        setVar $shipVoidsSet[$current_ship] TRUE
	    end
        gosub :checkPlanet
        gosub :checkPort
        gosub :checkUpgrade
        gosub :stealdump
        gosub :xport

# ----- SHIP 2 INIT
        setVar $total_revenue[$current_ship] 0
        setVar $equ_sold[$current_ship] 0
        gosub :getInfo
        setVar $sector[$current_ship] $player~current_sector
	getSectorParameter $player~current_sector "BUSTED" $bustthissec
	if ($bustthissec = TRUE)
		setvar $switchboard~message "According to my data i've busted here - ending*"
		gosub :switchboard~switchboard
		if (($shipVoidsSet[$current_ship] = TRUE) and ($noavoid <> TRUE))
			gosub :SECTOR~CLEARVOIDADJACENT
			setVar $shipVoidsSet[$current_ship] FALSE
		end
		 gosub :endCNsettings
		halt
	end
        setVar $holds[$current_ship] $holds
        send "*"
        waitFor "(?=Help)?"
        if ($noavoid <> TRUE)
	        gosub :SECTOR~VOIDADJACENT
	        setVar $shipVoidsSet[$current_ship] TRUE
	    end
        gosub :checkPlanet
        gosub :checkPort
        gosub :checkUpgrade
        gosub :stealdump
        gosub :xport
        setVar $skip_ships "YES"

# ----- MAIN PROGRAM LOOP
:sdtLoop
        gosub :checkUpgrade
        gosub :stealdump
        setVar $player~turns $init_turns
        subtract $player~turns $player~turns_used
        if ($player~turns > $bot~bot_turn_limit)
               gosub :xport
               goto :sdtLoop
        else
               setvar $switchboard~message "Low Turns, Halting Script*"
               gosub :switchboard~switchboard
               setVar $low_turns "YES"
               goto :finish
        end

# ----- FINISH
:finish
		if (($shipVoidsSet[$current_ship] = TRUE) and ($noavoid <> TRUE))
	        gosub :SECTOR~CLEARVOIDADJACENT
	        setVar $shipVoidsSet[$current_ship] FALSE
		end
        if ($current_ship = $ship_1)
               setVar $other_ship $ship_2
               setVar $player~current_sector $sector[$ship_2]
        else
               setVar $other_ship $ship_1
               setVar $player~current_sector $sector[$ship_1]
        end
		if (($shipVoidsSet[$other_ship] = TRUE) and ($player~current_sector <> 0) and ($noavoid <> TRUE))
			gosub :SECTOR~CLEARVOIDADJACENT
			setVar $shipVoidsSet[$other_ship] FALSE
		end
        gosub :endCNsettings
        setVar $cash_made $player~credits
        subtract $cash_made $init_credits
        setVar $exp_made $exp
        subtract $exp_made $init_exp
        if ($equ_sold[$ship_1] <> 0)
               setVar $credsPerUnit[$ship_1] $total_revenue[$ship_1]
               divide $credsPerUnit[$ship_1] $equ_sold[$ship_1]
        else
               setVar $credsPerUnit[$ship_1] 0
        end
        if ($equ_sold[$ship_2] <> 0)
               setVar $credsPerUnit[$ship_2] $total_revenue[$ship_2]
               divide $credsPerUnit[$ship_2] $equ_sold[$ship_2]
        else
               setVar $credsPerUnit[$ship_2] 0
        end
        if ($player~turns_used <> 0)
               setVar $credsPerTurn $cash_made
               divide $credsPerTurn $player~turns_used
        else
               setVar $credsPerTurn 0
        end
        format $total_revenue[$ship_1] $ship1money NUMBER
        format $total_revenue[$ship_2] $ship2money NUMBER
        format $equ_sold[$ship_1] $ship1equ NUMBER
        format $equ_sold[$ship_2] $ship2equ NUMBER
        format $cash_made $cashformat NUMBER
        format $credsPerTurn $credsPerTurnformat NUMBER
        setvar $switchboard~message "   - Ship " & $ship_1 & " - " & $ship1money & " cr - " & $ship1equ & " units (" & $credsPerUnit[$ship_1] & "/unit) - MCIC " & $MCIC[$ship_1] & "*   - Ship " & $ship_2 & " - " & $ship2money & " cr - " & $ship2equ & " units (" & $credsPerUnit[$ship_2] & "/unit) - MCIC " & $MCIC[$ship_2] & "*   - Net " & $cashformat & " credits in " & $player~turns_used & " turns (" & $credsPerTurnformat & "/turn).*  *"
        #gosub :switchboard~switchboard

    if ($low_turns <> "YES")
        if ($beamFurbing = "n")
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
:checkPlanet
    setTextLineTrigger noplanet :noplanet "There isn't a planet in this sector."
    setTextLineTrigger planetnum :planetnum "Registry# and Planet Name"
    setTextLineTrigger landing :landing "Landing sequence engaged..."
    send "L"
    pause
    pause
    :noplanet
        killalltriggers
        gosub :endCNsettings
        setVar $exit_message "There isn't a planet in this sector."
        goto :exit
    :planetnum
        killalltriggers
        if ($planet~planet[$current_ship] <> 0)
            send $planet~planet[$current_ship] & "*"
        end
        setTextLineTrigger wrongplanet :wrongplanet "That planet is not in this sector."
        setTextLineTrigger wrongplanet2 :wrongplanet "Invalid registry number, landing aborted."
        setTextLineTrigger landing :landing "Landing sequence engaged..."
        pause
        pause
        :wrongplanet
            killalltriggers
            send "Q*"
            gosub :endCNsettings
            setVar $exit_message "That planet is not in this sector."
            goto :exit
    :landing
        killalltriggers
        send "SNL1*TNL1*TNL2*TNL3*"
        waitfor "How many holds of Equipment do you want to leave"
        waitfor "Planet command"
        gosub :planet~getplanetinfo
        setvar $planet~planet[$current_ship] $planet~planet
        setVar $planet~planet[$current_ship].equ $planet~planetequip
        send "QJY"
        waitfor "Are you sure you want to jettison"
        return


# ----- SUB :checkPort
:checkPort
    send "D"
    waitfor "<Re-Display>"
    setTextLineTrigger getPort :getPort "Ports   :"
    setTextTrigger noport :noport "Command [TL="
    pause
    pause
    :getPort
        killalltriggers
        getText CURRENTLINE $port[$current_ship] ", Class " " ("
        if ($port[$current_ship] <> 2) and ($port[$current_ship] <> 3) and ($port[$current_ship] <> 4) and ($port[$current_ship] <> 8)
            gosub :endCNsettings
            setVar $exit_message "This is not an equipment buying port, you can't SDT here!"
            goto :exit
        else
            send "CR*Q"
                setTextLineTrigger getEquOnPort :getEquOnPort "Equipment  Buying"
                pause
                pause
                :getEquOnPort
                    killalltriggers
                    getWord CURRENTLINE $port[$current_ship].equ_amount 3
                    getWord CURRENTLINE $port[$current_ship].equ_pct 4
                    stripText $port[$current_ship].equ_pct "%"
                    add $port[$current_ship].equ_pct 1
                    setVar $port[$current_ship].equ_max $port[$current_ship].equ_amount
                    multiply $port[$current_ship].equ_max 100
                    divide $port[$current_ship].equ_max $port[$current_ship].equ_pct
                    setVar $port[$current_ship].equ_on_port $port[$current_ship].equ_max
                    subtract $port[$current_ship].equ_on_port $port[$current_ship].equ_amount
            return
        end
    :noport
        killalltriggers
        gosub :endCNsettings
        setVar $exit_message "There is no port, you can't SDT here!"
        goto :exit


# ----- SUB :checkUpgrade
# ----- USED WITHIN MAIN PROGRAM LOOP
:checkUpgrade

    setVar $steal_holds $exp
    divide $steal_holds $GAME~steal_factor
    if ($steal_holds < 10)
        gosub :endCNsettings
        setVar $exit_message "You need more experience to SDT!!!"
        goto :exit
    elseif ($holds[$current_ship] < 10)
        gosub :endCNsettings
        setVar $exit_message "You need more cargo holds to SDT!!!"
        goto :exit
    end
    if ($steal_holds > $holds[$current_ship])
        setVar $steal_holds $holds[$current_ship]
    end

    :calcSectorEqu
    setVar $sector_equ[$current_ship] $planet~planet[$current_ship].equ
    add $sector_equ[$current_ship] $port[$current_ship].equ_on_port
    setVar $sector_equ_needed[$current_ship] $steal_holds
    multiply $sector_equ_needed[$current_ship] $maxcycles
    add $sector_equ_needed[$current_ship] 10

    if ($port[$current_ship].equ_on_port >= $steal_holds)
        return
    else
        if ($sector_equ[$current_ship] >= $sector_equ_needed[$current_ship])
            gosub :sell
            return
        else
            setVar $upgrade_amount $steal_holds
            subtract $upgrade_amount $port[$current_ship].equ_on_port
            divide $upgrade_amount 10
            add $upgrade_amount 5
            setVar $cash_needed $upgrade_amount
            multiply $cash_needed 900
            if ($player~credits >= $cash_needed)
                send "o  3" & $upgrade_amount & "*  *"
                multiply $upgrade_amount 10
                add $port[$current_ship].equ_on_port $upgrade_amount
                if ($ckSDTquiet = "OFF")
                    setvar $switchboard~message "Ship " & $current_ship & " - port upgraded " & $upgrade_amount & " units.*"
                    gosub :switchboard~switchboard
                end
                setVar $upgrade_amount 0
                subtract $player~credits $cash_needed
            else
                if ($planet~planet[$current_ship].equ >= $steal_holds)
                    setvar $switchboard~message "Not enough credits to upgrade, selling early.*"
                    gosub :switchboard~switchboard
                    gosub :sell
                else
                    gosub :endCNsettings
                    setVar $exit_message "Not enough credits on hand to upgrade the port."
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
            setTextLineTrigger equpct :equpct "Equipment  Buying"
            pause
            pause

            :equpct
                getWord CURRENTLINE $player~current_sector.equpercent 4
                striptext $player~current_sector.equpercent "%"

        :sellproduct
            setTextTrigger sellfuel :sellfuel "How many units of Fuel Ore"
            setTextTrigger sellorg :sellorg "How many units of Organics"
            setTextTrigger sellequ :sellequ "How many units of Equipment"
            settexttrigger noequ :noequ "Command ["

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
                if (HAGGLE)
                    setVar $nativePlanetTradeActive 0
                    setVar $nativeSellAmount 0
                    setVar $nativeTradeCreditsBefore $player~credits
                    gosub :nativePlanetTradeWait
                    gosub :getInfo
                    if ($nativeSellAmount <= 0)
                        goto :sellhagglefailed
                    end
                    getSectorParameter $player~current_sector "EQUMCIC" $MCIC[$current_ship]
                    if ($MCIC[$current_ship] = "")
                        setVar $MCIC[$current_ship] 0
                    end
                    setVar $nativeRevenueMade $player~credits
                    subtract $nativeRevenueMade $nativeTradeCreditsBefore
                    if ($nativeRevenueMade < 0)
                        setVar $nativeRevenueMade 0
                    end
                    subtract $planet~planet[$current_ship].equ $nativeSellAmount
                    if ($planet~planet[$current_ship].equ < 0)
                        setVar $planet~planet[$current_ship].equ 0
                    end
                    add $port[$current_ship].equ_on_port $nativeSellAmount
                    add $equ_sold[$current_ship] $nativeSellAmount
                    add $total_revenue[$current_ship] $nativeRevenueMade
                    setVar $perunit 0
                    if ($nativeSellAmount > 0)
                        setVar $perunit $nativeRevenueMade
                        divide $perunit $nativeSellAmount
                    end
                    if ($ckSDTquiet = "OFF")
                        setvar $switchboard~message "Ship " & $current_ship & " - " & $nativeSellAmount & " EQU haggled for " & $nativeRevenueMade & " credits (" & $perunit & " per unit).*"
                        gosub :switchboard~switchboard
                    end
                    return
                end
                setTextLineTrigger equamount :equamount "Agreed,"
                pause
                pause

            :equamount
                getWord CURRENTLINE $portbuying 2
                striptext $portbuying ","

    :sellhaggle
        setTextLineTrigger sellfirstoffer :sellfirstoffer "We'll buy them for"
        pause

    :sellfirstoffer
        killalltriggers
        getWord CURRENTLINE $offer 5
        striptext $offer ","
        gosub :swathoff
        if ($swathoff = 0)
            setVar $exit_message $message
            goto :exit
        end

        # ----- CALCULATE the port's "quality" -----
        setVar $perunitinitoffer $offer

        #NEW CODE ADDED TO SUPPORT NON-100% PTRADES
        multiply $perunitinitoffer 100
        divide $perunitinitoffer $game~ptradesetting

        # multiply by 100 to increase accuracy of results, we'll need to divide by 100 later
        multiply $perunitinitoffer 100

        # divide by the number of units you are selling
        divide $perunitinitoffer $portbuying

        #initialize portmaxinit
        setVar $portmaxinit $perunitinitoffer

        # return to 10 scale
        divide $perunitinitoffer 10

            # port max init  =(($perunitinitoffer-90.6281)/($percent-10.98921))*(89.01079)+90.6281
            setVar $basevalue 906281000
            setVar $basepercent 10989
            setVar $basepercentinverse 89010
            setVar $percentfrombase $player~current_sector.equpercent

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
            setVar $portmaxinit 1063
        end


        # ----- LOOKUP the counteroffer percentage to use at this "quality" port -----
            if ($portmaxinit >= 1393)
                setVar $MCIC "-65"
                setVar $multiple 1347

            elseif ($portmaxinit >= 1386)
                setVar $MCIC "-64"
                setVar $multiple 1341

            elseif ($portmaxinit >= 1379)
                setVar $MCIC "-63"
                setVar $multiple 1336

            elseif ($portmaxinit >= 1372)
                setVar $MCIC "-62"
                setVar $multiple 1330

            elseif ($portmaxinit >= 1365)
                setVar $MCIC "-61"
                setVar $multiple 1324

            elseif ($portmaxinit >= 1358)
                setVar $MCIC "-60"
                setVar $multiple 1319

            elseif ($portmaxinit >= 1351)
                setVar $MCIC "-59"
                setVar $multiple 1313

            elseif ($portmaxinit >= 1344)
                setVar $MCIC "-58"
                setVar $multiple 1307

            elseif ($portmaxinit >= 1337)
                setVar $MCIC "-57"
                setVar $multiple 1302

            elseif ($portmaxinit >= 1329)
                setVar $MCIC "-56"
                setVar $multiple 1296

            elseif ($portmaxinit >= 1323)
                setVar $MCIC "-55"
                setVar $multiple 1291

            elseif ($portmaxinit >= 1315)
                setVar $MCIC "-54"
                setVar $multiple 1285

            elseif ($portmaxinit >= 1308)
                setVar $MCIC "-53"
                setVar $multiple 1279

            elseif ($portmaxinit >= 1301)
                setVar $MCIC "-52"
                setVar $multiple 1274

            elseif ($portmaxinit >= 1294)
                setVar $MCIC "-51"
                setVar $multiple 1268

            elseif ($portmaxinit >= 1287)
                setVar $MCIC "-50"
                setVar $multiple 1262

            elseif ($portmaxinit >= 1279)
                setVar $MCIC "-49"
                setVar $multiple 1254

            elseif ($portmaxinit >= 1272)
                setVar $MCIC "-48"
                setVar $multiple 1247

            elseif ($portmaxinit >= 1265)
                setVar $MCIC "-47"
                setVar $multiple 1246

            elseif ($portmaxinit >= 1258)
                setVar $MCIC "-46"
                setVar $multiple 1241

            elseif ($portmaxinit >= 1251)
                setVar $MCIC "-45"
                setVar $multiple 1235

            elseif ($portmaxinit >= 1243)
                setVar $MCIC "-44"
                setVar $multiple 1229

            elseif ($portmaxinit >= 1236)
                setVar $MCIC "-43"
                setVar $multiple 1224

            elseif ($portmaxinit >= 1229)
                setVar $MCIC "-42"
                setVar $multiple 1218

            elseif ($portmaxinit >= 1221)
                setVar $MCIC "-41"
                setVar $multiple 1213

            elseif ($portmaxinit >= 1214)
                setVar $MCIC "-40"
                setVar $multiple 1208

            elseif ($portmaxinit >= 1206)
                setVar $MCIC "-39"
                setVar $multiple 1201

            elseif ($portmaxinit >= 1199)
                setVar $MCIC "-38"
                setVar $multiple 1196

            elseif ($portmaxinit >= 1192)
                setVar $MCIC "-37"
                setVar $multiple 1190

            elseif ($portmaxinit >= 1184)
                setVar $MCIC "-36"
                setVar $multiple 1185

            elseif ($portmaxinit >= 1177)
                setVar $MCIC "-35"
                setVar $multiple 1180

            elseif ($portmaxinit >= 1169)
                setVar $MCIC "-34"
                setVar $multiple 1174

            elseif ($portmaxinit >= 1162)
                setVar $MCIC "-33"
                setVar $multiple 1169

            elseif ($portmaxinit >= 1154)
                setVar $MCIC "-32"
                setVar $multiple 1164

            elseif ($portmaxinit >= 1147)
                setVar $MCIC "-31"
                setVar $multiple 1158

            elseif ($portmaxinit >= 1139)
                setVar $MCIC "-30"
                setVar $multiple 1152

            elseif ($portmaxinit >= 1132)
                setVar $MCIC "-29"
                setVar $multiple 1149

            elseif ($portmaxinit >= 1124)
                setVar $MCIC "-28"
                setVar $multiple 1144

            elseif ($portmaxinit >= 1116)
                setVar $MCIC "-27"
                setVar $multiple 1136

            elseif ($portmaxinit >= 1109)
                setVar $MCIC "-26"
                setVar $multiple 1132

            elseif ($portmaxinit >= 1101)
                setVar $MCIC "-25"
                setVar $multiple 1126

            elseif ($portmaxinit >= 1093)
                setVar $MCIC "-24"
                setVar $multiple 1122

            elseif ($portmaxinit >= 1086)
                setVar $MCIC "-23"
                setVar $multiple 1117

            elseif ($portmaxinit >= 1078)
                setVar $MCIC "-22"
                setVar $multiple 1110

            elseif ($portmaxinit >= 1071)
                setVar $MCIC "-21"
                setVar $multiple 1105

            elseif ($portmaxinit >= 1063)
                setVar $MCIC "-20"
                setVar $multiple 1102

            else
                setVar $MCIC "0"
                setVar $multiple 1102

            end

        setVar $counter $offer
        divide $counter 10
        multiply $counter $multiple
        # divide by 1000 instead of 100 because the multiple is in 10 scale
        divide $counter 100
        send $counter & "*"
        setVar $midhaggles 0
    :sellofferloop
        setTextLineTrigger sellprice :sellprice "We'll buy them for"
        setTextLineTrigger sellfinaloffer :sellfinaloffer "Our final offer"
        setTextLineTrigger sellnotinterested :sellnotinterested "We're not interested."
        setTextLineTrigger sellexperience :sellexperience "experience point(s)"
        setTextLineTrigger sellyouhave :sellyouhave "You have"

        setTextLineTrigger sellscrewup1 :sellscrewup "Get real ion-brain, make me a real offer."
        setTextLineTrigger sellscrewup2 :sellscrewup "This is the big leagues Jr.  Make a real offer."
        setTextLineTrigger sellscrewup3 :sellscrewup "My patience grows short with you."
        setTextLineTrigger sellscrewup4 :sellscrewup "I have much better things to do than waste my time.  Try again."
        setTextLineTrigger sellscrewup5 :sellscrewup "HA! HA, ha hahahhah hehehe hhhohhohohohh!  You choke me up!"
        setTextLineTrigger sellscrewup6 :sellscrewup "Quit playing around, you're wasting my time!"
        setTextLineTrigger sellscrewup7 :sellscrewup "Make a real offer or get the h*ll out of here!"
        setTextLineTrigger sellscrewup8 :sellscrewup "WHAT?!@!? you must be crazy!"
        setTextLineTrigger sellscrewup9 :sellscrewup "So, you think I'm as stupid as you look? Make a real offer."
        setTextLineTrigger sellscrewup10 :sellscrewup "What do you take me for, a fool?  Make a real offer!"
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
        setVar $old_offer $offer
        setVar $old_counter $counter
        getWord CURRENTLINE $offer 5
        striptext $offer ","

            # new method
            setVar $offer_change $offer
            subtract $offer_change $old_offer
            if ($MCIC > "-50")
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
        setVar $old_offer $offer
        setVar $old_counter $counter
        getWord CURRENTLINE $offer 5
        striptext $offer ","
        setVar $offer_change $offer
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
        getWord CURRENTLINE $exp_bonus 7
        add $exp $exp_bonus
        goto :sellofferloop
    :sellyouhave
        killalltriggers
        setVar $oldcredits $player~credits
        getWord CURRENTLINE $player~credits 3
        stripText $player~credits ","
        if ($oldcredits = $player~credits)
            setVar $currenthaggle "failed"
            goto :sellhagglefailed
        else
            setVar $currenthaggle "succeeded"
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
        setVar $MCIC[$current_ship] $MCIC
        subtract $planet~planet[$current_ship].equ $portbuying
        add $port[$current_ship].equ_on_port $portbuying
        add $equ_sold[$current_ship] $portbuying
        add $total_revenue[$current_ship] $counter
        setVar $perunit $counter
        divide $perunit $portbuying
        if ($ckSDTquiet = "OFF")
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

:nativePlanetTradeWait
    setTextLineTrigger NATIVEPLANETSTART1 :nativePlanetTradeProgress "<Port>"
    setTextLineTrigger NATIVEPLANETSTART2 :nativePlanetTradeProgress "Docking..."
    setTextTrigger NATIVEPLANETSTART3 :nativePlanetTradeProgress "Your offer ["
    setTextTrigger NATIVEPLANETSTART4 :nativePlanetTradeProgress "Our final offer"
    setTextLineTrigger NATIVEPLANETSTART5 :nativePlanetTradeAgreed "Agreed,"
    setTextTrigger NATIVEPLANETQTY :nativePlanetTradeQty "How many units of "
    if ($nativePlanetTradeActive = 1)
        setTextTrigger NATIVEPLANETDONE1 :nativePlanetTradeDone "Planet command"
        setTextTrigger NATIVEPLANETDONE2 :nativePlanetTradeDone "Command [TL="
        setTextTrigger NATIVEPLANETDONE3 :nativePlanetTradeDone "Citadel command"
        setTextTrigger NATIVEPLANETDONE4 :nativePlanetTradeDone "Corporate command [TL="
    end
    pause

:nativePlanetTradeProgress
    killalltriggers
    setVar $nativePlanetTradeActive 1
    goto :nativePlanetTradeWait

:nativePlanetTradeAgreed
    killalltriggers
    setVar $nativePlanetTradeActive 1
    getWord CURRENTLINE $nativeSellAmount 2
    striptext $nativeSellAmount ","
    goto :nativePlanetTradeWait

:nativePlanetTradeQty
    killalltriggers
    setVar $nativePlanetTradeActive 1
    setVar $nativeLine CURRENTLINE
    gosub :handleNativePlanetQty
    goto :nativePlanetTradeWait

:nativePlanetTradeDone
    killalltriggers
    return

:handleNativePlanetQty
    setVar $nativeTradeProduct "None"
    getWordPos $nativeLine $nativeX "Fuel"
    if ($nativeX > 0)
        setVar $nativeTradeProduct "Fuel"
    else
        getWordPos $nativeLine $nativeX "Organics"
        if ($nativeX > 0)
            setVar $nativeTradeProduct "Organics"
        else
            getWordPos $nativeLine $nativeX "Equipment"
            if ($nativeX > 0)
                setVar $nativeTradeProduct "Equipment"
            end
        end
    end

    if ($nativeTradeProduct = "Equipment")
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
    setTextLineTrigger equOnPort :equOnPort "Equipment  Buying"
    setTextLineTrigger fake :fake "Suddenly you're Busted!"
    pause
    pause
    :equOnPort
        killalltriggers
        getWord CURRENTLINE $port[$current_ship].equ_on_port 4
        :dothedeed
            setTextLineTrigger bust :bust "For getting caught"
	    setTextLineTrigger noprod :noprod "There aren't that many holds of Equipment at this port!"
            setTextLineTrigger good :good "and you receive"
            pause
            pause
	    :noprod
		killalltriggers
		send "'Not enough equipment at port, upgrading and resuming*"
		send "o31*q"
		goto :stealagain
		
            :bust

                killalltriggers
                setSectorParameter 1 "LRA" $sector[$current_ship]
                SetVar $ckLRA $sector[$current_ship]
                SaveVar $ckLRA    
                setSectorParameter $sector[$current_ship] "BUSTED" TRUE
                send "'<"&$bot~subspace&">[Busted:"&$sector[$current_ship]&"]<"&$bot~subspace&">*"
                #gosub :sell
                gosub :getInfo
                gosub :player~quikstats

                setVar $sendString "L " & $planet~planet[$current_ship] & "*  TNL3*c t t"& ($player~credits-500000)&"*qqq * * "
                send $sendString

                goto :finish
            :fake
                killAllTriggers
                setSectorParameter $sector[$current_ship] "FAKEBUST" TRUE
                send "  "
                send "N  N  *  *"
                gosub :endCNsettings
                setVar $exit_message "FAKE Busted in Ship " & $current_ship & ", need a super furb"
                goto :exit
            :good
                killalltriggers
                setSectorParameter 1 "LRA" $sector[$current_ship]
                SetVar $ckLRA $sector[$current_ship]
                SaveVar $ckLRA    
                getWord CURRENTLINE $exp_bonus 4
                add $exp $exp_bonus
                setVar $sendString "L " & $planet~planet[$current_ship] & "*  TNL3*Q"
                send $sendString
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
        setVar $current_ship $ship_2
    else
        setVar $current_ship $ship_1
    end
    add $player~turns_used 1
    if ($skip_ships = "YES")
        setVar $xportString "X  " & $current_ship & "*  Q"
        send $xportString
        return
    else
        setVar $xportString "X  " & $current_ship & "*  Q"
        send $xportString
        gosub :player~quikstats

		if ($player~ship_number <> $current_ship)
			setVar $exit_message "Cannot Xport to Ship "&$current_ship&".  Check Xport Range.  Halting.*"
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
:startCNsettings
    send "CN"

        SetTextLineTrigger ansi0 :ansi0 "(1) ANSI graphics            - Off"
        SetTextLineTrigger ansi1 :ansi1 "(1) ANSI graphics            - On"
        pause

        :ansi0
            killalltriggers
            setVar $cn1 0
            goto :cn1done
        :ansi1
            killalltriggers
            setVar $cn1 1
        :cn1done

        SetTextLineTrigger anim0 :anim0 "(2) Animation display        - Off"
        SetTextLineTrigger anim1 :anim1 "(2) Animation display        - On"
        pause

        :anim0
            killalltriggers
            setVar $cn2 0
            goto :cn2done
        :anim1
            killalltriggers
            setVar $cn2 1
        :cn2done

        SetTextLineTrigger page0 :page0 "(3) Page on messages         - Off"
        SetTextLineTrigger page1 :page1 "(3) Page on messages         - On"
        pause

        :page0
            killalltriggers
            setVar $cn3 0
            goto :cn3done
        :page1
            killalltriggers
            setVar $cn3 1
        :cn3done

        SetTextLineTrigger silence0 :silence0 "(7) Silence ALL messages     - No"
        SetTextLineTrigger silence1 :silence1 "(7) Silence ALL messages     - Yes"
        pause

        :silence0
            killalltriggers
            setVar $cn7 0
            goto :cn7done
        :silence1
            killalltriggers
            setVar $cn7 1
        :cn7done

        SetTextLineTrigger abortdisplay0 :abortdisplay0 "(9) Abort display on keys    - SPACE"
        SetTextLineTrigger abortdisplay1 :abortdisplay1 "(9) Abort display on keys    - ALL KEYS"
        pause

        :abortdisplay0
            killalltriggers
            setVar $cn9 0
            goto :cn9done
        :abortdisplay1
            killalltriggers
            setVar $cn9 1
        :cn9done

        SetTextLineTrigger messagedisplay0 :messagedisplay0 "(A) Message Display Mode     - Compact"
        SetTextLineTrigger messagedisplay1 :messagedisplay1 "(A) Message Display Mode     - Long"
        pause

        :messagedisplay0
            killalltriggers
            setVar $cna 0
            goto :cnadone
        :messagedisplay1
            killalltriggers
            setVar $cna 1
        :cnadone

        SetTextLineTrigger screenpauses0 :screenpauses0 "(B) Screen Pauses            - No"
        SetTextLineTrigger screenpauses1 :screenpauses1 "(B) Screen Pauses            - Yes"
        pause

        :screenpauses0
            killalltriggers
            setVar $cnb 0
            goto :cnbdone
        :screenpauses1
            killalltriggers
            setVar $cnb 1
        :cnbdone

#        waitfor "Settings command (?=Help)"
        gosub :sendCNstring
#        send "?"
#        waitfor "Settings command (?=Help)"
        send "QQ"
        SetTextTrigger subStartCNcontinue1 :subStartCNcontinue "Command [TL="
        SetTextTrigger subStartCNcontinue2 :subStartCNcontinue "Citadel command (?=help)"
        pause
        :subStartCNcontinue
        killalltriggers
        return



# ----- SUB: end CN settings -----
:endCNsettings
    send "CN"
    waitfor "Settings command (?=Help)"
    gosub :sendCNstring
    send "?"
    waitfor "Settings command (?=Help)"
    send "QQ"
    SetTextTrigger subEndCNcontinue1 :subEndCNcontinue "Command [TL="
    SetTextTrigger subEndCNcontinue2 :subEndCNcontinue "Citadel command (?=help)"
    pause
    :subEndCNcontinue
    killalltriggers
    return


# ----- SUB: send CN string -----
:sendCNstring
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
:getInfo
    setVar $player~photons 0
    setVar $player~scan_type "None"
    setVar $player~twarp_type 0
    setVar $player~corpstring "[0]"
    send "I"
    waitfor "<Info>"
    :waitForInfo
        setTextLineTrigger getTraderName :getTraderName "Trader Name    :"
        setTextLineTrigger getExpAndAlign :getExpAndAlign "Rank and Exp"
        setTextLineTrigger getCorp :getCorp "Corp           #"
        setTextLineTrigger getShipType :getShipType "Ship Info      :"
        setTextLineTrigger getTPW :getTPW "Turns to Warp  :"
        setTextLineTrigger getSect :getSect "Current Sector :"
        setTextLineTrigger getTurns :getTurns "Turns left"
        setTextLineTrigger getHolds :getHolds "Total Holds"
        setTextLineTrigger getFighters :getFighters "Fighters       :"
        setTextLineTrigger getShields :getShields "Shield points  :"
        setTextLineTrigger getPhotons :getPhotons "Photon Missiles:"
        setTextLineTrigger getScanType :getScanType "LongRange Scan :"
        setTextLineTrigger getTwarpType1 :getTwarpType1 "  (Type 1 Jump):"
        setTextLineTrigger getTwarpType2 :getTwarpType2 "  (Type 2 Jump):"
        setTextLineTrigger getCredits :getCredits "Credits"
        setTextTrigger getInfoDone :getInfoDone "Command [TL="
        setTextTrigger getInfoDone2 :getInfoDone "Citadel command"
        pause
        pause
    :getTraderName
        killAllTriggers
        setVar $tradername CURRENTLINE
        stripText $tradername "Trader Name    : "
        stripText $tradername "3rd Class "
        stripText $tradername "2nd Class "
        stripText $tradername "1st Class "
        stripText $tradername "Nuisance "
        stripText $tradername "Menace "
        stripText $tradername "Smuggler Savant "
        stripText $tradername "Smuggler "
        stripText $tradername "Robber "
        stripText $tradername "Private "
        stripText $tradername "Lance Corporal "
        stripText $tradername "Corporal "
        stripText $tradername "Staff Sergeant "
        stripText $tradername "Gunnery Sergeant "
        stripText $tradername "1st Sergeant "
        stripText $tradername "Sergeant Major "
        stripText $tradername "Sergeant "
        stripText $tradername "Chief Warrant Officer "
        stripText $tradername "Warrant Officer "
        stripText $tradername "Terrorist "
        stripText $tradername "Infamous Pirate "
        stripText $tradername "Notorious Pirate "
        stripText $tradername "Dread Pirate "
        stripText $tradername "Pirate "
        stripText $tradername "Galactic Scourge "
        stripText $tradername "Enemy of the State "
        stripText $tradername "Enemy of the People "
        stripText $tradername "Enemy of Humankind "
        stripText $tradername "Heinous Overlord "
        stripText $tradername "Prime Evil "
        stripText $tradername "Ensign "
        stripText $tradername "Lieutenant J.G. "
        stripText $tradername "Lieutenant Commander "
        stripText $tradername "Lieutenant "
        stripText $tradername "Commander "
        stripText $tradername "Captain "
        stripText $tradername "Commodore "
        stripText $tradername "Rear Admiral "
        stripText $tradername "Vice Admiral "
        stripText $tradername "Fleet Admiral "
        stripText $tradername "Admiral "
        stripText $tradername "Civilian "
        stripText $tradername "Annoyance "
        goto :waitForInfo
    :getExpAndAlign
        killAllTriggers
        getWord CURRENTLINE $exp 5
        getWord CURRENTLINE $align 7
        stripText $exp ","
        stripText $align ","
        stripText $align "Alignment="
        goto :waitForInfo
    :getCorp
        killAllTriggers
        getWord CURRENTLINE $player~corp 3
        stripText $player~corp ","
        setVar $player~corpstring "[" & $player~corp & "]"
        goto :waitForInfo
    :getShipType
        killAllTriggers
        getWordPos CURRENTLINE $shiptypeend "Ported="
        subtract $shiptypeend 18
        cutText CURRENTLINE $shiptype 18 $shiptypeend
        goto :waitForInfo
    :getTPW
        killAllTriggers
        getWord CURRENTLINE $tpw 5
        goto :waitForInfo
    :getSect
        killAllTriggers
        getWord CURRENTLINE $player~current_sector 4
        goto :waitForInfo
    :getTurns
        killAllTriggers
        getWord CURRENTLINE $player~turns 4
        if ($player~turns = "Unlimited")
            setVar $player~turns 65000
        end
        goto :waitForInfo
    :getHolds
        killAllTriggers
        setVar $line CURRENTLINE
        getWord $line $holds 4
        getWordPos $line $textpos "Ore="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $oreholds 1
            stripText $oreholds "Ore="
        else
            setVar $oreholds 0
        end
        getWordPos $line $textpos "Organics="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $orgholds 1
            stripText $orgholds "Organics="
        else
            setVar $orgholds 0
        end
        getWordPos $line $textpos "Equipment="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $equholds 1
            stripText $equholds "Equipment="
        else
            setVar $equholds 0
        end
        getWordPos $line $textpos "Colonists="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $coloholds 1
            stripText $coloholds "Colonists="
        else
            setVar $coloholds 0
        end
        getWordPos $line $textpos "Empty="
        if ($textpos <> 0)
            cutText CURRENTLINE $temp $textpos 100
            getWord $temp $emptyholds 1
            stripText $emptyholds "Empty="
        else
            setVar $emptyholds 0
        end
        goto :waitForInfo
    :getFighters
        killAllTriggers
        getWord CURRENTLINE $figs 3
        stripText $figs ","
        goto :waitForInfo
    :getShields
        killAllTriggers
        getWord CURRENTLINE $player~shields 4
        stripText $player~shields ","
        goto :waitForInfo
    :getPhotons
        killAllTriggers
        getWord CURRENTLINE $player~photons 3
        goto :waitForInfo
    :getScanType
        killAllTriggers
        getWord CURRENTLINE $player~scan_type 4
        goto :waitForInfo
    :getTwarpType1
        killAllTriggers
        getWord CURRENTLINE $twarp_1_range 4
        setVar $player~twarp_type 1
        goto :waitForInfo
    :getTwarpType2
        killAllTriggers
        getWord CURRENTLINE $twarp_2_range 4
        setVar $player~twarp_type 2
        goto :waitForInfo
    :getCredits
        killAllTriggers
        getWord CURRENTLINE $player~credits 3
        stripText $player~credits ","
        goto :waitForInfo
    :getInfoDone
        killalltriggers
        return

# ----- SUB :planet~getplanetinfo -----
:planet~getplanetinfo
    send "*"
    setTextLineTrigger planetInfo :planetInfo "Planet #"
    pause

    :planetinfo
        killalltriggers
        setVar $planet~CITADEL 0
        setVar $planet~CITADELcredits 0
        getWord CURRENTLINE $planet~planet 2
        stripText $planet~planet "#"
        getWord CURRENTLINE $player~current_sector 5
        stripText $player~current_sector ":"
        waitfor "2 Build 1   Product    Amount     Amount     Maximum"

        :getPlanetStuff
            setTextLineTrigger fuelstart :fuelstart "Fuel Ore"
            setTextLineTrigger orgstart :orgstart "Organics"
            setTextLineTrigger equipstart :equipstart "Equipment"
            setTextLineTrigger figstart :figstart "Fighters        N/A"
            setTextLineTrigger citadelstart :citadelstart "Planet has a level"
            setTextTrigger planetInfoDone :planetInfoDone "Planet command (?=help)"
            pause

        :fuelstart
            killalltriggers
            getWord CURRENTLINE $planet~planetfuel 6
            getWord CURRENTLINE $planet~planetfuelmax 8
            stripText $planet~planetfuel ","
            stripText $planet~planetfuelmax ","
            goto :getPlanetStuff

        :orgstart
            killalltriggers
            getWord CURRENTLINE $planet~planetorg 5
            getWord CURRENTLINE $planet~planetorgmax 7
            stripText $planet~planetorg ","
            stripText $planet~planetorgmax ","
            goto :getPlanetStuff

        :equipstart
            killalltriggers
            getWord CURRENTLINE $planet~planetequip 5
            getWord CURRENTLINE $planet~planetequipmax 7
            stripText $planet~planetequip ","
            stripText $planet~planetequipmax ","
            goto :getPlanetStuff

        :figstart
            killalltriggers
            getWord CURRENTLINE $planet~planetfig 5
            getWord CURRENTLINE $planet~planetfigmax 7
            stripText $planet~planetfig ","
            stripText $planet~planetfigmax ","
            goto :getPlanetStuff

        :citadelstart
            killalltriggers
            getWord CURRENTLINE $planet~CITADEL 5
            getWord CURRENTLINE $planet~CITADELcredits 9
            striptext $planet~CITADELcredits ","

    :planetInfoDone
        return
        
:swathoff
	loadvar $swathoff
    if ($swathoff = 0)
        setTextTrigger swathison :swathison "Command [TL="
        setDelayTrigger swathisoff :swathisoff 2000
        pause

        :swathison
        killalltriggers
        setVar $message "Detected SWATH Autohaggle"
        setVar $swathoff 0
        savevar $swathoff
        return

        :swathisoff
        killalltriggers
        setVar $swathoff 1
        savevar $swathoff
    end
    return
    
include "source\include\planet"
include "source\include\player"
include "source\include\sector"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
