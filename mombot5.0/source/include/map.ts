:MAP~COMMAS


if ($MAP~VALUE < 1000)

elseif ($MAP~VALUE < 1000000)
  getlength $MAP~VALUE $MAP~LEN
  setvar $MAP~LEN ($MAP~LEN - 3)
  cuttext $MAP~VALUE $MAP~TMP 1 $MAP~LEN
  cuttext $MAP~VALUE $MAP~TMP1 ($MAP~LEN + 1) 999
  setvar $MAP~TMP $MAP~TMP&","&$MAP~TMP1
  setvar $MAP~VALUE $MAP~TMP
elseif ($MAP~VALUE <= 999999999)
  getlength $MAP~VALUE $MAP~LEN
  setvar $MAP~LEN ($MAP~LEN - 6)
  cuttext $MAP~VALUE $MAP~TMP 1 $MAP~LEN
  setvar $MAP~TMP $MAP~TMP&","
  cuttext $MAP~VALUE $MAP~TMP1 ($MAP~LEN + 1) 3
  setvar $MAP~TMP $MAP~TMP&$MAP~TMP1&","
  cuttext $MAP~VALUE $MAP~TMP1 ($MAP~LEN + 4) 999
  setvar $MAP~TMP $MAP~TMP&$MAP~TMP1
  setvar $MAP~VALUE $MAP~TMP
end
return
:MAP~DISPLAYADJACENTGRIDANSI


setvar $MAP~MARKER_BEACON 1
setvar $MAP~LIMPET_MINE 2
setvar $MAP~ARMID_MINE 10
setvar $MAP~FIGHTER 5
setvar $MAP~HAZARD 21
setvar $MAP~UNMANNED_SHIP 38
setvar $MAP~MANNED_SHIP 40
setvar $MAP~DESTROYED_PORT 50
setvar $MAP~PORT 100
setvar $MAP~PLANET 500

setvar $MAP~I 1
if (CURRENTSECTOR = 0)
  gosub :PLAYER~QUIKSTATS
end
isnumber $MAP~TEST CURRENTSECTOR
if ($MAP~TEST)
  echo "**" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 "*"
  while (SECTOR.WARPS[CURRENTSECTOR][$MAP~I] > 0)
    setvar $MAP~ADJ_SEC SECTOR.WARPS[CURRENTSECTOR][$MAP~I]
    setvar $MAP~ISALIENS FALSE
    setvar $MAP~ADJSECTOROWNER SECTOR.FIGS.OWNER[$MAP~ADJ_SEC]
    setvar $MAP~ADJLIMPOWNER SECTOR.LIMPETS.OWNER[$MAP~ADJ_SEC]
    setvar $MAP~ADJMINEOWNER SECTOR.MINES.OWNER[$MAP~ADJ_SEC]

    getsectorparameter $MAP~ADJ_SEC "FIGSEC" $MAP~ISFIGGED
    getsectorparameter $MAP~ADJ_SEC "LIMPSEC" $MAP~ISLIMPED
    if ($MAP~ISFIGGED <> TRUE)
      setvar $MAP~ISFIGGED FALSE
    end
    setvar $MAP~CONTAINSSHIELDEDPLANET FALSE
    setvar $MAP~SHIELDEDPLANETS 0
    if ($MAP~ADJ_SEC >= 10000)
      setvar $MAP~ADJUST ""
    elseif ($MAP~ADJ_SEC >= 1000)
      setvar $MAP~ADJUST " "
    elseif ($MAP~ADJ_SEC >= 100)
      setvar $MAP~ADJUST "  "
    elseif ($MAP~ADJ_SEC >= 10)
      setvar $MAP~ADJUST "   "
    else
      setvar $MAP~ADJUST "    "


    end
    gosub :FORMATSECTOROWNER
    echo ANSI_13 "* (" ANSI_10 $MAP~I ANSI_13 ")" ANSI_15 " - " ANSI_13 "<" $MAP~COLOR $MAP~ADJ_SEC ANSI_13 ">" $MAP~ADJUST ANSI_5
    echo " " ANSI_15 "["


    echo $MAP~COLOR $MAP~TEMP

    echo ANSI_15 "]"

    echo "   Warps" ANSI_14 ": " ANSI_14 SECTOR.WARPCOUNT[$MAP~ADJ_SEC] "   "
    getsectorparameter $MAP~ADJ_SEC "FIGSEC" $MAP~ISFIGGED
    getsectorparameter $MAP~ADJ_SEC "MSLSEC" $MAP~ISMSL
    getsectorparameter $MAP~ADJ_SEC "BUBBLE" $MAP~ISBUBBLE
    if ($MAP~ISFIGGED = "")
      setvar $MAP~ISFIGGED FALSE
    end
    if ($MAP~ISMSL = "")
      setvar $MAP~ISMSL FALSE
    end
    isnumber $MAP~ISNUMBER SECTOR.ANOMALY[$MAP~ADJ_SEC]
    if ($MAP~ISNUMBER)
      if (SECTOR.ANOMALY[$MAP~ADJ_SEC])
        echo ANSI_15 " Anom: " ANSI_11 "Yes" ANSI_15
      else
        echo ANSI_15 " Anom: " ANSI_7 " No" ANSI_15
      end
    else
      echo ANSI_15 " Anom: " ANSI_7 " ???" ANSI_15
    end
    echo ANSI_15 "  Dens: " ANSI_14
    if (SECTOR.DENSITY[$MAP~ADJ_SEC] = "-1")
      echo "???        "
    else
      setvar $MAP~CALCULATED_DENSITY 0
      setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] * $MAP~FIGHTER))
      setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + (SECTOR.MINES.QUANTITY[$MAP~ADJ_SEC] * $MAP~ARMID_MINE))
      setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + (SECTOR.LIMPETS.QUANTITY[$MAP~ADJ_SEC] * $MAP~LIMPET_MINE))
      setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + (SECTOR.NAVHAZ[$MAP~ADJ_SEC] * $MAP~HAZARD))
      if (SECTOR.BEACON[$MAP~I] <> "")
        setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + $MAP~MARKER_BEACON)
      end
      if (PORT.EXISTS[$MAP~ADJ_SEC])
        setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + $MAP~PORT)
      end
      setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + (SECTOR.PLANETCOUNT[$MAP~ADJ_SEC] * $MAP~PLANET))
      setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + (SECTOR.TRADERCOUNT[$MAP~ADJ_SEC] * $MAP~MANNED_SHIP))
      setvar $MAP~CALCULATED_DENSITY ($MAP~CALCULATED_DENSITY + (SECTOR.SHIPCOUNT[$MAP~ADJ_SEC] * $MAP~UNMANNED_SHIP))
      setvar $MAP~DENS SECTOR.DENSITY[$MAP~ADJ_SEC]
      getlength SECTOR.DENSITY[$MAP~ADJ_SEC] $MAP~DENSLENGTH

      if ($MAP~DENSLENGTH >= 9)
        echo "HIGH      "
      else





        echo $MAP~DENS
      end
      if ($MAP~CALCULATED_DENSITY < $MAP~DENS)
        if (($MAP~ISLIMPED <> TRUE) and ((SECTOR.ANOMOLY[$MAP~ADJ_SEC] = TRUE) and ((($MAP~ADJLIMPOWNER <> "belong to your Corp") and ($MAP~ADJLIMPOWNER <> "yours")) and (SECTOR.LIMPETS.QUANTITY[$MAP~ADJ_SEC] <= 0))))
          setvar $MAP~POSSIBLE_LIMPETS (($MAP~DENS - $MAP~CALCULATED_DENSITY) / 2)
          if ($MAP~POSSIBLE_LIMPETS <= 0)
            setvar $MAP~POSSIBLE_LIMPETS 1
          end
          echo ANSI_3 " [" ANSI_12 $MAP~POSSIBLE_LIMPETS " Enemy Limpets Detected" ANSI_3 "]"
        end
      elseif ($MAP~CALCULATED_DENSITY = $MAP~DENS)
        if ($MAP~SECTOR.ANOMOLY[$MAP~ADJ_SEC] = TRUE)
          echo ANSI_3 " /\/\" ANSI_12 "Cloaked Ship Detected" ANSI_3 "\/\/"
        end
      end


    end
    if ($MAP~ISMSL = TRUE)
      echo ANSI_15 " [" ANSI_14 "MSL" ANSI_15 "]" ANSI_7
    end
    if ($MAP~ISBUBBLE = TRUE)
      echo ANSI_15 " [" ANSI_10 "BUBBLE" ANSI_15 "]" ANSI_7
    end
    setvar $MAP~OUTPUT ""
    if (PORT.EXISTS[$MAP~ADJ_SEC])
      setvar $MAP~CLASS PORT.CLASS[$MAP~ADJ_SEC]
      setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"           Port"&ANSI_14&"    : "&ANSI_11&PORT.NAME[$MAP~ADJ_SEC]&ANSI_14&", "&ANSI_5&"Class "&ANSI_11&$MAP~CLASS&" "
      if (($MAP~CLASS <> 0) and ($MAP~CLASS <> 9))
        setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"("
        if (PORT.BUYFUEL[$MAP~ADJ_SEC])
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
        else
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
        end
        if (PORT.BUYORG[$MAP~ADJ_SEC])
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
        else
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
        end
        if (PORT.BUYEQUIP[$MAP~ADJ_SEC])
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
        else
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
        end
        setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&")"
      end
      setvar $MAP~OUTPUT $MAP~OUTPUT&""
      echo "*    "&$MAP~OUTPUT&""
    end
    if (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] > 0)
      setvar $MAP~FIG_COUNT SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC]

      if ((SECTOR.FIGS.OWNER[$MAP~ADJ_SEC] = "belong to your Corp") or (SECTOR.FIGS.OWNER[$MAP~ADJ_SEC] = "yours"))
        setvar $MAP~FIG_OWNER ANSI_11&"("&ANSI_3&SECTOR.FIGS.OWNER[$MAP~ADJ_SEC]&ANSI_11&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$MAP~ADJ_SEC]&"]"
        setvar $MAP~FIGHTER_COLOR ANSI_14
      elseif ($MAP~ISALIENS = TRUE)
        setvar $MAP~FIG_OWNER ANSI_10&"("&ANSI_2&SECTOR.FIGS.OWNER[$MAP~ADJ_SEC]&ANSI_10&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$MAP~ADJ_SEC]&"]"
        setvar $MAP~FIGHTER_COLOR ANSI_10
      else
        if ($MAP~ISFIGGED <> TRUE)
          setvar $MAP~FIG_OWNER ANSI_12&"("&ANSI_4&SECTOR.FIGS.OWNER[$MAP~ADJ_SEC]&ANSI_12&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$MAP~ADJ_SEC]&"]"
          setvar $MAP~FIGHTER_COLOR ANSI_12
        else
          setvar $MAP~FIG_OWNER ANSI_11&"("&ANSI_3&"Database hasn't updated yet."&ANSI_11&") "
          setvar $MAP~FIGHTER_COLOR ANSI_14
        end
      end
      setvar $MAP~VALUE $MAP~FIG_COUNT
      gosub :COMMAS
      setvar $MAP~FIG_COUNT $MAP~VALUE
      echo ANSI_5&"*               Fighters"&ANSI_14&": "&$MAP~FIGHTER_COLOR&$MAP~FIG_COUNT&ANSI_5&" "&$MAP~FIG_OWNER

    end
    setvar $MAP~P 1
    setvar $MAP~OUTPUT "*"
    while ($MAP~P <= SECTOR.PLANETCOUNT[$MAP~ADJ_SEC])
      setvar $MAP~ISSHIELDED FALSE
      setvar $MAP~TEMP SECTOR.PLANETS[$MAP~ADJ_SEC][$MAP~P]
      getword $MAP~TEMP $MAP~TEST 1
      if ($MAP~TEST = "<<<<")
        setvar $MAP~ISSHIELDED TRUE
      end
      getword $MAP~TEMP $MAP~TYPE 2
      striptext $MAP~TYPE "("
      striptext $MAP~TYPE ")"
      if ($MAP~ISSHIELDED)
        getlength $MAP~TEMP $MAP~LENGTH
        cuttext $MAP~TEMP $MAP~TEMP 1 ($MAP~LENGTH - 15)
        cuttext $MAP~TEMP $MAP~TEMP 10 9999
        setvar $MAP~TEMP ANSI_12&"<<<< "&ANSI_10&"("&ANSI_14&$MAP~TYPE&ANSI_10&") "&ANSI_1&$MAP~TEMP&ANSI_12&" >>>> "&ANSI_2&"(Shielded)"
      else
        setvar $MAP~TEMP ANSI_2&$MAP~TEMP
      end
      if ($MAP~P = 1)
        setvar $MAP~TEMP ANSI_5&"               Planets "&ANSI_14&": "&$MAP~TEMP
        setvar $MAP~OUTPUT $MAP~OUTPUT&$MAP~TEMP&""
      else
        setvar $MAP~OUTPUT $MAP~OUTPUT&"                         "&$MAP~TEMP&""
      end
      if ($MAP~P < SECTOR.PLANETCOUNT[$MAP~ADJ_SEC])
        setvar $MAP~OUTPUT $MAP~OUTPUT&"*"
      end
      add $MAP~P 1
    end
    if (SECTOR.PLANETCOUNT[$MAP~ADJ_SEC] > 0)
      echo ""&$MAP~OUTPUT&""
    end
    setvar $MAP~P 1
    if (SECTOR.TRADERCOUNT[$MAP~ADJ_SEC] > 0)
      echo ANSI_6 "*               Traders" ANSI_15 " : "&ANSI_7
    end
    while ($MAP~P <= SECTOR.TRADERCOUNT[$MAP~ADJ_SEC])
      echo "*                         "&ANSI_11&SECTOR.TRADERS[$MAP~ADJ_SEC][$MAP~P]
      add $MAP~P 1
    end
    setvar $MAP~P 1
    if (SECTOR.SHIPCOUNT[$MAP~ADJ_SEC] > 0)
      echo ANSI_5 "*               Ships   " ANSI_15 ": "&ANSI_11&"("&SECTOR.SHIPCOUNT[$MAP~ADJ_SEC]&") Empty Ships"
    end
    add $MAP~I 1
  end
  setvar $MAP~GRIDWARPCOUNT ($MAP~I - 1)
else
  echo ANSI_15 " ERROR WITH CURRENTSECTOR  " ANSI_7
end
echo "**" ANSI_4 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196 #196
echo "**" CURRENTANSILINE
return
:MAP~DISPLAYNAVIGATION


setvar $MAP~I 1
setvar $MAP~MAP ""
setarray $MAP~SECTORS_ARRAY 6
setvar $MAP~SECTORS_ARRAY[1] ""
setvar $MAP~SECTORS_ARRAY[2] ""
setvar $MAP~SECTORS_ARRAY[3] ""
setvar $MAP~SECTORS_ARRAY[4] ""
setvar $MAP~SECTORS_ARRAY[5] ""
setvar $MAP~SECTORS_ARRAY[6] ""
setvar $MAP~COUNT 0
isnumber $MAP~TEST CURRENTSECTOR
if ($MAP~TEST)
  while (SECTOR.WARPS[CURRENTSECTOR][$MAP~I] > 0)
    setvar $MAP~MAP ""
    setvar $MAP~ADJ_SEC SECTOR.WARPS[CURRENTSECTOR][$MAP~I]
    setvar $MAP~CONTAINSSHIELDEDPLANET FALSE
    setvar $MAP~SHIELDEDPLANETS 0
    if ($MAP~ADJ_SEC >= 10000)
      setvar $MAP~ADJUST ""
    elseif ($MAP~ADJ_SEC >= 1000)
      setvar $MAP~ADJUST " "
    elseif ($MAP~ADJ_SEC >= 100)
      setvar $MAP~ADJUST "  "
    elseif ($MAP~ADJ_SEC >= 10)
      setvar $MAP~ADJUST "   "
    else
      setvar $MAP~ADJUST "    "
    end
    setvar $MAP~MAP $MAP~MAP&ANSI_13&"* ("&ANSI_10&$MAP~I&ANSI_13&")"&ANSI_15&" - "&ANSI_13&"<"&ANSI_14&SECTOR.WARPS[CURRENTSECTOR][$MAP~I]&ANSI_13&">"&$MAP~ADJUST&ANSI_15&" Warps: "&ANSI_7&SECTOR.WARPCOUNT[$MAP~ADJ_SEC]
    getsectorparameter $MAP~ADJ_SEC "FIGSEC" $MAP~ISFIGGED
    getsectorparameter $MAP~ADJ_SEC "MSLSEC" $MAP~ISMSL
    if ($MAP~ISFIGGED = "")
      setvar $MAP~ISFIGGED FALSE
    end
    if ($MAP~ISMSL = "")
      setvar $MAP~ISMSL FALSE
    end
    if ($MAP~ISFIGGED or ((($MAP~ADJSECTOROWNER = "belong to your Corp") or ($MAP~ADJSECTOROWNER = "yours")) and (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] > 0)))
      setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_14&"   OURS   "
    else
      getword $MAP~ADJSECTOROWNER $MAP~ALIENCHECK 1
      if (($MAP~ADJ_SEC < 11) or ($MAP~ADJ_SEC = $MAP~STARDOCK))
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_9&" FEDSPACE "
      elseif ($MAP~ADJ_SEC = $MAP~RYLOS)
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_9&"  RYLOS   "
      elseif ($MAP~ADJ_SEC = $MAP~ALPHA_CENTAURI)
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_9&"  ALPHA   "
      elseif ($MAP~ADJSECTOROWNER = "Rogue Mercenaries")
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_7&"  ROGUE   "
      elseif ($MAP~ALIENCHECK = "the")
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_2&"  ALIENS  "
      elseif ($MAP~ALIENCHECK = "The")
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_2&"  ALIENS  "
      elseif (($MAP~ADJSECTOROWNER <> "") and ($MAP~ADJSECTOROWNER <> "Unknown"))
        setvar $MAP~HEADS TRUE
        getword $MAP~ADJSECTOROWNER $MAP~TEMP 3
        striptext $MAP~TEMP ","
        uppercase $MAP~TEMP
        getlength $MAP~TEMP $MAP~TEMPLENGTH
        if ($MAP~TEMPLENGTH >= 10)
          cuttext $MAP~TEMP $MAP~TEMP 1 10
        else
          while ((10 - $MAP~TEMPLENGTH) > 0)
            if ($MAP~HEADS)
              setvar $MAP~TEMP $MAP~TEMP&" "
              setvar $MAP~HEADS FALSE
            else
              setvar $MAP~TEMP " "&$MAP~TEMP
              setvar $MAP~HEADS TRUE
            end
            getlength $MAP~TEMP $MAP~TEMPLENGTH
          end
        end
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_12&$MAP~TEMP
      else
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Owner: "&ANSI_13&"   NONE   "
      end
    end
    isnumber $MAP~ISNUMBER SECTOR.ANOMALY[$MAP~ADJ_SEC]
    if ($MAP~ISNUMBER)
      if (SECTOR.ANOMALY[$MAP~ADJ_SEC])
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Anom: "&ANSI_11&"Yes"&ANSI_15
      else
        setvar $MAP~MAP $MAP~MAP&ANSI_15&" Anom: "&ANSI_7&" No"&ANSI_15
      end
    else
      setvar $MAP~MAP $MAP~MAP&ANSI_15&" Anom: "&ANSI_7&" ???"&ANSI_15
    end
    setvar $MAP~MAP $MAP~MAP&ANSI_15&"  Dens: "&ANSI_14
    if (SECTOR.DENSITY[$MAP~ADJ_SEC] = "-1")
      setvar $MAP~MAP $MAP~MAP&"???        "
    else
      setvar $MAP~DENS SECTOR.DENSITY[$MAP~ADJ_SEC]
      getlength SECTOR.DENSITY[$MAP~ADJ_SEC] $MAP~DENSLENGTH
      if ($MAP~DENSLENGTH >= 9)
        setvar $MAP~MAP $MAP~MAP&"HIGH      "
      else
        setvar $MAP~D $MAP~DENSLENGTH
        while ($MAP~D <= 10)
          setvar $MAP~DENS $MAP~DENS&" "
          add $MAP~D 1
        end
        setvar $MAP~MAP $MAP~MAP&$MAP~DENS
      end
    end

    if ($MAP~ISMSL = TRUE)
      setvar $MAP~MAP $MAP~MAP&ANSI_15&"["&ANSI_14&"MSL"&ANSI_15&"]"&ANSI_7
    end
    setvar $MAP~OUTPUT ""
    if (PORT.EXISTS[$MAP~ADJ_SEC])
      setvar $MAP~CLASS PORT.CLASS[$MAP~ADJ_SEC]
      setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"    Port   "&ANSI_14&": "&ANSI_11&PORT.NAME[$MAP~ADJ_SEC]&ANSI_14&", "&ANSI_5&"Class "&ANSI_11&$MAP~CLASS&" "
      if (($MAP~CLASS <> 0) and ($MAP~CLASS <> 9))
        setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"("
        if (PORT.BUYFUEL[$MAP~ADJ_SEC])
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
        else
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
        end
        if (PORT.BUYORG[$MAP~ADJ_SEC])
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
        else
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
        end
        if (PORT.BUYEQUIP[$MAP~ADJ_SEC])
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
        else
          setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
        end
        setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&")"
      end
      setvar $MAP~OUTPUT $MAP~OUTPUT&""
      setvar $MAP~MAP $MAP~MAP&"*    "&$MAP~OUTPUT&""
    end
    if (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] > 0)
      setvar $MAP~MAP $MAP~MAP&ANSI_5&"*    Fighters   : "&ANSI_11&SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC]&ANSI_5&" ("&SECTOR.FIGS.OWNER[$MAP~ADJ_SEC]&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$MAP~ADJ_SEC]&"]"
    end
    setvar $MAP~P 1
    setvar $MAP~OUTPUT "*"
    while ($MAP~P <= SECTOR.PLANETCOUNT[$MAP~ADJ_SEC])
      setvar $MAP~ISSHIELDED FALSE
      setvar $MAP~TEMP SECTOR.PLANETS[$MAP~ADJ_SEC][$MAP~P]
      getword $MAP~TEMP $MAP~TEST 1
      if ($MAP~TEST = "<<<<")
        setvar $MAP~ISSHIELDED TRUE
      end
      getword $MAP~TEMP $MAP~TYPE 2
      striptext $MAP~TYPE "("
      striptext $MAP~TYPE ")"
      if ($MAP~ISSHIELDED)
        getlength $MAP~TEMP $MAP~LENGTH
        cuttext $MAP~TEMP $MAP~TEMP 1 ($MAP~LENGTH - 15)
        cuttext $MAP~TEMP $MAP~TEMP 10 9999
        setvar $MAP~TEMP ANSI_12&"<<<< "&ANSI_10&"("&ANSI_14&$MAP~TYPE&ANSI_10&") "&ANSI_1&$MAP~TEMP&ANSI_12&" >>>> "&ANSI_2&"(Shielded)"
      else
        setvar $MAP~TEMP ANSI_2&$MAP~TEMP
      end
      if ($MAP~P = 1)
        setvar $MAP~TEMP ANSI_5&"     Planets "&ANSI_14&"  : "&$MAP~TEMP
        setvar $MAP~OUTPUT $MAP~OUTPUT&$MAP~TEMP&""
      else
        setvar $MAP~OUTPUT $MAP~OUTPUT&"                 "&$MAP~TEMP&""
      end
      if ($MAP~P < SECTOR.PLANETCOUNT[$MAP~ADJ_SEC])
        setvar $MAP~OUTPUT $MAP~OUTPUT&"*"
      end
      add $MAP~P 1
    end
    if (SECTOR.PLANETCOUNT[$MAP~ADJ_SEC] > 0)
      setvar $MAP~MAP $MAP~MAP&""&$MAP~OUTPUT&""
    end
    setvar $MAP~P 1
    if (SECTOR.TRADERCOUNT[$MAP~ADJ_SEC] > 0)
      setvar $MAP~MAP $MAP~MAP&ANSI_6&"*        Traders: "&ANSI_7
    end
    while ($MAP~P <= SECTOR.TRADERCOUNT[$MAP~ADJ_SEC])
      setvar $MAP~MAP $MAP~MAP&"*             "&ANSI_11&SECTOR.TRADERS[$MAP~ADJ_SEC][$MAP~P]
      add $MAP~P 1
    end
    setvar $MAP~P 1
    if (SECTOR.SHIPCOUNT[$MAP~ADJ_SEC] > 0)
      setvar $MAP~MAP $MAP~MAP&ANSI_6&"*       Ships   : "&ANSI_11&"("&SECTOR.SHIPCOUNT[$MAP~ADJ_SEC]&") Empty Ships"
    end
    setvar $MAP~SECTORS_ARRAY[$MAP~I] $MAP~MAP
    add $MAP~COUNT 1
    add $MAP~I 1
  end
  setvar $MAP~GRIDWARPCOUNT ($MAP~I - 1)
else
  setvar $MAP~MAP $MAP~MAP&ANSI_15&" ERROR WITH CURRENTSECTOR  "&ANSI_7
end
setvar $MAP~MAP $MAP~SECTORS_ARRAY[1]&"  "&$MAP~SECTORS_ARRAY[2]&"  "&$MAP~SECTORS_ARRAY[3]&"***"
setvar $MAP~DISPLAYSECTOR CURRENTSECTOR
gosub :DISPLAYSECTOR
setvar $MAP~MAP $MAP~MAP&$MAP~OUTPUT&"*"
setvar $MAP~MAP $MAP~MAP&$MAP~SECTORS_ARRAY[4]&"  "&$MAP~SECTORS_ARRAY[5]&"  "&$MAP~SECTORS_ARRAY[6]&"*"
return
:MAP~DISPLAYSECTOR


setvar $MAP~I $MAP~DISPLAYSECTOR
setvar $MAP~OUTPUT ANSI_10&"    Sector  "&ANSI_14&": "&ANSI_11&$MAP~I&ANSI_2&" in "
setvar $MAP~CONSTELLATION SECTOR.CONSTELLATION[$MAP~I]
if ($MAP~CONSTELLATION = "The Federation.")
  setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_10&$MAP~CONSTELLATION&"*"
else
  setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_1&$MAP~CONSTELLATION&"*"
end
if (SECTOR.BEACON[$MAP~I] <> "")
  setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"    Beacon  "&ANSI_14&": "&ANSI_12&SECTOR.BEACON[$MAP~I]&"*"
end
if (PORT.EXISTS[$MAP~I])
  setvar $MAP~CLASS PORT.CLASS[$MAP~I]
  setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"    Ports   "&ANSI_14&": "&ANSI_11&PORT.NAME[$MAP~I]&ANSI_14&", "&ANSI_5&"Class "&ANSI_11&$MAP~CLASS&" "
  if (($MAP~CLASS <> 0) and ($MAP~CLASS <> 9))
    setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"("
    if (PORT.BUYFUEL[$MAP~I])
      setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
    else
      setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
    end
    if (PORT.BUYORG[$MAP~I])
      setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
    else
      setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
    end
    if (PORT.BUYEQUIP[$MAP~I])
      setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&"B"
    else
      setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"S"
    end
    setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&")"
  end
  setvar $MAP~OUTPUT $MAP~OUTPUT&"*"
end
setvar $MAP~J 1
while ($MAP~J <= SECTOR.PLANETCOUNT[$MAP~I])
  setvar $MAP~ISSHIELDED FALSE
  setvar $MAP~TEMP SECTOR.PLANETS[$MAP~I][$MAP~J]
  getword $MAP~TEMP $MAP~TEST 1
  if ($MAP~TEST = "<<<<")
    setvar $MAP~ISSHIELDED TRUE
  end
  getword $MAP~TEMP $MAP~TYPE 2
  striptext $MAP~TYPE "("
  striptext $MAP~TYPE ")"
  if ($MAP~ISSHIELDED)
    getlength $MAP~TEMP $MAP~LENGTH
    cuttext $MAP~TEMP $MAP~TEMP 1 ($MAP~LENGTH - 15)
    cuttext $MAP~TEMP $MAP~TEMP 10 9999
    setvar $MAP~TEMP ANSI_12&"<<<< "&ANSI_10&"("&ANSI_14&$MAP~TYPE&ANSI_10&") "&ANSI_1&$MAP~TEMP&ANSI_12&" >>>> "&ANSI_2&"(Shielded)"
  else
    setvar $MAP~TEMP ANSI_2&$MAP~TEMP
  end
  if ($MAP~J = 1)
    setvar $MAP~TEMP ANSI_5&"    Planets "&ANSI_14&": "&$MAP~TEMP
    setvar $MAP~OUTPUT $MAP~OUTPUT&$MAP~TEMP&"*"
  else
    setvar $MAP~OUTPUT $MAP~OUTPUT&"              "&$MAP~TEMP&"*"
  end
  add $MAP~J 1
end
setvar $MAP~J 1
while ($MAP~J <= SECTOR.TRADERCOUNT[$MAP~I])
  setvar $MAP~TEMP SECTOR.TRADERS[$MAP~I][$MAP~J]
  setvar $MAP~TEMP ANSI_2&$MAP~TEMP
  if ($MAP~J = 1)
    setvar $MAP~TEMP ANSI_5&"    Traders "&ANSI_14&": "&$MAP~TEMP
    setvar $MAP~OUTPUT $MAP~OUTPUT&$MAP~TEMP&"*"
  else
    setvar $MAP~OUTPUT $MAP~OUTPUT&"              "&$MAP~TEMP&"*"
  end
  add $MAP~J 1
end
setvar $MAP~J 1
while ($MAP~J <= SECTOR.SHIPCOUNT[$MAP~I])
  setvar $MAP~TEMP SECTOR.SHIPS[$MAP~I][$MAP~J]
  setvar $MAP~TEMP ANSI_2&$MAP~TEMP
  if ($MAP~J = 1)
    setvar $MAP~TEMP ANSI_5&"      Ships "&ANSI_14&": "&$MAP~TEMP
    setvar $MAP~OUTPUT $MAP~OUTPUT&$MAP~TEMP&"*"
  else
    setvar $MAP~OUTPUT $MAP~OUTPUT&"              "&$MAP~TEMP&"*"
  end
  add $MAP~J 1
end
if (SECTOR.FIGS.QUANTITY[$MAP~I] > 0)
  setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"    Fighters"&ANSI_14&": "&ANSI_11&SECTOR.FIGS.QUANTITY[$MAP~I]&ANSI_5&" ("&SECTOR.FIGS.OWNER[$MAP~I]&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$MAP~I]&"]*"
end
setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_10&"    Warps to sector(s) "&ANSI_14&":  "
setvar $MAP~K 1
while (SECTOR.WARPS[$MAP~I][$MAP~K] > 0)
  if ($MAP~K <> 1)
    setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&" - "
  end
  getsectorparameter SECTOR.WARPS[$MAP~I][$MAP~K] "FIGSEC" $MAP~CHECK
  if ($MAP~CHECK = TRUE)
    setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&"["&SECTOR.WARPS[$MAP~I][$MAP~K]&"]"
  else
    setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&SECTOR.WARPS[$MAP~I][$MAP~K]
  end
  add $MAP~K 1
end
setvar $MAP~K 1
while (SECTOR.BACKDOORS[$MAP~I][$MAP~K] > 0)
  if ($MAP~K <> 1)
    setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&" - "
  else
    setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_12&"*    Backdoor from sector(s) "&ANSI_14&":  "
  end
  setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&SECTOR.BACKDOORS[$MAP~I][$MAP~K]
  add $MAP~K 1
end
setvar $MAP~OUTPUT $MAP~OUTPUT&"*"
return
:MAP~FORMATSECTOROWNER


setvar $MAP~MOST_RECENT_DATA FALSE
setvar $MAP~DATETIME DATE&" "&TIME
if ($MAP~DATETIME = SECTOR.UPDATED[$MAP~ADJ_SEC])
  setvar $MAP~MOST_RECENT_DATA TRUE
end
if ($MAP~MOST_RECENT_DATA = TRUE)
  if ((($MAP~ADJSECTOROWNER = "belong to your Corp") or ($MAP~ADJSECTOROWNER = "yours")) and (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] > 0))
    setsectorparameter $MAP~ADJ_SEC "FIGSEC" TRUE
    setvar $MAP~ISFIGGED TRUE
  else
    setsectorparameter $MAP~ADJ_SEC "FIGSEC" FALSE
    setvar $MAP~ISFIGGED FALSE
  end
  if ((SECTOR.ANOMOLY[$MAP~ADJ_SEC] = TRUE) and (((($MAP~ADJLIMPOWNER = "belong to your Corp") or ($MAP~ADJLIMPOWNER = "yours")) and (SECTOR.LIMPETS.QUANTITY[$MAP~ADJ_SEC] > 0))))
    setsectorparameter $MAP~ADJ_SEC "LIMPSEC" TRUE
    setvar $MAP~ISLIMPED TRUE
  else
    setsectorparameter $MAP~ADJ_SEC "LIMPSEC" FALSE
    setvar $MAP~ISLIMPED FALSE
  end
  if ((($MAP~ADJMINEOWNER = "belong to your Corp") or ($MAP~ADJMINEOWNER = "yours")) and (SECTOR.MINES.QUANTITY[$MAP~ADJ_SEC] > 0))
    setsectorparameter $MAP~ADJ_SEC "MINESEC" TRUE
  else
    setsectorparameter $MAP~ADJ_SEC "MINESEC" FALSE
  end
end

if ($MAP~ISFIGGED = TRUE) or ((($MAP~ADJSECTOROWNER = "belong to your Corp") or ($MAP~ADJSECTOROWNER = "yours")) and (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] > 0))
  setvar $MAP~TEXT "OURS"
  setvar $MAP~COLOR ANSI_14
else
  getword $MAP~ADJSECTOROWNER $MAP~ALIENCHECK 1
  if (($MAP~ADJ_SEC < 11) or ($MAP~ADJ_SEC = $MAP~STARDOCK))
    setvar $MAP~COLOR ANSI_9
    setvar $MAP~TEXT "FEDSPACE"
  elseif ($MAP~ADJ_SEC = $MAP~RYLOS)
    setvar $MAP~COLOR ANSI_9
    setvar $MAP~TEXT "RYLOS"
  elseif ($MAP~ADJ_SEC = $MAP~ALPHA_CENTAURI)
    setvar $MAP~COLOR ANSI_9
    setvar $MAP~TEXT "ALPHA"
  elseif ($MAP~ADJSECTOROWNER = "Rogue Mercenaries")
    setvar $MAP~COLOR ANSI_7
    setvar $MAP~TEXT "ROGUE"
  elseif ($MAP~ALIENCHECK = "the")
    setvar $MAP~COLOR ANSI_2
    setvar $MAP~TEXT "ALIEN"
    setvar $MAP~ISALIENS TRUE
  elseif ($MAP~ALIENCHECK = "The")
    setvar $MAP~COLOR ANSI_2
    setvar $MAP~TEXT "ALIEN"
    setvar $MAP~ISALIENS TRUE
  elseif (($MAP~ADJSECTOROWNER <> "") and ($MAP~ADJSECTOROWNER <> "Unknown"))
    setvar $MAP~HEADS TRUE
    getword $MAP~ADJSECTOROWNER $MAP~TEMP 3
    striptext $MAP~TEMP ","
    uppercase $MAP~TEMP
    setvar $MAP~TEXT $MAP~TEMP
    setvar $MAP~COLOR ANSI_12
  else
    setvar $MAP~TEXT "NONE"
    setvar $MAP~COLOR ANSI_13
  end
end
setvar $MAP~TEMP $MAP~TEXT
getlength $MAP~TEMP $MAP~TEMPLENGTH
setvar $MAP~LENGTH 10
if ($MAP~TEMPLENGTH >= $MAP~LENGTH)
  cuttext $MAP~TEMP $MAP~TEMP 1 $MAP~LENGTH
else
  while (($MAP~LENGTH - $MAP~TEMPLENGTH) > 0)
    if ($MAP~HEADS)
      setvar $MAP~TEMP $MAP~TEMP&" "
      setvar $MAP~HEADS FALSE
    else
      setvar $MAP~TEMP " "&$MAP~TEMP
      setvar $MAP~HEADS TRUE
    end
    getlength $MAP~TEMP $MAP~TEMPLENGTH
  end
end
return
:MAP~FORMAT_SECTOR_OWNER


setvar $MAP~MOST_RECENT_DATA FALSE
setvar $MAP~DATETIME DATE&" "&TIME
if ($MAP~DATETIME = SECTOR.UPDATED[$MAP~ADJ_SEC])
  setvar $MAP~MOST_RECENT_DATA TRUE
end
if ($MAP~MOST_RECENT_DATA = TRUE)
  if ((($MAP~ADJSECTOROWNER = "belong to your Corp") or ($MAP~ADJSECTOROWNER = "yours")) and (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] > 0))
    setsectorparameter $MAP~ADJ_SEC "FIGSEC" TRUE
    setvar $MAP~ISFIGGED TRUE
  else
    setsectorparameter $MAP~ADJ_SEC "FIGSEC" FALSE
    setvar $MAP~ISFIGGED FALSE
  end
  if ((SECTOR.ANOMOLY[$MAP~ADJ_SEC] = TRUE) and (((($MAP~ADJLIMPOWNER = "belong to your Corp") or ($MAP~ADJLIMPOWNER = "yours")) and (SECTOR.LIMPETS.QUANTITY[$MAP~ADJ_SEC] > 0))))
    setsectorparameter $MAP~ADJ_SEC "LIMPSEC" TRUE
    setvar $MAP~ISLIMPED TRUE
  else
    setsectorparameter $MAP~ADJ_SEC "LIMPSEC" FALSE
    setvar $MAP~ISLIMPED FALSE
  end
  if ((($MAP~ADJMINEOWNER = "belong to your Corp") or ($MAP~ADJMINEOWNER = "yours")) and (SECTOR.MINES.QUANTITY[$MAP~ADJ_SEC] > 0))
    setsectorparameter $MAP~ADJ_SEC "MINESEC" TRUE
  else
    setsectorparameter $MAP~ADJ_SEC "MINESEC" FALSE
  end
end

if ($MAP~ISFIGGED = TRUE) or ((($MAP~ADJSECTOROWNER = "belong to your Corp") or ($MAP~ADJSECTOROWNER = "yours")) and (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] > 0))
  setvar $MAP~TEXT "OURS"
  setvar $MAP~COLOR ANSI_14
else
  getword $MAP~ADJSECTOROWNER $MAP~ALIENCHECK 1
  if (($MAP~ADJ_SEC < 11) or ($MAP~ADJ_SEC = $MAP~STARDOCK))
    setvar $MAP~COLOR ANSI_9
    setvar $MAP~TEXT "FEDSPACE"
  elseif ($MAP~ADJ_SEC = $MAP~RYLOS)
    setvar $MAP~COLOR ANSI_9
    setvar $MAP~TEXT "RYLOS"
  elseif ($MAP~ADJ_SEC = $MAP~ALPHA_CENTAURI)
    setvar $MAP~COLOR ANSI_9
    setvar $MAP~TEXT "ALPHA"
  elseif ($MAP~ADJSECTOROWNER = "Rogue Mercenaries")
    setvar $MAP~COLOR ANSI_7
    setvar $MAP~TEXT "ROGUE"
  elseif ($MAP~ALIENCHECK = "the")
    setvar $MAP~COLOR ANSI_2
    setvar $MAP~TEXT "ALIEN"
    setvar $MAP~ISALIENS TRUE
  elseif ($MAP~ALIENCHECK = "The")
    setvar $MAP~COLOR ANSI_2
    setvar $MAP~TEXT "ALIEN"
    setvar $MAP~ISALIENS TRUE
  elseif (($MAP~ADJSECTOROWNER <> "") and ($MAP~ADJSECTOROWNER <> "Unknown"))
    setvar $MAP~HEADS TRUE
    getword $MAP~ADJSECTOROWNER $MAP~TEMP 3
    striptext $MAP~TEMP ","
    uppercase $MAP~TEMP
    setvar $MAP~TEXT $MAP~TEMP
    setvar $MAP~COLOR ANSI_12
  else
    setvar $MAP~TEXT "NONE"
    setvar $MAP~COLOR ANSI_13
  end
end
setvar $MAP~TEMP $MAP~TEXT
getlength $MAP~TEMP $MAP~TEMPLENGTH
setvar $MAP~LENGTH 10
if ($MAP~TEMPLENGTH >= $MAP~LENGTH)
  cuttext $MAP~TEMP $MAP~TEMP 1 $MAP~LENGTH
else
  while (($MAP~LENGTH - $MAP~TEMPLENGTH) > 0)
    if ($MAP~HEADS)
      setvar $MAP~TEMP $MAP~TEMP&" "
      setvar $MAP~HEADS FALSE
    else
      setvar $MAP~TEMP " "&$MAP~TEMP
      setvar $MAP~HEADS TRUE
    end
    getlength $MAP~TEMP $MAP~TEMPLENGTH
  end
end
return
