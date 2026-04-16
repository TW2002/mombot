:PLANET~LANDINGSUB




gosub :KILLLANDINGTRIGGERS
send "l" $PLANET~PLANET "*z  n  z  n  *  "
setvar $PLANET~SUCESSFULCITADEL FALSE
setvar $PLANET~SUCESSFULPLANET FALSE
settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger NO_LAND :NO_LAND "since it couldn't possibly stand"
settextlinetrigger PLANET :PLANET "Planet #"
settextlinetrigger WRONGONE :WRONG_NUM "That planet is not in this sector."
pause
:PLANET~NOPLANET
gosub :KILLLANDINGTRIGGERS
setvar $SWITCHBOARD~MESSAGE "No Planet in Sector!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLANET~NO_LAND
gosub :KILLLANDINGTRIGGERS
setvar $SWITCHBOARD~MESSAGE "This ship cannot land!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLANET~PLANET
getword CURRENTLINE $PLANET~PNUM_CK 2
striptext $PLANET~PNUM_CK "#"
gosub :KILLLANDINGTRIGGERS
if ($PLANET~PNUM_CK <> $PLANET~PLANET)
  send "q"
  goto :WRONG_NUM
end
settexttrigger WRONG_NUM :WRONG_NUM "That planet is not in this sector."
settexttrigger PLANET :PLANET_PROMPT "Planet command"
pause
:PLANET~WRONG_NUM
killtrigger PLANET
send "**"
setvar $SWITCHBOARD~MESSAGE "Incorrect Planet Number*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLANET~PLANET_PROMPT
killtrigger WRONG_NUM
setvar $PLANET~CURRENTBOTPLANET $PLANET~PLANET
savevar $PLANET~CURRENTBOTPLANET
savevar $PLANET~PLANET
setvar $PLANET~SUCESSFULPLANET TRUE
if ($PLANET~LAND_AND_LIFT = TRUE)
  send "m* * * q  "
  return
end
send "m* * * c*"
settexttrigger BUILD_CIT :BUILD_CIT "Do you wish to construct one?"
settexttrigger IN_CIT :IN_CIT "Citadel command"
settexttrigger NOCITALLOWED :BUILD_CIT "Citadels are not allowed in FedSpace."
settexttrigger CITNOTBUILTYET :BUILD_CIT "Be patient, your Citadel is not yet finished."
pause
:PLANET~BUILD_CIT
gosub :KILLLANDINGTRIGGERS
setvar $PLANET~SUCESSFULPLANET TRUE
setvar $PLANET~STARTINGLOCATION "Planet"
return
:PLANET~IN_CIT
gosub :KILLLANDINGTRIGGERS
setvar $PLANET~SUCESSFULCITADEL TRUE
setvar $PLANET~STARTINGLOCATION "Citadel"
return
:PLANET~KILLLANDINGTRIGGERS


killtrigger NOPLANET
killtrigger NO_LAND
killtrigger PLANET
killtrigger WRONGONE
killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
return
