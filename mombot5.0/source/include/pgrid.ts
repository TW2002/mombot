# pgrid into sector #

:PGRID~RUN
:PGRID~PGRID
setvar $BOT~COMMAND "pgrid"
setvar $BOT~USER_COMMAND_LINE " pgrid " & $PGRIDSECTOR
setvar $BOT~PARM1 $PGRIDSECTOR
savevar $BOT~PARM1
savevar $BOT~COMMAND
savevar $BOT~USER_COMMAND_LINE
load "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\grid\pgrid.cts"
seteventtrigger PGRIDDONE :PGRID~PGRIDDONE "SCRIPT STOPPED" "scripts\"&$BOT~MOMBOT_DIRECTORY&"\commands\grid\pgrid.cts"
pause
:PGRID~PGRIDDONE
return
