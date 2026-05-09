
###############################################################################
#     Please leave this header intact.  This script is released for the players
#     and scripters to use.

#     proZTM Originally written by Promethius
#     Release Date:   Aug 2005
#     Updated:  v.6   Oct 2005
#     Updated:  v1.0  Aug 2006
#     Updated:  v1.4  Nov 2006
#     Updated:  v1.4A Jan 2007
#     Updated:  v2.0  Apr 2008
#     Updated:  v3.0  Nov 2008
#     Updated:  v4.0  Dec 2008
#     Updated:  v4.11 Jun 2009
#     Source Released Dec 25, 2009
###############################################################################

setVar $game GAMENAME
setVar $version "ProZTM 4.11"
setVar $computerInt "n"
setVar $useWatch "Yes"
setVar $cim "Yes"
setVar $ztmMode "Interrogation"
setVar $7WarpsList "No"
setVar $deadEndList "No"
setVar $swathData "No"
setVar $trafficAnalysis "No"
setVar $ztmRange "No"
setVar $ztmVarRefresh "No"
setVar $7WarpsInMonitor "Yes"
setVar $showWarpsFound "Yes"
setVar $1stPassWarpSpec "No"
setVar $endPassWarps FALSE
setVar $warpsPlotted 0
setVar $reConn 0
loadVar $ztmMin
loadVar $ztmMax
if ($ztmMin = 0) or ($ztmMax = 0)
   setVar $ztmMin 1
   setVar $ztmMax SECTORS
   saveVar $ztmMin
   saveVar $ztmMax
end
setVar $ztmStart $ztmMin
setVar $ztmSend "No"

setVar $BOT~command "proztm"
gosub :HELP~INITIALIZE
setVar $HELP~HELP[1]   $HELP~TAB&"ProZTM by Promethius "
setVar $HELP~HELP[2]   $HELP~TAB&" - proztm {reset} {nowindow} "
setVar $HELP~HELP[3]   $HELP~TAB&"   Options: "
setVar $HELP~HELP[4]   $HELP~TAB&"     {reset}        - reset ztmStart/ztmMin/ztmMax for clean start  "
setVar $HELP~HELP[5]   $HELP~TAB&"     {nowindow}     - don't pop up a status window"
gosub :HELP~HELPFILE

getWordPos " "&$bot~user_command_line&" " $pos " reset"
if ($pos > 0)
   setVar $ztmVarRefresh "Yes"
   setVar $ztmMin 1
   saveVar $ztmMin
   setVar $ztmMax SECTORS
   saveVar $ztmMax
   setVar $ztmStart 0
   saveVar $ztmStart
   setVar $ztmEnd SECTORS
   saveVar $ztmEnd
   setVar $verifyStart 0
   saveVar $verifyStart
   setVar $verifyEnd 0
   saveVar $verifyEnd
   setVar $firstPassVerified 0
   saveVar $firstPassVerified
   setVar $sPassZTMStart $ztmMin
   saveVar $sPassZTMStart
   setVar $sPassZTMEnd $ztmEnd
   saveVar $spassZTMEnd
end

getWordPos " "&$bot~user_command_line&" " $pos " nowindow"
if ($pos > 0)
	setVar $nowindow TRUE
else
   setVar $nowindow FALSE
end

:begin

setEventTrigger connLost :connLost "CONNECTION LOST"
setTextTrigger connLost2 :connLost "Connection lost"
getword CURRENTLINE $prompt 1

# plotDisplay setting
setVar $plotDisplay (($ztmMax - $ztmMin + 1) / 100)
if ($plotDisplay < 100)
    setVar $plotDisplay 100
end

if ($nowindow = FALSE)
   gosub :windowSetup

   :windowMessages
    setvar $WindowMessagePass0 "*  Game:    "& $game & "*  Sectors: " & SECTORS  & "*"
   setVar $windowMessagepassCim "*  CIM "
   setVar $windowMessagepass1 "*  Pass 1:  Mapping @ 0%*"
   setVar $windowMessagePass2 "*  Pass 2: *"
   setVar $windowMessagePass3 "*  Pass 3: *"
   setVar $windowMessagePass4 "*  Pass 4: *"
   setVar $windowMessagePass5 "*  Pass 5: *"
   gosub :ztmWindowUpdate
end

:intMode

if ($cim = "Yes")
   if ($recon = 1)
      send "^"
   else
      send "^iq"
      waitfor ": ENDINTERROG"
      send "^"
   end
   setVar $cimmed 1
else
    send "^"
end

:firstPass
   gosub :totalWarps
   setVar $prevWarpCnt $totalWarps
   if ($nowindow = FALSE) and ($cimmed = 1)
      setVar $windowMessagepassCim "*  CIM found: " & $totalWarps & " Warps*"
      gosub :ztmWindowUpdate
   end
  loadVar $ztmStart
  loadVar $ztmEnd
  setVar $plots 0
  setVar $burstCnt 0
  setVar $burst ""
  setVar $forwardPlot FALSE
  # was 0
  setVar $2ndIn 0
  if ($ztmStart = 0)
    setVar $ztmStart $ztmMin
  end
  if ($ztmEnd = 0)
    setVar $ztmEnd $ztmMax
  end
while ($ztmStart <= $ztmMax)
  :ztmFirstSector
   if ($ztmStart > $ztmMax)
      goto :secondPass
   end
     # changed from = 0 to <=2
     if (sector.warpcount[$ztmStart] = 0) and ($ztmStart <= $ztmMax) and (sector.explored[$ztmStart] <> YES)
       goto :ztmSecondSector
    else
       add $ztmStart 1
       if ($ztmStart > $ztmMax)
          goto :secondPass
       end
       goto :ztmFirstSector
    end

  :ztmSecondSector
    # was < 2
   if (sector.warpInCount[$ztmEnd] <= $2ndIn) and ($ztmEnd <> $ztmStart) and ($ztmEnd > ($ztmMin-1)) and (sector.explored[$ztmEnd] <> YES)
       setVar $burst $burst & "f" & $ztmStart & "*" & $ztmEnd & "*y"
       if ($forwardPlot = FALSE)
          setVar $burst $burst & "f" & $ztmEnd & "*" & $ztmStart & "*y"
          add $plots 2
          add $warpsPlotted 2
       else
          add $plots 1
          add $warpsPlotted 1
       end
       add $burstCnt 1
       if ($burstCnt > 5)
          goto :firstPassPlot
       else
          subtract $ztmEnd 1
       end
       if ($ztmEnd < $ztmMin)
          setVar $ztmEnd $ztmMax
          add $2ndIn 1
       end
       add $ztmStart 1
       if ($ztmStart = $ztmEnd)
          subtract $ztmEnd 1
          if ($ztmEnd < $ztmMin)
             setVar $ztmMin $ztmEnd
             add $2ndIn 1
          end
       end
       add $burstCnt 1
       goto :ztmFirstSector

    else
       subtract $ztmEnd 1
       if ($ztmEnd < $ztmMin)
          setVar $ztmEnd $ztmMax
          add $2ndIn 1
       end
       goto :ztmSecondSector
    end

  :firstPassPlot
  if ($ztmMode = "Interrogation")
    send $burst
    setVar $burst ""
    setVar $burstCnt 0
    if ($forwardPlot = TRUE)
       waitfor "FM > " & $ztmStart
    else
       waitfor "FM > " & $ztmEnd
    end
  else
    send $burst
    setVar $burst ""
    setVar $burstCnt 0
    setVar $chkSector $ztmStart
    gosub :checkComp
  end
    saveVar $ztmStart
    saveVar $ztmEnd
    add $ztmStart 1
    subtract $ztmEnd 1
    setVar $tot_sectors $ztmStart
    multiply $tot_sectors 100
    divide $tot_Sectors ($ztmMax - $ztmMin)
    if ($nowindow=FALSE)
      if ($ckUpdate <> $tot_sectors) and ($plots >= $plotDisplay)
      gosub :totalWarps
      if ($warpsPlotted > 0)
         setprecision 3
         setVar $plotEfficiency  (($totalWarps - $prevWarpCnt) / $warpsPlotted)
         setprecision 0
      end
      if ($plotEfficiency < 6.5)
         setVar $forwardPlot TRUE
      end
        setVar $windowMessagePass1 "*  Pass 1:  Mapping @ " & $tot_Sectors & "%" & " Warps: " & $totalWarps & ", Warps:Plot " & $plotEfficiency & "*"
      else
        setVar $windowMessagePass1 "*  Pass 1:  Mapping @ " & $tot_Sectors & "%*"
      end
      gosub :ztmWindowUpdate
      setVar $ckUpdate $tot_sectors
      setVar $plots 0
   end
end

#-----------------

:secondPass
send $burst
loadvar $2ndvStart
loadVar $2ndvEnd
setVar $burstCnt 0
setVar $warpsPlotted 0
setVar $windowMessagePass2 ""
setVar $plots 0
setVar $burst ""
setVar $plots 0
getTime $1PassEndTime "hh:nn:ss"
setVar $ckUpdate 0
setVar $tot_Sectors 0
gosub :totalWarps
setVar $prevWarpCnt $totalWarps
setVar $windowMessagePass1 "*  Pass 1:  Completed @ " & $1PassEndTime & ", " & $totalWarps & " warps found*"
if ($nowindow = FALSE) and ($1stPassWarpSpec = "Yes")
   setVar $windowMessagePass2 "*  Writing " & gamename & "warpSpec.txt*"
   gosub :ztmWindowUpdate
   gosub :writeWarpSpec
   setVar $windowMessagePass2 "*  WarpSpec Written to " & gamename & "warpSpec.txt*"
end
if ($nowindow = FALSE)
   setVar $windowMessagePass2 $windowMessagePass2 & "*  Pass 2:  Mapping @ " & $tot_Sectors & "%" & " Warps: " & $totalWarps & "*"
   gosub :ztmWindowUpdate
end

if ($2ndvStart = 0)
   setVar $2ndvStart $ztmMin
   setVar $2ndvEnd $ztmMax
end
while ($2ndvStart <= $ztmMax)
      if (sector.warpcount[$2ndvStart] = 1) and (sector.explored[$2ndvStart] <> YES)
         setVar $voidClear "c" & sector.warps[$2ndvStart][1] & "*"
         setVar $burst $burst & "s" & sector.warps[$2ndvStart][1] & "*f" & $2ndvStart & "*"
      elseif (sector.warpCount[$2ndvStart] = 0)
         setVar $burst $burst & "f" & $2ndvStart & "*"
         setVar $voidClear ""
      else
         goto :endSecondvPass
      end
      :get2ndvEnd
      if (sector.warpInCount[$2ndvEnd] < 2)
         setVar $burst $burst & $2ndvEnd & "*Y" & $voidClear
         add $plots 1
         add $burstCnt 1
         add $warpsPlotted 1
      else
         subtract $2ndvEnd 1
         if ($2ndvEnd = $2ndvStart)
             subtract $2ndvEnd 1
         end
         if ($2ndvEnd < $ztmMin)
            setVar $2ndvEnd $ztmMax
         end
         goto :get2ndvEnd
      end
      if ($burstCnt > 5)
          send $burst
          savevar $2ndvStart
          saveVar $2ndvEnd
             if ($ztmMode = "Interrogation")
                waitfor "FM > " & $2ndvStart
             else
                setVar $chkSector $2ndvStart
                gosub :checkComp
             end
          setVar $burst ""
          setVar $burstCnt 0
      end
      subtract $2ndvEnd 1
      if ($2ndvEnd < $ztmMin)
         setVar $2ndvEnd $ztmMax
      end
      :endSecondvPass
      add $2ndvStart 1
      if ($2ndvStart = $2ndvEnd)
         subtract $2ndvEnd 1
         if ($2ndvEnd < $ztmMin)
            setVar $2ndvEnd $2ndvMax
         end
      end
   if ($nowindow = FALSE)
      setVar $tot_sectors $2ndvStart
            multiply $tot_sectors 100
            divide $tot_Sectors ($ztmMax - $ztmMin)
            if ($ckUpdate <> $tot_sectors) and ($plots >= $plotDisplay)
               setVar $plots 1
               gosub :totalWarps
               setPrecision 3
               setVar $plotEfficiency (($totalWarps - $prevWarpCnt) / $warpsPlotted)
               setprecision 0
            if ($showWarpsFound = "Yes")
                setVar $windowMessagePass2 "*  Pass 2:  Mapping @ " & $tot_Sectors & "%" & " Warps: " & $totalWarps & " Warps:Plot: " & $plotEfficiency & "*"
            else
                setVar $windowMessagePass2 "*  Pass 2:  Mapping @ " & $tot_Sectors & "%*"
            end
            gosub :ztmWindowUpdate
            setVar $ckUpdate $tot_sectors
         end
   end
 end
send $burst


#--------------------


:thirdPass
 setVar $plots 0
 setVar $firstPassVerified 1
 saveVar $firstPassVerified
 getTime $1PassEndTime "hh:nn:ss"
 setVar $ckUpdate 0
 setVar $tot_Sectors 0
 setVar $endPassWarps TRUE
 gosub :totalWarps
 if ($nowindow = FALSE)
   if ($warpsPlotted > 0)
     setPrecision 3
     setVar $plotEfficiency  ($totalWarps - $prevWarpCnt) / $warpsPlotted
     setPrecision 0
   end
   setVar $endPassWarps FALSE
   setVar $windowMessagePass2 "*  Pass 2:  Completed @ " & $1PassEndTime & ", " & $totalWarps & " warps*"
   setVar $windowMessagePass3 "*  Pass 3:  Mapping @ " & $tot_Sectors & "%*"
   gosub :ztmWindowUpdate
 end

 loadVar $sPassZTMStart
 loadVar $sPassZTMEnd
 setVar $ckUpdate 0
 if ($sPassZTMStart = 0)
    setVar $sPassZTMStart $ztmMin
 end
 if ($sPassZTMEnd = 0)
    setVar $sPassZTMEnd $ztmMax
 end
 while ($sPassZTMStart <= $ztmMax)
      :sPassPlotFrom
        # added sector.warpcount = 1
     if (sector.warpcount[$sPassZTMStart] = 6) or (sector.explored[$sPassZTMStart] = YES) or (sector.warpcount[$sPassZTMStart] = 1)
        add $sPassZTMStart 1
        if ($sPassZTMStart > $ztmMax)
           goto :data
        end
        goto :sPassPlotFrom
     end
      :getAvoids
      setVar $sendBurst ""
      setVar $i 1
       while ($i <= SECTOR.WARPCOUNT[$sPassZTMStart])
             if (SECTOR.WARPS[$sPassZTMStart][$i] > 0)
                if ($computerInt = "n")
                   setVar $sendBurst $sendBurst & "s" & SECTOR.WARPS[$sPassZTMStart][$i] & "*"
                else
                   setVar $sendBurst $sendBurst & "v" & SECTOR.WARPS[$sPassZTMStart][$i] & "*"
                end
             end
             add $i 1
       end
       :burstIt
       if ($sPassZTMStart = $sPassZTMEnd)
          subtract $sPassZTMEnd 1
          if ($sPassZTMEnd < $ztmMin)
             setVar $sPassZTMEnd $ztmMax
          end
       end
       send $sendBurst "f" $sPassZTMStart "*" $sPassZTMEnd "*y"
       setTextlineTrigger sect :addVoid $sPassZTMStart & " > "
       setTextTrigger compClear :clearVoids "Clear Avoids"
       pause
     :addVoid
      killtrigger compClear
        getword CURRENTLINE $nVoid 3
        stripText $nvoid ")"
        stripText $nvoid "("
       if ($nvoid = $sPassZTMEnd)
          subtract $spassZTMEnd 1
          goto :burstIt
       end
       # catch sectors that are next door
       if ($ztmMode = "Interrogation")
           setVar $sendBurst "s" & $nVoid & "*"
       else
           setVar $sendBurst "v" & $nVoid & "*"
       end
       goto :burstIt
     :clearVoids
       killtrigger sect
       saveVar $sPassZTMStart
       saveVar $sPassZTMEnd
       add $plots 1
       add $sPassZTMStart 1
       subtract $sPassZTMEnd 1
      if ($nowindow = FALSE)
         setVar $tot_sectors $sPassZTMStart
         multiply $tot_sectors 100
         divide $tot_Sectors ($ztmMax - $ztmMin)
         if ($ckUpdate <> $tot_sectors) and ($plots >= $plotDisplay)
            gosub :totalWarps
            setVar $windowMessagePass3 "*  Pass 3:  Mapping @ " & $tot_Sectors & "%" & " Warps: " & $totalWarps & "*"
         else
            setVar $windowMessagePass3 "*  Pass 3:  Mapping @ " & $tot_Sectors & "%*"
         end
         gosub :ztmWindowUpdate
         setVar $ckUpdate $tot_sectors
         setVar $plots 0
      end
   end

  :data
if ($nowindow = FALSE)
   gettime $thirdPassEndTime "hh:nn:ss"
   setVar $endPassWarps TRUE
   gosub :totalWarps
   setVar $endPassWarps FALSE
   setVar $windowMessagePass3 "*  Pass 3:  Completed @ " & $thirdPassEndTime & ", " & $totalWarps & " warps found.*"
   gosub :ztmWindowUpdate
end

 :fourthPass
 loadVar $backdoorComplete
 if ($backdoorComplete = 1)
    goto :doneBackDoorCheck
 end
 if ($nowindow = FALSE)
   setVar $windowMessagePass4 "*  Pass 4:  Running*"
   gosub :ztmWindowUpdate
 end
 setVar $i $ztmMin
 setVar $burstCnt 0
 setVar $burst ""
 while ($i <= SECTORS)
   if (sector.backDoorCount[$i] > 0)
      setVar $backDoorCnt 0
      :backdoor
      if ($backdoorCnt < sector.backDoorCount[$i])
         add $backDoorCnt 1
         setVar $burst $burst & "f" & $i & "*" & sector.backdoors[$i][$backDoorCnt] & "*y"
         add $burstCnt 1
         goto :backdoor
      end
   end
   if ($burstCnt > 5)
      send $burst
      setVar $burstCnt 0
      setVar $burst ""
      if ($ztmMode = "Interrogation")
         waitfor "FM > " & $i
      else
         setVar $chkSector $i
         gosub :checkComp
     end
   end
   add $i 1
 end
 send $burst
 :doneBackDoorCheck
gettime $4PassEndTime "hh:nn:ss"
setVar $endPassWarps TRUE
gosub :totalWarps
setVar $endPassWarps FALSE
setVar $windowMessagePass4 "*  Pass 4:  Completed @ " & $4PassEndTime & ", " & $totalWarps & " warps found.*"
gosub :ztmWindowUpdate
setVar $backdoorComplete 1
saveVar $backdoorComplete
send "q"
setvar $SWITCHBOARD~MESSAGE "ZTM Completed at " & $4PassEndTime & "*"
gosub :SWITCHBOARD~SWITCHBOARD
halt

# our padding routine
:padLen
 setVar $padIt ""
 while ($len < 6)
    setVar $padIt $padIt & " "
    add $len 1
 end
 return
 
:padLeftLen
 setVar $padIt ""
 while ($len < 7)
    setVar $padIt " " & $padIt
    add $len 1
 end
 return

# goSubs

:writeWarpSpec
setVar $i 1
delete gamename & "warpSpec.txt"
while ($i <= sectors)
   getLength $i $len
   gosub :padLen
   setVar $warpString $i & $padIt
   setVar $warpCounter 1
   if (sector.warpcount[$i] > 0)
      while ($warpCounter <= sector.warpcount[$i])
         getLength sector.warps[$i][$warpCounter] $len
         gosub :padLen
         setVar $warpString $warpString & sector.warps[$i][$warpCounter] & $padIt
         add $warpCounter 1
      end
      write gamename & "warpSpec.txt" $warpString
   end
   add $i 1
end
return

:windowSetup
getTime $stTime "'Start time:  ' h:nn:ss"
setVar $Window 1
Window ZTM 475 375 "      " & $version & "  by Promethius    " & $stTime  ONTOP
setVar $Window "*     Public Release*"
setVar $Window $Window & "     Release Date:   Aug 2005*"
setVar $Window $Window & "     Updated:  v.6   Oct 2005*"
setVar $Window $Window & "     Updated:  v1.0  Aug 2006*"
setVar $Window $Window & "     Updated:  v1.4  Nov 2006*"
setVar $Window $Window & "     Updated:  v1.4A Jan 2007*"
setVar $Window $Window & "     Updated:  v2.0  Apr 2008*"
setVar $window $window & "     Updated:  v3.0  Nov 2008*"
setVar $window $window & "     Updated:  v4.0  Dec 2008*"
setVar $window $window & "     Updated:  v4.11 Jun 2009"
setVar $Window $Window & " Please let me know of any issues on classicTW.com.*"
setWindowContents ZTM $Window
setDelayTrigger WindowSplash :windowSplash 3000
pause
:windowSplash
return

:ztmWindowUpdate
  setVar $window $windowMessagePass0 & $windowMessagepassCim & $windowMessagePass1 & $windowMessagePass2
  setVar $window $window & $windowMessagePass3 & $windowMessagePass4 & $windowMessagePass5
  setWindowContents ZTM $window
return

:connLost
 killalltriggers
  waitfor "Command [TL"
      loadVar $ztmMin
      loadVar $ztmMax
      loadVar $ztmStart
      loadVar $ztmEnd
      loadVar $verifyStart
      loadVar $verifyEnd
      loadVar $firstPassVerified
      loadVar $sPassZTMStart
      loadVar $spassZTMEnd
      echo ansi_12 "*" & $version & " resuming in " ansi_14 "10 " ANSI_12 "seconds."
      setDelayTrigger relogDelay :begin 10000
      setVar $reConn 1
      pause
  goto :begin
  halt

:totalWarps
setVar $totalWarps 0
setVar $ttlwrps 0
setVar $7Ins ""
if ($showWarpsFound = "Yes") or ($7WarpsInMonitor = "Yes") or ($endPassWarps = TRUE)
   while ($ttlwrps < SECTORS)
       add $ttlwrps 1
       add $totalWarps SECTOR.WARPCOUNT[$ttlwrps]
       if (SECTOR.WARPINCOUNT[$ttlwrps] = 7) and ($7WarpsInMonitor = "Yes")
          if (sector.explored[$ttlwrps] = YES)
              setVar $padIt " -e- "
          else
              setVar $padIt " -u- "
          end

          if ($ttlWrps < 10)
             setVar $padIt $padIt & "     BD = "
          elseif ($ttlWrps < 100)
             setVar $padIt $padIt & "    BD = "
          elseif ($ttlWrps < 1000)
             setVar $padIt $padIt & "   BD = "
          elseif ($ttlWrps < 10000)
             setVar $padIt $padIt & "  BD = "
          elseif ($ttlWrps > 9999)
          setVar $padIt $padIt & " BD = "
          end
          setVar $update7In 1
          setVar $7Ins $7Ins & "*" & $ttlwrps & $padIt & SECTOR.BACKDOORS[$ttlwrps][1]
       end
   end
end
return

:checkComp
  setTextTrigger intGood2 :computerDone2 $chkSector & " > "
  setTextTrigger compClear2 :clearVoids2 "Clear Avoids"
  pause
 :clearVoids2
  killtrigger intGood2
  send "y"
 :computerDone2
 killtrigger compClear2
return

include "source\include\help"
include "source\include\switchboard.ts"
