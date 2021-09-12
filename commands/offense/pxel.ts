	gosub :BOT~loadVars

	setVar $BOT~help[1] $BOT~tab&"PXEL - Photon, Export, Enter, Land"
	setVar $BOT~help[2] $BOT~tab&"       Used to launch a Photon into an adjacent Sector then immediately"
	setVar $BOT~help[3] $BOT~tab&"       Export into another Ship and Enter Photon'd Sector; then Lands"
	setVar $BOT~help[4] $BOT~tab&"       on a planet."
	setVar $BOT~help[5] $BOT~tab&"   "
	setVar $BOT~help[6] $BOT~tab&"       pxel [Sector] [ShipNumber] [PlanetNumber]"

	gosub :bot~helpfile

    gosub :INVADER~check_invade_macro_params
    setVar $INVADER~speed_invade_macro  $INVADER~xport&$INVADER~enter&"       * "
    setVar $INVADER~normal_invade_macro     $INVADER~xport&$INVADER~enter&"** "
    goto :INVADER~start_invade_macro

halt

# includes:
include "source\module_includes\bot\loadvars\bot"
include "source\module_includes\bot\helpfile\bot"
include "source\module_includes\invader"
