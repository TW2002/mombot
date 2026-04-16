:BOT~DISPLAYHELP
setvar $BOT~I 1
setvar $BOT~HELPOUTPUT ""
setvar $BOT~ISDONE FALSE
while (($BOT~I <= $BOT~HELP) and ($BOT~ISDONE <> TRUE))
  if ($BOT~HELP[$BOT~I] <> 0)
    striptext $BOT~HELP[$BOT~I] #13
    striptext $BOT~HELP[$BOT~I] "`"
    striptext $BOT~HELP[$BOT~I] "'"
    replacetext $BOT~HELP[$BOT~I] "=" "-"
    setvar $BOT~TEMP $BOT~HELP[$BOT~I]
    getlength $BOT~TEMP $BOT~LENGTH
    setvar $BOT~ISTOOLONG FALSE
    setvar $BOT~NEXT_LINE ""
    setvar $BOT~MAX_LENGTH 65
    if (($SWITCHBOARD~SELF_COMMAND = TRUE) or ($BOT~SILENT_RUNNING = TRUE))
      setvar $BOT~LINE $BOT~HELP[$BOT~I]
      gosub :FORMATHELPLINE
      setvar $BOT~HELP[$BOT~I] $BOT~LINE
      setvar $BOT~NEXT_LINE_TEST $BOT~NEXT_LINE
      striptext $BOT~NEXT_LINE_TEST " "
      if ($BOT~NEXT_LINE_TEST <> "")
        setvar $BOT~LINE $BOT~NEXT_LINE
        gosub :FORMATHELPLINE
        setvar $BOT~NEXT_LINE $BOT~LINE
      end
    else
      while ($BOT~LENGTH > $BOT~MAX_LENGTH)
        setvar $BOT~ISTOOLONG TRUE
        cuttext $BOT~TEMP $BOT~NEXT_LINE ($BOT~MAX_LENGTH + 1) ($BOT~LENGTH - $BOT~MAX_LENGTH)
        cuttext $BOT~TEMP $BOT~HELP[$BOT~I] 1 $BOT~MAX_LENGTH
        getlength $BOT~NEXT_LINE $BOT~LENGTH
      end
    end
    setvar $BOT~HELPOUTPUT $BOT~HELPOUTPUT&$BOT~HELP[$BOT~I]&"  *"
    setvar $BOT~NEXT_LINE_TEST $BOT~NEXT_LINE
    striptext $BOT~NEXT_LINE_TEST " "
    if ($BOT~NEXT_LINE_TEST <> "")
      setvar $BOT~HELPOUTPUT $BOT~HELPOUTPUT&""&$BOT~NEXT_LINE&"  *"
    end
    if ($BOT~LENGTH <= 1)
    end


  else
    setvar $BOT~ISDONE TRUE
  end
  add $BOT~I 1
end

if (($SWITCHBOARD~SELF_COMMAND = TRUE) or ($BOT~SILENT_RUNNING = TRUE))
  setvar $BOT~HELPOUTPUT "  *"&ANSI_14&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*  *"&ANSI_15&$BOT~HELPOUTPUT&ANSI_14&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&ANSI_15
  setvar $SWITCHBOARD~MESSAGE $BOT~HELPOUTPUT
  gosub :SWITCHBOARD~SWITCHBOARD
else
  setvar $BOT~HELPOUTPUT "  *"&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&$BOT~HELPOUTPUT&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"
  send "'*{"&$SWITCHBOARD~BOT_NAME&"} - *"&$BOT~HELPOUTPUT&"*"
end
return
