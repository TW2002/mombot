




loadvar $BOT_NAME


loadvar $UNLIMITEDGAME


loadvar $BOT_TURN_LIMIT


loadvar $USER_COMMAND_LINE


loadvar $PARM1




if ($PARM1 = "help")
  send "'*{" $BOT_NAME "} - msl (all) or (sector)*"
  send "------- Will Check Sector to see if it's a MSL -------*"
  send "-- If all, will output all MSL sectors to Subspace. --*"
  send "--- Location of Rylos and Alpha Cen Must be Known. ---*"
  send "------------------------------------------------------*"
  send "----------------- Written By Zarkahn -----------------*"
  send "------------------------------------------------------*"
  send "*"
  halt
end

isnumber $TEST $PARM1
if (($TEST = FALSE) and ($PARM1 <> "all"))
  send "'{" $BOT_NAME "} - Invalid Sector. Please enter a Sector number or 'all'.*"
  halt
end

send "'Zarkahn's MSL Check, Processing Data, Stand By*"
gosub :ZMSL

if ($PARM1 = "all")
  goto :REPORTALL
end

getsector $PARM1 $CHKSECTOR
getsectorparameter $PARM1 "MSLSEC" $MSL
isnumber $RESULT $MSL
if ($RESULT > 0)
  send "'MSL Check Completed*"
  send "'Sector " $PARM1 " IS A MSL*"
  halt
end

send "'MSL Check Completed*"
send "'Sector " $PARM1 " Is NOT a MSL*"
halt
:REPORTALL


setvar $START 1

while ($START <= SECTORS)
  getsector $START $CHKSECTOR
  getsectorparameter $START "MSLSEC" $MSL
  isnumber $RESULT $MSL
  if ($RESULT > 0)
    send "'Sector " $START " is MSL*"
  end
  add $START 1
end
send "'MSL Output Completed, Halting*"
halt
:ZMSL


setvar $FORSURE 1

while ($FORSURE < 11)
  setsectorparameter $FORSURE "MSLSEC" TRUE
  add $FORSURE 1
end
:CHECK_AC


if (ALPHACENTAURI = 0)
  send "'AC is not known, Shutting Down*"
  halt
end
setsectorparameter ALPHACENTAURI "MSLSEC" TRUE
:CHECK_RYLOS
if (RYLOS = 0)
  send "'Rylos not Known, Shutting Down*"
  halt
end
setsectorparameter RYLOS "MSLSEC" TRUE
:RUN_TERRA1
setvar $FROM 1
getcourse $WARP $FROM STARDOCK
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_TERRA2

getcourse $WARP $FROM ALPHACENTAURI
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_TERRA3

getcourse $WARP $FROM RYLOS
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_DOCK1

setsectorparameter STARDOCK "MSLSEC" TRUE
setvar $FROM STARDOCK
getcourse $WARP $FROM 1
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_DOCK2

getcourse $WARP $FROM ALPHACENTAURI
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_DOCK3

getcourse $WARP $FROM RYLOS
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_AC1

setvar $FROM ALPHACENTAURI
getcourse $WARP $FROM 1
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_AC2

getcourse $WARP $FROM STARDOCK
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_AC3

getcourse $WARP $FROM RYLOS
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_RYLOS1

setvar $FROM RYLOS
getcourse $WARP $FROM 1
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_RYLOS2

getcourse $WARP $FROM STARDOCK
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end
:RUN_RYLOS3

getcourse $WARP $FROM ALPHACENTAURI
setvar $C 1
while ($C < $WARP)
  setsectorparameter $WARP[$C] "MSLSEC" TRUE
  add $C 1
end

send "'MSL Search Complete Sector Parameters Set*"
return
