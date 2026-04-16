
loadglobal $PLAYER~SWATHOFF
:PLAYER~SWATHOFF
if ($PLAYER~SWATHOFF = FALSE)
  settexttrigger SWATHISON :SWATHISON "Command [TL="
  setdelaytrigger SWATHISOFF :SWATHISOFF 2000
  pause
  :PLAYER~SWATHISON

  killtrigger SWATHISOFF
  killtrigger SWATHISON
  setvar $PLAYER~SWATHOFFMESSAGE "Detected SWATH Autohaggle"
  setvar $PLAYER~SWATHOFF FALSE
  saveglobal $PLAYER~SWATHOFF
  return
  :PLAYER~SWATHISOFF

  killtrigger SWATHISOFF
  killtrigger SWATHISON
  setvar $PLAYER~SWATHOFF TRUE
  saveglobal $PLAYER~SWATHOFF
end
return
