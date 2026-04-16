:BOT~CHECKSTARTINGPROMPT
if ($PLAYER~CURRENT_PROMPT = 0)
  gosub :PLAYER~CURRENTPROMPT
end
getwordpos " "&$BOT~VALIDPROMPTS&" " $BOT~POS $PLAYER~CURRENT_PROMPT
if ($BOT~POS <= 0)
  setvar $SWITCHBOARD~MESSAGE "Invalid starting prompt: ["&$PLAYER~CURRENT_PROMPT&"]. Valid prompt(s) for this command: ["&$BOT~VALIDPROMPTS&"]*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end
return
