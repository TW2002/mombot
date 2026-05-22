gosub :loadvars~loadvars
gosub :help~initialize
loadvar $bot~corppassword
loadvar $player~corpnumber

setvar $help~help[1]  $help~tab&"- corp [join/drop] [corp number] [password]                "
setvar $help~help[2]  $help~tab&"      join        - Will join Corporation                          "
setvar $help~help[3]  $help~tab&"      drop        - Will Drop current corporation                  "
setvar $help~help[4]  $help~tab&"      corp number - The corp number to join                        "
setvar $help~help[5]  $help~tab&"      password    - The corp password                              "
setvar $help~help[6]  $help~tab&"*NOTE: If corp and password were previously used via bot           "
setvar $help~help[7]  $help~tab&"       the corp number and password will be saved                  "
gosub :help~helpfile

# ============================== Corp Join/Drop (CORP) ==============================
:corp
gosub :player~quikstats
if (($player~current_prompt <> "Command") and ($player~current_prompt <> "Citadel"))
	setvar $switchboard~message "Must run from Command or Citadel Prompt*"
	gosub :switchboard~switchboard
	halt
end
if ($bot~parm1 <> "drop")
	if (((($bot~parm2 < 1) and ($player~corpnumber < 1)) or (($bot~parm3 = "") and ($bot~corppassword = "")) and ($bot~parm1 <> "join")))
		setvar $switchboard~message "Please use CORP [drop/join] {corp #} {password}*"
		gosub :switchboard~switchboard
		halt
	end
end
if (($bot~parm2 <> "") and ($bot~parm2 <> ""))
	setvar $player~corpnumber $bot~parm2
end
if (($bot~parm3 <> "") and ($bot~parm3 <> ""))
	setvar $bot~corppassword $bot~parm3
end
if ($bot~parm1 = "drop")
	if ($player~current_prompt = "Command")
		send "txy**q*"
		settextlinetrigger offcorp :offcorp "Ok!  You're off the Corp"
		settextlinetrigger notoncorp :notoncorp "You are not currently in a Corporation"
		pause
	elseif ($player~current_prompt = "Citadel")
		send "xxy*q**"
		settextlinetrigger offcorp :offcorp "Ok!  You're off the Corp"
		settextlinetrigger notoncorp :notoncorp "You are not currently in a Corporation"
		pause
	end
elseif ($bot~parm1 = "join")
	if ($player~current_prompt = "Command")
		send "tj" $player~corpnumber "*"
		settextlinetrigger oncorpalready :oncorpalready "You are already on a Corp silly"
		settexttrigger joincorp      :joincorp      "Enter the Password to join"
		pause
	elseif ($player~current_prompt = "Citadel")
		send "xj"
		settextlinetrigger oncorpalready :oncorpalready "You are already on a Corp silly"
		settextlinetrigger joincorp      :joincorp      "Enter the Password to join"
		pause
	end
end
send  $player~corpnumber & "*"
settextlinetrigger fullcorp            :fullcorp      "The Corporation is Full"
settextlinetrigger alignconflict       :alignconflict "Sorry, you can only join a Corporation if your alignment doesn't conflict."

:joincorp
killalltriggers
send $bot~corppassword & "*q"
settextlinetrigger badcorppass         :badcorppass "Nice try, that has been recorded by Federal Intelligence."
settextlinetrigger joinedcorp          :joinedcorp "Welcome Aboard"
settextlinetrigger joinedcorp2          :joinedcorp2 "Welcome aboard!"
pause

:joinedcorp
:joinedcorp2
killalltriggers
setvar $switchboard~message "I joined the Corporation and Claimed my Ship Corporate!*"
gosub :switchboard~switchboard
savevar $bot~corppassword
savevar $player~corpnumber
halt

:offcorp
killalltriggers
setvar $switchboard~message "I have removed myself from the Corporation!*"
gosub :switchboard~switchboard
halt

:notoncorp
killalltriggers
setvar $switchboard~message "I am not currently on a Corporation!*"
gosub :switchboard~switchboard
halt

:oncorpalready
killalltriggers
send "q"
setvar $switchboard~message "I am already on a Corporation!*"
gosub :switchboard~switchboard
halt

:alignconflict
killalltriggers
send "q"
setvar $switchboard~message "My alignment currently prohibits me from joining this corporation!*"
gosub :switchboard~switchboard
halt

:badcorppass
killalltriggers
send "q"
setvar $switchboard~message "The Corporation password was incorrect!*"
gosub :switchboard~switchboard
send "*"
halt

:fullcorp
killalltriggers
send "q"
setvar $switchboard~message "The Corporation is FULL!*"
gosub :switchboard~switchboard
halt
# ============================== End Corp Join/Drop (CORP) ==============================

# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
