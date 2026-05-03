#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:LOADVARS~LOADVARS
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
loadvar $BOT~MODE
loadvar $BOT~COMMAND
loadvar $BOT~COMMAND_TYPED
loadvar $BOT~COMMAND_CALLER
loadvar $BOT~MOMBOT_DIRECTORY
loadvar $BOT~MOMBOT_CONFIG_FILE
loadvar $SWITCHBOARD~BOT_NAME
setvar $BOT~BOT_NAME $SWITCHBOARD~BOT_NAME
loadvar $PLANET~PLANET_FILE
loadvar $SHIP~CAP_FILE
loadvar $BOT~USER_COMMAND_LINE
loadvar $BOT~PARM1
loadvar $BOT~PARM2
loadvar $BOT~PARM3
loadvar $BOT~PARM4
loadvar $BOT~PARM5
loadvar $BOT~PARM6
loadvar $BOT~PARM7
loadvar $BOT~PARM8
loadvar $BOT~BOT_TURN_LIMIT
loadvar $PLAYER~UNLIMITEDGAME
loadvar $MAP~STARDOCK
loadvar $MAP~RYLOS
loadvar $MAP~ALPHA_CENTAURI
loadvar $MAP~HOME_SECTOR
loadvar $MAP~BACKDOOR
loadvar $BOT~SILENT_RUNNING
loadvar $BOT~BOTISDEAF
loadvar $SWITCHBOARD~SELF_COMMAND
loadvar $PLANET~PLANET
loadvar $BOT~PASSWORD
loadvar $BOT~LETTER
loadvar $GAME~PORT_MAX
loadvar $BOT~FOLDER
loadvar $GAME~PHOTON_DURATION
loadvar $PLAYER~OVERRIDE
loadvar $PLAYER~SURROUNDFIGS
loadvar $PLAYER~SURROUNDLIMP
loadvar $PLAYER~SURROUNDMINE
loadvar $PLAYER~FIGHTER_DEPLOY_TYPE
loadvar $PLAYER~DROPOFFENSIVE
loadvar $PLAYER~DROPTOLL
gosub :LOADVARS~NORMALIZE_DEPLOY_PREFERENCES
return

#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
:LOADVARS~NORMALIZE_DEPLOY_PREFERENCES
#-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
if ($PLAYER~DROPOFFENSIVE = TRUE)
  setvar $PLAYER~DROPOFFENSIVE TRUE
  setvar $PLAYER~DROPTOLL FALSE
  setvar $PLAYER~FIGHTER_DEPLOY_TYPE "o"
elseif ($PLAYER~DROPTOLL = TRUE)
  setvar $PLAYER~DROPOFFENSIVE FALSE
  setvar $PLAYER~DROPTOLL TRUE
  setvar $PLAYER~FIGHTER_DEPLOY_TYPE "t"
else
  lowercase $PLAYER~FIGHTER_DEPLOY_TYPE
  if ($PLAYER~FIGHTER_DEPLOY_TYPE = "o")
    setvar $PLAYER~DROPOFFENSIVE TRUE
    setvar $PLAYER~DROPTOLL FALSE
    setvar $PLAYER~FIGHTER_DEPLOY_TYPE "o"
  elseif ($PLAYER~FIGHTER_DEPLOY_TYPE = "t")
    setvar $PLAYER~DROPOFFENSIVE FALSE
    setvar $PLAYER~DROPTOLL TRUE
    setvar $PLAYER~FIGHTER_DEPLOY_TYPE "t"
  else
    setvar $PLAYER~DROPOFFENSIVE FALSE
    setvar $PLAYER~DROPTOLL FALSE
    setvar $PLAYER~FIGHTER_DEPLOY_TYPE "d"
  end
end
savevar $PLAYER~DROPOFFENSIVE
savevar $PLAYER~DROPTOLL
savevar $PLAYER~FIGHTER_DEPLOY_TYPE
return
