:PLAYER~VOIDADJACENT

getsector $PLAYER~CURRENT_SECTOR $PLAYER~SECTORINFO
if ($PLAYER~SECTORINFO.WARP[1] = 0)
  send "'This sector has no warps, maybe you need to scan it first*"
  halt
else
  setvar $PLAYER~VOIDSECT 0
  :PLAYER~VOIDS
  add $PLAYER~VOIDSECT 1
  if ($PLAYER~VOIDSECT < 7)
    if ($PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT] <> 0)
      send "CV"&$PLAYER~SECTORINFO.WARP[$PLAYER~VOIDSECT]&"*Q"
    end
    goto :VOIDS
  end

  send "/"
  waiton " Sect "
end
return
