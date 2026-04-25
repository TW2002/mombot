#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:SEARCH~FIND
:SEARCH~NEAR
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
setvar $SEARCH~NEAR $BOT~PARM1
setvar $SEARCH~SOURCE $BOT~PARM2

isnumber $SEARCH~NUMBER $SEARCH~SOURCE
if ($SEARCH~NUMBER = TRUE)
  if ($SEARCH~SOURCE <= 0)
    setvar $SEARCH~SOURCE CURRENTSECTOR
  end
  if ($SEARCH~SOURCE > SECTORS)
    setvar $SWITCHBOARD~MESSAGE "That sector is out of bounds (Must be between 1-"&SECTORS&")*"
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
else
  setvar $SEARCH~PORT_TYPE $BOT~PARM2
  setvar $SEARCH~SOURCE CURRENTSECTOR
end

setvar $SEARCH~CHECK_SECTOR $SEARCH~SOURCE
gosub :SEARCH~LOAD_FIG_STATE
setvar $SEARCH~ISFIGGED $SEARCH~CHECK_FIGGED

if ($SEARCH~ISFIGGED = "")
  setvar $SWITCHBOARD~MESSAGE "It appears no grid data is available.  Run a fighter grid checker that uses the sector parameter FIGSEC. (Try figs command)*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if (($SEARCH~NEAR <> "owner") and (($SEARCH~NEAR <> "ufde") and (($SEARCH~NEAR <> "f") and (($SEARCH~NEAR <> "nf") and (($SEARCH~NEAR <> "fde") and (($SEARCH~NEAR <> "uf") and (($SEARCH~NEAR <> "fp") and (($SEARCH~NEAR <> "nfup") and (($SEARCH~NEAR <> "fup") and (($SEARCH~NEAR <> "p") and (($SEARCH~NEAR <> "de") and (($SEARCH~NEAR <> "fig") and (($SEARCH~NEAR <> "nofig") and (($SEARCH~NEAR <> "figport") and (($SEARCH~NEAR <> "port") and ($SEARCH~NEAR <> "deadend"))))))))))))))))
  setvar $SWITCHBOARD~MESSAGE "Please use - [type] [sector] format*"
  gosub :SWITCHBOARD~SWITCHBOARD
  halt
end

if (($SEARCH~NEAR = "fp") or ($SEARCH~NEAR = "port") or ($SEARCH~NEAR = "p") or ($SEARCH~NEAR = "nfup") or ($SEARCH~NEAR = "fup"))
  getlength $SEARCH~PORT_TYPE $SEARCH~PLENGTH
  if (($SEARCH~SOURCE = 0) or ($SEARCH~PLENGTH <> 3))
    setvar $SEARCH~PORT_TYPE "xxx"
  end
  setvar $SEARCH~INVALID FALSE
  cuttext $SEARCH~PORT_TYPE $SEARCH~PFUEL 1 1
  if (($SEARCH~PFUEL <> "s") and (($SEARCH~PFUEL <> "b") and ($SEARCH~PFUEL <> "x")))
    setvar $SEARCH~INVALID TRUE
  end
  cuttext $SEARCH~PORT_TYPE $SEARCH~PORG 2 1
  if (($SEARCH~PORG <> "s") and (($SEARCH~PORG <> "b") and ($SEARCH~PORG <> "x")))
    setvar $SEARCH~INVALID TRUE
  end
  cuttext $SEARCH~PORT_TYPE $SEARCH~PEQUIP 3 1
  if (($SEARCH~PEQUIP <> "s") and (($SEARCH~PEQUIP <> "b") and ($SEARCH~PEQUIP <> "x")))
    setvar $SEARCH~INVALID TRUE
  end
  if ($SEARCH~INVALID)
    setvar $SWITCHBOARD~MESSAGE "Please use - [fp/p] [sector] [port type] format."
    gosub :SWITCHBOARD~SWITCHBOARD
    halt
  end
  setvar $SEARCH~PTYPE $SEARCH~PORT_TYPE
  uppercase $SEARCH~PTYPE
end

setvar $SEARCH~CHECK_SECTOR $SEARCH~SOURCE
gosub :SEARCH~LOAD_FIG_STATE
setvar $SEARCH~ISFIGGED $SEARCH~CHECK_FIGGED
getword SECTOR.FIGS.OWNER[$SEARCH~SOURCE] $SEARCH~FIGOWNER 3
setvar $SEARCH~SOURCE_MESSAGE ""

if (($SEARCH~NEAR = "f") and ($SEARCH~ISFIGGED = TRUE))
  setvar $SEARCH~SOURCE_MESSAGE "appears to be fig'd."
elseif (($SEARCH~NEAR = "owner") and (($SEARCH~ISFIGGED <> TRUE) and ($SEARCH~FIGOWNER = "Corp#"&$SEARCH~TARGET_CORP&",")))
  setvar $SEARCH~SOURCE_MESSAGE "appears to be fig'd by corp #"&$SEARCH~TARGET_CORP&"."
elseif ((($SEARCH~NEAR = "nf") or ($SEARCH~NEAR = "uf")) and ($SEARCH~ISFIGGED <> TRUE))
  setvar $SEARCH~SOURCE_MESSAGE "is not figged."
else
  setvar $SEARCH~CHECK_SECTOR $SEARCH~SOURCE
  gosub :SEARCH~LOAD_DEADEND_STATE
end

if (($SEARCH~NEAR = "ufde") and (($SEARCH~ISFIGGED = FALSE) and ($SEARCH~CHECK_DEADEND = TRUE)))
  setvar $SEARCH~SOURCE_MESSAGE "appears to be an unfigged dead-end."
elseif (($SEARCH~NEAR = "fde") and (($SEARCH~ISFIGGED = TRUE) and ($SEARCH~CHECK_DEADEND = TRUE)))
  setvar $SEARCH~SOURCE_MESSAGE "appears to be a figged dead-end."
elseif (($SEARCH~NEAR = "de") and ($SEARCH~CHECK_DEADEND = TRUE))
  setvar $SEARCH~SOURCE_MESSAGE "appears to be a dead-end."
elseif (($SEARCH~NEAR = "fp") and (($SEARCH~ISFIGGED = TRUE) and ((PORT.CLASS[$SEARCH~SOURCE] > 0) and (PORT.CLASS[$SEARCH~SOURCE] < 9))))
  if (((($SEARCH~PFUEL = "b") and (PORT.BUYFUEL[$SEARCH~SOURCE] = 1)) or (($SEARCH~PFUEL = "s") and (PORT.BUYFUEL[$SEARCH~SOURCE] = 0))) or ($SEARCH~PFUEL = "x"))
    if (((($SEARCH~PORG = "b") and (PORT.BUYORG[$SEARCH~SOURCE] = 1)) or (($SEARCH~PORG = "s") and (PORT.BUYORG[$SEARCH~SOURCE] = 0))) or ($SEARCH~PORG = "x"))
      if (((($SEARCH~PEQUIP = "b") and (PORT.BUYEQUIP[$SEARCH~SOURCE] = 1)) or (($SEARCH~PEQUIP = "s") and (PORT.BUYEQUIP[$SEARCH~SOURCE] = 0))) or ($SEARCH~PEQUIP = "x"))
        setvar $SEARCH~SOURCE_MESSAGE " has a "&$SEARCH~PTYPE&" port that's figged."
      end
    end
  end
elseif ((($SEARCH~NEAR = "port") or ($SEARCH~NEAR = "p")) and ((PORT.CLASS[$SEARCH~SOURCE] > 0) and (PORT.CLASS[$SEARCH~SOURCE] < 9)))
  if (((($SEARCH~PFUEL = "b") and (PORT.BUYFUEL[$SEARCH~SOURCE] = 1)) or (($SEARCH~PFUEL = "s") and (PORT.BUYFUEL[$SEARCH~SOURCE] = 0))) or ($SEARCH~PFUEL = "x"))
    if (((($SEARCH~PORG = "b") and (PORT.BUYORG[$SEARCH~SOURCE] = 1)) or (($SEARCH~PORG = "s") and (PORT.BUYORG[$SEARCH~SOURCE] = 0))) or ($SEARCH~PORG = "x"))
      if (((($SEARCH~PEQUIP = "b") and (PORT.BUYEQUIP[$SEARCH~SOURCE] = 1)) or (($SEARCH~PEQUIP = "s") and (PORT.BUYEQUIP[$SEARCH~SOURCE] = 0))) or ($SEARCH~PEQUIP = "x"))
        setvar $SEARCH~SOURCE_MESSAGE " has a "&$SEARCH~PTYPE&" port."
      end
    end
  end
elseif (((($SEARCH~NEAR = "fup") and ($SEARCH~ISFIGGED = TRUE)) or (($SEARCH~NEAR = "nfup") and ($SEARCH~ISFIGGED <> TRUE))) and ((PORT.CLASS[$SEARCH~SOURCE] > 0) and (PORT.CLASS[$SEARCH~SOURCE] < 9)))
  setvar $SEARCH~FOUNDFUELPORT FALSE
  setvar $SEARCH~FOUNDORGPORT FALSE
  setvar $SEARCH~FOUNDEQUIPPORT FALSE
  if ((((($SEARCH~PFUEL = "b") and (PORT.BUYFUEL[$SEARCH~SOURCE] = 1)) and (PORT.FUEL[$SEARCH~SOURCE] >= 10000)) or ((($SEARCH~PFUEL = "s") and (PORT.BUYFUEL[$SEARCH~SOURCE] = 0)) and (PORT.FUEL[$SEARCH~SOURCE] >= 10000))))
    setvar $SEARCH~FOUNDFUELPORT TRUE
  end
  if ((((($SEARCH~PORG = "b") and (PORT.BUYORG[$SEARCH~SOURCE] = 1)) and (PORT.ORG[$SEARCH~SOURCE] >= 10000)) or ((($SEARCH~PORG = "s") and (PORT.BUYORG[$SEARCH~SOURCE] = 0)) and (PORT.ORG[$SEARCH~SOURCE] >= 10000))))
    setvar $SEARCH~FOUNDORGPORT TRUE
  end
  if ((((($SEARCH~PEQUIP = "b") and (PORT.BUYEQUIP[$SEARCH~SOURCE] = 1)) and (PORT.EQUIP[$SEARCH~SOURCE] >= 10000)) or ((($SEARCH~PEQUIP = "s") and (PORT.BUYEQUIP[$SEARCH~SOURCE] = 0)) and (PORT.EQUIP[$SEARCH~SOURCE] >= 10000))))
    setvar $SEARCH~FOUNDEQUIPPORT TRUE
  end
  if (($SEARCH~PFUEL = "x") and (($SEARCH~PORG = "x") and ($SEARCH~PEQUIP = "x")))
    if (((($SEARCH~PFUEL = "x") and (PORT.FUEL[$SEARCH~SOURCE] >= 10000)) or (($SEARCH~PORG = "x") and (PORT.ORG[$SEARCH~SOURCE] >= 10000))) or (($SEARCH~PEQUIP = "x") and (PORT.EQUIP[$SEARCH~SOURCE] >= 10000)))
      setvar $SEARCH~FOUNDFUELPORT TRUE
      setvar $SEARCH~FOUNDORGPORT TRUE
      setvar $SEARCH~FOUNDEQUIPPORT TRUE
    end
  else
    if ($SEARCH~PFUEL = "x")
      setvar $SEARCH~FOUNDFUELPORT TRUE
    end
    if ($SEARCH~PORG = "x")
      setvar $SEARCH~FOUNDORGPORT TRUE
    end
    if ($SEARCH~PEQUIP = "x")
      setvar $SEARCH~FOUNDEQUIPPORT TRUE
    end
  end
  if (($SEARCH~FOUNDFUELPORT = TRUE) and (($SEARCH~FOUNDORGPORT = TRUE) and ($SEARCH~FOUNDEQUIPPORT = TRUE)))
    if ($SEARCH~NEAR = "fup")
      setvar $SEARCH~SOURCE_MESSAGE " has an upped "&$SEARCH~PTYPE&" port that's figged."
    else
      setvar $SEARCH~SOURCE_MESSAGE " has an upped "&$SEARCH~PTYPE&" port that's not figged."
    end
  end
end

gosub :BREADTH_SEARCH

if ($SEARCH~RETURN_DATA <> "")
  setvar $SWITCHBOARD~MESSAGE $SEARCH~RETURN_DATA
  if ($SEARCH~SOURCE_MESSAGE <> "")
    setvar $SEARCH~CHECK_SECTOR $SEARCH~SOURCE
    gosub :SEARCH~LOAD_FIG_STATE
    setvar $SEARCH~ISFIGGED3 $SEARCH~CHECK_FIGGED
    getsectorparameter $SEARCH~SOURCE "MINESEC" $SEARCH~ISMINED3
    getsectorparameter $SEARCH~SOURCE "LIMPSEC" $SEARCH~ISLIMPD3
    if (($SEARCH~ISLIMPD3 = TRUE) and ($SEARCH~ISMINED3 = TRUE))
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*   *   Note: "&$SEARCH~SOURCE&"LA, "&$SEARCH~SOURCE_MESSAGE
    else
      if ($SEARCH~ISLIMPD3 = TRUE)
        setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*   *   Note: "&$SEARCH~SOURCE&"L, "&$SEARCH~SOURCE_MESSAGE
      elseif ($SEARCH~ISMINED3 = TRUE)
        setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*   *   Note: "&$SEARCH~SOURCE&"A, "&$SEARCH~SOURCE_MESSAGE
      else
        setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*   *   Note: "&$SEARCH~SOURCE&", "&$SEARCH~SOURCE_MESSAGE
      end
    end
    if ($SEARCH~ISFIGGED3 = TRUE)
      setvar $SEARCH~DIRECTIONS " "&$SEARCH~SOURCE&"F"&$SEARCH~DIRECTIONS
    else
      setvar $SEARCH~DIRECTIONS " "&$SEARCH~SOURCE&$SEARCH~DIRECTIONS
    end
  end
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*"
  if (($SWITCHBOARD~SELF_COMMAND <> TRUE) or ($BOT~SILENT_MODE <> TRUE))
    setvar $SWITCHBOARD~SELF_COMMAND 2
  end
  gosub :SWITCHBOARD~SWITCHBOARD
end
return

:SEARCH~BREADTH_SEARCH
setvar $SEARCH~I 1
setvar $SEARCH~LOOP_DATA 1
getnearestwarps $SEARCH~NEARARRAY $SEARCH~SOURCE
while ($SEARCH~I <= $SEARCH~NEARARRAY)
  setvar $SEARCH~FOCUS $SEARCH~NEARARRAY[$SEARCH~I]
  setvar $SEARCH~CHECK_SECTOR $SEARCH~FOCUS
  gosub :SEARCH~LOAD_FIG_STATE
  setvar $SEARCH~ISFIGGED2 $SEARCH~CHECK_FIGGED
  gosub :SEARCH~LOAD_DEADEND_STATE
  getword SECTOR.FIGS.OWNER[$SEARCH~FOCUS] $SEARCH~FIGOWNER 3
  if ((($SEARCH~SOURCE <> $SEARCH~FOCUS) and (($SEARCH~FOCUS > 10) and ($SEARCH~FOCUS <> $MAP~STARDOCK))) and (((($SEARCH~NEAR = "de") and ($SEARCH~CHECK_DEADEND = TRUE))) or ((($SEARCH~ISFIGGED2 = FALSE) and (($SEARCH~NEAR = "uf") or ($SEARCH~NEAR = "nf") or (($SEARCH~NEAR = "owner") and ($SEARCH~FIGOWNER = "Corp#"&$SEARCH~TARGET_CORP&",")) or (($SEARCH~NEAR = "ufde") and ($SEARCH~CHECK_DEADEND = TRUE)))) or (($SEARCH~ISFIGGED2 = TRUE) and (($SEARCH~NEAR = "f") or (($SEARCH~NEAR = "fde") and ($SEARCH~CHECK_DEADEND = TRUE)))))))
    getcoursedijkstra $SEARCH~COURSE $SEARCH~SOURCE $SEARCH~FOCUS
    setvar $SEARCH~HOPS $SEARCH~COURSE
    if ($SEARCH~HOPS > 0)
      subtract $SEARCH~HOPS 1
    end
    setvar $SEARCH~I 1
    setvar $SEARCH~FCOUNT 0
    setvar $SEARCH~DIRECTIONS ""
    if ($SEARCH~NEAR = "f")
      setvar $SWITCHBOARD~MESSAGE "Nearest Fig"
    elseif (($SEARCH~NEAR = "uf") or ($SEARCH~NEAR = "nf"))
      setvar $SWITCHBOARD~MESSAGE "Nearest Non-Fig"
    elseif ($SEARCH~NEAR = "owner")
      setvar $SWITCHBOARD~MESSAGE "Nearest Corp #"&$SEARCH~TARGET_CORP&" Fig"
    elseif ($SEARCH~NEAR = "de")
      setvar $SWITCHBOARD~MESSAGE "Nearest DE"
    elseif ($SEARCH~NEAR = "ufde")
      setvar $SWITCHBOARD~MESSAGE "Nearest Non-Fig DE"
    elseif ($SEARCH~NEAR = "fde")
      setvar $SWITCHBOARD~MESSAGE "Nearest Fig'd DE"
    end
    if ($SEARCH~COURSE = 2)
      while (SECTOR.WARPS[$SEARCH~SOURCE][$SEARCH~I] > 0)
        setvar $SEARCH~TEMPCHECK SECTOR.WARPS[$SEARCH~SOURCE][$SEARCH~I]
        setvar $SEARCH~CHECK_SECTOR $SEARCH~TEMPCHECK
        gosub :SEARCH~LOAD_FIG_STATE
        setvar $SEARCH~ISFIGGED3 $SEARCH~CHECK_FIGGED
        gosub :SEARCH~LOAD_DEADEND_STATE
        getsectorparameter $SEARCH~TEMPCHECK "MINESEC" $SEARCH~ISMINED3
        getsectorparameter $SEARCH~TEMPCHECK "LIMPSEC" $SEARCH~ISLIMPD3

        getword SECTOR.FIGS.OWNER[$SEARCH~TEMPCHECK] $SEARCH~FIGOWNER2 3
        if (((($SEARCH~NEAR = "de") and ($SEARCH~CHECK_DEADEND = TRUE))) or ((($SEARCH~ISFIGGED3 = TRUE) and (($SEARCH~NEAR = "f") or (($SEARCH~NEAR = "fde") and ($SEARCH~CHECK_DEADEND = TRUE)))) or (($SEARCH~ISFIGGED3 = FALSE) and ((($SEARCH~NEAR = "owner") and ($SEARCH~FIGOWNER2 = "Corp#"&$SEARCH~TARGET_CORP&",")) or ($SEARCH~NEAR = "uf") or ($SEARCH~NEAR = "nf") or (($SEARCH~NEAR = "ufde") and ($SEARCH~CHECK_DEADEND = TRUE))))))
          setvar $SEARCH~DIRECTIONS $SEARCH~DIRECTIONS&$SEARCH~TEMPCHECK
          if (($SEARCH~ISMINED3 = TRUE) and ($SEARCH~ISLIMPD3 = TRUE))
            setvar $SEARCH~DIRECTIONS $SEARCH~DIRECTIONS&"LA"
          else
            if ($SEARCH~ISMINED3 = TRUE)
              setvar $SEARCH~DIRECTIONS $SEARCH~DIRECTIONS&"A"
            elseif ($SEARCH~ISLIMPD3 = TRUE)
              setvar $SEARCH~DIRECTIONS $SEARCH~DIRECTIONS&"L"
            end
          end
          setvar $SEARCH~DIRECTIONS $SEARCH~DIRECTIONS&" "
          add $SEARCH~FCOUNT 1
        end
        add $SEARCH~I 1
      end
      if ($SEARCH~FCOUNT > 1)
        setvar $SEARCH~RETURN_DATA $SWITCHBOARD~MESSAGE&"s adjacent to "&$SEARCH~SOURCE&" are*    [ "&$SEARCH~DIRECTIONS&"]"
      else
        setvar $SEARCH~RETURN_DATA $SWITCHBOARD~MESSAGE&" adjacent to "&$SEARCH~SOURCE&" is*    [ "&$SEARCH~DIRECTIONS&"]"
      end
    else
      while ($SEARCH~I <= $SEARCH~COURSE)
        setvar $SEARCH~CHECK_SECTOR $SEARCH~COURSE[$SEARCH~I]
        gosub :SEARCH~LOAD_FIG_STATE
        setvar $SEARCH~ISFIGGED3 $SEARCH~CHECK_FIGGED
        getsectorparameter $SEARCH~COURSE[$SEARCH~I] "MINESEC" $SEARCH~ISMINED3
        getsectorparameter $SEARCH~COURSE[$SEARCH~I] "LIMPSEC" $SEARCH~ISLIMPD3
        if (($SEARCH~ISMINED3 = TRUE) and ($SEARCH~ISLIMPD3 = TRUE))
          setvar $SEARCH~DIRECTIONS "LA"&$SEARCH~DIRECTIONS
        else
          if ($SEARCH~ISMINED3 = TRUE)
            setvar $SEARCH~DIRECTIONS "A"&$SEARCH~DIRECTIONS
          end
          if ($SEARCH~ISLIMPD3 = TRUE)
            setvar $SEARCH~DIRECTIONS "L"&$SEARCH~DIRECTIONS
          end
        end
        if ($SEARCH~ISFIGGED3 = TRUE)
          setvar $SEARCH~DIRECTIONS " "&$SEARCH~COURSE[$SEARCH~I]&"F"&$SEARCH~DIRECTIONS
        else
          setvar $SEARCH~DIRECTIONS " "&$SEARCH~COURSE[$SEARCH~I]&$SEARCH~DIRECTIONS
        end

        add $SEARCH~I 1
      end
      setvar $SEARCH~RETURN_DATA $SWITCHBOARD~MESSAGE&" to "&$SEARCH~SOURCE&" is "&$SEARCH~FOCUS&" ("&$SEARCH~HOPS&" hops)*  <<"&$SEARCH~DIRECTIONS&" >>*                L: Limpet A: Armid F:Fighter  "
    end
    return
  elseif ((($SEARCH~NEAR = "nfup") and ($SEARCH~ISFIGGED2 = FALSE)) or (($SEARCH~NEAR = "fup") and ($SEARCH~ISFIGGED2 = TRUE)))
    setvar $SEARCH~FOUNDFUELPORT FALSE
    setvar $SEARCH~FOUNDORGPORT FALSE
    setvar $SEARCH~FOUNDEQUIPPORT FALSE
    if (((PORT.CLASS[$SEARCH~FOCUS] > 0) and (PORT.CLASS[$SEARCH~FOCUS] < 9)) and ($SEARCH~FOCUS <> $SEARCH~SOURCE))
      if ((((($SEARCH~PFUEL = "b") and (PORT.BUYFUEL[$SEARCH~FOCUS] = 1)) and (PORT.FUEL[$SEARCH~FOCUS] >= 10000)) or ((($SEARCH~PFUEL = "s") and (PORT.BUYFUEL[$SEARCH~FOCUS] = 0)) and (PORT.FUEL[$SEARCH~FOCUS] >= 10000))))
        setvar $SEARCH~FOUNDFUELPORT TRUE
      end
      if ((((($SEARCH~PORG = "b") and (PORT.BUYORG[$SEARCH~FOCUS] = 1)) and (PORT.ORG[$SEARCH~FOCUS] >= 10000)) or ((($SEARCH~PORG = "s") and (PORT.BUYORG[$SEARCH~FOCUS] = 0)) and (PORT.ORG[$SEARCH~FOCUS] >= 10000))))
        setvar $SEARCH~FOUNDORGPORT TRUE
      end
      if ((((($SEARCH~PEQUIP = "b") and (PORT.BUYEQUIP[$SEARCH~FOCUS] = 1)) and (PORT.EQUIP[$SEARCH~FOCUS] >= 10000)) or ((($SEARCH~PEQUIP = "s") and (PORT.BUYEQUIP[$SEARCH~FOCUS] = 0)) and (PORT.EQUIP[$SEARCH~FOCUS] >= 10000))))
        setvar $SEARCH~FOUNDEQUIPPORT TRUE
      end
      if (($SEARCH~PFUEL = "x") and (($SEARCH~PORG = "x") and ($SEARCH~PEQUIP = "x")))
        if (((($SEARCH~PFUEL = "x") and (PORT.FUEL[$SEARCH~FOCUS] >= 10000)) or (($SEARCH~PORG = "x") and (PORT.ORG[$SEARCH~FOCUS] >= 10000))) or (($SEARCH~PEQUIP = "x") and (PORT.EQUIP[$SEARCH~FOCUS] >= 10000)))
          setvar $SEARCH~FOUNDFUELPORT TRUE
          setvar $SEARCH~FOUNDORGPORT TRUE
          setvar $SEARCH~FOUNDEQUIPPORT TRUE
        end
      else
        if ($SEARCH~PFUEL = "x")
          setvar $SEARCH~FOUNDFUELPORT TRUE
        end
        if ($SEARCH~PORG = "x")
          setvar $SEARCH~FOUNDORGPORT TRUE
        end
        if ($SEARCH~PEQUIP = "x")
          setvar $SEARCH~FOUNDEQUIPPORT TRUE
        end
      end
      if (($SEARCH~FOUNDFUELPORT = TRUE) and (($SEARCH~FOUNDORGPORT = TRUE) and ($SEARCH~FOUNDEQUIPPORT = TRUE)))
        if ($SEARCH~LOOP_DATA = 1)
          getcoursedijkstra $SEARCH~COURSE $SEARCH~SOURCE $SEARCH~FOCUS
          setvar $SEARCH~HOPS $SEARCH~COURSE
          if ($SEARCH~HOPS > 0)
            subtract $SEARCH~HOPS 1
          end
          setvar $SEARCH~RETURN_DATA "Nearest Figged upgraded "&$SEARCH~PTYPE&" port(s) to "&$SEARCH~SOURCE&": "&$SEARCH~FOCUS&" ("&$SEARCH~HOPS&" hops)"
        elseif ($SEARCH~LOOP_DATA = 2)
          getcoursedijkstra $SEARCH~COURSE $SEARCH~SOURCE $SEARCH~FOCUS
          setvar $SEARCH~HOPS $SEARCH~COURSE
          if ($SEARCH~HOPS > 0)
            subtract $SEARCH~HOPS 1
          end
          setvar $SEARCH~RETURN_DATA $SEARCH~RETURN_DATA&", "&$SEARCH~FOCUS&" ("&$SEARCH~HOPS&" hops)"
        else
          getcoursedijkstra $SEARCH~COURSE $SEARCH~SOURCE $SEARCH~FOCUS
          setvar $SEARCH~HOPS $SEARCH~COURSE
          if ($SEARCH~HOPS > 0)
            subtract $SEARCH~HOPS 1
          end
          setvar $SEARCH~RETURN_DATA $SEARCH~RETURN_DATA&", and "&$SEARCH~FOCUS&" ("&$SEARCH~HOPS&" hops)"
          setvar $SEARCH~LOOP_DATA 1
          return
        end
        add $SEARCH~LOOP_DATA 1
      end
    end
  elseif ((($SEARCH~NEAR = "port") or ($SEARCH~NEAR = "p")) or (($SEARCH~NEAR = "fp") and ($SEARCH~ISFIGGED2 = TRUE)))
    if (((PORT.CLASS[$SEARCH~FOCUS] > 0) and (PORT.CLASS[$SEARCH~FOCUS] < 9)) and ($SEARCH~FOCUS <> $SEARCH~SOURCE))
      if (((($SEARCH~PFUEL = "b") and (PORT.BUYFUEL[$SEARCH~FOCUS] = 1)) or (($SEARCH~PFUEL = "s") and (PORT.BUYFUEL[$SEARCH~FOCUS] = 0))) or ($SEARCH~PFUEL = "x"))
        if (((($SEARCH~PORG = "b") and (PORT.BUYORG[$SEARCH~FOCUS] = 1)) or (($SEARCH~PORG = "s") and (PORT.BUYORG[$SEARCH~FOCUS] = 0))) or ($SEARCH~PORG = "x"))
          if (((($SEARCH~PEQUIP = "b") and (PORT.BUYEQUIP[$SEARCH~FOCUS] = 1)) or (($SEARCH~PEQUIP = "s") and (PORT.BUYEQUIP[$SEARCH~FOCUS] = 0))) or ($SEARCH~PEQUIP = "x"))
            if ($SEARCH~LOOP_DATA = 1)
              getcoursedijkstra $SEARCH~COURSE $SEARCH~SOURCE $SEARCH~FOCUS
              setvar $SEARCH~HOPS $SEARCH~COURSE
              if ($SEARCH~HOPS > 0)
                subtract $SEARCH~HOPS 1
              end
              setvar $SEARCH~RETURN_DATA "Nearest Figged "&$SEARCH~PTYPE&" port(s) to "&$SEARCH~SOURCE&": "&$SEARCH~FOCUS&" ("&$SEARCH~HOPS&" hops)"
            elseif ($SEARCH~LOOP_DATA = 2)
              getcoursedijkstra $SEARCH~COURSE $SEARCH~SOURCE $SEARCH~FOCUS
              setvar $SEARCH~HOPS $SEARCH~COURSE
              if ($SEARCH~HOPS > 0)
                subtract $SEARCH~HOPS 1
              end
              setvar $SEARCH~RETURN_DATA $SEARCH~RETURN_DATA&", "&$SEARCH~FOCUS&" ("&$SEARCH~HOPS&" hops)"
            else
              getcoursedijkstra $SEARCH~COURSE $SEARCH~SOURCE $SEARCH~FOCUS
              setvar $SEARCH~HOPS $SEARCH~COURSE
              if ($SEARCH~HOPS > 0)
                subtract $SEARCH~HOPS 1
              end
              setvar $SEARCH~RETURN_DATA $SEARCH~RETURN_DATA&", and "&$SEARCH~FOCUS&" ("&$SEARCH~HOPS&" hops)"
              setvar $SEARCH~LOOP_DATA 1
              return
            end
            add $SEARCH~LOOP_DATA 1
          end
        end
      end
    end
  end
  add $SEARCH~I 1
end

setvar $SEARCH~RETURN_DATA "Nothing found for that search."
return

:SEARCH~LOAD_FIG_STATE
getsectorparameter $SEARCH~CHECK_SECTOR "FIGSEC" $SEARCH~CHECK_FIGGED
return

:SEARCH~LOAD_DEADEND_STATE
setvar $SEARCH~CHECK_DEADEND FALSE
setvar $SEARCH~KNOWN_WARPS 0
setvar $SEARCH~DE_IDX 1
while (($SEARCH~DE_IDX <= 6) and (SECTOR.WARPS[$SEARCH~CHECK_SECTOR][$SEARCH~DE_IDX] > 0))
  add $SEARCH~KNOWN_WARPS 1
  add $SEARCH~DE_IDX 1
end

if ($SEARCH~KNOWN_WARPS = 1)
  if (SECTOR.WARPCOUNT[$SEARCH~CHECK_SECTOR] = 1)
    setvar $SEARCH~CHECK_DEADEND TRUE
  end
end
return
