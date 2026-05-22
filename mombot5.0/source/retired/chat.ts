systemscript
gosub :bot~loadvars

setvar $bot~help[1] $bot~tab&"Chat helper to send chat as a macro to avoid problems with scripts."
gosub :bot~helpfile

setvar $bot~script_title "Chat"
gosub :bot~banner

:start
killtrigger fed
killtrigger ss
killtrigger text
killtrigger reecho
setvar $type ""
settextouttrigger fed :fed "`"
settextouttrigger ss :ss "'"
pause

:ss
setvar $prompt ansi_10&#27&"[255D"&#27&"[255B"&#27&"[K"&ansi_4&"{"&ansi_14&"Subspace chat"&ansi_4&"}"&ansi_15&" "&$switchboard~bot_name&ansi_2&">"&ansi_7
setvar $type "ss"
goto :doprompt

:fed
setvar $type "fed"
setvar $prompt ansi_10&#27&"[255D"&#27&"[255B"&#27&"[K"&ansi_4&"{"&ansi_14&"Fedspace chat"&ansi_4&"}"&ansi_15&" "&$switchboard~bot_name&ansi_2&">"&ansi_7

:doprompt
echo $prompt

:getinput
setvar $promptoutput ""
setvar $charcount 0
setvar $charpos 0
killtrigger             text
killtrigger             reecho
killtrigger fed
killtrigger ss
settextouttrigger       text                    :getcharacter
settexttrigger          reecho                  :reecho
pause

:getcharacter
getouttext $character
setvar $found_enter_key false
if ($character = #13)
	gosub :do_enter_key
	goto :start
else
	getlength $character $characterlength
	if (($characterlength > 1) or ($character = #8))
		if ($character = #8)
			if ($charcount <= 0)
				setvar $charcount 0
				setvar $charpos 0
			else
				if ($charpos >= $charcount)
					setvar $frontmacro $promptoutput
					setvar $tailmacro ""
				else
					cuttext $promptoutput $tailmacro ($charpos+1) 9999
					cuttext $promptoutput  $frontmacro 1 ($charpos)
				end
				getlength $frontmacro $frontlength
				if ($frontlength > 1)
					cuttext $frontmacro $frontmacro 1 ($frontlength - 1)
				else
					setvar $frontmacro ""
				end
				setvar $promptoutput $frontmacro & $tailmacro
				getlength $promptoutput $charcount
				subtract $charpos 1
				if ($charpos <= 0)
					setvar $charpos 0
				end
				if (($charcount-$charpos) > 0)
					echo $prompt $promptoutput #27 "[" ($charcount-($charpos)) "D"
				else
					echo $prompt $promptoutput
				end
			end
		elseif (($character = #27&"[A") or ($character = #28))
		elseif (($character = #27&"[B") or ($character = #29))
		elseif (($character = #27&"[D") or ($character = #31))
			if ($charpos > 0)
				subtract $charpos 1
				echo ansi_10 $character
			end
		elseif (($character = #27&"[C") or ($character = #30))
			if ($charpos <= $charcount)
				add $charpos 1
				echo ansi_10 $character
			end
		else
			getwordpos $character $pos #13
			if ($pos > 0)
				setvar $found_enter_key true
			end
			striptext $character #27&"[A"
			striptext $character #27&"[B"
			striptext $character #27&"[C"
			striptext $character #27&"[D"
			striptext $character #8
			striptext $character #13
			getlength $character $characterlength
			goto :treatasusual
		end
	else

		:treatasusual
		if ($charpos >= $charcount)
			setvar $frontmacro $promptoutput
			setvar $tailmacro ""&$character&""
		else
			cuttext $promptoutput $frontmacro 1 ($charpos)
			cuttext $promptoutput $tailmacro  ($charpos+1) ($charcount - ($charpos-1))
			setvar $frontmacro $frontmacro&$character
		end
		setvar $promptoutput $frontmacro&$tailmacro
		getlength $promptoutput $charcount
		add $charpos $characterlength
		if (($charcount-$charpos) > 0)
			echo $prompt $promptoutput #27 "[" ($charcount-$charpos+1) "D"
		else
			echo $prompt $promptoutput
		end
		if ($found_enter_key)
			gosub :do_enter_key
			goto :start
		end
	end
end
settextouttrigger text :getcharacter
pause

:reecho
if (($charcount-$charpos) > 0)
	echo $prompt&$promptoutput&#27&"["&($charcount-$charpos+1)&"D"
else
	echo $prompt&$promptoutput
end
killtrigger reecho
settexttrigger reecho :reecho
pause

goto :start

:do_enter_key
echo #27&"[255D"&#27&"[255B"&#27&"[K"
setvar $message $promptoutput
if ($type = "ss")
	if ($message <> "")
		send "'"&$message&"*"
	end
end
if ($type = "fed")
	if ($message <> "")
		send "`"&$message&"*"
	end
end
return

#INCLUDES:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\bot\banner\bot"
