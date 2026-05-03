#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:HELP~INITIALIZE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setarray $HELP~HELP 60
setvar $HELP~HELP 60
setvar $HELP~TAB "     "
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:HELP~HELPFILE
:HELP~HELP_FILE
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $BOT~MOMBOT_DIRECTORY
loadvar $BOT~COMMAND
loadvar $BOT~PARM1
loadvar $BOT~USER_COMMAND_LINE
setvar $HELP_FILE "scripts\"&$BOT~MOMBOT_DIRECTORY&"\help\"&$BOT~COMMAND&".txt"
fileexists $DOESHELPFILEEXIST $HELP_FILE
setvar $BOT~ONLY_HELP FALSE
if (($BOT~PARM1 = "help") or ($BOT~PARM1 = "?"))
  setvar $BOT~ONLY_HELP TRUE
end
savevar $BOT~ONLY_HELP
if ($DOESHELPFILEEXIST)
  setvar $I 1
  read $HELP_FILE $HELP_LINE ($I + 4)
  while ($HELP_LINE <> "EOF")
    striptext $HELP~HELP[$I] #13
    striptext $HELP~HELP[$I] "`"
    striptext $HELP~HELP[$I] "'"
    replacetext $HELP~HELP[$I] "=" "-"
    if ($HELP~HELP[$I] <> $HELP_LINE)
      goto :WRITE_NEW_HELP_FILE
    end
    add $I 1
    read $HELP_FILE $HELP_LINE ($I + 4)
  end
  if (($HELP~HELP[($I + 1)] <> 0) or ($HELP~HELP[($I + 2)] <> 0))
    goto :WRITE_NEW_HELP_FILE
  end
  if ($BOT~ONLY_HELP = TRUE)
    gosub :DISPLAYHELP
    halt
  end
  return
end
goto :WRITE_NEW_HELP_FILE

:WRITE_NEW_HELP_FILE
loadvar $BOT~COMMAND
delete $HELP_FILE
setvar $I 1
getlength $BOT~COMMAND $LENGTH
setvar $SPACES "                                            "
setvar $STARS "---------------------------------------------"
setvar $POS $LENGTH
cuttext $STARS $BORDER 1 $POS
setvar $POS ((50 - ($LENGTH + 10)) / 2)
cuttext $SPACES $CENTER 1 $POS
write $HELP_FILE "                     "
write $HELP_FILE "   "
write $HELP_FILE $CENTER&"<<<< "&$BOT~COMMAND&" >>>>"
write $HELP_FILE "   "
while ($I <= $HELP~HELP)
  striptext $HELP~HELP[$I] #13
  striptext $HELP~HELP[$I] "`"
  striptext $HELP~HELP[$I] "'"
  replacetext $HELP~HELP[$I] "=" "-"
  if ($HELP~HELP[$I] = 0)
    goto :DONE_HELP_FILE
  end
write $HELP_FILE $HELP~HELP[$I]
add $I 1
end

:DONE_HELP_FILE
setvar $SWITCHBOARD~MESSAGE "Writing text file for "&$BOT~COMMAND&" in help directory.*"
gosub :SWITCHBOARD~SWITCHBOARD

if ($BOT~ONLY_HELP = TRUE)
  gosub :DISPLAYHELP
  halt
end
return

:HELP~DISPLAYHELP
loadvar $SWITCHBOARD~SELF_COMMAND
loadvar $SWITCHBOARD~BOT_NAME
loadvar $BOT~SILENT_RUNNING
setvar $I 1
setvar $HELPOUTPUT ""
setvar $ISDONE FALSE
while (($I <= $HELP~HELP) and ($ISDONE <> TRUE))
  if ($HELP~HELP[$I] <> 0)
    striptext $HELP~HELP[$I] #13
    striptext $HELP~HELP[$I] "`"
    striptext $HELP~HELP[$I] "'"
    replacetext $HELP~HELP[$I] "=" "-"
    setvar $TEMP $HELP~HELP[$I]
    getlength $TEMP $LENGTH
    setvar $ISTOOLONG FALSE
    setvar $NEXT_LINE ""
    setvar $MAX_LENGTH 65
    if (($SWITCHBOARD~SELF_COMMAND = TRUE) or ($BOT~SILENT_RUNNING = TRUE))
      setvar $LINE $HELP~HELP[$I]
      gosub :FORMATHELPLINE
      setvar $HELP~HELP[$I] $LINE
      setvar $NEXT_LINE_TEST $NEXT_LINE
      striptext $NEXT_LINE_TEST " "
      if ($NEXT_LINE_TEST <> "")
        setvar $LINE $NEXT_LINE
        gosub :FORMATHELPLINE
        setvar $NEXT_LINE $LINE
      end
    else
      while ($LENGTH > $MAX_LENGTH)
        setvar $ISTOOLONG TRUE
        cuttext $TEMP $NEXT_LINE ($MAX_LENGTH + 1) ($LENGTH - $MAX_LENGTH)
        cuttext $TEMP $HELP~HELP[$I] 1 $MAX_LENGTH
        getlength $NEXT_LINE $LENGTH
      end
    end
    setvar $HELPOUTPUT $HELPOUTPUT&$HELP~HELP[$I]&"  *"
    setvar $NEXT_LINE_TEST $NEXT_LINE
    striptext $NEXT_LINE_TEST " "
    if ($NEXT_LINE_TEST <> "")
      setvar $HELPOUTPUT $HELPOUTPUT&""&$NEXT_LINE&"  *"
    end
    if ($LENGTH <= 1)
    end


  else
    setvar $ISDONE TRUE
  end
  add $I 1
end

if (($SWITCHBOARD~SELF_COMMAND = TRUE) or ($BOT~SILENT_RUNNING = TRUE))
  setvar $HELPOUTPUT "  *"&ANSI_14&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*  *"&ANSI_15&$HELPOUTPUT&ANSI_14&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&ANSI_15
  setvar $SWITCHBOARD~MESSAGE $HELPOUTPUT
  gosub :SWITCHBOARD~SWITCHBOARD
else
  setvar $HELPOUTPUT "  *"&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&$HELPOUTPUT&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"
  send "'*{"&$SWITCHBOARD~BOT_NAME&"} - *"&$HELPOUTPUT&"*"
end
return

:FORMATHELPLINE
replacetext $LINE "[" ANSI_2&"["&ANSI_6
replacetext $LINE "]" ANSI_2&"]"&ANSI_13
replacetext $LINE "-" ANSI_7&"-"&ANSI_13
replacetext $LINE "<<<<" ANSI_14&"<"&ANSI_7&"<"&ANSI_14&"<"&ANSI_7&"<"&ANSI_15
replacetext $LINE ">>>>" ANSI_7&">"&ANSI_14&">"&ANSI_7&">"&ANSI_14&">"
replacetext $LINE "{" ANSI_2&"{"&ANSI_6
replacetext $LINE "}" ANSI_2&"}"&ANSI_13
replacetext $LINE "Options:" ANSI_6&"Options"&ANSI_2&":"&ANSI_13
setvar $LINE ANSI_13&$LINE&ANSI_15
return

include "source\include\switchboard"
