:PLAYER~STARTCNSETTINGS
send "CN"
settextlinetrigger ANSI1 :CNCHECK "(1) ANSI graphics            - Off"
settextlinetrigger ANIM1 :CNCHECK "(2) Animation display        - On"
settextlinetrigger PAGE1 :CNCHECK "(3) Page on messages         - On"
settextlinetrigger SETSSCHN :SETSSCHN "(4) Sub-space radio channel"
settextlinetrigger SILENCE1 :CNCHECK "(7) Silence ALL messages     - Yes"
settextlinetrigger ABORTDISPLAY1 :CNCHECK "(9) Abort display on keys    - ALL KEYS"
settextlinetrigger MESSAGEDISPLAY1 :CNCHECK "(A) Message Display Mode     - Long"
settextlinetrigger SCREENPAUSES1 :CNCHECK "(B) Screen Pauses            - Yes"
settextlinetrigger ONLINEAUTOFLEE0 :CNCDONE "(C) Online Auto Flee         - Off"
settextlinetrigger ONLINEAUTOFLEE1 :CNCALMOSTDONE "(C) Online Auto Flee         - On"
pause
:PLAYER~CNCHECK
gosub :GETCNC
pause
:PLAYER~SETSSCHN
getword CURRENTLINE $BOT~SUBSPACE 6
if ($BOT~SUBSPACE = 0)
  getrnd $BOT~SUBSPACE 101 60000
  send 4&$BOT~SUBSPACE&"*"
end
savevar $BOT~SUBSPACE
pause
:PLAYER~CNCALMOSTDONE
gosub :GETCNC
:PLAYER~CNCDONE
send "QQ"
killtrigger 1
killtrigger 2
settexttrigger 1 :SUBSTARTCNCONTINUE "Command [TL="
settexttrigger 2 :SUBSTARTCNCONTINUE "Citadel command (?=help)"
pause
:PLAYER~SUBSTARTCNCONTINUE
killtrigger 1
killtrigger 2
return
:PLAYER~GETCNC
getword CURRENTLINE $PLAYER~CNC 1
striptext $PLAYER~CNC "("
striptext $PLAYER~CNC ")"
send $PLAYER~CNC&"  "
return
