loadvar $BOT_NAME
:SETTRIGGERS

settextlinetrigger FINDFIG :FINDFIG "Deployed Fighters Report Sector"
settextlinetrigger FINDFIG2 :FINDFIG2 "Your fighters in sector "
pause
:FINDFIG2

killalltriggers
getword CURRENTLINE $SPOOF 1
if ($SPOOF <> "Your")
  goto :SETTRIGGERS
end
getword CURRENTLINE $FIGHIT 5
striptext $FIGHIT ":"
setvar $NEAR "f"
setvar $SOURCE $FIGHIT
goto :NEAR_HIT
:FINDFIG

killalltriggers
getword CURRENTLINE $SPOOF 1
if ($SPOOF <> "Deployed")
  goto :SETTRIGGERS
end
getwordpos CURRENTLINE $POS " is attacking!"
if ($POS <= 0)
  goto :SETTRIGGERS
end
getword CURRENTLINE $FIGHIT 5
striptext $FIGHIT ":"
setvar $NEAR "f"
setvar $SOURCE $FIGHIT
:NEAR_HIT

getsectorparameter $SOURCE "FIGSEC" $ISFIGGED
setvar $BREADTH_MODE "forward"
gosub :BREADTH_SEARCH
if ($RETURN_DATA <> "")
  send "'*{" $BOT_NAME "}*  - "&$RETURN_DATA&"**"
end
goto :SETTRIGGERS
:BREADTH_SEARCH




setvar $I 1
getnearestwarps $NEARARRAY $SOURCE
while ($I <= $NEARARRAY)
  setvar $FOCUS $NEARARRAY[$I]
  getsectorparameter $FOCUS "FIGSEC" $ISFIGGED2

  if (($ISFIGGED2 = TRUE) and ($SOURCE <> $FOCUS))
    getcourse $COURSE $SOURCE $FOCUS
    setvar $I 1
    setvar $FCOUNT 0
    setvar $DIRECTIONS ""
    if ($COURSE = 1)
      while (SECTOR.WARPS[$SOURCE][$I] > 0)
        setvar $TEMPCHECK SECTOR.WARPS[$SOURCE][$I]
        getsectorparameter $TEMPCHECK "FIGSEC" $ISFIGGED3
        if ($ISFIGGED3)
          setvar $DIRECTIONS $DIRECTIONS&$TEMPCHECK&" "
          add $FCOUNT 1
        end
        add $I 1
      end
      if ($FCOUNT > 1)
        setvar $RETURN_DATA "Adjacent Figs to "&$SOURCE&" are [ "&$DIRECTIONS&"] "
      else
        setvar $RETURN_DATA "Adjacent Fig to "&$SOURCE&" is [ "&$DIRECTIONS&"] "
      end
    else
      setvar $COURSELENGTH ($COURSE + 1)
      while ($I <= $COURSELENGTH)
        setvar $DIRECTIONS $DIRECTIONS&$COURSE[$I]&" "
        add $I 1
      end
      setvar $RETURN_DATA "Nearest Fig to "&$SOURCE&" is "&$FOCUS&" ("&$COURSE&" hops)  << "&$DIRECTIONS&" >> "
    end
    return
  end

  add $I 1
end



setvar $RETURN_DATA "Nothing found for that search."
return
