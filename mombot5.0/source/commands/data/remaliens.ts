


loadvar $BOT_NAME
loadvar $UNLIMITEDGAME
loadvar $BOT_TURN_LIMIT
loadvar $USER_COMMAND_LINE
loadvar $PARM1



if ($PARM1 = "help")
  send "'*{" $BOT_NAME "} - remaliens *"
  send "-----------------------------------*"
  send "----- Zarkahn's Alien Remember ----*"
  send "--- Based on Code by Promethius ---*"
  send "-----------------------------------*"
  send "-------- Modded By Zarkahn --------*"
  send "-----------------------------------*"
  send "*"
  halt
end





send "'Starting Alien Remember*"
waitfor "Message sent on sub-space channel"
send "'Most Code Thanks to Promethius*"
waitfor "Message sent on sub-space channel"

setdelaytrigger START :START 2000
pause
:START





setvar $START 11

while ($START <= SECTORS)
  getsector $START $CHKSECTOR
  if ($CHKSECTOR.EXPLORED = "YES")
    getwordpos $CHKSECTOR.CONSTELLATION $POS "uncharted"
    if ($POS = 0)
      getwordpos $CHKSECTOR.CONSTELLATION $POS "Space"
      if ($POS > 0)
        send "'" $CHKSECTOR.CONSTELLATION " in sector: " $START "*"
      end
    end
  end



  add $START 1
end

setdelaytrigger DONE :DONE 3000
pause
:DONE

send "'Sector Listing Complete*"
halt
