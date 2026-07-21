gosub :help~initialize
setvar $help~help[1] $help~tab&"Sets a planet quasar cannon damage target."
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  qset [a | s]  [damage]"
setvar $help~help[4] $help~tab&"   "
setvar $help~help[5] $help~tab&"   [a] - atmosphere cannon."
setvar $help~help[6] $help~tab&"   [s] - sector cannon."
setvar $help~help[7] $help~tab&"   [damage] - desired cannon damage."
setvar $help~help[8] $help~tab&"   Run from Planet or Citadel; calculates the needed fuel percent."
gosub :help~helpfile

loadvar $bot_name
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $self_command
loadvar $stardock
loadvar $player~unlimitedgame
loadvar $switchboard~bot_name
loadvar $switchboard~self_command

:qset
:q
getword $user_command_line $parm1 1
getword $user_command_line $parm2 2

isnumber $number $parm2
if ($number <> true)
	setvar $switchboard~message "Cannon Damage Entered is not a number!*"
	gosub :switchboard~switchboard
	halt
end
if (($parm1 <> "a") and ($parm1 <> "s"))
	setvar $switchboard~message "Please use qset [a/s] [damage]!*"
	gosub :switchboard~switchboard
	halt
end

gosub :player~currentprompt
setvar $startinglocation $player~current_prompt
setvar $bot~validprompts "Planet Citadel"
gosub :player~checkstartingprompt

setvar $planet~qset_type $parm1
setvar $planet~qset_setting $parm2

gosub :planet~qset
halt

# includes:

#INCLUDES:
include "source\include\planet"
include "source\include\switchboard.ts"
include "source\include\help"
