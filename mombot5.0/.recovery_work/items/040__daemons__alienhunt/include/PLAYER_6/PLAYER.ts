:PLAYER~CLEARADJACENT
getsector $PLAYER~CURRENT_SECTOR $PLAYER~SECTORINFO
if ($PLAYER~SECTORINFO.WARP[1] = 0)
  setvar $SWITCHBOARD~MESSAGE "This sector has no warps, try to scan it first!*"
  gosub :SWITCHBOARD~SWITCHBOARD
  return
else
  setvar $PLAYER~VOIDSECT 0
  :PLAYER~CLEARVOIDS
  add $PLAYER~VOIDSECT 1
  if ($PLAYER~VOIDSECT < 7)
    if ($PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT] <> 0)
      send "CV0*YN"&$PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT]&"*Q"
    end
    goto :CLEARVOIDS
  end

  send "/"
  waiton " Sect "
end
return
