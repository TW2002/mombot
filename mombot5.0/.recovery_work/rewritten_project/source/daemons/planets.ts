openmenu TWX_TOGGLEDEAF FALSE
closemenu


setvar $I 2
:KEEPGOING
killalltriggers
setvar $FOUNDSECTORS 0
setvar $OUTPUT "*"
while (($I <= SECTORS) and ($FOUNDSECTORS < 5))
  getsectorparameter $I "FIGSEC" $ISFIGGED
  if ($ISFIGGED <> TRUE)
    if (SECTOR.PLANETCOUNT[$I] > 0)
      setvar $OUTPUT $OUTPUT&ANSI_10&"Sector  "&ANSI_14&": "&ANSI_11&$I&ANSI_2&" in "&ANSI_1&SECTOR.CONSTELLATION[$I]&"*"
      if (PORT.EXISTS[$I])
        setvar $CLASS PORT.CLASS[$I]
        setvar $OUTPUT $OUTPUT&ANSI_10&"Ports   "&ANSI_14&": "&ANSI_11&PORT.NAME[$I]&ANSI_14&", "&ANSI_5&"Class "&$CLASS&" "
        if (($CLASS <> 0) and ($CLASS <> 9))
          setvar $OUTPUT $OUTPUT&ANSI_5&"("
          if (PORT.BUYFUEL[$I])
            setvar $OUTPUT $OUTPUT&ANSI_2&"B"
          else
            setvar $OUTPUT $OUTPUT&ANSI_11&"S"
          end
          if (PORT.BUYORG[$I])
            setvar $OUTPUT $OUTPUT&ANSI_2&"B"
          else
            setvar $OUTPUT $OUTPUT&ANSI_11&"S"
          end
          if (PORT.BUYEQUIP[$I])
            setvar $OUTPUT $OUTPUT&ANSI_2&"B"
          else
            setvar $OUTPUT $OUTPUT&ANSI_11&"S"
          end
          setvar $OUTPUT $OUTPUT&ANSI_5&")"
        end
        setvar $OUTPUT $OUTPUT&"*"
      end
      setvar $J 1
      while ($J <= SECTOR.PLANETCOUNT[$I])
        setvar $ISSHIELDED FALSE
        setvar $TEMP SECTOR.PLANETS[$I][$J]
        getword $TEMP $TEST 1
        if ($TEST = "<<<<")
          setvar $ISSHIELDED TRUE
        end
        getword $TEMP $TYPE 2
        striptext $TYPE "("
        striptext $TYPE ")"
        if ($ISSHIELDED)
          getlength $TEMP $LENGTH
          cuttext $TEMP $TEMP 1 ($LENGTH - 15)
          cuttext $TEMP $TEMP 10 9999
          setvar $TEMP ANSI_12&"<<<< "&ANSI_10&"("&ANSI_14&$TYPE&ANSI_10&") "&ANSI_1&$TEMP&ANSI_12&" >>>> "&ANSI_2&"(Shielded)"
        else
          setvar $TEMP ANSI_2&$TEMP
        end
        if ($J = 1)
          setvar $TEMP ANSI_5&"Planets "&ANSI_14&": "&$TEMP
          setvar $OUTPUT $OUTPUT&$TEMP&"*"
        else
          setvar $OUTPUT $OUTPUT&"          "&$TEMP&"*"
        end
        add $J 1
      end
      setvar $OUTPUT $OUTPUT&ANSI_5&"Fighters"&ANSI_14&": "&ANSI_11&SECTOR.FIGS.QUANTITY[$I]&ANSI_5&" ("&SECTOR.FIGS.OWNER[$I]&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$I]&"]**"
      add $FOUNDSECTORS 1
    end
  end
  add $I 1
end
if ($FOUNDSECTORS > 0)
  echo "[2J"&$OUTPUT
  if ($I >= SECTORS)
    echo "*End of List"
  end
end
settextouttrigger QUITKEY :STOP "q"
settextouttrigger QUITKEY2 :STOP "Q"
settextouttrigger ANYKEY :KEEPGOING
pause
:STOP

killalltriggers
openmenu TWX_TOGGLEDEAF FALSE
closemenu
echo "*Halting..*"
halt
