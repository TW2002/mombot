





































loadvar $BOT_NAME
loadvar $USER_COMMAND_LINE
loadvar $PARM1
loadvar $PARM2
loadvar $PARM3
loadvar $PARM4
loadvar $PARM5
loadvar $PARM6
loadvar $PARM7
loadvar $PARM8

getword $USER_COMMAND_LINE $PARM1 1
getword $USER_COMMAND_LINE $PARM2 2
getword $USER_COMMAND_LINE $PARM3 3
getword $USER_COMMAND_LINE $PARM4 4
getword $USER_COMMAND_LINE $PARM5 5
getword $USER_COMMAND_LINE $PARM6 6
getword $USER_COMMAND_LINE $PARM7 7
getword $USER_COMMAND_LINE $PARM8 8

if ($PARM1 = "help")
  send "'*{" $BOT_NAME "} - news [category] {r}*"
  send " Categories Allowed:*"
  send "    rep         - Overall reporting of events in the Log*"
  send "    foton       - Lists fotons fired*"
  send "    tow         - Who was towed*"
  send "    ports       - Port activity (construction, demolition, Openings)*"
  send "    planets     - Who popped planet(s) and how many*"

  send "    corp        - Corporate news, formations, hirings, firings, etc.*"
  send "    fed         - Awarded Commish, Bounties*"
  send "    pods        - Itemized list of who podded*"

  send "    overloads   - List of sectors with overloaded planets*"
  send "    announce    - Reporting of any announcements made*"
  send "                *"
  send " Refresh command line params:*"
  send "    r           - does a refresh using current game date*"
  send "    yest        - does a refresh of previous day game date data**"
  halt
end
:READ_NEWS_PAPER

setvar $NEWS_PARAM1 $PARM1
setvar $NEWS_PARAM2 $PARM2


setvar $NEWS_VERSION "v2.0"

setvar $UNDER_CONSTRUCTION "    *    Feature Currently Not Implemented*     *"
setvar $NEWS_HEADER "-------------=[Lonestar's M()M Dailies News Reader "&$NEWS_VERSION&"]=-------------*"
setvar $UNIVERSAL_FILE_ERR "    *    Problem Reading Data File*    *    "
setvar $UNEXPECTED_EOF "** '{"&$BOT_NAME&"} - Unexpected End Of Array. Halting.*"
setvar $NEWS_EMPTY "[32mNo log entries today."

setvar $NEWS_VALIDATED FALSE
setvar $NEWS_FOOTER ""
setvar $NEWS_FILE "_MOM_"&GAMENAME&".news"

setvar $FILE_HEADER ""
setvar $NEWS_READ FALSE
loadvar $NEWS_YEST

setvar $ACTUALLINES 0

gosub :PLAYER~QUIKSTATS
setvar $STARTINGLOCAL $PLAYER~CURRENT_PROMPT

if (($STARTINGLOCAL <> "Citadel") and ($STARTINGLOCAL <> "Command"))
  setvar $switchboard~message "Must start at citadel or command prompt*"
  gosub :switchboard~switchboard
  halt
end


if (($NEWS_PARAM1 = "yest") or ($NEWS_PARAM2 = "yest"))
  setvar $NEWS_YEST TRUE
  gosub :LOG_2_FILE
elseif (($NEWS_PARAM1 = "r") or ($NEWS_PARAM2 = "r"))
  setvar $NEWS_YEST FALSE
  gosub :LOG_2_FILE
else
  fileexists $NEWS_FILE_CHK $NEWS_FILE
  if ($NEWS_FILE_CHK = FALSE)
    gosub :LOG_2_FILE
  end

end
gosub :FILE_2_ARRAY
gosub :FORMAT_FOOTER
gosub :VALIDATE

send "'*"
waitfor "Comm-link open on sub-space band"

send $NEWS_HEADER

if ($NEWS_VALIDATED = FALSE)
  send "     *      No News To Report*     *     *"
elseif (($NEWS_PARAM1 = "rep") or ($NEWS_PARAM1 = 0) or ($NEWS_PARAM1 = "r") or ($NEWS_PARAM1 = "yest"))
  gosub :OVERLOAD
  send $UMASS_RESULTS&"    *"
  gosub :TOW_DETAIL
  send $TOWRESULTS&"       *"
  gosub :PORT_AUTHORITY
  send $PORTRESULTS&"      *"
  gosub :PLANETS_POPPED
  send $POPPEDRESULTS&"     *"
  gosub :PHOTONS_FIRED
  send $LAUNCHEDRESULTS&"    *"
  gosub :PODINGSS
  send $PODRESULTS&"        *"
  gosub :ANNOUNCED
  send $ANNONRESULTS&"      *"
  gosub :CORPORATE
  send $CORPRESULTS&"       *"
  gosub :FED
  send $FEDRESULTS&"        *"
elseif ($NEWS_PARAM1 = "foton")
  gosub :PHOTONS_LIST
  send $PHOTONRESULTS
elseif ($NEWS_PARAM1 = "tow")
  gosub :TOW_DETAIL
  send $TOWRESULTS&"       *"
elseif ($NEWS_PARAM1 = "ports")
  gosub :PORT_AUTHORITY
  send $PORTRESULTS&"      *"
elseif ($NEWS_PARAM1 = "planets")
  gosub :PLANETS_POPPED
  send $POPPEDRESULTS&"    *"
elseif ($NEWS_PARAM1 = "obits")
  send $UNDER_CONSTRUCTION
elseif ($NEWS_PARAM1 = "pods")
  gosub :PODINGSS
  send $PODRESULTS&"        *"
elseif ($NEWS_PARAM1 = "corp")
  gosub :CORPORATE
  send $CORPRESULTS&"       *"
elseif ($NEWS_PARAM1 = "invasions")
  send $UNDER_CONSTRUCTION
elseif ($NEWS_PARAM1 = "overload")
  gosub :OVERLOAD
  send $UMASS_RESULTS&"    *"
elseif ($NEWS_PARAM1 = "announce")
  gosub :ANNOUNCED
  send $ANNONRESULTS&"     *"
elseif ($NEWS_PARAM1 = "fed")
  gosub :FED
  send $FEDRESULTS&"        *"
else
  send "    *    SYNTAX ERROR!*      *"


end
send $NEWS_FOOTER&"** "
halt
:PODINGSS

setvar $IDX 1
setvar $PODRESULTS ""
setvar $PODSIZE 20
setvar $PODDINGS 10

setarray $PODS $PODSIZE $PODDINGS
setvar $PODCNT 0
if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[0;32m was on the pl"
      if ($POS <> 0)
        setvar $I 1
        setvar $TRDERRESP " N/A  "
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "[0;32m was"

        while ($I <= "($IDX+10")
          setvar $CTLINE $NEWS_ARRAY[$I]
          getwordpos $CLINE $POS "DESTROYED[32m the planet"
          if ($POS <> 0)
            gettext $CLINE $TRADERRESP "[1;36m" "[5;31m"
            goto :RESP_SRCH_DONE
          end
          add $I 1
        end
        :RESP_SRCH_DONE
        setvar $I 1
        while ($I <= $POSSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Was on a planet Blown-up by: "&$TRADERRESP
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Was on a planet Blown-up by: "&$TRADERRESP
            goto :NEXT_PODDING
          end
        end
      end

      getwordpos $CURRENTLINE $POS "[31mGOT BLOWN UP TOO!"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" " [31mGOT"
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Destroyed a Planet and got blown up too!"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Destroyed a Planet and got blown up too!"
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[32m by collision with a Nav"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "'s ["
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Collided with a Navigational Hazard!"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Collided with a Navigational Hazard!"
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[32m by a Corbomite Reaction!"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "'s "
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Ship was Destroyed by a Corbomite Reaction!"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Ship was Destroyed by a Corbomite Reaction!"
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[32m while invading [1;36m"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "'s [0"
        gettext $CURRENTLINE $PLANETOID "invading [1;36m" "[0;32m!"
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Ship was Destroyed Invading "&$PLANETOID&"!"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Ship was Destroyed Invading "&$PLANETOID&"!"
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "destroyed[32m by a Quasar"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "'s ["
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Ship was Destroyed by a Quasar Cannon!"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Ship was Destroyed by a Quasar Cannon!"
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[0;32m's fighters!"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "'s ["
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" was destroyed by fighters!"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" was destroyed by fighters!"
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[5;31m DESTROYED [1;36m"
      if ($POS <> 0)
        getwordpos $CURRENTLINE $POS "[1;36mCorp #[33m"
        if ($POS <> 0)

          goto :NEXT_PODDING
        end
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "DESTROYED [1;36m" "'s "
        gettext $CURRENTLINE $PODDER "[1;36m" "[5;31m"
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Ship Destroyed by "&$PODDER
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Ship Destroyed by "&$PODDER
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS " [0;32msurrendered a"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE

        gettext $CURRENTLINE $TRADER "[1;36m" " [0;32msurrendered a"
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" surrendered a ship!"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" "&$SPEACIAL
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[32m by atomic fusion!"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "'s ["
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Ship was Destroyed by atomic fusion"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Ship was Destroyed by atomic fusion!"
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "by [1;36mCaptain Zyrain"
      if ($POS <> 0)
        setvar $I 1
        add $PODCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "'s ["
        while ($I <= $PODSIZE)
          if ($PODS[$I] = $TRADER)
            setvar $II 1
            while ($II <= $PODDINGS)
              if ($PODS[$I][$II] = 0)
                setvar $PODS[$I][$II] $TIMECODE&" Ship was Destroyed by Captain Zyrain!"
                goto :NEXT_PODDING
              end
              add $II 1
            end
          elseif ($PODS[$I] = 0)
            setvar $PODS[$I] $TRADER
            setvar $PODS[$I][1] $TIMECODE&" Ship was Destroyed by Captain Zyrain!"
            goto :NEXT_PODDING
          end
          add $I 1
        end
      end
    end
    :NEXT_PODDING
    add $IDX 1
  end

  setvar $PODRESULTS "Possible Poddings:*"
  setvar $I 1

  while ($I <= $PODSIZE)
    if ($PODS[$I] <> 0)
      setvar $II 1
      setvar $PODRESULTS $PODRESULTS&"           "&$PODS[$I]&"*"
      while ($II <= 10)
        if ($PODS[$I][$II] <> 0)
          setvar $PODRESULTS $PODRESULTS&"              "&$PODS[$I][$II]&"*"
        end
        add $II 1
      end
    end
    add $I 1
  end

else
  setvar $PODRESULTS $UNIVERSAL_FILE_ERR
end

return
:FED
setvar $IDX 1
setvar $FEDRESULTS ""
setvar $BOUNTYSIZE 50
setarray $BOUNTIES $BOUNTYSIZE
setvar $BOUNTYCNT 0
setvar $COMMISHSIZE 50
setarray $COMMISH $COMMISHSIZE
setvar $COMMISHCNT 0

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[33mThe Federation hereby posts"
      if ($POS <> 0)
        add $BOUNTYCNT 1
        gettext $CURRENTLINE $AMOUNT "of [1m" "[0;33m credits"
        setvar $I ($IDX + 1)
        while ($I <= $LINES)
          setvar $TRADERSEARCH $NEWS_ARRAY[$I]
          getwordpos $TRADERSEARCH $POS "[33m  for the destruction of"
          if ($POS <> 0)
            gettext $TRADERSEARCH $TRADER "of [1;36m" " [0;33mship!"
            goto :GOT_TRADER
          end
          add $I 1
        end
        setvar $TRADER "-- Not Known --"
        :GOT_TRADER
        setvar $I 1
        while ($I <= $BOUNTYSIZE)
          if ($BOUNTIES[$I] <> 0)
            setvar $BOUNTIES[$I] $TRADER&" for "&$AMOUNT
            goto :NEXT_FED_ITEM
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[31m was awarded a Federal"
      if ($POS <> 0)
        add $COMMISHCNT 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;32m" "[31m was"
        setvar $I 1
        while ($I <= $COMMISHSIZE)
          if ($COMMISH[$I] <> 0)
            setvar $COMMISH[$I] $TIMECODE&" - "&$TRADER
            goto :NEXT_FED_ITEM
          end
          add $I 1
        end
      end
    end
    :NEXT_FED_ITEM
    add $IDX 1
  end

  if ($BOUNTYCNT > 0)
    setvar $FEDRESULTS $BOUNTYCNT&" Federal Bounties Posted:*"
    setvar $I 1
    while ($I <= $BOUNTYSIZE)
      if ($BOUNTIES[$I] <> 0)
        setvar $FEDRESULTS $FEDRESULTS&"                               "&$BOUNTIES[$I]&"*"
      end
      add $I 1
    end
    setvar $FEDRESULTS $FEDRESULTS&"         *"
  else
    setvar $FEDRESULTS "Federal Bounties Posted:        None*     *"
  end
  if ($COMMISHCNT > 0)
    setvar $FEDRESULTS $FEDRESULTS&$COMMISHCNT&" Federal Commissions Issued:*"
    setvar $I 1
    while ($I <= $COMMISHSIZE)
      if ($COMMISH[$I] <> 0)
        setvar $FEDRESULTS $FEDRESULTS&"                               "&$COMMISH[$I]&"*"
      end
      add $I 1
    end
  else
    setvar $FEDRESULTS $FEDRESULTS&"Federal Commissions Issued:     None*"
  end
else
  setvar $FEDRESULTS $UNIVERSAL_FILE_ERR
end
return
:CORPORATE

setvar $IDX 1
setvar $CORPRESULTS ""
setvar $CORPS_NEW 0
setvar $CORPARRAYSIZE 5
setvar $CORPMEMBERSIZE 5
setarray $CORPORATIONS $CORPARRAYSIZE $CORPMEMBERSIZE
setvar $FIREDSIZE 20
setarray $FIRED $FIREDSIZE
setvar $FIREDCNT 0

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "name of [1;33m"
      if ($POS <> 0)
        add $CORPS_NEW 1
        setvar $I 1
        gosub :TIME_DECODE
        while ($I <= $CORPARRAYSIZE)
          if ($CORPORATIONS[$I] = 0)
            gettext $CURRENTLINE $TRADER "[1;36m" "[0;32m created"
            gettext $CURRENTLINE $CORPNAME "of [1;33m" "[0;32m."
            setvar $CORPORATIONS[$I] $CORPNAME
            setvar $CORPORATIONS[$I][1] $TIMECODE&" "&$TRADER&" Created Corp"
            goto :NEXT_CORPITEM
          end
          add $I 1
        end
        goto :NEXT_CORPITEM
      end

      getwordpos $CURRENTLINE $POS "[0;32m joined up with"
      if ($POS <> 0)
        gettext $CURRENTLINE $CORPNAME "with [1;33m" "[0;32m."
        gettext $CURRENTLINE $TRADER "[1;36m" "[0;32m joined"
        gosub :TIME_DECODE
        setvar $I 1
        while ($I <= $CORPARRAYSIZE)
          if ($CORPNAME = $CORPORATIONS[$I])
            setvar $II 1
            while ($II <= $CORPMEMBERSIZE)
              if ($CORPORATIONS[$I][$II] = 0)
                setvar $CORPORATIONS[$I][$II] $TIMECODE&" "&$TRADER&" joined corp"
                goto :NEXT_CORPITEM
              end
              add $II 1
            end
          elseif ($CORPORATIONS[$I] = 0)
            setvar $CORPORATIONS[$I] $CORPNAME
            setvar $CORPORATIONS[$I][1] $TIMECODE&" "&$TRADER&" joined corp"
            goto :NEXT_CORPITEM
          end
          add $I 1
        end
        goto :NEXT_CORPITEM
      end

      getwordpos $CURRENTLINE $POS "[0;32m tried to"
      if ($POS <> 0)
        gettext $CURRENTLINE $CORPNAME "Corp: [1;33m" "[0;32m!"
        setvar $I 1
        gosub :TIME_DECODE
        gettext $CURRENTLINE $TRADER "[1;36m" "[0;32m tried"
        while ($I <= $CORPARRAYSIZE)
          if ($CORPNAME = $CORPORATIONS[$I])
            setvar $II 1
            while ($II <= $CORPMEMBERSIZE)
              if ($CORPORATIONS[$I][$II] = 0)
                setvar $CORPORATIONS[$I][$II] $TIMECODE&" "&$TRADER&" Attempted a B&E"
                goto :NEXT_CORPITEM
              end
              add $II 1
            end
          elseif ($CORPORATIONS[$I] = 0)
            setvar $CORPORATIONS[$I] $CORPNAME
            setvar $CORPORATIONS[$I][1] $TIMECODE&" "&$TRADER&" Attempted a B&E"
            goto :NEXT_CORPITEM
          end
          add $I 1
        end
        goto :NEXT_CORPITEM
      end

      getwordpos $CURRENTLINE $POS "[0;32m disbanded Corp"
      if ($POS <> 0)
        gettext $CURRENTLINE $CORPNAME "Corp [1;33m" "[0;32m."
        gettext $CURRENTLINE $TRADER "[1;36m" "[0;32m disbanded"
        setvar $I 1
        gosub :TIME_DECODE
        while ($I <= $CORPARRAYSIZE)
          if ($CORPNAME = $CORPORATIONS[$I])
            setvar $II 1
            while ($II <= $CORPMEMBERSIZE)
              if ($CORPORATIONS[$I][$II] = 0)
                setvar $CORPORATIONS[$I][$II] $TIMECODE&" "&$TRADER&" Disbanded Corp"
                goto :NEXT_CORPITEM
              end
              add $II 1
            end
          elseif ($CORPORATIONS[$I] = 0)
            setvar $CORPORATIONS[$I] $CORPNAME
            setvar $CORPORATIONS[$I][1] $TIMECODE&" "&$TRADER&" Disbanded Corp"
            goto :NEXT_CORPITEM
          end
          add $I 1
        end
        goto :NEXT_CORPITEM
      end

      getwordpos $CURRENTLINE $POS "[0;32m deserted"
      if ($POS <> 0)
        gettext $CURRENTLINE $CORPNAME "Corp [1;33m" "[0;32m."
        gettext $CURRENTLINE $TRADER "[1;36m" "[0;32m deserted"
        gosub :TIME_DECODE
        setvar $I 1
        while ($I <= $CORPARRAYSIZE)
          if ($CORPNAME = $CORPORATIONS[$I])
            setvar $II 1
            while ($II <= $CORPMEMBERSIZE)
              if ($CORPORATIONS[$I][$II] = 0)
                setvar $CORPORATIONS[$I][$II] $TIMECODE&" "&$TRADER&" Deserted Corp"
                goto :NEXT_CORPITEM
              end
              add $II 1
            end
          elseif ($CORPORATIONS[$I] = 0)
            setvar $CORPORATIONS[$I] $CORPNAME
            setvar $CORPORATIONS[$I][1] $TIMECODE&" "&$TRADER&" Deserted Corp"
            goto :NEXT_CORPITEM
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[0;32m removed [1;33m"
      if ($POS <> 0)
        add $FIREDCNT 1
        setvar $I 0
        while ($I <= $FIREDSIZE)
          if ($FIRED[$I] = 0)
            gettext $CURRENTLINE $TRADER "[1;36m" "[0;32m removed"
            gettext $CURRENTLINE $PLAYER~CORPNUMBER "Corp#[1;33m" "[0;32m."
            gosub :TIME_DECODE
            setvar $FIRED[$I] $TIMECODE&" "&$TRADER&" removed from Corp #"&$PLAYER~CORPNUMBER
            goto :NEXT_CORPITEM
          end
          add $I 1
        end
      end
    end
    :NEXT_CORPITEM
    add $IDX 1
  end

  setvar $CORPRESULTS "Corporate Happenings:*            *"

  if ($CORPORATIONS[1] <> 0)
    setvar $I 1
    while ($I <= $CORPARRAYSIZE)
      if ($CORPORATIONS[$I] <> 0)
        setvar $CURRENTCORP $CORPORATIONS[$I]
        setvar $CORPRESULTS $CORPRESULTS&"        "&$CURRENTCORP&"*"
        setvar $II 1
        while ($II <= $CORPMEMBERSIZE)
          if ($CORPORATIONS[$I][$II] <> 0)
            setvar $CORPRESULTS $CORPRESULTS&"           "&$CORPORATIONS[$I][$II]&"*"
          end
          add $II 1
        end
      end
      add $I 1
    end
    return
    if ($FIREDCNT <> 0)
      setvar $I 1
      while ($I <= $FIREDSIZE)
        if ($FIRED[$I] <> 0)
          setvar $CORPRESULTS $CORPRESULTS&"           "&$FIRED[$I]&"*"
        end
        add $I 1
      end
    end
  else
    setvar $CORPRESULTS "Corporate Happenings:           None*"
  end
else
  setvar $CORPRESULTS $UNIVERSAL_FILE_ERR
end
return
:ANNOUNCED

setvar $IDX 1
setvar $ANNONCNT 0
setvar $ANNONRESULTS ""
setvar $ANNONSIZE 50
setarray $ANNON $ANNONSIZE

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[0;32mposted this"
      if (($POS <> 0) and ($ANNONCNT < $ANNONSIZE))
        add $ANNONCNT 1
        gettext $CURRENTLINE $TRADER "[1;36m" " [0;32mposted"
        gosub :TIME_DECODE
        setvar $CURRENTLINE $NEWS_ARRAY[($IDX + 1)]
        striptext $CURRENTLINE "0m[1;34m"
        striptext $CURRENTLINE "[1;34m"
        setvar $TEMP $TIMECODE&"::"&$TRADER&"::"&$CURRENTLINE
        getlength $TEMP $LENGTH
        if ($LENGTH > 70)
          cuttext $TEMP $TEMP1 1 70
          if ($LENGTH > 127)
            setvar $TEMP3 ""
            setvar $TEMP2 ""
            striptext $TEMP $TEMP1
            cuttext $TEMP $TEMP2 1 57
            striptext $TEMP $TEMP2
            cuttext $TEMP $TEMP3 1 9999
            setvar $TEMP $TEMP1&"*             "&$TEMP2&"*             "&$TEMP3
          else
            striptext $TEMP $TEMP1
            cuttext $TEMP $TEMP2 1 9999
            setvar $TEMP $TEMP1&"*             "&$TEMP2
          end
        end
        setvar $ANNON[$ANNONCNT] $TEMP
      end
    end
    add $IDX 1
  end

  if ($ANNONCNT <> 0)
    setvar $ANNONRESULTS "    *"&$ANNONCNT&" Public Addresses Made:*     *"
    setvar $I 1
    while ($I <= $ANNONCNT)
      setvar $ANNONRESULTS $ANNONRESULTS&$ANNON[$I]&"*"
      add $I 1
    end
  else
    setvar $ANNONRESULTS "   *"&"Public Addresses Made:  None*"
  end
else
  setvar $ANNONRESULTS $UNIVERSAL_FILE_ERR
end
return
:PLANETS_POPPED

setvar $IDX 1
setvar $POPPEDRESULTS ""
setvar $POPPED 0
setvar $POPPERSIZE 50
setarray $POPPERS $POPPERSIZE 2
setvar $POPPINGTRADERS 0

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[5;31m DESTROYED[32m the planet"
      getwordpos $CURRENTLINE $POZ "[1;36m"
      if (($POS <> 0) and ($POZ = 1))
        add $POPPED 1
        gettext $CURRENTLINE $TRADER "[1;36m" "[5;31m DESTROYED"
        setvar $I 1
        if ($I <= $POPPERSIZE)
          if ($POPPERS[$I][1] = $TRADER)
            setvar $TEMP $POPPERS[$I][2]
            striptext $TEMP " "
            add $TEMP 1
            if ($TEMP < 10)
              setvar $POPPERS[$I][2] "   "&$TEMP
            elseif ($TEMP < 100)
              setvar $POPPERS[$I][2] "  "&$TEMP
            elseif ($TEMP < 1000)
              setvar $POPPERS[$I][2] " "&$TEMP
            else
              setvar $POPPERS[$I][2] $TEMP
            end
            goto :DONE_POPPER
          elseif ($POPPERS[$I][2] = 0)
            setvar $POPPERS[$I][1] $TRADER
            setvar $POPPERS[$I][2] "   1"
            goto :DONE_POPPER
          end
          add $I 1
        end
      end
    end
    :DONE_POPPER
    add $IDX 1
  end
  if ($POPPED <> 0)
    setvar $POPPEDRESULTS $POPPED&" Planet(s) Popped:*"
    setvar $I 1
    while ($I <= $POPPERSIZE)
      if ($POPPERS[$I][1] <> 0)
        setvar $POPPEDRESULTS $POPPEDRESULTS&"                       "&$POPPERS[$I][2]&" by "&$POPPERS[$I][1]&"*"
      end
      add $I 1
    end
  else
    setvar $POPPEDRESULTS "Planet(s) Popped:*"
    setvar $POPPEDRESULTS $POPPEDRESULTS&"                       None*"
  end
else
  setvar $POPPEDRESULTS $UNIVERSAL_FILE_ERR
end
return
:PORT_AUTHORITY

setvar $IDX 1
setvar $PORTRESULTS ""
setvar $BLOWNCNT 0
setvar $PORTARRAYSIZE 75
setarray $PORTBLOWN $PORTARRAYSIZE 52
setarray $NEWPORTS 75
setvar $NEWPORTIDX 0
setarray $OPENED 75
setvar $OPENEDIDX 0
setarray $ADVANCED 75
setvar $ADVANCEDIDX 0
setarray $NADVANCED 75
setvar $NADVANCEDIDX 0
setvar $PORTOFFSIZE 75
setarray $PORTOFF $PORTOFFSIZE
setvar $PORTOFFCNT 0

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[0;32m began construction!"
      if ($POS <> 0)
        add $NEWPORTIDX 1
        gettext $CURRENTLINE $CURRENTLINE "[1;36m" "[0;32m began"
        setvar $NEWPORTS[$NEWPORTIDX] $CURRENTLINE
        goto :NEXT_PORT
      end

      getwordpos $CURRENTLINE $POS "[0;32m opened"
      if ($POS <> 0)
        add $OPENEDIDX 1
        striptext $CURRENTLINE "[0;32m opened for business today. ("&$NEWS_DATE&")"
        striptext $CURRENTLINE "[32mPort [1;36m"
        gosub :TIME_DECODE
        setvar $OPENED[$OPENEDIDX] $CURRENTLINE&" at "&$TIMECODE
        goto :NEXT_PORT
      end

      getwordpos $CURRENTLINE $POS "[0;32m construction advanced."
      if ($POS <> 0)
        add $ADVANCEDIDX 1
        striptext $CURRENTLINE "[1;36m"
        striptext $CURRENTLINE "[0;32m construction advanced."
        setvar $ADVANCED[$ADVANCEDIDX] $CURRENTLINE
        goto :NEXT_PORT
      end

      getwordpos $CURRENTLINE $POS "[5;31m construction did not"
      if ($POS <> 0)
        add $NADVANCEDIDX 1
        striptext $CURRENTLINE "[32mPort [1;36m"
        striptext $CURRENTLINE "[5;31m construction did not advance."
        setvar $NADVANCED[$NADVANCEDIDX] $CURRENTLINE
        goto :NEXT_PORT
      end

      getwordpos $CURRENTLINE $POS "by Star Port [35m"
      if ($POS <> 0)
        add $PORTOFFCNT 1
        gettext $CURRENTLINE $TRADER "[1;36m" "[0;32m was"
        gettext $CURRENTLINE $PORTNAME "Port [35m" "[32m!"
        gosub :TIME_DECODE
        while ($I <= $PORTOFFSIZE)
          if ($I <> 0)
            if ($PORTOFF[$I] <> 0)
              setvar $PORTOFF[$I] $TIMECODE&" "&$TRADER&" attacked by Port "&$PORTNAME
              goto :NEXT_PORT
            end
          end
          add $I 1
        end
      end

      getwordpos $CURRENTLINE $POS "[5;31m DESTROYED [32mthe Star Port in sector"
      if ($POS <> 0)
        add $BLOWNCNT 1
        gettext $CURRENTLINE $TRADER "[1;36m" "[5;31m DESTROYED"
        gettext $CURRENTLINE $PORT_ADDY "sector [1;33m" "[0;32m!"
        setvar $I 1
        if ($I <= $PORTARRAYSIZE)
          if ($PORTBLOWN[$I][1] = $TRADER)
            setvar $TEMP $PORTBLOWN[$I][2]
            striptext $TEMP " "
            gosub :TIME_DECODE
            add $TEMP 1
            if ($TEMP < 10)
              setvar $PORTBLOWN[$I][2] "   "&$TEMP
            elseif ($TEMP < 100)
              setvar $PORTBLOWN[$I][2] "  "&$TEMP
            elseif ($TEMP < 1000)
              setvar $PORTBLOWN[$I][2] " "&$TEMP
            else
              setvar $PORTBLOWN[$I][2] $TEMP
            end
            setvar $PORTBLOWN[$I][($TEMP + 2)] $PORT_ADDY&" at "&$TIMECODE
            goto :NEXT_PORT
          else
            gosub :TIME_DECODE
            setvar $PORTBLOWN[$I][1] $TRADER
            setvar $PORTBLOWN[$I][2] "   1"
            setvar $PORTBLOWN[$I][3] $PORT_ADDY&" at "&$TIMECODE
            goto :NEXT_PORT
          end
          add $I 1
        end
      end
    end
    :NEXT_PORT
    add $IDX 1

  end
  if ($NEWPORTIDX <> 0)
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $NEWPORTIDX&" New Ports:*"
    setvar $I 1
    while ($I <= $NEWPORTIDX)
      setvar $PORTRESULTS $PORTRESULTS&"                       "&$NEWPORTS[$I]&"*"
      add $I 1
    end
  else
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&"New Ports:                    None*"
  end
  if ($OPENEDIDX <> 0)
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&$OPENEDIDX&" Ports Opened Today:*"
    setvar $I 1
    while ($I <= $OPENEDIDX)
      setvar $PORTRESULTS $PORTRESULTS&"                       "&$OPENED[$I]&"*"
      add $I 1
    end
  else
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&"Opened Today:                 None*"
  end

  if ($ADVANCEDIDX <> 0)
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&$ADVANCEDIDX&" Ports Construction Advanced:*"
    setvar $I 1
    while ($I <= $ADVANCEDIDX)
      setvar $PORTRESULTS $PORTRESULTS&"                              "&$ADVANCED[$I]&"*"
      add $I 1
    end
  else
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&"Port Construction Advanced:   None*"
  end

  if ($NADVANCEDIDX <> 0)
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&$NADVANCEDIDX&" Ports Construction Stalled:*"
    setvar $I 1
    while ($I <= $NADVANCEDIDX)
      setvar $PORTRESULTS $PORTRESULTS&"                              "&$NADVANCED[$I]&"*"
      add $I 1
    end
  else
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&"Port Construction Stalled:    None*"
  end

  if ($BLOWNCNT <> 0)
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&$BLOWNCNT&" Ports Blown Up:*"
    setvar $I 1
    while ($I <= $PORTARRAYSIZE)
      if ($PORTBLOWN[$I][1] <> 0)
        setvar $PORTRESULTS $PORTRESULTS&"                       "&$PORTBLOWN[$I][2]&" by "&$PORTBLOWN[$I][1]&"*"
        setvar $II 3
        while ($PORTBLOWN[$I][$II] <> 0)
          setvar $PORTRESULTS $PORTRESULTS&"                                Sector "&$PORTBLOWN[$I][$II]&"*"
          add $II 1
        end
      end
      add $I 1
    end
  else
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&"Ports Blown Up:               None*"
  end

  if ($PORTOFFCNT <> 0)
    setvar $PORTRESULTS $PORTRESULTS&"       *"
    setvar $PORTRESULTS $PORTRESULTS&$PORTOFFCNT&" Port Attacks:*"
    setvar $I 1
    while ($I <= $PORTOFFSIZE)
      if ($PORTOFF[$I] <> 0)
        setvar $PORTRESULTS $PORTRESULTS&"                       "&$PORTOFF[$I]&"*"
      end
      add $I 1
    end
  end
  setvar $PORTRESULTS $PORTRESULTS&"       *"
else
  setvar $PORTRESULTS $UNIVERSAL_FILE_ERR
end
return
:OVERLOAD

setvar $IDX 1
setvar $UMASS_RESULTS "Unstable Planetary Masses: Non Detected*"
setvar $UMASS 0
setvar $COLLIDEDSIZE 50
setarray $COLLIDED $COLLIDEDSIZE

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[32mAn unstable "
      if ($POS <> 0)
        add $UMASS 1
        gettext $CURRENTLINE $UMASSADDY "sector [1;33m" ""
        setvar $CURRENTLINE $NEWS_ARRAY[($IDX + 1)]
        getwordpos $CURRENTLINE $POS "[31m collided!"
        if ($POS <> 0)
          gettext $CURRENTLINE $TEMP1 "Planets [36m" " [31mand"
          gettext $CURRENTLINE $TEMP2 "and [36m" "[31m collided"
          setvar $UMASSADDY "Sector: "&$UMASSADDY&", Planets "&$TEMP1&" and "&$TEMP2
        else
          setvar $UMASSADDY "Sector: "&$UMASSADDY&", Planet Name Unkown"
        end
        setvar $COLLIDED[$UMASS] $UMASSADDY
      else
        getwordpos $CURRENTLINE $POS "[33mEnd Daily Journal [34m"
        if ($POS <> 0)
          if ($UMASS <> 0)
            setvar $UMASS_RESULTS $UMASS&" Unstable Planetary Masses:*"
            setvar $I 1
            while ($I <= $UMASS)
              setvar $UMASS_RESULTS $UMASS_RESULTS&"                      "&$COLLIDED[$I]&"*"
              add $I 1
            end
          end
          return
        end
      end
    end
    add $IDX 1
  end
else
  setvar $UMASS_RESULTS $UNIVERSAL_FILE_ERR
end
return
:PHOTONS_FIRED

setvar $IDX 1
setvar $LAUNCHEDRESULTS ""
setvar $LAUNCHED 0
setvar $LAUNCHEDSIZE 50
setarray $LAUNCHERS $LAUNCHEDSIZE 52

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[0;32m launched a"
      if ($POS <> 0)
        add $LAUNCHED 1
        setvar $TRADER $CURRENTLINE
        striptext $TRADER "[1;36m"
        striptext $TRADER "[0;32m launched a Photon Missile somewhere!"
        setvar $I 1
        if ($I <= $LAUNCHEDSIZE)
          if ($LAUNCHERS[$I][1] = $TRADER)
            setvar $TEMP $LAUNCHERS[$I][2]
            striptext $TEMP " "
            gosub :TIME_DECODE
            add $TEMP 1
            if ($TEMP < 10)
              setvar $LAUNCHERS[$I][2] "   "&$TEMP
            elseif ($TEMP < 100)
              setvar $LAUNCHERS[$I][2] "  "&$TEMP
            elseif ($TEMP < 1000)
              setvar $LAUNCHERS[$I][2] " "&$TEMP
            else
              setvar $LAUNCHERS[$I][2] $TEMP
            end
            setvar $LAUNCHERS[$I][($TEMP + 2)] $TIMECODE
            goto :DONE_TORPER
          elseif ($LAUNCHERS[$I][1] = 0)
            gosub :TIME_DECODE
            setvar $LAUNCHERS[$I][1] $TRADER
            setvar $LAUNCHERS[$I][2] "   1"
            setvar $LAUNCHERS[$I][3] $TIMECODE
            goto :DONE_TORPER
          end
          add $I 1
        end
      end
    end
    :DONE_TORPER
    add $IDX 1

  end
  if ($LAUNCHED <> 0)
    setvar $LAUNCHEDRESULTS $LAUNCHED&" Photons Launched:*"
    setvar $I 1
    while ($I <= $LAUNCHEDSIZE)
      if ($LAUNCHERS[$I][1] <> 0)
        setvar $LAUNCHEDRESULTS $LAUNCHEDRESULTS&"                       "&$LAUNCHERS[$I][2]&" by "&$LAUNCHERS[$I][1]&"*"
        if ($LAUNCHERS[$I][2] > 4)

          setvar $MATH4DUMMIES ($LAUNCHERS[$I][2] - 4)
          setvar $II ($MATH4DUMMIES + 3)
        else
          setvar $II 3
        end
        while ($LAUNCHERS[$I][$II] <> 0)
          setvar $LAUNCHEDRESULTS $LAUNCHEDRESULTS&"                                  "&$LAUNCHERS[$I][$II]&"*"
          add $II 1
        end
      end
      add $I 1
    end
  else
    setvar $LAUNCHEDRESULTS "Photons Launched:*"
    setvar $LAUNCHEDRESULTS $LAUNCHEDRESULTS&"                       None Were Found In Log*"
  end
else
  setvar $LAUNCHEDRESULTS $UNIVERSAL_FILE_ERR
end
return
:PHOTONS_LIST

setvar $IDX 1
setvar $PHOTONRESULTS ""
setvar $TOTALFIRED 0

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[0;32m launched a Photon Missile somewhere!"
      if ($POS <> 0)
        add $TOTALFIRED 1
        gosub :TIME_DECODE
        striptext $CURRENTLINE " somewhere!"
        striptext $CURRENTLINE "[1;36m"
        striptext $CURRENTLINE "[0;32m"
        setvar $PHOTONRESULTS $PHOTONRESULTS&$TIMECODE&" - "&$CURRENTLINE&"*"
      end
    end
    add $IDX 1
  end

  if ($TOTALFIRED <> 0)
    setvar $PHOTONRESULTS $PHOTONRESULTS&"------------*"&"Total Fired: "&$TOTALFIRED&"*"
  else
    setvar $PHOTONRESULTS "   *    No Photons Fired*    *"
  end
else
  setvar $PHOTONRESULTS $UNIVERSAL_FILE_ERR
end

return
:TIME_DECODE

setvar $TIMEIDX ($IDX - 1)
while ($TIMEIDX > 0)
  getwordpos $NEWS_ARRAY[$TIMEIDX] $POS $FILTER
  if ($POS <> 0)
    setvar $TIMECODE $NEWS_ARRAY[$TIMEIDX]
    striptext $TIMECODE $FILTER&" [0;35m"
    striptext $TIMECODE "[1;31m-- [0;35m"
    striptext $TIMECODE "[1;31m --"
    return
  end
  subtract $TIMEIDX 1
end
setvar $TIMECODE "  UnKnown  "
return
:TOW_DETAIL

setvar $IDX 1
setvar $TOWRESULTS ""
setvar $ARRAYSIZE 20
setarray $TOWED $ARRAYSIZE
setvar $HITS 0

if ($NEWS_READ and ($LINES <> 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS "[0;33m was towed"
      if ($POS <> 0)
        add $HITS 1
        striptext $CURRENTLINE "[0;33m was towed out of FedSpace"
        setvar $II $IDX
        while ($II <= $LINES)
          setvar $SEARCH $NEWS_ARRAY[$II]
          getwordpos $SEARCH $POS $CURRENTLINE
          if ($POS = 1)
            striptext $CURRENTLINE "[1;36m"
            setvar $TOWRESULTS $TOWRESULTS&"                      "&$CURRENTLINE&" - Has Been Online*"
            goto :SEARCH_COMPLETE
          end
          add $II 1
        end
        striptext $CURRENTLINE "[1;36m"
        setvar $TOWRESULTS $TOWRESULTS&"                      "&$CURRENTLINE&"*"
        :SEARCH_COMPLETE
      else
        getwordpos $CURRENTLINE $POS "[33mEnd Daily Journal [34m"
        if ($POS <> 0)
          if ($HITS = 0)
            setvar $TOWRESULTS "Towed From Fed Space: No One*"
          else
            setvar $TOWRESULTS "Towed From Fed Space:*"&$TOWRESULTS
          end
          return
        end
      end
    end
    add $IDX 1
  end
else
  setvar $TOWRESULTS $UNIVERSAL_FILE_ERR
end
return
:FORMAT_FOOTER

setvar $IDX 1
loadvar $NEWS_DATE
setvar $FILTER "[1;31m-- [0;35m"&$NEWS_DATE&"[1;31m --"

if ($NEWS_READ and ($LINES > 0))
  while ($IDX <= $LINES)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    end
    getwordpos $CURRENTLINE $POS $FILTER
    if ($POS = 0)
      add $ACTUALLINES 1
    end
    add $IDX 1
  end

  setvar $NEWS_FOOTER "---={Lines In Log: "&$ACTUALLINES
  if ($NEWS_YEST)
    setvar $NEWS_FOOTER $NEWS_FOOTER&" - Yesturday's Log Data."
  end
  setvar $NEWS_FOOTER $NEWS_FOOTER&"*---={Last Updated: "&$NEWS_ARRAY[1]&"*"
else
  setvar $NEWS_FOOTER "---------------- ERROR - DATA CORRUPTION -------------------"
end
return
:FILE_2_ARRAY

setvar $NEWS_READ TRUE
read $NEWS_FILE $FILE_HEADER 1
readtoarray $NEWS_FILE $NEWS_ARRAY
setvar $LINES $NEWS_ARRAY

if (($FILE_HEADER = "EOF") or ($LINES <= 0))
  setvar $switchboard~message "Problem Reading File. Try A Refresh. Halting*"
  gosub :switchboard~switchboard
  halt
else
  setvar $switchboard~message "Loading NEWS::AS OF "&$FILE_HEADER&"*"
  gosub :switchboard~switchboard
  waitfor "(?="
end
return
:VALIDATE

setvar $IDX 1
setvar $LIMITOR 35

if ($NEWS_READ and ($LINES <> 0))
  if ($LINES < $LIMITOR)
    setvar $LIMITOR $LINES
  end
  while ($IDX <= $LIMITOR)
    setvar $CURRENTLINE $NEWS_ARRAY[$IDX]
    if ($CURRENTLINE = "EOF")
      send $UNEXPECTED_EOF
      halt
    else
      getwordpos $CURRENTLINE $POS $NEWS_EMPTY
      if ($POS <> 0)
        setvar $NEWS_VALIDATED FALSE
        return
      end
    end
    add $IDX 1
  end
  setvar $NEWS_VALIDATED TRUE
else
  setvar $NEWS_VALIDATED FALSE
end

return
:LOG_2_FILE

delete $NEWS_FILE
setvar $STOP_DATE ""
savevar $NEWS_YEST
send "'{"&$BOT_NAME&"} - Reading Log To File... Comms will be off during this...*| C D"
setvar $S TIME&"-"&DATE
gettime $S "h:nna/p - d/m/yyy"
write $NEWS_FILE $S
:GETDATE_SPOOF
settexttrigger GETDATE :GETDATE "Enter the beginning date you wish to read from. Today is"
pause
:GETDATE
killtrigger GETDATE
setvar $ANSI CURRENTANSILINE
striptext $ANSI "[0m"
striptext $ANSI #10
striptext $ANSI #13

getwordpos $ANSI $POS "is [1;33m"
if ($POS <> 0)
  gettext $ANSI $NEWS_DATE "is [1;33m" ""

  if ($NEWS_YEST)

    setvar $STOP_DATE $NEWS_DATE
    replacetext $NEWS_DATE "/" " "
    getword $NEWS_DATE $NEWS_MONTH 1
    getword $NEWS_DATE $NEWS_DAY 2
    getword $NEWS_DATE $NEWS_YEAR 3

    if (($NEWS_MONTH = 12) and ($NEWS_DAY = 01))
      setvar $NEWS_MONTH 11
      setvar $NEWS_DAY 30
    elseif (($NEWS_MONTH = 11) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 10
      setvar $NEWS_DAY 31
    elseif (($NEWS_MONTH = 10) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 9
      setvar $NEWS_DAY 30
    elseif (($NEWS_MONTH = 9) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 8
      setvar $NEWS_DAY 31
    elseif (($NEWS_MONTH = 8) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 7
      setvar $NEWS_DAY 31
    elseif (($NEWS_MONTH = 7) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 6
      setvar $NEWS_DAY 30
    elseif (($NEWS_MONTH = 6) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 5
      setvar $NEWS_DAY 31
    elseif (($NEWS_MONTH = 5) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 4
      setvar $NEWS_DAY 30
    elseif (($NEWS_MONTH = 4) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 3
      setvar $NEWS_DAY 31
    elseif (($NEWS_MONTH = 3) and ($NEWS_DAY = 1))

      setvar $NEWS_MONTH 2
      setvar $NEWS_DAY 28
    elseif (($NEWS_MONTH = 2) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 1
      setvar $NEWS_DAY 31
    elseif (($NEWS_MONTH = 1) and ($NEWS_DAY = 1))
      setvar $NEWS_MONTH 12
      setvar $NEWS_DAY 30
    else
      subtract $NEWS_DAY 1

    end
    setvar $NEWS_DATE $NEWS_MONTH&"/"&$NEWS_DAY&"/"&$NEWS_YEAR
  end
  savevar $NEWS_DATE
else
  goto :GETDATE_SPOOF
end
:INDATE_SPOOF
settexttrigger INDATE :INDATE "Input search date"
pause
:INDATE
killtrigger INDATE
getwordpos CURRENTANSILINE $POS "[35mInput"
if ($POS <> 0)
  send $NEWS_DATE&"*y*"
else
  goto :INDATE_SPOOF
end
:TOPOFLOG_SPOOF

settexttrigger TOPOFLOG :TOPOFLOG "-=-=-=-=-=-=-=-=-=- Trade Wars 2002"
pause
:TOPOFLOG

killtrigger TOPOFLOG
getwordpos CURRENTANSILINE $POS "[1;34m  -="
if ($POS <> 0)
else
  goto :TOPOFLOG_SPOOF
end
:END_OF_LINES_SPOOF
if ($NEWS_YEST)
  settextlinetrigger END_OF_LINES1 :END_OF_LINES "S.D. "&$STOP_DATE
else
  settexttrigger END_OF_LINES2 :END_OF_LINES "command [TL="
end
settextlinetrigger NOTHING_2_DO :NOTHING_2_DO "No log entries today."
:RESET_LINE_TRIGGER
settextlinetrigger LINE_TRIG :PARSE_SCAN_LINE
pause
:PARSE_SCAN_LINE
killtrigger :LINE_TRIG
setvar $ANSI CURRENTANSILINE
striptext $ANSI "[0m"
striptext $ANSI #13
striptext $ANSI #16


getwordpos $ANSI $POS "[Pause]"
if ($POS <> 0)
  send "*"
  goto :RESET_LINE_TRIGGER
end
if (($ANSI = "") or ($ANSI = 0))
  goto :RESET_LINE_TRIGGER
end
write $NEWS_FILE $ANSI
goto :RESET_LINE_TRIGGER
:NOTHING_2_DO
killalltriggers
setvar $ANSI CURRENTANSILINE
getwordpos $ANSI $POS $NEWS_EMPTY
if ($POS <> 0)
  write $NEWS_FILE $NEWS_EMPTY
  send "***  Q|"
  goto :DONE_READING_NEWS
else
  goto :END_OF_LINES_SPOOF
end
:END_OF_LINES
killtrigger END_OF_LINES
killtrigger LINE_TRIG

if ($NEWS_YEST)
  getwordpos CURRENTANSILINE $POS "[1;34m-="
  if ($POS <> 0)
    send "*  *   *  ** Q|"
  else
    goto :END_OF_LINES_SPOOF
  end
else
  getwordpos CURRENTANSILINE $POS "[1;33mTL"
  if ($POS <> 0)
    send " Q|"
  else
    goto :END_OF_LINES_SPOOF
  end
end
:DONE_READING_NEWS
setvar $NEWS_READ TRUE
waiton "<Computer deactivated>"
return
include "source\include\player"
include "source\include\switchboard.ts"
