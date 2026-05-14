# Copyright (C) 2005  Remco Mulder
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; either version 2 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
#
# For source notes please refer to Notes.txt
# For license terms please refer to GPL.txt.
#
# These files should be stored in the root of the compression you
# received this source in.

# SUB:       MakePlanet
# Passed:    $WantedPlanets[] - Zero based array of full/partial names of wanted planets
#            $Sector - Current sector ("0" if unknown)
#            $WantedPlanetCount - Number of items in array
#            $WarpType - "T" to twarp to/from stardock
#                        "E" to ewarp
#                        "S" to single step warp
#            $Resupply - "1" to resupply from stardock
#            $CreditLimit - Sub will abort if credits fall below this
#            $Haggle~HaggleFactor - Default hagglefactor
# Triggered: Anywhere
# Returned:  $PlanetID - ID of planet created
#            $Type - Type of planet created
#            $Name - Name of planet created
#            $Credits - Player credits
#            $Failed - "1" if failed to create planet (out of cash)
#                      "2" if failed to create planet


	gosub :LOADVARS~LOADVARS
	gosub :HELP~INITIALIZE

	setVar $HELP~HELP[1]    $HELP~TAB&"makeplanet {ewarp} {create:} {"&#34&"custom planet name"&#34&"} "
	setVar $HELP~HELP[2]    $HELP~TAB&"       "
	setVar $HELP~HELP[3]    $HELP~TAB&"     {ewarp}  - Will refurb torps and atomics by ewarp "
	setVar $HELP~HELP[4]    $HELP~TAB&"                This is NOT safe."
	setVar $HELP~HELP[5]    $HELP~TAB&"       "
	setVar $HELP~HELP[6]    $HELP~TAB&"   {create:}  - List of planet types to make.  First word"
	setVar $HELP~HELP[7]    $HELP~TAB&"                of planet types separated by commas and no spaces."
	setVar $HELP~HELP[8]    $HELP~TAB&"                Default will use keeper planets in preferences."
	setVar $HELP~HELP[9]    $HELP~TAB&"                "
	setVar $HELP~HELP[10]   $HELP~TAB&"{custom name} - Name the planet will be.  Otherwise it's a random   "
	setVar $HELP~HELP[11]   $HELP~TAB&"                name from a database              "
	setVar $HELP~HELP[12]   $HELP~TAB&"                              "
	setVar $HELP~HELP[13]   $HELP~TAB&"      Examples:                   "
	setVar $HELP~HELP[14]   $HELP~TAB&"            >makeplanet create:earth,volcanic,oceanic "
	setVar $HELP~HELP[15]   $HELP~TAB&"            >makeplanet ewarp create:earth         "
	setVar $HELP~HELP[16]   $HELP~TAB&"            >makeplanet "&#34&"death"&#34&" create:volcanic "
	setVar $HELP~HELP[17]   $HELP~TAB&"                              "
	setVar $HELP~HELP[18]   $HELP~TAB&"               - Originally written by Xide"
	gosub :HELP~HELPFILE

	loadVar $GAME~GENESIS_COST
	loadVar $GAME~ATOMIC_COST
	loadVar $MAP~STARDOCK
	loadvar $bot~folder
	loadvar $game~MAX_PLANETS_PER_SECTOR
	loadvar $planet~planet_file

gosub :player~quikstats
setVar $startingLocation $PLAYER~CURRENT_PROMPT
if ($startingLocation = "Command")

elseif ($startingLocation = "Citadel")
	send "q"
	gosub :PLANET~getPlanetInfo
	setvar $startingPlanet $planet~planet
	send "q"
elseif ($startingLocation = "Planet")
	gosub :PLANET~getPlanetInfo
	setvar $startingPlanet $planet~planet
	send "q"
else
	setVar $SWITCHBOARD~message "Have to be on Command, Planet, or Citadel prompt to start upgrader.*"
	gosub :SWITCHBOARD~switchboard
	halt
end

gosub :PLANET~loadplanetInfo

getWordPos " "&$bot~user_command_line&" " $pos "ewarp"
setvar $warptype "T"
if ($pos > 0)
	setVar $warptype "E"
end


getWordPos " "&$bot~user_command_line&" " $pos "create:"
if ($pos > 0)
	getText " "&$bot~user_command_line&" " $create_list "create:" " "
	getwordpos $create_list $pos ","
	if ($pos > 0)
		splitText $create_list $wantedplanets  ","
	else
		setarray $wantedplanets 1
		setvar $wantedplanets[1] $create_list
		setvar $wantedplanets 1
	end
else
	setVar $i 1
	setVar $foundPlanet FALSE
	setVar $isAKeeper FALSE
	while (($i <= $planet~planetcounter) AND ($foundPlanet = FALSE))
		if ($planet~planetList[$i][7] = true)
			setVar $isAKeeper TRUE
		end
		add $i 1
	end
	if ($isAKeeper <> TRUE)
		setVar $SWITCHBOARD~message "Create list not defined, and no keeper planets defined in preferences.*"
		gosub :SWITCHBOARD~switchboard
		halt
	end
end

setvar $custom_planet_name ""
getWordPos $bot~user_command_line $pos #34
if ($pos > 0)
	setvar $bot~user_command_line $bot~user_command_line&" "
	getText " "&$bot~user_command_line&" " $custom_planet_name " "&#34 #34&" "
	if ($custom_planet_name <> "")
		stripText $bot~user_command_line " "&#34&$custom_planet_name&#34&" "
		cuttext $custom_planet_name $first_letter 1 1
		cuttext $custom_planet_name $rest_of_letters 2 9999
		uppercase $first_letter
		setvar $custom_planet_name $first_letter&$rest_of_letters
	end
end

gosub :planetnames~make_planet_array

gosub :makeplanet
if (($startingLocation = "Citadel") OR ($startingLocation = "Planet"))
	setvar $planet~planet $startingPlanet
	gosub :PLANET~landingsub
end
halt

:MakePlanet
  # sys_check



  setVar $Failed 0
  gosub :PLAYER~QUIKSTATS

  setvar $sector $PLAYER~CURRENT_SECTOR
  setVar $Credits $PLAYER~CREDITS
  setVar $holds $PLAYER~TOTAL_HOLDS
  setVar $torps $PLAYER~GENESIS
  setVar $dets $PLAYER~ATOMIC
  setVar $figs $PLAYER~FIGHTERS
  setVar $shield $PLAYER~SHIELDS


  # see if we really can twarp
  if ((SECTOR.FIGS.QUANTITY[$Sector] <= 0) or ((SECTOR.FIGS.OWNER[$Sector] <> "belong to your Corp") and (SECTOR.FIGS.OWNER[$Sector] = "yours")) or (($PLAYER~TWARP_TYPE = 0) or ($PLAYER~TWARP_TYPE = "No")) or ($PLAYER~ALIGNMENT < 1000)) and ($WarpType = "T")
	setVar $SWITCHBOARD~message "Cannot twarp safely, so halting.  Check alignment and make sure fighter is in sector.*"
	gosub :SWITCHBOARD~switchboard
	halt
  end

  setVar $announce_message ""

  :bust

  if ($torps <= 0) or ($dets <= 1)
    # resupply
    gosub :sub_Resupply
  end

  if ($Failed > 0)
    return
  end

  send "uy n " #8 #8
  subtract $torps 1
  setTextLineTrigger 1 :Bust_TestPlanet "What do you want to name"
  pause

  :Bust_TestPlanet
  getWord CURRENTLINE $Type 11
  stripText $Type ")"
  lowercase $type

if ($wantedplanets[1] = 0)
	setvar $planet~planet_type $type
	lowercase $planet~planet_type
	striptext $planet~planet_type ")"
	#echo $planet~planet_type&"*"

	setVar $i 1
	setVar $foundPlanet FALSE
	setVar $isAKeeper FALSE
	while (($i <= $planet~planetcounter) AND ($foundPlanet = FALSE))
		lowercase $planet~planetList[$i]
		lowercase $planet~planet_type
		getWordPos $planet~planetList[$i] $pos $planet~planet_type
		if ($pos > 0)
			setVar $isAKeeper $planet~planetList[$i][7]
			setVar $foundPlanet TRUE
		end
		add $i 1
	end
	if ($isAKeeper = true)
		goto :Bust_Wanted
	end
else

  if ($wantedplanets = 0)
		setVar $SWITCHBOARD~message "Somehow no wanted planets are defined.  Halting.*"
		gosub :SWITCHBOARD~switchboard
		halt
  end
  # see if we want it
  setVar $i 1
  while ($i <= $WantedPlanets)
    if ($WantedPlanets[$i] = $Type)
		setVar $announce_message "Made "&$WantedPlanets[$i]&" planet!.*"
		goto :Bust_Wanted
    else
		#setVar $SWITCHBOARD~message "Looking for "&$WantedPlanets[$i]&", but found "&$Type&" instead.*"
		#gosub :SWITCHBOARD~switchboard
    end
    add $i 1
  end
end

  # we don't want it
  getRnd $name 1000 99999
  mergeText "Kill-" $name $longName
  send $longName "*cl"
  waitFor "Command [TL="

  # get its ID
  setTextLineTrigger 1 :Bust_Landed "Landing sequence engaged..."
  setTextLineTrigger 2 :Bust_GetID $longName
  pause
  :Bust_GetID
  setVar $line CURRENTLINE
  stripText $line "<"
  stripText $line ">"
  getWord $line $planetID 1
  send $planetID "* "
  killTrigger 1

  :Bust_Landed
  killTrigger 2
  # nuke it
  send "zdy  "
  subtract $dets 1
  goto :bust

  :Bust_Wanted
  # give it a nice name

if ($custom_planet_name = "")
	getRnd $planet~planet_pointer 1 1000
	setVar $first_part $planet~planet_names[$planet~planet_pointer]
	getWord $first_part $first_half 1
	getRnd $planet~planet_pointer 1 1000
	setVar $second_part $planet~planet_names[$planet~planet_pointer]
	getRnd $flip_a_coin 1 2
	getWord $second_part $last_half $flip_a_coin
	if (($last_half = "")  OR ($last_half = "0"))
		getWord $second_part $last_half 1
	end
	setVar $planet~planetLabel $first_half&" "&$last_half
	setVar $name $planet~planetLabel
else
	setvar $name $custom_planet_name
end
  send $Name "*cl"

  # get its ID
  waitOn "Should this be a"
  setTextLineTrigger 1 :Bust_Landed2 "Landing sequence engaged..."
  setTextLineTrigger 2 :Bust_GetID2 $Name
  pause
  :Bust_GetID2
  setVar $line CURRENTLINE
  stripText $line "<"
  stripText $line ">"
  getWord $line $PlanetID 1
  send "q*"
  killTrigger 1
  if ($announce_message <> "")
    setVar $SWITCHBOARD~message $announce_message
    gosub :SWITCHBOARD~switchboard
    setVar $announce_message ""
  end
  return

  :Bust_Landed2
  setTextLineTrigger 1 :Bust_Landed3 "Planet #"
  pause
  :Bust_Landed3
  getWord CURRENTLINE $PlanetID 2
  stripText $PlanetID "#"
  killTrigger 2
  send "q"
  if ($announce_message <> "")
    setVar $SWITCHBOARD~message $announce_message
    gosub :SWITCHBOARD~switchboard
    setVar $announce_message ""
  end
  return


:sub_Resupply
  if ($Credits < $CreditLimit)
    # low on cash
    setVar $Failed 1
    return
  end

  gosub :PLAYER~QUIKSTATS
  setVar $buyFigs ($figs - $PLAYER~FIGHTERS)
  setVar $buyShield ($shield - $PLAYER~SHIELDS)
  setVar $Credits $PLAYER~CREDITS

  loadvar $map~stardock

  if ($WarpType = "T")
    # TWarp to stardock
    gosub :calc_twarp_ore
    if ($ore_short > 0)
      if ($empty_holds <= 0)
        setVar $SWITCHBOARD~message "Need more ore for the round trip to StarDock, but the ship has no empty holds.*"
        gosub :SWITCHBOARD~switchboard
        setVar $Failed 1
        return
      end

      if ($empty_holds < $ore_short)
        setVar $SWITCHBOARD~message "Need "&$ore_short&" holds of ore for the round trip to StarDock, but only "&$empty_holds&" holds are free.*"
        gosub :SWITCHBOARD~switchboard
        setVar $Failed 1
        return
      end

      setVar $SeekProduct~Product 1
      setVar $SeekProduct~Holds $ore_short
      gosub :seekproduct
    end

    if ($map~stardock < 600) or (SECTORS > 5000)
      send $map~stardock "*yy"
    else
      send $map~stardock "yy"
    end
  else
    setVar $Warp~Mode $WarpType
    setVar $Warp~Dest $map~stardock
    gosub :warp
  end

  send "ps  g yg qh t"
  waitFor "Planning on starting a colony eh?"

  setTextTrigger Resupply_GetTorps :Resupply_GetTorps ") [0] ?"
  pause

  :Resupply_GetTorps
  getWord CURRENTLINE $Resupply_Torps 9
  stripText $Resupply_Torps ")"
  if ($torps >= 20)
    send "*a"
  elseif ($Resupply_Torps < (20 - $torps))
    send $Resupply_Torps "*a"
  else
    send (20 - $torps) "*a"
  end
  add $torps $Resupply_Torps

  waitFor "We have the standard Nuerevy Atomic Detonator"
  setTextTrigger Resupply_GetDets :Resupply_GetDets ") [0] ?"
  pause

  :Resupply_GetDets
  getWord CURRENTLINE $Resupply_Dets 9
  stripText $Resupply_Dets ")"
  send $Resupply_Dets "*"
  add $dets $Resupply_Dets

  if ($buyFigs > 0) or ($buyShield > 0)
    send "qs p "

    if ($buyFigs > 0)
      send "b" $buyFigs "*"
    end
    if ($buyShield > 0)
      send "c" $buyShield "*"
    end

    send "q"
  end

  send "qq"

  if ($WarpType = "T")
    if ($Sector < 600) or (SECTORS > 5000)
      send $Sector "*yy"
    else
      send $Sector "yy"
    end
  else
    setVar $Warp~Mode $WarpType
    setVar $Warp~Dest $Sector
    gosub :warp
  end

  return

:seekproduct
if ($seek_holds = 0)
  gosub :PLAYER~QUIKSTATS
  setvar $seek_holds $PLAYER~TOTAL_HOLDS
end

:seek_gogather
setvar $MOVE~CHECKSUB ":seek_checksector"
send "d"
gosub :MOVE~MOVE

if ($seek_found = "P")
:seek_buyproduct
  if ($seek_product = 1)
    setvar $HAGGLE~BUYPROD "Fuel"
  elseif ($seek_product = 2)
    setvar $HAGGLE~BUYPROD "Organics"
  else
    setvar $HAGGLE~BUYPROD "Equipment"
  end

  setvar $HAGGLE~QUANTITY 0
  setvar $HAGGLE~SECTOR $seek_source_sector
  send "pt"
  gosub :HAGGLE~HAGGLE

  if ($HAGGLE~ABORT)
    goto :seek_buyproduct
  end
else
  send "tnt"&$seek_product "*q"
end
return

:seek_checksector
setvar $FINDPRODUCT~QUANTITY $seek_holds
setvar $FINDPRODUCT~PRODUCT $seek_product
setvar $FINDPRODUCT~IGNORELIST $seek_ignorelist
setvar $FINDPRODUCT~STAYONPLANET 1
setvar $FINDPRODUCT~SECTOR $MOVE~CURSECTOR

gosub :FINDPRODUCT~FINDPRODUCT

setvar $seek_ignorelist $FINDPRODUCT~IGNORELIST

if ($FINDPRODUCT~LOCATION <> 0)
  setvar $MOVE~FOUND 1
  setvar $seek_source_sector $MOVE~CURSECTOR
  setvar $seek_found $FINDPRODUCT~LOCATION
end

return

:calc_twarp_ore
setvar $ore_required 0
setvar $ore_short 0
setvar $empty_holds ($PLAYER~TOTAL_HOLDS - ($PLAYER~ORE_HOLDS + $PLAYER~ORGANIC_HOLDS + $PLAYER~EQUIPMENT_HOLDS + $PLAYER~COLONIST_HOLDS))

getdistance $dist1 $PLAYER~CURRENT_SECTOR $MAP~STARDOCK
getdistance $dist2 $MAP~STARDOCK $PLAYER~CURRENT_SECTOR

if ($PLAYER~CURRENT_SECTOR <> $MAP~STARDOCK)
  if ($dist1 <= 0)
    setVar $SWITCHBOARD~message "Insufficient warp data plotting course to StarDock for makeplanet.*"
    gosub :SWITCHBOARD~switchboard
    setVar $Failed 1
    return
  end

  if ($dist2 <= 0)
    setVar $SWITCHBOARD~message "Insufficient warp data plotting return course from StarDock for makeplanet.*"
    gosub :SWITCHBOARD~switchboard
    setVar $Failed 1
    return
  end
end

setvar $ore_required (($dist1 + $dist2) * 3)
if ($PLAYER~ORE_HOLDS < $ore_required)
  setvar $ore_short ($ore_required - $PLAYER~ORE_HOLDS)
end

return

:warp
send $WARP~DEST "*"

settextlinetrigger MAKEPLANET_WARP_ARRIVED :warp_arrived "You are already in that sector!"
settextlinetrigger MAKEPLANET_WARP_BEGIN :warp_begin "<Move>"
pause

:warp_begin
killtrigger MAKEPLANET_WARP_ARRIVED
settexttrigger MAKEPLANET_WARP_START :warp_start "Engage the Autopilot?"
settexttrigger MAKEPLANET_WARP_TWARP :warp_twarp "Do you want to engage"
settextlinetrigger MAKEPLANET_WARP_SINGLE :warp_single "Sector  :"
pause

:warp_twarp
send "n"

:warp_start
send "e"

:warp_single
killtrigger MAKEPLANET_WARP_START
killtrigger MAKEPLANET_WARP_TWARP
killtrigger MAKEPLANET_WARP_SINGLE

setvar $warp_stopprompt 1
setvar $warp_mineprompt 1

:warp_mid
killtrigger MAKEPLANET_WARP_TOLLFIGS
killtrigger MAKEPLANET_WARP_FIGS
killtrigger MAKEPLANET_WARP_STOPPROMPT
killtrigger MAKEPLANET_WARP_MINESPROMPT
killtrigger MAKEPLANET_WARP_NEXTSECTOR
killtrigger MAKEPLANET_WARP_ARRIVED
settextlinetrigger MAKEPLANET_WARP_NEXTSECTOR :warp_nextsector "Sector  :"
settextlinetrigger MAKEPLANET_WARP_TOLLFIGS :warp_tollfigs "You have to destroy the fighters or pay"
settextlinetrigger MAKEPLANET_WARP_FIGS :warp_figs "You have to destroy the fighters to remain"
settexttrigger MAKEPLANET_WARP_STOPPROMPT :warp_stopprompt "Stop in this sector"
settexttrigger MAKEPLANET_WARP_MINESPROMPT :warp_minesprompt "Mined Sector:"
settexttrigger MAKEPLANET_WARP_ARRIVED :warp_arrived "Command [TL="
pause

:warp_nextsector
setvar $warp_stopprompt 1
setvar $warp_mineprompt 1
goto :warp_mid

:warp_tollfigs
if ($MOVE~ATTACK = 3)
  send "py"
else
  send "a9999*"
end
goto :warp_mid

:warp_figs
send "a9999*"
goto :warp_mid

:warp_stopprompt
if ($warp_stopprompt)
  send "n"
  setvar $warp_stopprompt 0
end
goto :warp_mid

:warp_minesprompt
if ($warp_mineprompt)
  send "n"
  setvar $warp_mineprompt 0
end
goto :warp_mid

:warp_arrived
killtrigger MAKEPLANET_WARP_BEGIN
killtrigger MAKEPLANET_WARP_START
killtrigger MAKEPLANET_WARP_TWARP
killtrigger MAKEPLANET_WARP_SINGLE
killtrigger MAKEPLANET_WARP_NEXTSECTOR
killtrigger MAKEPLANET_WARP_TOLLFIGS
killtrigger MAKEPLANET_WARP_FIGS
killtrigger MAKEPLANET_WARP_STOPPROMPT
killtrigger MAKEPLANET_WARP_MINESPROMPT
killtrigger MAKEPLANET_WARP_ARRIVED
return


# includes:

include "source\include\move"
include "source\include\loadvars"
include "source\include\findproduct"
include "source\include\haggle"
include "source\include\planetnames"
include "source\include\help"
include "source\include\switchboard.ts"
