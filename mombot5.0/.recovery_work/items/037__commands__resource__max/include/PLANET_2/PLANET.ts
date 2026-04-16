:PLANET~LANDINGSUB




killtrigger NOPLANET
killtrigger NO_LAND
killtrigger PLANET
killtrigger WRONGONE
send "l" $PLANET~PLANET "*z  n  z  n  *  "
setvar $PLANET~SUCESSFULCITADEL FALSE
setvar $PLANET~SUCESSFULPLANET FALSE
settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger NO_LAND :NO_LAND "since it couldn't possibly stand"
settextlinetrigger PLANET :PLANET "Planet #"
settextlinetrigger WRONGONE :WRONG_NUM "That planet is not in this sector."
pause
:PLANET~NOPLANET
killtrigger NO_LAND
killtrigger PLANET
killtrigger WRONGONE
setvar $SWITCHBOARD~MESSAGE "No Planet in Sector!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLANET~NO_LAND
killtrigger NOPLANET
killtrigger PLANET
killtrigger WRONGONE
setvar $SWITCHBOARD~MESSAGE "This ship cannot land!*"
gosub :SWITCHBOARD~SWITCHBOARD
return
:PLANET~PLANET
getword CURRENTLINE $PLANET~PNUM_CK 2
striptext $PLANET~PNUM_CK "#"
if ($PLANET~PNUM_CK <> $PLANET~PLANET)
  killtrigger NO_LAND
  killtrigger WRONGONE
  killtrigger NO_PLANET
  send "q"
  goto :WRONG_NUM
end
killtrigger NOPLANET
killtrigger NO_LAND
killtrigger WRONGONE
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
killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
setvar $PLANET~SUCESSFULPLANET TRUE
setvar $PLANET~STARTINGLOCATION "Planet"
return
:PLANET~IN_CIT
killtrigger IN_CIT
killtrigger NOCITALLOWED
killtrigger BUILD_CIT
killtrigger CITNOTBUILTYET
setvar $PLANET~SUCESSFULCITADEL TRUE
setvar $PLANET~STARTINGLOCATION "Citadel"
return
