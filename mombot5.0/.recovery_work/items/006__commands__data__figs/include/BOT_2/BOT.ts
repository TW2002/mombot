:BOT~HELPFILE
setvar $BOT~ONLY_HELP FALSE
if (($BOT~PARM1 = "help") or ($BOT~PARM1 = "?"))
  setvar $BOT~ONLY_HELP TRUE
end
setvar $BOT~HELP_FILE "scripts\mombot\help\"&$BOT~COMMAND&".txt"
fileexists $BOT~DOESHELPFILEEXIST $BOT~HELP_FILE
if ($BOT~DOESHELPFILEEXIST)
  setvar $BOT~I 1
  read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  while ($BOT~HELP_LINE <> "EOF")

    striptext $BOT~HELP[$BOT~I] #13
    striptext $BOT~HELP[$BOT~I] "`"
    striptext $BOT~HELP[$BOT~I] "'"
    replacetext $BOT~HELP[$BOT~I] "=" "-"
    if ($BOT~HELP[$BOT~I] <> $BOT~HELP_LINE)
      goto :WRITE_NEW_HELP_FILE
    end
    add $BOT~I 1
    read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  end
  if (($BOT~HELP[($BOT~I + 1)] <> 0) or ($BOT~HELP[($BOT~I + 2)] <> 0))
    goto :WRITE_NEW_HELP_FILE
  end
  if ($BOT~ONLY_HELP = TRUE)
    gosub :DISPLAYHELP
    halt
  end
  return
end
:BOT~WRITE_NEW_HELP_FILE
delete $BOT~HELP_FILE
setvar $BOT~I 1
getlength $BOT~COMMAND $BOT~LENGTH
setvar $BOT~SPACES "                                            "
setvar $BOT~STARS "---------------------------------------------"
setvar $BOT~POS $BOT~LENGTH
cuttext $BOT~STARS $BOT~BORDER 1 $BOT~POS
setvar $BOT~POS ((50 - ($BOT~LENGTH + 10)) / 2)
cuttext $BOT~SPACES $BOT~CENTER 1 $BOT~POS
write $BOT~HELP_FILE "                     "
write $BOT~HELP_FILE "   "
write $BOT~HELP_FILE $BOT~CENTER&"<<<< "&$BOT~COMMAND&" >>>>"
write $BOT~HELP_FILE "   "
while ($BOT~I <= $BOT~HELP)
  striptext $BOT~HELP[$BOT~I] #13
  striptext $BOT~HELP[$BOT~I] "`"
  striptext $BOT~HELP[$BOT~I] "'"
  replacetext $BOT~HELP[$BOT~I] "=" "-"
  if ($BOT~HELP[$BOT~I] = 0)
    goto :DONE_HELP_FILE
  end
  write $BOT~HELP_FILE $BOT~HELP[$BOT~I]
  add $BOT~I 1
end
:BOT~DONE_HELP_FILE
setvar $SWITCHBOARD~MESSAGE "Writing text file for "&$BOT~COMMAND&" in help directory.*"
gosub :SWITCHBOARD~SWITCHBOARD

if ($BOT~ONLY_HELP = TRUE)
  gosub :DISPLAYHELP
  halt
end
return
