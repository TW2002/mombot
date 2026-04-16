:BOT~ADDFIGTODATA


















setsectorparameter $BOT~TARGET "FIGSEC" TRUE
return
:BOT~BANNER


setvar $SWITCHBOARD~MESSAGE $BOT~SCRIPT_TITLE&" starting up!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
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
:BOT~COMMAS


format $BOT~VALUE $BOT~VALUE "NUMBER"
return
:BOT~DISCONNECTTRIGGERS


settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
return
:BOT~PAUSING

killalltriggers
echo ANSI_14 "*[["&ANSI_15&$BOT~SCRIPT_TITLE&" paused. To restart, re-enter citadel prompt"&ANSI_14&"]]*"&ANSI_7
settexttrigger RESTART :RESTARTING "Citadel command ("
pause
:BOT~RESTARTING
killalltriggers
echo ANSI_14 "*[[" ANSI_15 "Alien Hunter restarted" ANSI_14 "]]*" ANSI_7
goto :RESTART
:BOT~DISPLAYHELP


setvar $BOT~I 1
setvar $BOT~HELPOUTPUT ""
setvar $BOT~ISDONE FALSE
while (($BOT~I <= $BOT~HELP) and ($BOT~ISDONE <> TRUE))
  if ($BOT~HELP[$BOT~I] <> 0)
    striptext $BOT~HELP[$BOT~I] #13
    striptext $BOT~HELP[$BOT~I] "`"
    striptext $BOT~HELP[$BOT~I] "'"

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
  setvar $BOT~HELPOUTPUT "  *"&ANSI_14&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*  *"&ANSI_15&$BOT~HELPOUTPUT&ANSI_14&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&ANSI_15
  setvar $SWITCHBOARD~MESSAGE $BOT~HELPOUTPUT
  gosub :SWITCHBOARD~SWITCHBOARD
else
  setvar $BOT~HELPOUTPUT "  *"&"-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"&$BOT~HELPOUTPUT&"  *     *-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-*"
  send "'*{"&$SWITCHBOARD~BOT_NAME&"} - *"&$BOT~HELPOUTPUT&"*"
end
return
:BOT~ECHO


getdeafclients $BOT~BOTISDEAF
if ($BOT~BOTISDEAF)
  setvar $BOT~SILENT_RUNNING TRUE
  gosub :SWITCHBOARD~SWITCHBOARD
else
  echo $SWITCHBOARD~MESSAGE
end
return
:BOT~FORMATHELPLINE



replacetext $BOT~LINE "[" ANSI_2&"["&ANSI_6
replacetext $BOT~LINE "]" ANSI_2&"]"&ANSI_13
replacetext $BOT~LINE "  >" ANSI_2&"  >"&ANSI_14
replacetext $BOT~LINE " - " ANSI_7&" - "&ANSI_13


replacetext $BOT~LINE "|" ANSI_2&"|"&ANSI_6
replacetext $BOT~LINE "{" ANSI_2&"{"&ANSI_6
replacetext $BOT~LINE "}" ANSI_2&"}"&ANSI_13
replacetext $BOT~LINE "Options:" ANSI_6&"Options"&ANSI_2&":"&ANSI_13
replacetext $BOT~LINE "Examples:" ANSI_6&"Examples"&ANSI_2&":"&ANSI_13
replacetext $BOT~LINE "Example:" ANSI_6&"Example"&ANSI_2&":"&ANSI_13
replacetext $BOT~LINE "Usage:" ANSI_6&"Usage"&ANSI_2&":"&ANSI_13
setvar $BOT~LINE ANSI_13&$BOT~LINE&ANSI_15

return
:BOT~HELPFILE


setvar $BOT~ONLY_HELP FALSE
if (($BOT~PARM1 = "help") or ($BOT~PARM1 = "?"))
  setvar $BOT~ONLY_HELP TRUE
end
if (($SWITCHBOARD~SELF_COMMAND <> FALSE) and (($BOT~PARM1 = "!") or ($BOT~PARM1 = "menu")))
  goto :SELF_MENU
end
setvar $BOT~HELP_FILE "scripts\"&$BOT~MOMBOT_DIRECTORY&"\help\"&$BOT~COMMAND&".txt"
fileexists $BOT~DOESHELPFILEEXIST $BOT~HELP_FILE
if ($BOT~DOESHELPFILEEXIST)
  setvar $BOT~I 1
  read $BOT~HELP_FILE $BOT~HELP_LINE ($BOT~I + 4)
  while ($BOT~HELP_LINE <> "EOF")

    striptext $BOT~HELP[$BOT~I] #13
    striptext $BOT~HELP[$BOT~I] "`"
    striptext $BOT~HELP[$BOT~I] "'"

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
:BOT~SELF_MENU
setvar $BOT~I 1
if (($SWITCHBOARD~SELF_COMMAND <> FALSE) and (($BOT~PARM1 = "!") or ($BOT~PARM1 = "menu")))
  setarray $BOT~FIELDS 100 5
  setvar $BOT~FIELDS 0
  setvar $BOT~FIELD_COUNT 0
  setvar $BOT~ISDONE FALSE
  setvar $BOT~TOPOFFILE TRUE
  while (($BOT~I <= $BOT~HELP) and ($BOT~ISDONE <> TRUE))
    if ($BOT~HELP[$BOT~I] <> 0)
      striptext $BOT~HELP[$BOT~I] #13
      striptext $BOT~HELP[$BOT~I] "`"
      striptext $BOT~HELP[$BOT~I] "'"



      setvar $BOT~CHECK_FOR_BLANK_LINE $BOT~HELP[$BOT~I]
      trim $BOT~CHECK_FOR_BLANK_LINE
      if ($BOT~CHECK_FOR_BLANK_LINE = "")
        setvar $BOT~TOPOFFILE FALSE
      else
        if ($BOT~TOPOFFILE = TRUE)

          if ($BOT~I = 1)
            getwordpos $BOT~HELP[$BOT~I] $BOT~POS "{"
            cuttext $BOT~HELP[$BOT~I] $BOT~MENU_TITLE 1 $BOT~POS
            cuttext $BOT~HELP[$BOT~I] $BOT~REST_OF_STRING $BOT~POS 9999
          else
            setvar $BOT~REST_OF_STRING $BOT~HELP[$BOT~I]
          end
          gettext $BOT~REST_OF_STRING $BOT~OPTION "{" "}"
          while ($BOT~OPTION <> "")



            getwordpos $BOT~REST_OF_STRING $BOT~POS "}"
            cuttext $BOT~REST_OF_STRING&"     " $BOT~REST_OF_STRING ($BOT~POS + 1) 9999

            replacetext $BOT~OPTION "{" ""
            replacetext $BOT~OPTION "}" ""
            getwordpos $BOT~OPTION $BOT~POS "|"

            add $BOT~FIELD_COUNT 1

            if ($BOT~POS > 0)
              setvar $BOT~FIELD_TYPE "multi"
              setvar $BOT~FIELD_NAME $BOT~OPTION
              splittext $BOT~FIELD_NAME $BOT~OPTIONS "|"

              setvar $BOT~FIELDS[$BOT~FIELD_COUNT][2] $BOT~OPTIONS[1]
            else
              getwordpos $BOT~OPTION $BOT~POS ":"
              getwordpos $BOT~OPTION $BOT~POS2 #34
              if (($BOT~POS > 0) or ($BOT~POS2 > 0))
                getwordpos $BOT~OPTION $BOT~POS ":#"
                if ($BOT~POS > 0)
                  setvar $BOT~FIELD_TYPE "number"
                  setvar $BOT~FIELDS[$BOT~FIELD_COUNT][2] 0
                else
                  getwordpos $BOT~OPTION $BOT~POS #34
                  if ($BOT~POS > 0)

                    setvar $BOT~FIELDS[$BOT~FIELD_COUNT][5] TRUE
                  end
                  setvar $BOT~FIELD_TYPE "string"
                  setvar $BOT~FIELDS[$BOT~FIELD_COUNT][2] ""
                end
                splittext $BOT~OPTION $BOT~INPUTS ":"
                setvar $BOT~FIELD_NAME $BOT~OPTION
              else
                setvar $BOT~FIELD_TYPE "boolean"
                setvar $BOT~FIELD_NAME $BOT~OPTION
                setvar $BOT~FIELDS[$BOT~FIELD_COUNT][2] FALSE
              end
            end
            setvar $BOT~FIELDS[$BOT~FIELD_COUNT] $BOT~FIELD_NAME
            setvar $BOT~FIELDS[$BOT~FIELD_COUNT][1] $BOT~FIELD_TYPE

            add $BOT~FIELDS 1



            gettext $BOT~REST_OF_STRING $BOT~OPTION "{" "}"
          end
        else
          getwordpos $BOT~HELP[$BOT~I] $BOT~POS "{"
          if ($BOT~POS > 0)








            getword $BOT~HELP[$BOT~I] $BOT~OPTION 1
            replacetext $BOT~OPTION "{" ""
            replacetext $BOT~OPTION "}" ""
            trim $BOT~OPTION
            getwordpos $BOT~HELP[$BOT~I] $BOT~POS "}"
            cuttext $BOT~HELP[$BOT~I] $BOT~HELP[$BOT~I] $BOT~POS 9999
            replacetext $BOT~HELP[$BOT~I] "{" ""
            replacetext $BOT~HELP[$BOT~I] "}" ""
            replacetext $BOT~HELP[$BOT~I] "-" ""
            trim $BOT~HELP[$BOT~I]

            setvar $BOT~J 1
            while ($BOT~J <= $BOT~FIELDS)
              setvar $BOT~FOUNDOPTION FALSE
              getwordpos $BOT~FIELDS[$BOT~J] $BOT~POS "|"
              if ($BOT~POS > 0)
                splittext $BOT~FIELDS[$BOT~J] $BOT~OPTIONS "|"
                setvar $BOT~K 1
                while ($BOT~K <= $BOT~OPTIONS)
                  trim $BOT~OPTIONS[$BOT~K]
                  if ($BOT~OPTIONS[$BOT~K] = $BOT~OPTION)
                    if ($BOT~FIELDS[$BOT~J][3] = 0)
                      setvar $BOT~FIELDS[$BOT~J][3] ""
                    end
                    setvar $BOT~FIELDS[$BOT~J][3] $BOT~FIELDS[$BOT~J][3]&$BOT~HELP[$BOT~I]&"|"
                  end
                  add $BOT~K 1
                end
              else

                if ($BOT~OPTION = $BOT~FIELDS[$BOT~J])
                  setvar $BOT~FIELDS[$BOT~J][3] $BOT~HELP[$BOT~I]
                end
              end
              add $BOT~J 1
            end
          else
          end
        end
      end


    else
      setvar $BOT~ISDONE TRUE
    end
    add $BOT~I 1
  end

  setvar $BOT~COMMAND_DISPLAY $BOT~COMMAND
  uppercase $BOT~COMMAND_DISPLAY
  addmenu "" "MENUSYSTEM" ANSI_15&":::  "&ANSI_14&"["&ANSI_15&"help - "&ANSI_6&"+"&ANSI_14&"]"&ANSI_15&" -=[ "&ANSI_6&$BOT~COMMAND_DISPLAY&ANSI_15&" ]=- "&ANSI_14&"["&ANSI_15&"refresh - "&ANSI_6&"?"&ANSI_14&"]"&ANSI_15&"  ::" "." "" "Main" FALSE
  setmenuoptions "MENUSYSTEM" FALSE FALSE FALSE

  setarray $BOT~MENU_SYSTEM_KEYS 33
  setvar $BOT~MENU_SYSTEM_KEYS 33
  setvar $BOT~MENU_SYSTEM_KEYS[1] 1
  setvar $BOT~MENU_SYSTEM_KEYS[2] 2
  setvar $BOT~MENU_SYSTEM_KEYS[3] 3
  setvar $BOT~MENU_SYSTEM_KEYS[4] 4
  setvar $BOT~MENU_SYSTEM_KEYS[5] 5
  setvar $BOT~MENU_SYSTEM_KEYS[6] 6
  setvar $BOT~MENU_SYSTEM_KEYS[7] 7
  setvar $BOT~MENU_SYSTEM_KEYS[8] 8
  setvar $BOT~MENU_SYSTEM_KEYS[9] 9
  setvar $BOT~MENU_SYSTEM_KEYS[10] "a"
  setvar $BOT~MENU_SYSTEM_KEYS[11] "b"
  setvar $BOT~MENU_SYSTEM_KEYS[12] "c"
  setvar $BOT~MENU_SYSTEM_KEYS[13] "d"
  setvar $BOT~MENU_SYSTEM_KEYS[14] "e"
  setvar $BOT~MENU_SYSTEM_KEYS[15] "f"
  setvar $BOT~MENU_SYSTEM_KEYS[16] "g"
  setvar $BOT~MENU_SYSTEM_KEYS[17] "h"
  setvar $BOT~MENU_SYSTEM_KEYS[18] "i"
  setvar $BOT~MENU_SYSTEM_KEYS[19] "j"
  setvar $BOT~MENU_SYSTEM_KEYS[20] "k"
  setvar $BOT~MENU_SYSTEM_KEYS[21] "l"
  setvar $BOT~MENU_SYSTEM_KEYS[22] "m"
  setvar $BOT~MENU_SYSTEM_KEYS[23] "n"
  setvar $BOT~MENU_SYSTEM_KEYS[24] "o"
  setvar $BOT~MENU_SYSTEM_KEYS[25] "p"
  setvar $BOT~MENU_SYSTEM_KEYS[26] "r"
  setvar $BOT~MENU_SYSTEM_KEYS[27] "s"
  setvar $BOT~MENU_SYSTEM_KEYS[28] "t"
  setvar $BOT~MENU_SYSTEM_KEYS[29] "u"
  setvar $BOT~MENU_SYSTEM_KEYS[30] "v"
  setvar $BOT~MENU_SYSTEM_KEYS[31] "w"
  setvar $BOT~MENU_SYSTEM_KEYS[32] "x"
  setvar $BOT~MENU_SYSTEM_KEYS[33] "y"

  setvar $BOT~LONGEST 0
  setvar $BOT~I 1
  while ($BOT~I <= $BOT~FIELDS)
    if ($BOT~FIELDS[$BOT~I][1] = "multi")
      getlength "::select::" $BOT~LENGTH
    else
      getlength $BOT~FIELDS[$BOT~I] $BOT~LENGTH
    end
    if ($BOT~LENGTH > $BOT~LONGEST)
      setvar $BOT~LONGEST $BOT~LENGTH
    end
    add $BOT~I 1
  end
  setvar $BOT~BOT_TO_CONTROL $BOT~BOT_NAME
  setvar $BOT~MENU_FIELD_DISPLAY "Start!"
  padright $BOT~MENU_FIELD_DISPLAY $BOT~LONGEST
  addmenu "MENUSYSTEM" "START" ANSI_15&$BOT~MENU_FIELD_DISPLAY "Z" ":ENDMENUANDGO" "" FALSE
  setvar $BOT~MENU_FIELD_DISPLAY "Bot"
  padright $BOT~MENU_FIELD_DISPLAY $BOT~LONGEST
  setvar $BOT~MENU_FIELD_DISPLAY $BOT~MENU_FIELD_DISPLAY&" "&ANSI_14&":"&ANSI_15&" "
  addmenu "MENUSYSTEM" "CONTROL" ANSI_15&$BOT~MENU_FIELD_DISPLAY 0 ":CHANGEBOTNAME" $BOT~BOT_TO_CONTROL FALSE
  setvar $BOT~BOT_TO_CONTROL_DISPLAY ANSI_14&$BOT~BOT_TO_CONTROL
  padright $BOT~BOT_TO_CONTROL_DISPLAY $BOT~LONGEST
  setmenuvalue "CONTROL" $BOT~BOT_TO_CONTROL_DISPLAY

  setvar $BOT~I 1
  setvar $BOT~FIELD_PADDING 18
  while ($BOT~I <= $BOT~FIELDS)
    setvar $BOT~EXTRA $BOT~FIELDS[$BOT~I][3]
    if ($BOT~FIELDS[$BOT~I][1] = "boolean")
      if ($BOT~FIELDS[$BOT~I][2] = TRUE)
        setvar $BOT~DISPLAYVALUE ANSI_14&"On"
      else
        setvar $BOT~DISPLAYVALUE ANSI_15&"Off"
      end
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end
    if ($BOT~FIELDS[$BOT~I][1] = "multi")
      splittext $BOT~FIELDS[$BOT~I] $BOT~OPTIONS "|"
      setvar $BOT~K 1
      while ($BOT~K <= $BOT~OPTIONS)
        if ($BOT~OPTIONS[$BOT~K] = $BOT~FIELDS[$BOT~I][2])
          if ($BOT~K < $BOT~OPTIONS)
            setvar $BOT~OPTIONINDEX $BOT~K
          else
            setvar $BOT~OPTIONINDEX 1
          end
          setvar $BOT~CURRENTVALUE $BOT~OPTIONS[$BOT~OPTIONINDEX]
          splittext $BOT~FIELDS[$BOT~I][3] $BOT~DESCRIPTIONS "|"
        end
        add $BOT~K 1
      end
      setvar $BOT~EXTRA ANSI_15&"["&ANSI_14&$BOT~DESCRIPTIONS[$BOT~OPTIONINDEX]&ANSI_15&"]"&ANSI_14
      setvar $BOT~DISPLAYVALUE ANSI_14&$BOT~FIELDS[$BOT~I][2]
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end
    if ($BOT~FIELDS[$BOT~I][1] = "string")
      setvar $BOT~DISPLAYVALUE $BOT~FIELDS[$BOT~I][2]
      if ($BOT~DISPLAYVALUE = "")
        setvar $BOT~DISPLAYVALUE ANSI_15&"Off"
      end
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end
    if ($BOT~FIELDS[$BOT~I][1] = "number")
      setvar $BOT~DISPLAYVALUE ANSI_15&$BOT~FIELDS[$BOT~I][2]
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end

    if ($BOT~FIELDS[$BOT~I][1] = "multi")
      setvar $BOT~MENU_FIELD_DISPLAY "::select::"
    else
      setvar $BOT~MENU_FIELD_DISPLAY $BOT~FIELDS[$BOT~I]
    end
    padleft $BOT~MENU_FIELD_DISPLAY $BOT~LONGEST
    addmenu "MENUSYSTEM" $BOT~FIELDS[$BOT~I] ANSI_11&$BOT~MENU_FIELD_DISPLAY&ANSI_14&" : " $BOT~MENU_SYSTEM_KEYS[$BOT~I] ":"&$BOT~FIELDS[$BOT~I][1]&"Field"&$BOT~I $BOT~FIELDS[$BOT~I][3] FALSE
    setmenuvalue $BOT~FIELDS[$BOT~I] $BOT~DISPLAYVALUE
    setmenuhelp $BOT~FIELDS[$BOT~I] $BOT~FIELDS[$BOT~I][3]
    :BOT~MENU_CREATION
    add $BOT~I 1
  end
  openmenu "MENUSYSTEM" TRUE
  :BOT~ENDMENUANDGO
  closemenu
  setvar $BOT~I 1
  setvar $BOT~PARM_COUNT 0
  setvar $BOT~USER_COMMAND_LINE ""
  while ($BOT~I <= $BOT~FIELDS)
    trim $BOT~FIELDS[$BOT~I][2]
    if ($BOT~FIELDS[$BOT~I][2] = 0) or (($BOT~FIELDS[$BOT~I][1] = "string") and ($BOT~FIELDS[$BOT~I][2] = ""))

    else
      if ($BOT~FIELDS[$BOT~I][1] = "boolean")
        if ($BOT~FIELDS[$BOT~I][2] = TRUE)
          setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "&$BOT~FIELDS[$BOT~I]
          setvar $BOT~PARM_VALUE $BOT~FIELDS[$BOT~I]
        end
      end
      if (($BOT~FIELDS[$BOT~I][1] = "string") or ($BOT~FIELDS[$BOT~I][1] = "number"))
        if ($BOT~FIELDS[$BOT~I][5] = TRUE)

          setvar $BOT~STRING_FIELD #34&$BOT~FIELDS[$BOT~I][2]&#34
        else
          splittext $BOT~FIELDS[$BOT~I] $BOT~INPUTS ":"
          setvar $BOT~STRING_FIELD $BOT~INPUTS[1]&":"&$BOT~FIELDS[$BOT~I][2]
        end
        setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "&$BOT~STRING_FIELD
        setvar $BOT~PARM_VALUE $BOT~STRING_FIELD
      end
      if ($BOT~FIELDS[$BOT~I][1] = "multi")
        setvar $BOT~USER_COMMAND_LINE $BOT~USER_COMMAND_LINE&" "&$BOT~FIELDS[$BOT~I][2]
        setvar $BOT~PARM_VALUE $BOT~FIELDS[$BOT~I][2]
      end
      if ($BOT~PARM_COUNT <= 8)
        add $BOT~PARM_COUNT 1
        if ($BOT~PARM_COUNT = 1)
          setvar $BOT~PARM1 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 2)
          setvar $BOT~PARM2 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 3)
          setvar $BOT~PARM3 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 4)
          setvar $BOT~PARM4 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 5)
          setvar $BOT~PARM5 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 6)
          setvar $BOT~PARM6 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 7)
          setvar $BOT~PARM7 $BOT~PARM_VALUE
        end
        if ($BOT~PARM_COUNT = 8)
          setvar $BOT~PARM8 $BOT~PARM_VALUE
        end
      end
    end
    add $BOT~I 1
  end
  savevar $BOT~USER_COMMAND_LINE
  savevar $BOT~PARM1
  savevar $BOT~PARM2
  savevar $BOT~PARM3
  savevar $BOT~PARM4
  savevar $BOT~PARM5
  savevar $BOT~PARM6
  savevar $BOT~PARM7
  savevar $BOT~PARM8
  trim $BOT~COMMAND
  trim $BOT~USER_COMMAND_LINE
  if ($BOT~BOT_NAME <> $BOT~BOT_TO_CONTROL)
    setvar $BOT~CONTROL_STRING "'"&$BOT~BOT_TO_CONTROL&" "&$BOT~COMMAND&" "&$BOT~USER_COMMAND_LINE
    send $BOT~CONTROL_STRING&"*"
    loadvar $BOT~HISTORYSTRING
    setvar $BOT~HISTORY[1] $BOT~CONTROL_STRING
    setvar $BOT~HISTORYSTRING $BOT~HISTORY[1]&"<<|HS|>>"&$BOT~HISTORYSTRING
    savevar $BOT~HISTORYSTRING
    halt
  else
    loadvar $BOT~HISTORYSTRING
    setvar $BOT~HISTORY[1] $BOT~COMMAND&" "&$BOT~USER_COMMAND_LINE
    setvar $BOT~HISTORYSTRING $BOT~HISTORY[1]&"<<|HS|>>"&$BOT~HISTORYSTRING
    savevar $BOT~HISTORYSTRING
  end
end


return
:BOT~BOOLEANFIELD1

setvar $BOT~FIELD_INDEX 1
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD2

setvar $BOT~FIELD_INDEX 2
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD3

setvar $BOT~FIELD_INDEX 3
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD4

setvar $BOT~FIELD_INDEX 4
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD5

setvar $BOT~FIELD_INDEX 5
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD6

setvar $BOT~FIELD_INDEX 6
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD7

setvar $BOT~FIELD_INDEX 7
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD8

setvar $BOT~FIELD_INDEX 8
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD9

setvar $BOT~FIELD_INDEX 9
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD10

setvar $BOT~FIELD_INDEX 10
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD11

setvar $BOT~FIELD_INDEX 11
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD12

setvar $BOT~FIELD_INDEX 12
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD13

setvar $BOT~FIELD_INDEX 13
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD14

setvar $BOT~FIELD_INDEX 14
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD15

setvar $BOT~FIELD_INDEX 15
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD16

setvar $BOT~FIELD_INDEX 16
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD17

setvar $BOT~FIELD_INDEX 17
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD18

setvar $BOT~FIELD_INDEX 18
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD19

setvar $BOT~FIELD_INDEX 19
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD20

setvar $BOT~FIELD_INDEX 20
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD21

setvar $BOT~FIELD_INDEX 21
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD22

setvar $BOT~FIELD_INDEX 22
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD23

setvar $BOT~FIELD_INDEX 23
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD24

setvar $BOT~FIELD_INDEX 24
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD25

setvar $BOT~FIELD_INDEX 25
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD26

setvar $BOT~FIELD_INDEX 26
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD27

setvar $BOT~FIELD_INDEX 27
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD28

setvar $BOT~FIELD_INDEX 28
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD29

setvar $BOT~FIELD_INDEX 29
goto :BOOLEANFIELD
:BOT~BOOLEANFIELD30

setvar $BOT~FIELD_INDEX 30
:BOT~BOOLEANFIELD

setvar $BOT~CURRENTVALUE $BOT~FIELDS[$BOT~FIELD_INDEX][2]
if ($BOT~CURRENTVALUE = FALSE)
  setvar $BOT~CURRENTVALUE TRUE
  setvar $BOT~DISPLAYVALUE ANSI_14&"On"
else
  setvar $BOT~CURRENTVALUE FALSE
  setvar $BOT~DISPLAYVALUE ANSI_15&"Off"
end
setvar $BOT~FIELDS[$BOT~FIELD_INDEX][2] $BOT~CURRENTVALUE
setvar $BOT~EXTRA $BOT~FIELDS[$BOT~FIELD_INDEX][3]
padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
setmenuvalue $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~DISPLAYVALUE
goto :MENU_CREATION
:BOT~MULTIFIELD1

setvar $BOT~FIELD_INDEX 1
goto :MULTIFIELD
:BOT~MULTIFIELD2

setvar $BOT~FIELD_INDEX 2
goto :MULTIFIELD
:BOT~MULTIFIELD3

setvar $BOT~FIELD_INDEX 3
goto :MULTIFIELD
:BOT~MULTIFIELD4

setvar $BOT~FIELD_INDEX 4
goto :MULTIFIELD
:BOT~MULTIFIELD5

setvar $BOT~FIELD_INDEX 5
goto :MULTIFIELD
:BOT~MULTIFIELD6

setvar $BOT~FIELD_INDEX 6
goto :MULTIFIELD
:BOT~MULTIFIELD7

setvar $BOT~FIELD_INDEX 7
goto :MULTIFIELD
:BOT~MULTIFIELD8

setvar $BOT~FIELD_INDEX 8
goto :MULTIFIELD
:BOT~MULTIFIELD9

setvar $BOT~FIELD_INDEX 9
goto :MULTIFIELD
:BOT~MULTIFIELD10

setvar $BOT~FIELD_INDEX 10
goto :MULTIFIELD
:BOT~MULTIFIELD11

setvar $BOT~FIELD_INDEX 11
goto :MULTIFIELD
:BOT~MULTIFIELD12

setvar $BOT~FIELD_INDEX 12
goto :MULTIFIELD
:BOT~MULTIFIELD13

setvar $BOT~FIELD_INDEX 13
goto :MULTIFIELD
:BOT~MULTIFIELD14

setvar $BOT~FIELD_INDEX 14
goto :MULTIFIELD
:BOT~MULTIFIELD15

setvar $BOT~FIELD_INDEX 15
goto :MULTIFIELD
:BOT~MULTIFIELD16

setvar $BOT~FIELD_INDEX 16
goto :MULTIFIELD
:BOT~MULTIFIELD17

setvar $BOT~FIELD_INDEX 17
goto :MULTIFIELD
:BOT~MULTIFIELD18

setvar $BOT~FIELD_INDEX 18
goto :MULTIFIELD
:BOT~MULTIFIELD19

setvar $BOT~FIELD_INDEX 19
goto :MULTIFIELD
:BOT~MULTIFIELD20

setvar $BOT~FIELD_INDEX 20
goto :MULTIFIELD
:BOT~MULTIFIELD21

setvar $BOT~FIELD_INDEX 21
goto :MULTIFIELD
:BOT~MULTIFIELD22

setvar $BOT~FIELD_INDEX 22
goto :MULTIFIELD
:BOT~MULTIFIELD23

setvar $BOT~FIELD_INDEX 23
goto :MULTIFIELD
:BOT~MULTIFIELD24

setvar $BOT~FIELD_INDEX 24
goto :MULTIFIELD
:BOT~MULTIFIELD25

setvar $BOT~FIELD_INDEX 25
goto :MULTIFIELD
:BOT~MULTIFIELD26

setvar $BOT~FIELD_INDEX 26
goto :MULTIFIELD
:BOT~MULTIFIELD27

setvar $BOT~FIELD_INDEX 27
goto :MULTIFIELD
:BOT~MULTIFIELD28

setvar $BOT~FIELD_INDEX 28
goto :MULTIFIELD
:BOT~MULTIFIELD29

setvar $BOT~FIELD_INDEX 29
goto :MULTIFIELD
:BOT~MULTIFIELD30

setvar $BOT~FIELD_INDEX 30
:BOT~MULTIFIELD

splittext $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~OPTIONS "|"
if ($BOT~OPTIONS > 1)
  setvar $BOT~K 1
  while ($BOT~K <= $BOT~OPTIONS)
    if ($BOT~OPTIONS[$BOT~K] = $BOT~FIELDS[$BOT~FIELD_INDEX][2])
      if ($BOT~K < $BOT~OPTIONS)
        setvar $BOT~OPTIONINDEX ($BOT~K + 1)
      else
        setvar $BOT~OPTIONINDEX 1
      end
      setvar $BOT~CURRENTVALUE $BOT~OPTIONS[$BOT~OPTIONINDEX]
      splittext $BOT~FIELDS[$BOT~FIELD_INDEX][3] $BOT~DESCRIPTIONS "|"
      setvar $BOT~EXTRA ANSI_15&"["&ANSI_14&$BOT~DESCRIPTIONS[$BOT~OPTIONINDEX]&ANSI_15&"]"&ANSI_14
      setvar $BOT~DISPLAYVALUE ANSI_14&$BOT~CURRENTVALUE
      padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
      setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA
    end
    add $BOT~K 1
  end

  setvar $BOT~FIELDS[$BOT~FIELD_INDEX][2] $BOT~CURRENTVALUE
  setmenuvalue $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~DISPLAYVALUE
end

goto :MENU_CREATION
:BOT~STRINGFIELD1

setvar $BOT~FIELD_INDEX 1
goto :STRINGFIELD
:BOT~STRINGFIELD2

setvar $BOT~FIELD_INDEX 2
goto :STRINGFIELD
:BOT~STRINGFIELD3

setvar $BOT~FIELD_INDEX 3
goto :STRINGFIELD
:BOT~STRINGFIELD4

setvar $BOT~FIELD_INDEX 4
goto :STRINGFIELD
:BOT~STRINGFIELD5

setvar $BOT~FIELD_INDEX 5
goto :STRINGFIELD
:BOT~STRINGFIELD6

setvar $BOT~FIELD_INDEX 6
goto :STRINGFIELD
:BOT~STRINGFIELD7

setvar $BOT~FIELD_INDEX 7
goto :STRINGFIELD
:BOT~STRINGFIELD8

setvar $BOT~FIELD_INDEX 8
goto :STRINGFIELD
:BOT~STRINGFIELD9

setvar $BOT~FIELD_INDEX 9
goto :STRINGFIELD
:BOT~STRINGFIELD10

setvar $BOT~FIELD_INDEX 10
goto :STRINGFIELD
:BOT~STRINGFIELD11

setvar $BOT~FIELD_INDEX 11
goto :STRINGFIELD
:BOT~STRINGFIELD12

setvar $BOT~FIELD_INDEX 12
goto :STRINGFIELD
:BOT~STRINGFIELD13

setvar $BOT~FIELD_INDEX 13
goto :STRINGFIELD
:BOT~STRINGFIELD14

setvar $BOT~FIELD_INDEX 14
goto :STRINGFIELD
:BOT~STRINGFIELD15

setvar $BOT~FIELD_INDEX 15
goto :STRINGFIELD
:BOT~STRINGFIELD16

setvar $BOT~FIELD_INDEX 16
goto :STRINGFIELD
:BOT~STRINGFIELD17

setvar $BOT~FIELD_INDEX 17
goto :STRINGFIELD
:BOT~STRINGFIELD18

setvar $BOT~FIELD_INDEX 18
goto :STRINGFIELD
:BOT~STRINGFIELD19

setvar $BOT~FIELD_INDEX 19
goto :STRINGFIELD
:BOT~STRINGFIELD20

setvar $BOT~FIELD_INDEX 20
goto :STRINGFIELD
:BOT~STRINGFIELD21

setvar $BOT~FIELD_INDEX 21
goto :STRINGFIELD
:BOT~STRINGFIELD22

setvar $BOT~FIELD_INDEX 22
goto :STRINGFIELD
:BOT~STRINGFIELD23

setvar $BOT~FIELD_INDEX 23
goto :STRINGFIELD
:BOT~STRINGFIELD24

setvar $BOT~FIELD_INDEX 24
goto :STRINGFIELD
:BOT~STRINGFIELD25

setvar $BOT~FIELD_INDEX 25
goto :STRINGFIELD
:BOT~STRINGFIELD26

setvar $BOT~FIELD_INDEX 26
goto :STRINGFIELD
:BOT~STRINGFIELD27

setvar $BOT~FIELD_INDEX 27
goto :STRINGFIELD
:BOT~STRINGFIELD28

setvar $BOT~FIELD_INDEX 28
goto :STRINGFIELD
:BOT~STRINGFIELD29

setvar $BOT~FIELD_INDEX 29
goto :STRINGFIELD
:BOT~STRINGFIELD30

setvar $BOT~FIELD_INDEX 30
:BOT~STRINGFIELD


getinput $BOT~DISPLAYVALUE "Please enter a value for "&$BOT~FIELDS[$BOT~FIELD_INDEX]&"."
setvar $BOT~FIELDS[$BOT~FIELD_INDEX][2] $BOT~DISPLAYVALUE

if ($BOT~DISPLAYVALUE = "")
  setvar $BOT~DISPLAYVALUE ANSI_15&"Off"
else
  setvar $BOT~DISPLAYVALUE ANSI_14&$BOT~DISPLAYVALUE
end
setvar $BOT~EXTRA $BOT~FIELDS[$BOT~FIELD_INDEX][3]
padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA

setmenuvalue $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~DISPLAYVALUE
goto :MENU_CREATION
:BOT~NUMBERFIELD1

setvar $BOT~FIELD_INDEX 1
goto :NUMBERFIELD
:BOT~NUMBERFIELD2

setvar $BOT~FIELD_INDEX 2
goto :NUMBERFIELD
:BOT~NUMBERFIELD3

setvar $BOT~FIELD_INDEX 3
goto :NUMBERFIELD
:BOT~NUMBERFIELD4

setvar $BOT~FIELD_INDEX 4
goto :NUMBERFIELD
:BOT~NUMBERFIELD5

setvar $BOT~FIELD_INDEX 5
goto :NUMBERFIELD
:BOT~NUMBERFIELD6

setvar $BOT~FIELD_INDEX 6
goto :NUMBERFIELD
:BOT~NUMBERFIELD7

setvar $BOT~FIELD_INDEX 7
goto :NUMBERFIELD
:BOT~NUMBERFIELD8

setvar $BOT~FIELD_INDEX 8
goto :NUMBERFIELD
:BOT~NUMBERFIELD9

setvar $BOT~FIELD_INDEX 9
goto :NUMBERFIELD
:BOT~NUMBERFIELD10

setvar $BOT~FIELD_INDEX 10
goto :NUMBERFIELD
:BOT~NUMBERFIELD11

setvar $BOT~FIELD_INDEX 11
goto :NUMBERFIELD
:BOT~NUMBERFIELD12

setvar $BOT~FIELD_INDEX 12
goto :NUMBERFIELD
:BOT~NUMBERFIELD13

setvar $BOT~FIELD_INDEX 13
goto :NUMBERFIELD
:BOT~NUMBERFIELD14

setvar $BOT~FIELD_INDEX 14
goto :NUMBERFIELD
:BOT~NUMBERFIELD15

setvar $BOT~FIELD_INDEX 15
goto :NUMBERFIELD
:BOT~NUMBERFIELD16

setvar $BOT~FIELD_INDEX 16
goto :NUMBERFIELD
:BOT~NUMBERFIELD17

setvar $BOT~FIELD_INDEX 17
goto :NUMBERFIELD
:BOT~NUMBERFIELD18

setvar $BOT~FIELD_INDEX 18
goto :NUMBERFIELD
:BOT~NUMBERFIELD19

setvar $BOT~FIELD_INDEX 19
goto :NUMBERFIELD
:BOT~NUMBERFIELD20

setvar $BOT~FIELD_INDEX 20
goto :NUMBERFIELD
:BOT~NUMBERFIELD21

setvar $BOT~FIELD_INDEX 21
goto :NUMBERFIELD
:BOT~NUMBERFIELD22

setvar $BOT~FIELD_INDEX 22
goto :NUMBERFIELD
:BOT~NUMBERFIELD23

setvar $BOT~FIELD_INDEX 23
goto :NUMBERFIELD
:BOT~NUMBERFIELD24

setvar $BOT~FIELD_INDEX 24
goto :NUMBERFIELD
:BOT~NUMBERFIELD25

setvar $BOT~FIELD_INDEX 25
goto :NUMBERFIELD
:BOT~NUMBERFIELD26

setvar $BOT~FIELD_INDEX 26
goto :NUMBERFIELD
:BOT~NUMBERFIELD27

setvar $BOT~FIELD_INDEX 27
goto :NUMBERFIELD
:BOT~NUMBERFIELD28

setvar $BOT~FIELD_INDEX 28
goto :NUMBERFIELD
:BOT~NUMBERFIELD29

setvar $BOT~FIELD_INDEX 29
goto :NUMBERFIELD
:BOT~NUMBERFIELD30

setvar $BOT~FIELD_INDEX 30
:BOT~NUMBERFIELD


getinput $BOT~DISPLAYVALUE "Please enter a value for "&$BOT~FIELDS[$BOT~FIELD_INDEX]&"."
isnumber $BOT~ISNUMBER $BOT~DISPLAYVALUE
if ($BOT~ISNUMBER <> TRUE)
  echo "*Please enter a number value.*"
  goto :NUMBERFIELD
end
setvar $BOT~FIELDS[$BOT~FIELD_INDEX][2] $BOT~DISPLAYVALUE

if ($BOT~DISPLAYVALUE = 0)
  setvar $BOT~DISPLAYVALUE ANSI_15&$BOT~DISPLAYVALUE
else
  setvar $BOT~DISPLAYVALUE ANSI_14&$BOT~DISPLAYVALUE
end
setvar $BOT~EXTRA $BOT~FIELDS[$BOT~FIELD_INDEX][3]
padright $BOT~DISPLAYVALUE $BOT~FIELD_PADDING
setvar $BOT~DISPLAYVALUE $BOT~DISPLAYVALUE&$BOT~EXTRA

setmenuvalue $BOT~FIELDS[$BOT~FIELD_INDEX] $BOT~DISPLAYVALUE

goto :MENU_CREATION
:BOT~CHANGEBOTNAME

getinput $BOT~BOT_TO_CONTROL "What bot are you trying to control?"

if ($BOT~BOT_TO_CONTROL = "")
  setvar $BOT~BOT_TO_CONTROL $BOT~BOT_NAME
  setvar $BOT~BOT_TO_CONTROL_DISPLAY ANSI_14&$BOT~BOT_NAME
else
  setvar $BOT~BOT_TO_CONTROL_DISPLAY ANSI_14&$BOT~BOT_TO_CONTROL
end
padright $BOT~BOT_TO_CONTROL_DISPLAY $BOT~FIELD_PADDING
setmenuvalue "CONTROL" $BOT~BOT_TO_CONTROL_DISPLAY
goto :MENU_CREATION
:BOT~LOADVARS


loadvar $BOT~MODE
loadvar $BOT~COMMAND
loadvar $SWITCHBOARD~BOT_NAME
setvar $BOT~BOT_NAME $SWITCHBOARD~BOT_NAME
loadvar $PLANET~PLANET_FILE
loadvar $SHIP~CAP_FILE
loadvar $BOT~USER_COMMAND_LINE
loadvar $BOT~PARM1
loadvar $BOT~PARM2
loadvar $BOT~PARM3
loadvar $BOT~PARM4
loadvar $BOT~PARM5
loadvar $BOT~PARM6
loadvar $BOT~PARM7
loadvar $BOT~PARM8
loadvar $BOT~BOT_TURN_LIMIT
loadvar $PLAYER~UNLIMITEDGAME
loadvar $MAP~STARDOCK
loadvar $MAP~RYLOS
loadvar $MAP~ALPHA_CENTAURI
loadvar $MAP~HOME_SECTOR
loadvar $MAP~BACKDOOR
loadvar $BOT~SILENT_RUNNING
loadvar $BOT~BOTISDEAF
loadvar $SWITCHBOARD~SELF_COMMAND
loadvar $BOT~COMMAND_CALLER
loadvar $PLANET~PLANET
loadvar $BOT~PASSWORD
loadvar $BOT~LETTER
loadvar $GAME~PORT_MAX
loadvar $BOT~FOLDER
loadvar $BOT~MOMBOT_DIRECTORY
loadvar $GAME~PHOTON_DURATION
loadvar $SETTINGS~OVERRIDE
loadvar $PLAYER~DROPOFFENSIVE
loadvar $PLAYER~DROPTOLL
if ($PLAYER~DROPOFFENSIVE = TRUE)
  setvar $PLAYER~FIGHTER_DEPLOY_TYPE "o"
else
  if ($PLAYER~DROPTOLL = TRUE)
    setvar $PLAYER~FIGHTER_DEPLOY_TYPE "t"
  else
    setvar $PLAYER~FIGHTER_DEPLOY_TYPE "d"
  end
end
savevar $PLAYER~FIGHTER_DEPLOY_TYPE

setarray $BOT~HELP 60
setvar $BOT~HELP 60
setvar $BOT~TAB "     "

return
:BOT~MENU



addmenu "" "ScriptMenu" ANSI_6&"["&ANSI_14&"Settings"&ANSI_6&"]"&ANSI_7 "." "" "Main" FALSE
setvar $BOT~I 1
while ($BOT~I <= $BOT~MENU)
  if (($BOT~MENU[$BOT~I] <> 0) and ($BOT~MENU[$BOT~I] <> ""))
    setvar $BOT~DISPLAY_MENU $BOT~MENU[$BOT~I]
    replacetext $BOT~MENU[$BOT~I] " " "_"
    addmenu "ScriptMenu" $BOT~MENU[$BOT~I] ANSI_6&"["&ANSI_15&$BOT~DISPLAY_MENU&ANSI_6&"]                                 "&ANSI_7 "A" ":MENU_SET" "" FALSE
    setmenuhelp $BOT~MENU[$BOT~I] $BOT~MENU[$BOT~I][1]
  end
  add $BOT~I 1
end
openmenu "ScriptMenu"
:BOT~MENU_SET

pause
openmenu "Menu"

return
:BOT~REMOVEFIGFROMDATA


getsectorparameter $BOT~TARGET "FIGSEC" $BOT~CHECK
if ($BOT~CHECK = TRUE)
  getsectorparameter 2 "FIG_COUNT" $BOT~FIGCOUNT
  setsectorparameter 2 "FIG_COUNT" ($BOT~FIGCOUNT - 1)
end
setsectorparameter $BOT~TARGET "FIGSEC" FALSE
return
:BOT~WAIT_FOR_COMMAND


halt
:BOT~HELP_FILE


setvar $BOT~HELP_FILE "scripts\"&$BOT~MOMBOT_DIRECTORY&"\help\"&$BOT~COMMAND&".txt"
fileexists $BOT~DOESHELPFILEEXIST $BOT~HELP_FILE
setvar $BOT~ONLY_HELP FALSE
if (($BOT~PARM1 = "help") or ($BOT~PARM1 = "?"))
  setvar $BOT~ONLY_HELP TRUE
end
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
:BOT~DISCONNECT_TRIGGERS

settexttrigger PAUSE :PAUSING "Planet command (?="
settexttrigger PAUSE2 :PAUSING "Computer command ["
settexttrigger PAUSE3 :PAUSING "Corporate command ["
return
