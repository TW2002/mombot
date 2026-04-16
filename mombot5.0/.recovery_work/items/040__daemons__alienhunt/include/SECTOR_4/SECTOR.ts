:SECTOR~GETTRADERS
getwordpos $SECTOR~SECTORDATA $SECTOR~POSTRADER "[0m[33mTraders [1m:"
if ($SECTOR~POSTRADER > 0)
  gettext $SECTOR~SECTORDATA $SECTOR~TRADERDATA "[0m[33mTraders [1m:" "[0m[1;32mWarps to Sector(s) "
  setvar $SECTOR~TRADERDATA $SECTOR~STARTLINE&$SECTOR~TRADERDATA
  gettext $SECTOR~TRADERDATA $SECTOR~TEMP $SECTOR~STARTLINE $SECTOR~ENDLINE
  setvar $SECTOR~REALTRADERCOUNT 0
  setvar $SECTOR~CORPIECOUNT 0
  setvar $SECTOR~DEFENDERSHIPS 0
  while ($SECTOR~TEMP <> "")
    getlength $SECTOR~STARTLINE&$SECTOR~TEMP&$SECTOR~ENDLINE $SECTOR~LENGTH
    cuttext $SECTOR~TRADERDATA $SECTOR~TRADERDATA ($SECTOR~LENGTH + 1) 9999
    striptext $SECTOR~TEMP $SECTOR~STARTLINE
    striptext $SECTOR~TEMP $SECTOR~ENDLINE
    striptext $SECTOR~TEMP "[0m          "
    striptext $SECTOR~TEMP "[0m[33mTraders [1m:"
    setvar $SECTOR~J 1
    setvar $SECTOR~ISFOUND FALSE

    if (($PLAYER~CURRENT_SECTOR <= 10) or ($PLAYER~CURRENT_SECTOR = $MAP~STARDOCK) or ($PLAYER~CURRENT_SECTOR = STARDOCK))
      while (($SECTOR~J < $PLAYER~RANKSLENGTH) and ($SECTOR~ISFOUND = FALSE))
        getwordpos $SECTOR~TEMP $SECTOR~POS $PLAYER~RANKS[$SECTOR~J]
        if ($SECTOR~POS > 0)
          getlength $PLAYER~RANKS[$SECTOR~J] $SECTOR~LENGTH
          cuttext $SECTOR~TEMP $SECTOR~TEMP ($SECTOR~POS + ($SECTOR~LENGTH + 1)) 9999
          if ($SECTOR~J <= 10)
            setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][2] TRUE
          else
            setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][2] FALSE
          end
          setvar $SECTOR~ISFOUND TRUE
        end
        add $SECTOR~J 1
      end
    else
      setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][2] FALSE
    end
    getwordpos $SECTOR~TEMP $SECTOR~POS "[0;32m w/"
    getwordpos $SECTOR~TEMP $SECTOR~POS2 "[0;35m[[31mOwned by[35m]"
    getwordpos $SECTOR~TEMP $SECTOR~POS3 #27&"[0m      "&#27&"[32m     in "&#27

    if (($SECTOR~POS > 0) and ($SECTOR~POS2 <= 0))
      getwordpos $SECTOR~TEMP $SECTOR~POS "[[1;36m"
      if ($SECTOR~POS > 0)
        gettext $SECTOR~TEMP $SECTOR~TEMPCORP "[[1;36m" "[0;34m]"
        striptext $SECTOR~TEMPCORP ""
      else
        setvar $SECTOR~TEMPCORP 99999
      end
      gettext $SECTOR~TEMP $SECTOR~NUMBER_OF_FIGHTERS " w/ [1;33m" "[0;32m ftrs"
      striptext $SECTOR~NUMBER_OF_FIGHTERS ","
      replacetext $SECTOR~TEMP "[0;34m" "[34m"
      getwordpos $SECTOR~TEMP $SECTOR~POS "[34m"
      cuttext $SECTOR~TEMP $SECTOR~TEMP 1 $SECTOR~POS
      striptext $SECTOR~TEMP ""
      lowercase $SECTOR~TEMP
      striptext $SECTOR~TEMP "[36m"
      striptext $SECTOR~TEMP "[31m"
      striptext $SECTOR~TEMP "36m"
      striptext $SECTOR~TEMP "31m"
      setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)] $SECTOR~TEMP
      setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][1] $SECTOR~TEMPCORP
      setvar $PLAYER~TRADERS[($SECTOR~REALTRADERCOUNT + 1)][4] $SECTOR~NUMBER_OF_FIGHTERS
      if ($SECTOR~TEMPCORP = $PLAYER~CORP)
        add $SECTOR~CORPIECOUNT 1
      end
      add $SECTOR~REALTRADERCOUNT 1
    end

    if (($SECTOR~POS3 > 0) and (($SECTOR~TEMPCORP <> $PLAYER~CORP) and ($PLAYER~OVERRIDE <> TRUE)))
      gettext $SECTOR~TEMP $SECTOR~SHIPNAME "(" ")"

      if ($SECTOR~SHIPNAME = "")
        gettext $SECTOR~SHIPNAME $SECTOR~SHIPNAME "(" ")"
      end

      gettext $SECTOR~SHIPNAME&"ENDOFSHIP" $SECTOR~SHIPNAME "m" "ENDOFSHIP"
      setvar $SECTOR~ISFOUND FALSE
      setvar $SECTOR~S 1
      setvar $SECTOR~ISDEFENDER FALSE
      replacetext $SECTOR~SHIPNAME ";" "m"
      striptext $SECTOR~SHIPNAME "30m"
      striptext $SECTOR~SHIPNAME "31m"
      striptext $SECTOR~SHIPNAME "32m"
      striptext $SECTOR~SHIPNAME "33m"
      striptext $SECTOR~SHIPNAME "34m"
      striptext $SECTOR~SHIPNAME "35m"
      striptext $SECTOR~SHIPNAME "36m"
      striptext $SECTOR~SHIPNAME "37m"
      striptext $SECTOR~SHIPNAME "38m"
      striptext $SECTOR~SHIPNAME "39m"
      striptext $SECTOR~SHIPNAME "40m"
      striptext $SECTOR~SHIPNAME "41m"
      striptext $SECTOR~SHIPNAME "42m"
      striptext $SECTOR~SHIPNAME "43m"
      striptext $SECTOR~SHIPNAME "44m"
      striptext $SECTOR~SHIPNAME "45m"
      striptext $SECTOR~SHIPNAME "46m"
      striptext $SECTOR~SHIPNAME "47m"
      striptext $SECTOR~SHIPNAME "[0;30;47m"
      striptext $SECTOR~SHIPNAME "[32;40m"
      striptext $SECTOR~SHIPNAME "[0;"
      striptext $SECTOR~SHIPNAME "[1;"
      striptext $SECTOR~SHIPNAME "[0m"
      striptext $SECTOR~SHIPNAME "[1m"
      striptext $SECTOR~SHIPNAME #13
      striptext $SECTOR~SHIPNAME #27
      striptext $SECTOR~SHIPNAME ""
      striptext $SECTOR~SHIPNAME "["

      if ($SHIP~SHIPCOUNTER <= 0)
        gosub :SHIP~LOADSHIPINFO
      end
      while (($SECTOR~ISFOUND = FALSE) and ($SECTOR~S < $SHIP~SHIPCOUNTER))
        striptext $SHIP~SHIPLIST[$SECTOR~S] "["
        getwordpos $SECTOR~SHIPNAME $SECTOR~POS $SHIP~SHIPLIST[$SECTOR~S]

        if ($SECTOR~POS > 0)

          setvar $SECTOR~ISFOUND TRUE
          setvar $SECTOR~ISDEFENDER $SHIP~SHIPLIST[$SECTOR~S][8]
          setvar $SECTOR~TARGET_DEFENSE_ODDS $SHIP~SHIPLIST[$SECTOR~S][2]
          setvar $SECTOR~TARGET_SHIELDS $SHIP~SHIPLIST[$SECTOR~S][1]
        end
        add $SECTOR~S 1
      end
      setvar $PLAYER~TRADERS[$SECTOR~REALTRADERCOUNT][3] $SECTOR~SHIPNAME
      if ($SECTOR~ISDEFENDER = TRUE)
        setvar $PLAYER~TRADERS[$SECTOR~REALTRADERCOUNT][1] 100000

        add $SECTOR~DEFENDERSHIPS 1
      end
      getwordpos $SECTOR~SHIPNAME $SECTOR~ISTARGETEDSHIP $PLAYER~TARGETINGSHIP
      if ($SECTOR~ISTARGETEDSHIP > 0)
        setvar $PLAYER~TRADERS[$SECTOR~REALTRADERCOUNT][3] TRUE

        add $SECTOR~TARGETEDSHIPS 1
      end
    end
    gettext $SECTOR~TRADERDATA $SECTOR~TEMP $SECTOR~STARTLINE $SECTOR~ENDLINE
  end
else
  setvar $SECTOR~REALTRADERCOUNT 0
  setvar $SECTOR~CORPIECOUNT 0
  setvar $SECTOR~DEFENDERSHIPS 0
end
return
