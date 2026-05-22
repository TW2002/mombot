gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"   Macro          "
setvar $help~help[2]  $help~tab&"               "
setvar $help~help[3]  $help~tab&"    mac {macro to send}  "
setvar $help~help[4]  $help~tab&"        "
gosub :help~helpfile

# ============================== SINGLE MACRO (MAC) ==============================
:mac
setvar $nmac 1
goto :go_macro

:nmac
setvar $nmac $bot~parm1

:go_macro
isnumber $number $nmac
if ($number <> true)
	setvar $switchboard~message "Invalid Macro Count*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
if ($nmac <= 0)
	setvar $switchboard~message "Invalid Macro Count*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
gosub :macroprotections
setvar $i 0
while ($i < $nmac)
	send $bot~user_command_line
	add $i 1
end
if ($nmac > 1)
	setvar $switchboard~message "Numbered Macro - "&$nmac&" Cycles Complete*"
	gosub :switchboard~switchboard
else
	setvar $switchboard~message "Macro Complete*"
	gosub :switchboard~switchboard
end
goto :wait_for_command
# ============================== END MACROS (MAC/NMAC) SUB ==============================
:macroprotections
striptext $bot~user_command_line $switchboard~bot_name
striptext $bot~user_command_line " mac "
replacetext $bot~user_command_line "^m" "*"
replacetext $bot~user_command_line "^b" #8
replacetext $bot~user_command_line #42 "*"
getwordpos $bot~user_command_line $pos "`"
getwordpos $bot~user_command_line $pos2 "'"
getwordpos $bot~user_command_line $pos3 "="
if (($pos > 0) or ($pos2 > 0) or ($pos3 > 0))
	setvar $switchboard~message "No talking with the bot :P*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
setvar $cbycheck $bot~user_command_line
lowercase $cbycheck
getwordpos $cbycheck $posc "c"
getwordpos $cbycheck $posb "b"
getwordpos $cbycheck $posy "y"
gosub  :player~currentprompt
if (($player~current_prompt = "Computer") and ($posb > 0) and ($posy > 0))
	setvar $switchboard~message "Self Destruct Protection Activated*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end
if (($player~self_destruct_prompt = true) and ($posy > 0))
	setvar $switchboard~message "Self Destruct Protection Activated*"
	gosub :switchboard~switchboard
	goto :wait_for_command
end

getlength $cbycheck $length
setvar $i 1
while ($i <= $length)
	if (($posc > 0) and ($posb > $posc) and ($posy > $posb))
		setvar $switchboard~message "Self Destruct Protection Activated*"
		gosub :switchboard~switchboard
		goto :wait_for_command
	end
	if ($foundc = false)
		getwordpos $cbycheck $pos "c"
		if ($pos = 1)
			setvar $foundc true
		end
	elseif ($foundb = false)
		getwordpos $cbycheck $pos "b"
		if ($pos = 1)
			setvar $foundb true
		end
	elseif ($foundy = false)
		getwordpos $cbycheck $pos "y"
		if ($pos = 1)
			setvar $foundy true
		end
	end
	if ($foundc and $foundb and $foundy)
		setvar $switchboard~message "Self Destruct Protection Activated*"
		gosub :switchboard~switchboard
		goto :wait_for_command
	end
	if ($testlength > 1)
		cuttext $cbycheck $cbycheck 2 9999
	end
	add $i 1
end
return
# ============================== END MULTIPLE MACRO (NMAC) SUB ==============================
:wait_for_command
halt

# includes:
include "source\include\player"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
