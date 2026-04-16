:MAP~DISPLAYADJACENTGRIDANSI
setvar $MAP~I 1
isnumber $MAP~TEST CURRENTSECTOR
if ($MAP~TEST)
  if (SECTOR.WARPS[CURRENTSECTOR][$MAP~I] > 0)
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
    echo ANSI_13 "* (" ANSI_10 $MAP~I ANSI_13 ")" ANSI_15 " - " ANSI_13 "<" ANSI_14 SECTOR.WARPS[CURRENTSECTOR][$MAP~I] ANSI_13 ">" $MAP~ADJUST ANSI_15 " Warps: " ANSI_7 SECTOR.WARPCOUNT[$MAP~ADJ_SEC]
    getsectorparameter $MAP~ADJ_SEC "FIGSEC" $MAP~ISFIGGED
    getsectorparameter $MAP~ADJ_SEC "MSLSEC" $MAP~ISMSL
    if ($MAP~ISFIGGED = "")
      setvar $MAP~ISFIGGED FALSE
    end
    if ($MAP~ISMSL = "")
      setvar $MAP~ISMSL FALSE
    end
    setvar $MAP~ADJSECTOROWNER SECTOR.FIGS.OWNER[$MAP~ADJ_SEC]
    if ($MAP~ISFIGGED or ((($MAP~ADJSECTOROWNER = "belong to your Corp") or ($MAP~ADJSECTOROWNER = "yours")) and (SECTOR.FIGS.QUANTITY[$MAP~ADJ_SEC] > 0)))
      echo ANSI_15 " Owner: " ANSI_14 "   OURS   "
    else
      getword $MAP~ADJSECTOROWNER $MAP~ALIENCHECK 1
      if (($MAP~ADJ_SEC < 11) or ($MAP~ADJ_SEC = $MAP~STARDOCK))
        echo ANSI_15 " Owner: " ANSI_9 " FEDSPACE "
      elseif ($MAP~ADJ_SEC = $MAP~RYLOS)
        echo ANSI_15 " Owner: " ANSI_9 "  RYLOS   "
      end
      elseif ($MAP~ADJ_SEC = $MAP~ALPHA_CENTAURI)
        echo ANSI_15 " Owner: " ANSI_9 "  ALPHA   "
      elseif ($MAP~ADJSECTOROWNER = "Rogue Mercenaries")
        echo ANSI_15 " Owner: " ANSI_7 "  ROGUE   "
      elseif ($MAP~ALIENCHECK = "the")
        echo ANSI_15 " Owner: " ANSI_2 "  ALIENS  "
      elseif ($MAP~ALIENCHECK = "The")
        echo ANSI_15 " Owner: " ANSI_2 "  ALIENS  "
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
        echo ANSI_15 " Owner: " ANSI_12 $MAP~TEMP
      else
        echo ANSI_15 " Owner: " ANSI_13 "   NONE   "
    end
    isnumber $MAP~ISNUMBER SECTOR.ANOMOLY[$MAP~ADJ_SEC]
    if ($MAP~ISNUMBER)
      if (SECTOR.ANOMOLY[$MAP~ADJ_SEC])
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
      setvar $MAP~DENS SECTOR.DENSITY[$MAP~ADJ_SEC]
      getlength SECTOR.DENSITY[$MAP~ADJ_SEC] $MAP~DENSLENGTH
      if ($MAP~DENSLENGTH >= 9)
        echo "HIGH      "
      else
        setvar $MAP~D $MAP~DENSLENGTH
        while ($MAP~D <= 10)
          setvar $MAP~DENS $MAP~DENS&" "
          add $MAP~D 1
        end
        echo $MAP~DENS
      end
    end

    if ($MAP~ISMSL = TRUE)
      echo ANSI_15 "[" ANSI_14 "MSL" ANSI_15 "]" ANSI_7
    end
    setvar $MAP~P 1
    if (SECTOR.PLANETCOUNT[$MAP~ADJ_SEC] > 0)
      echo ANSI_15 "*        Planet(s): " ANSI_7
    end
    while ($MAP~P <= SECTOR.PLANETCOUNT[$MAP~ADJ_SEC])
      echo "*             " ANSI_14 SECTOR.PLANETS[$MAP~ADJ_SEC][$MAP~P]
      add $MAP~P 1
    end
    setvar $MAP~P 1
    if (SECTOR.TRADERCOUNT[$MAP~ADJ_SEC] > 0)
      echo ANSI_15 "*        Trader(s): " ANSI_7
    end
    while ($MAP~P <= SECTOR.TRADERCOUNT[$MAP~ADJ_SEC])
      echo "*             " ANSI_14 SECTOR.TRADERS[$MAP~ADJ_SEC][$MAP~P]
      add $MAP~P 1
    end
    add $MAP~I 1
  end
  setvar $MAP~GRIDWARPCOUNT ($MAP~I - 1)
else
  echo ANSI_15 " ERROR WITH CURRENTSECTOR  " ANSI_7

end
echo "**" CURRENTANSILINE
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
  setvar $MAP~ISSHIELDED FALSE
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
if (SECTOR.FIGS.QUANTITY[$MAP~I] > 0)
  setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_5&"    Fighters"&ANSI_14&": "&ANSI_11&SECTOR.FIGS.QUANTITY[$MAP~I]&ANSI_5&" ("&SECTOR.FIGS.OWNER[$MAP~I]&") "&ANSI_6&"["&SECTOR.FIGS.TYPE[$MAP~I]&"]*"
end
setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_10&"    Warps to sector(s) "&ANSI_14&":  "
setvar $MAP~K 1
while (SECTOR.WARPS[$MAP~I][$MAP~K] > 0)
  if ($MAP~K <> 1)
    setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_2&" - "
  end
  setvar $MAP~OUTPUT $MAP~OUTPUT&ANSI_11&SECTOR.WARPS[$MAP~I][$MAP~K]
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
setvar $MAP~OUTPUT $MAP~OUTPUT&"**"
return
:MAP~REMOVEFIGFROMDATA

getsectorparameter $MAP~TARGET "FIGSEC" $MAP~CHECK
if ($MAP~CHECK = TRUE)
  getsectorparameter 2 "FIG_COUNT" $MAP~FIGCOUNT
  setsectorparameter 2 "FIG_COUNT" ($MAP~FIGCOUNT - 1)
end
setsectorparameter $MAP~TARGET "FIGSEC" FALSE
return
:MAP~ADDFIGTODATA
setsectorparameter $MAP~TARGET "FIGSEC" TRUE
return
