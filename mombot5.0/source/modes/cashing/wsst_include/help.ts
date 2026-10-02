:help~initialize


setarray $help~help 60
setvar $help~help 60
setvar $help~tab "     "
return
:help~helpfile
:help~help_file



loadvar $bot~mombot_directory
loadvar $bot~command
loadvar $bot~parm1
loadvar $bot~user_command_line
setvar $help~help_file "scripts\"&$bot~mombot_directory&"\help\"&$bot~command&".txt"
fileexists $help~doeshelpfileexist $help~help_file
setvar $bot~only_help FALSE
if (($bot~parm1 = "help") or ($bot~parm1 = "?"))
  setvar $bot~only_help TRUE
end
savevar $bot~only_help
if ($help~doeshelpfileexist)
  setvar $help~i 1
  read $help~help_file $help~help_line ($help~i + 4)
  while ($help~help_line <> "EOF")
    striptext $help~help[$help~i] #13
    striptext $help~help[$help~i] "`"
    striptext $help~help[$help~i] "'"
    replacetext $help~help[$help~i] "=" "-"
    if ($help~help[$help~i] <> $help~help_line)
      goto :WRITE_NEW_HELP_FILE
    end
    add $help~i 1
    read $help~help_file $help~help_line ($help~i + 4)
  end
  if (($help~help[($help~i + 1)] <> 0) or ($help~help[($help~i + 2)] <> 0))
    goto :WRITE_NEW_HELP_FILE
  end
  if ($bot~only_help = TRUE)
    gosub :DISPLAYHELP
    halt
  end
  return
end
goto :WRITE_NEW_HELP_FILE
:help~write_new_help_file

loadvar $bot~command
delete $help~help_file
setvar $help~i 1
getlength $bot~command $help~length
setvar $help~spaces "                                            "
setvar $help~stars "---------------------------------------------"
setvar $help~pos $help~length
cuttext $help~stars $help~border 1 $help~pos
setvar $help~pos ((50 - ($help~length + 10)) / 2)
cuttext $help~spaces $help~center 1 $help~pos
write $help~help_file "                     "
write $help~help_file "   "
write $help~help_file $help~center&"<<<< "&$bot~command&" >>>>"
write $help~help_file "   "
while ($help~i <= $help~help)
  striptext $help~help[$help~i] #13
  striptext $help~help[$help~i] "`"
  striptext $help~help[$help~i] "'"
  replacetext $help~help[$help~i] "=" "-"
  if ($help~help[$help~i] = 0)
    goto :DONE_HELP_FILE
  end
  write $help~help_file $help~help[$help~i]
  add $help~i 1
end
:help~done_help_file

setvar $switchboard~message "Writing text file for "&$bot~command&" in help directory.*"
gosub :switchboard~switchboard

if ($bot~only_help = TRUE)
  gosub :DISPLAYHELP
  halt
end
return
:help~displayhelp

loadvar $switchboard~self_command
loadvar $switchboard~bot_name
loadvar $bot~silent_running
setvar $help~i 1
setvar $help~helpoutput ""
setvar $help~isdone FALSE
while (($help~i <= $help~help) and ($help~isdone <> TRUE))
  if ($help~help[$help~i] <> 0)
    striptext $help~help[$help~i] #13
    striptext $help~help[$help~i] "`"
    striptext $help~help[$help~i] "'"
    replacetext $help~help[$help~i] "=" "-"
    setvar $help~temp $help~help[$help~i]
    getlength $help~temp $help~length
    setvar $help~istoolong FALSE
    setvar $help~next_line ""
    setvar $help~max_length 65
    if (($switchboard~self_command = TRUE) or ($bot~silent_running = TRUE))
      setvar $help~line $help~help[$help~i]
      gosub :FORMATHELPLINE
      setvar $help~help[$help~i] $help~line
      setvar $help~next_line_test $help~next_line
      striptext $help~next_line_test " "
      if ($help~next_line_test <> "")
        setvar $help~line $help~next_line
        gosub :FORMATHELPLINE
        setvar $help~next_line $help~line
      end
    else
      while ($help~length > $help~max_length)
        setvar $help~istoolong TRUE
        cuttext $help~temp $help~next_line ($help~max_length + 1) ($help~length - $help~max_length)
        cuttext $help~temp $help~help[$help~i] 1 $help~max_length
        getlength $help~next_line $help~length
      end
    end
    setvar $help~helpoutput $help~helpoutput&$help~help[$help~i]&"  *"
    setvar $help~next_line_test $help~next_line
    striptext $help~next_line_test " "
    if ($help~next_line_test <> "")
      setvar $help~helpoutput $help~helpoutput&""&$help~next_line&"  *"
    end
    if ($help~length <= 1)
    end

  else
    setvar $help~isdone TRUE
  end
  add $help~i 1
end

if (($switchboard~self_command = TRUE) or ($bot~silent_running = TRUE))
  setvar $help~helpoutput "  *"&ANSI_14&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*  *"&ANSI_15&$help~helpoutput&ANSI_14&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&ANSI_15
  setvar $switchboard~message $help~helpoutput
  gosub :switchboard~switchboard
else
  setvar $help~helpoutput "  *"&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&$help~helpoutput&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"
  send "'*{"&$switchboard~bot_name&"} - *"&$help~helpoutput&"*"
end
return
:help~formathelpline

replacetext $help~line "[" ANSI_2&"["&ANSI_6
replacetext $help~line "]" ANSI_2&"]"&ANSI_13
replacetext $help~line "-" ANSI_7&"-"&ANSI_13
replacetext $help~line "<<<<" ANSI_14&"<"&ANSI_7&"<"&ANSI_14&"<"&ANSI_7&"<"&ANSI_15
replacetext $help~line ">>>>" ANSI_7&">"&ANSI_14&">"&ANSI_7&">"&ANSI_14&">"
replacetext $help~line "{" ANSI_2&"{"&ANSI_6
replacetext $help~line "}" ANSI_2&"}"&ANSI_13
replacetext $help~line "Options:" ANSI_6&"Options"&ANSI_2&":"&ANSI_13
setvar $help~line ANSI_13&$help~line&ANSI_15
return
