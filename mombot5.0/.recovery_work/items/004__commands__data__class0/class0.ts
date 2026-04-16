

loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
loadvar $BOT_TURN_LIMIT
loadvar $USER_COMMAND_LINE
loadvar $PARM1



if ($PARM1 = "help")
  send "'*{" $BOT_NAME "} - class0 (sector) *"
  send "----------------------------------------*"
  send " --- Reports Both Class 0's if Known ---*"
  send "----------------------------------------*"
  send "---------- Written By Zarkahn ----------*"
  send "----------------------------------------*"
  send "*"
  halt
end
:TEST




send "'*"
send "Zarkahn's Class 0 Report*"
send "Rylos is Sector: " RYLOS "*"
send "Alpha Centauri is Sector: " ALPHACENTAURI "*"
send "Class 0 Report Complete*"
send "*"
halt
