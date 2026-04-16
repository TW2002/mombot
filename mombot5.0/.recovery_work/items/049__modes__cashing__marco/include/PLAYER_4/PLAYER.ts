:PLAYER~FINDJUMPSECTOR
setvar $PLAYER~I 1
setvar $PLAYER~RED_ADJ 0
send "q q * "
while (SECTOR.WARPSIN[$PLAYER~TARGET][$PLAYER~I] > 0)
  setvar $PLAYER~RED_ADJ SECTOR.WARPSIN[$PLAYER~TARGET][$PLAYER~I]
  if ($PLAYER~RED_ADJ > 10)
    send "m "&$PLAYER~RED_ADJ&"* y"
    settexttrigger TWARPBLIND :TWARPBLIND "Do you want to make this jump blind? "
    settexttrigger TWARPLOCKED :TWARPLOCKED "All Systems Ready, shall we engage? "
    settextlinetrigger TWARPVOIDED :TWARPVOIDED "Danger Warning Overridden"
    settextlinetrigger TWARPADJ :TWARPADJ "<Set NavPoint>"
    pause
    :PLAYER~TWARPADJ
    gosub :KILLFINDJUMPSECTORS
    send " * "
    return
    :PLAYER~TWARPVOIDED

    gosub :KILLFINDJUMPSECTORS
    send " N N "
    goto :TRYINGNEXTADJ
    :PLAYER~TWARPLOCKED

    gosub :KILLFINDJUMPSECTORS
    goto :SECTORLOCKED
    :PLAYER~TWARPBLIND

    gosub :KILLFINDJUMPSECTORS
    send " N "
  end
  :PLAYER~TRYINGNEXTADJ
  add $PLAYER~I 1
end
:PLAYER~NOADJSFOUND

setvar $PLAYER~RED_ADJ 0
return
:PLAYER~SECTORLOCKED

if ($PLAYER~TARGET = $MAP~STARDOCK)
  setvar $MAP~BACKDOOR $PLAYER~RED_ADJ
  savevar $MAP~BACKDOOR
end
return
:PLAYER~KILLFINDJUMPSECTORS

killtrigger TWARPBLIND
killtrigger TWARPLOCKED
killtrigger TWARPVOIDED
killtrigger TWARPADJ
return
