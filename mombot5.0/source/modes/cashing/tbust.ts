logging "OFF"
reqrecording
loadvar $bot_name
loadvar $unlimitedgame
loadvar $bot_turn_limit
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $stardock
loadvar $command

gosub :player~quikstats

:load
gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1] $help~tab&"Traitors Planet Buster modified for M()M Bot use."
setvar $help~help[2] $help~tab&"       "
setvar $help~help[3] $help~tab&"  Usage: tbust [experience] {safe} {2fer} {max} {override}"
setvar $help~help[4] $help~tab&"               {delay} {bank} {red}"
setvar $help~help[5] $help~tab&"       "
setvar $help~help[6] $help~tab&"Options:"
setvar $help~help[7] $help~tab&"   [experience]  Desired experience."
setvar $help~help[8] $help~tab&"   {safe}        Create and destroy one at a time."
setvar $help~help[9] $help~tab&"   {2fer}        Create and destroy two at a time."
setvar $help~help[10] $help~tab&"   {max}         Create and destroy the max amount."
setvar $help~help[11] $help~tab&"   {override}    Override turns low limit."
setvar $help~help[12] $help~tab&"   {delay}       Random delay for each bust."
setvar $help~help[13] $help~tab&"   {bank}        Corpie will pass credits through bank."
setvar $help~help[14] $help~tab&"   {red}         Attempt negative alignment."
gosub :help~helpfile
if ($player~total_holds < 10)
	setvar $switchboard~message "You need at least 10 Holds to create a planet.*"
	gosub :switchboard~switchboard
	halt
end
isnumber $test $parm1
if ($test)
	if ($parm1 < 1)
		setvar $switchboard~message "Must enter Experience to Achiece*"
		gosub :switchboard~switchboard
		halt
	end
else
	setvar $switchboard~message "Invalid Experience amount entered. *"
	gosub :switchboard~switchboard
	halt
end
if ($player~current_prompt = "Command")
	send "p ss ys *q"
end
if (($player~current_prompt <> "<StarDock>") and ($player~current_prompt <> "Command"))
	setvar $switchboard~message "Must start from StarDock or Command Prompt*"
	gosub :switchboard~switchboard
	halt
end
getwordpos $user_command_line $pos "safe"
if ($pos > 0)
	setvar $bustmode "safe"
end
getwordpos $user_command_line $pos "2fer"
if ($pos > 0)
	setvar $bustmode "2fer"
end
getwordpos $user_command_line $pos "max"
if ($pos > 0)
	setvar $bustmode "max"
end
getwordpos $user_command_line $pos "override"
if ($pos > 0)
	setvar $ovveride true
end
getwordpos $user_command_line $pos "delay"
if ($pos > 0)
	setvar $randomdelay true
end
getwordpos $user_command_line $pos "bank"
if ($pos > 0)
	setvar $corpiebanker true
end
getwordpos $user_command_line $pos "red"
if ($pos > 0)
	setvar $makered "true"
end
if ($parm1 < $player~experience)
	setvar $switchboard~message "Already at or Above Desired Experience*"
	gosub :switchboard~switchboard
	halt
end
setvar $neededcycles ($parm1 / 75)

:check_corp
if ($player~corp > 0)
	gosub :silencemessages
	goto :checkautoflee
else
	setvar $switchboard~message "Must be on a Corp to Continue*"
	gosub :switchboard~switchboard
	halt
end

:checkautoflee
send "\"
settextlinetrigger checkflee :checkflee "Online Auto Flee is"
pause

:checkflee
killtrigger checkflee
getword currentline $autoflee 5
striptext $autoflee "."
if ($autoflee = "enabled")
	send "\"
end
goto :checkcn2

:checkcn2
waitfor "<StarDock>"
send "c"
settextlinetrigger cn2off :cn2off "Sorry, only Traders with ANSI"
settexttrigger cn2on :cn2on "Select(1-5,Q)"
pause

:cn2off
killtrigger cn2off
killtrigger cn2on
goto :checkcn9

:cn2on
killtrigger cn2off
killtrigger cn2on
send "q"
waitfor "<StarDock> Where to?"
send " q  c  n  2  q  q  p  s"
waitfor "<StarDock> Where to?"
if ($unlimitedgame <> 1)
	subtract $player~turns 1
end
goto :checkcn9

:checkcn9
send "ge"
settextlinetrigger cn9space :cn9space "You enter the most"
settextlinetrigger cn9all :cn9all "<Galactic Bank>"
pause

:cn9space
killtrigger cn9space
killtrigger cn9all
setvar $cn9 "space"
settextlinetrigger checkbankacct :checkbankacct "credits in your account."
pause

:cn9all
killtrigger cn9space
killtrigger cn9all
setvar $cn9 "all"
settextlinetrigger checkbankacct :checkbankacct "credits in your account."
pause

:checkbankacct
killtrigger checkbankacct
getword currentline $bankcreds 3
striptext $bankcreds ","
send "q"
waitfor "<StarDock> Where to?"
goto :getpricing

:getpricing
send "ha"
settextlinetrigger getdetcost :getdetcost "We sell them for"
pause

:getdetcost
killtrigger getdetcost
getword currentline $detcost 5
striptext $detcost ","
setstrigger howmanydets :howmanydets "How many Atomic Detonators do you want"
pause

:howmanydets
killtrigger howmanydets
getword currentline $maxdets 9
striptext $maxdets ")"
setvar $maxdets ($maxdets + $player~atomic)
send "0*t"
settextlinetrigger getgtorpcost :getgtorpcost "Aldus Genesis Torpedo."
pause

:getgtorpcost
killtrigger getgtorpcost
getword currentline $gtorpcost 6
striptext $gtorpcost ","
setstrigger howmanygtorps :howmanygtorps "How many Genesis Torpedoes do you want"
pause

:howmanygtorps
killtrigger howmanygtorps
getword currentline $maxgtorps 9
striptext $maxgtorps ")"
setvar $maxgtorps ($maxgtorps + $player~genesis)
send "0*q"
waitfor "See you later."

:redcheck
if ($makered = "true")
	gosub :fixalign
end

:checkforproblems
if ($unlimitedgame = 1)
	goto :fixcn9
elseif (($player~turns = 0) and ($unlimitedgame <> 1))
	setvar $switchboard~message "Turns to low to Run TBust! *"
	gosub :switchboard~switchboard
	gosub :hearmessages
	halt
elseif (($player~turns < 50) and ($override = true))
	goto :fixcn9
elseif ($player~turns < 50)
	gosub :hearmessages
	setvar $switchboard~message "Turns to low to Run TBust!*"
	gosub :switchboard~switchboard
	halt
end

:fixcn9
if ($cn9 = "all")
	send "qcn9  q  q  p  s"
	setvar $cn9 "space"
	waitfor "Landing on Federation StarDock."
	if ($unlimitedgame <> 1)
		subtract $player~turns 1
	end
end

:getuserinput
if (($maxdets = $maxgtorps) or ($maxdets < $maxgtorps))
	setvar $maxpercycle $maxdets
else
	setvar $maxpercycle $maxgtorps
end
setvar $totalinitialcreds ($player~credits + $bankcreds)
setvar $totalcycles (((($player~credits + $bankcreds) / ($gtorpcost + $detcost)) - 1) + $player~atomic)
if ($player~credits < ($gtorpcost + $detcost))
	setvar $switchboard~message "Need more Credits to bust.*"
	gosub :switchboard~switchboard
	halt
else
	setvar $totalcycles ((($player~credits / ($gtorpcost + $detcost)) - 1) + $player~atomic)
end

:finalprepbeforebusting
setvar $wtf 0
if ($bustmode = "safe")
	setvar $maxpercycle 1
elseif ($bustmode = "2fer")
	setvar $maxpercycle 2
elseif ($bustmode = "max")
	setvar $maxpercycle $maxgtorps
end
send "@"
waitfor "hundredths"
gosub :player~quikstats
gosub :checkstatus
if ($player~turns < (($neededcycles / $maxpercycle) + 2))
	if ($unlimitedgame <> 1)
		gosub :hearmessages
		setvar $switchboard~message "Not Enough Turns*"
		gosub :switchboard~switchboard
		halt
	end
end
if ($player~atomic < $maxpercycle)
	send "h  a  " ($maxpercycle - $player~atomic) "*q"
	waitfor "See you later"
end
if ($player~genesis < $maxpercycle)
	send "h  t  " ($maxpercycle - $player~genesis) "*q"
	waitfor "See you later"
end

:startbustcycle
setvar $count 1
setvar $buststring "q  "
setvar $tempcycles $maxpercycle
if ($neededcycles < $tempcycles)
	setvar $tempcycles $neededcycles
end
if ($tempcycles < 1)
	setvar $tempcycles 1
	add $wtf 1
end
while ($count <= $tempcycles)
	setvar $buststring $buststring&"u  y  n  .*cl  *  z  d  y  "
	add $count 1
end
setvar $buststring $buststring&"p  s "
subtract $neededcycles $tempcycles
send $buststring
waitfor "Command"
settextlinetrigger invalidregnum :invalidregnum "Invalid registry number"
settexttrigger bustok :bustok "<StarDock>"
pause

:bustok
killtrigger invalidregnum
killtrigger bustok
send "@"
waitfor "hundredths"
gosub :player~quikstats
gosub :checkstatus
if (($player~atomic >= $tempcycles) and ($player~genesis >= $tempcycles))
	setvar $buydetqty 0
	setvar $buytorpqty 0
else
	setvar $buydetqty ($tempcycles - $player~atomic)
	setvar $buytorpqty ($tempcycles - $player~genesis)
end
send "h  a  " $buydetqty "*  t  " $buytorpqty "*  q"
if ($randomdelay = "TRUE")
	gosub :randomdelay
end
goto :startbustcycle

:invalidregnum
killtrigger bustok
killtrigger invalidregnum
setvar $planetnums ""
send "@"
waitfor "hundredths"
gosub :player~quikstats
gosub :checkstatus
send "h  t  1*  q"
waitfor "<StarDock>"
send "q  u  y  n  .*cl*  z  d  y  p  s "
waitfor "Command"
settexttrigger getplannum :getplannum "Registry#"
settexttrigger ondock :ondock "<StarDock>"
pause

:getplannum
killtrigger getplannum
settextlinetrigger plannum :plannum "   <"
pause

:plannum
killtrigger plannum
add $extraplanets 1
getword currentline $tempplanetnum 2
striptext $tempplanetnum ">"
setvar $planetnums $planetnums&" "&$tempplanetnum
settexttrigger plannum :plannum "   <"
pause

:ondock
killtrigger getplannum
killtrigger plannum
killtrigger ondock
getword currentline $spoofplanetname 1
if ($spoofplanetname <> "<StarDock>")
	settexttrigger ondock :ondock "<StarDock>"
	settexttrigger plannum :plannum "   <"
	pause
end
setarray $randomplannum $extraplanets
setvar $c 1
setvar $rndplanetnums ""

:planetnumberrandomizer
while ($c <= $extraplanets)
	getrnd $random 1 $extraplanets
	if ($randomplannum[$random] = 1)
		goto :planetnumberrandomizer
	else
		getword $planetnums $tempplanetnum $random
		setvar $rndplanetnums $rndplanetnums&" "&$tempplanetnum
		add $c 1
		setvar $randomplannum[$random] 1
	end
end

:multiplanets
send "@"
waitfor "hundredths"
gosub :player~quikstats
gosub :checkstatus
if ($extraplanets >= 1)
	send "h  a  1*  q"
	waitfor "<StarDock>"
	getword $rndplanetnums $tempplanetnum $extraplanets
	send "q  l  "&#8&#8&$tempplanetnum "*  n  z  n  d  y  *  p  s "
	settexttrigger backondock :backondock "<StarDock>"
	settexttrigger planetnumgone :planetnumgone "That planet is not in this sector."
	settexttrigger triedtomove :triedtomove "<Move>"
	pause
else
	send "@"
	waitfor "hundredths"
	goto :bustok
end

:backondock
killtrigger backondock
killtrigger planetnumgone
killtrigger triedtomove
getword currentline $spoofplanetname 1
if ($spoofplanetname <> "<StarDock>")
	settexttrigger backondock :backondock "<StarDock>"
	settexttrigger planetnumgone :planetnumgone "That planet is not in this sector."
	settexttrigger triedtomove :triedtomove "<Move>"
	pause
end
subtract $extraplanets 1
goto :multiplanets

:planetnumgone
killtrigger backondock
killtrigger planetnumgone
killtrigger triedtomove
goto :invalidregnum

:triedtomove
killtrigger backondock
killtrigger planetnumgone
killtrigger triedtomove
goto :bustok

:checkstatus
if ($player~current_prompt <> "<StarDock>")
	gosub :hearmessages
	send "p  s  t"
	setvar $switchboard~message "Houston, we have a problem...*"
	gosub :switchboard~switchboard
	halt
end
if ($player~experience >= $parm1)
	gosub :hearmessages
	setvar $switchboard~message "Target Exp Reached!*"
	gosub :switchboard~switchboard
	halt
end
if (($player~turns < 10) and ($unlimitedgame <> 1))
	gosub :hearmessages
	setvar $switchboard~message "Not Enough Turns to Continue!*"
	gosub :switchboard~switchboard
	halt
end

:resume
if ($player~credits < (($gtorpcost + $detcost) * $maxpercycle))
	if ($corpiebanker = true)
		send "ge"
		settextlinetrigger viewbankacct :viewbankacct "credits in your account."
		pause

		:viewbankacct
		killtrigger viewbankacct
		getword currentline $bankcreds 3
		striptext $bankcreds ","
		send "q"
		waitfor "<StarDock> Where to?"
		if (($player~credits + $bankcreds) < (($gtorpcost + $detcost) * $maxpercycle))
			if ($corpiebanker = true)
				gosub :hearmessages
				setvar $switchboard~message "Need Creds in bank to continue. Waiting on Transfer*"
				gosub :switchboard~switchboard
				settextlinetrigger waitforcreds :waitforcreds "credits to your Galactic bank account."
				pause

				:waitforcreds
				killtrigger waitforcreds
				send "ge"
				settextlinetrigger verifybankacct :verifybankacct "credits in your account."
				pause

				:verifybankacct
				killtrigger verifybankacct
				getword currentline $bankcreds 3
				striptext $bankcreds ","
				send "q"
				waitfor "<StarDock> Where to?"
				if (($player~credits + $bankcreds) < (($gtorpcost + $detcost) * $maxpercycle))
					setvar $switchboard~message "Not enough Creds in bank*"
					gosub :switchboard~switchboard
					settextlinetrigger waitforcreds :waitforcreds "your Galactic bank account."
					pause
				else
					subtract $bankcreds (($gtorpcost + $detcost) * $maxpercycle)
					send "g  w" ((($gtorpcost + $detcost) * $maxpercycle) - $player~credits) "*  q"
					gosub :silencemessages
					waitfor "<StarDock>"
				end
			end
		else
			subtract $bankcreds (($gtorpcost + $detcost) * $maxpercycle)
			send "g  w" ((($gtorpcost + $detcost) * $maxpercycle) - $player~credits) "*  q"
			waitfor "<StarDock>"
		end
	end
end
if ($wtf > 10)
	gosub :hearmessages
	pause
end
return

:randomdelay
getrnd $rndnum 50 2000
setdelaytrigger delay :delay $rndnum
pause

:delay
killtrigger delay
return

:silencemessages
send "|"
setvar $hearmessages "no"
settextlinetrigger message :message "all messages."
pause

:hearmessages
send "|"
setvar $hearmessages "yes"
settextlinetrigger message :message "all messages."
pause

:message
killtrigger message
getword currentline $msgstat 1
if (($msgstat = "Displaying") and ($hearmessages = "yes"))
	return
elseif (($msgstat = "Displaying") and ($hearmessages = "no"))
	send "|"
	return
elseif (($msgstat = "Silencing") and ($hearmessages = "no"))
	return
else
	send "|"
	return
end

:fixalign
if (($player~alignment > 0) and ($player~alignment < 200))
	send "ttmafia*y"
	settexttrigger getmafiapwprice :getmafiapwprice "will ye pay?"
	pause

	:getmafiapwprice
	killtrigger getmafiapwprice
	getword currentline $mafiapwprice 6
	striptext $mafiapwprice ","
	send "n*q"
	waitfor "You make a hasty exit from the Tavern."
	setvar $fixalign $player~alignment
	setvar $fixaligncreds (($fixalign * 250) + $mafiapwprice)
	setvar $newmafiapw "use mombot more"
	goto :getmafiapw

elseif ($youralign > 199)
	setvar $switchboard~message "Cant Get a Negative Alignement.  Continuing for Experience*"
	gosub :switchboard~switchboard
	goto :fixalignreturn
end

:getmafiapw
send "ttmafia*yy"
settextlinetrigger mafiapw :mafiapw "The password today is"
pause

:mafiapw
killtrigger mafiapw
gettext currentline $tempmafiapw "today is "&#34 ""
getlength $tempmafiapw $mafiapwlength
cuttext $tempmafiapw $mafiapw 1 ($mafiapwlength - 1)
send "*q"
waitfor "<StarDock>"
goto :underground

:underground
send "u"
waitfor "Your reply :"
send $mafiapw "*"
settexttrigger pwworks :pwworks "The magnetic shielding goes down and the door opens."
settexttrigger pwfails :pwfails "<StarDock> Where to? (?=Help)"
pause

:pwfails
killtrigger pwworks
killtrigger pwfails
setvar $switchboard~message "Underground PW failed. You will have to fix manually.  Halting Script*"
gosub :switchboard~switchboard
halt

:pwworks
killtrigger pwworks
killtrigger pwfails
send "y" $newmafiapw "*"

:placecontract
setvar $letters "e t a o i n s r h l d c u m f p g w y b v k x j q z"
setvar $count 1

:picktrader4contract
if ($count <= 26)
	getword $letters $temp $count
	send "p" $temp "*"
	settexttrigger knowntrader :knowntrader "Do you mean"
	settexttrigger unknowntrader :unknowntrader "Unknown Trader!"
	pause
else
	gosub :hearmessages
	setvar $switchboard~message "Problems placing a Bounty. - HALTING*"
	gosub :switchboard~switchboard
	halt
end

:unknowntrader
killtrigger knowntrader
killtrigger unknowntrader
add $count 1
goto :picktrader4contract

:knowntrader
killtrigger knowntrader
killtrigger unknowntrader
send "y" ($fixalign * 250) "*q"
waitfor "<StarDock>"
send "@"
waitfor "hundredths"
gosub :player~quikstats

:fixalignreturn
return
include "source\include\player"
include "source\include\switchboard.ts"
include "source\include\loadvars"
include "source\include\help"
