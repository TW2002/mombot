:planetloop~planetloop

setvar $planetloop~i 1
setvar $planetloop~ignorecount 0
:planetloop~i
getword $planetloop~ignorelist $planetloop~ignore[$planetloop~i] $planetloop~i
if ($planetloop~ignore[$planetloop~i] <> 0)
  add $planetloop~i 1
  add $planetloop~ignorecount 1
  goto :I
end
setvar $planetloop~ignorelist ""

setvar $planetloop~found 0
send "l"

settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger MULTIPLEPLANETS :MULTIPLEPLANETS "Registry# and Planet Name"
settextlinetrigger SINGLEPLANET :SINGLEPLANET "Landing sequence engaged..."
pause
:planetloop~noplanet

killtrigger MULTIPLEPLANETS
killtrigger SINGLEPLANET
return
:planetloop~multipleplanets

killtrigger SINGLEPLANET
killtrigger NOPLANET
setvar $planetloop~lastid 0
:planetloop~nextplanet

settexttrigger PLANETSCHECKED :PLANETSCHECKED "Land on which planet <Q to abort>"
settextlinetrigger GETID :GETID "<"
pause
:planetloop~getid

getword CURRENTLINE $planetloop~word 1
if ($planetloop~word = "Owned")
  settextlinetrigger GETID :GETID "<"
  pause
end

killtrigger PLANETSCHECKED
setvar $planetloop~line CURRENTLINE
striptext $planetloop~line "<"
striptext $planetloop~line ">"
getword $planetloop~line $planetloop~id 1
if ($planetloop~id = "Land")
  goto :PLANETSCHECKED
end

gosub :SUB_CHECKIGNORE

if (($planetloop~id > $planetloop~lastid) and ($planetloop~ignore = 0))
  send $planetloop~id "*"
  setvar $planetloop~lastid $planetloop~id
  gosub :SUB_CHECK

  if ($planetloop~found <> 0)
    return
  end

  send "ql"
  waitfor "Registry# and Planet Name"
end
goto :NEXTPLANET
:planetloop~planetschecked

killtrigger GETID
send "q*"
return
:planetloop~singleplanet

killtrigger MULTIPLEPLANETS
killtrigger NOPLANET
gosub :SUB_CHECK
if ($planetloop~found = 0)
  send "q"
end
return
:planetloop~sub_check

settextlinetrigger CHECK_GETPLANET :CHECK_GETPLANET "Planet #"
pause
:planetloop~check_getplanet
getword CURRENTLINE $planetloop~check_planet 2
striptext $planetloop~check_planet "#"

setvar $planetloop~id $planetloop~check_planet
gosub :SUB_CHECKIGNORE

if ($planetloop~ignore = 0)
  gosub $planetloop~loopsub
end

return
:planetloop~sub_checkignore

setvar $planetloop~j 1
setvar $planetloop~ignore 0
:planetloop~j
if ($planetloop~j <= $planetloop~ignorecount)
  if ($planetloop~ignore[$planetloop~j] = $planetloop~id)
    setvar $planetloop~ignore 1
  else
    add $planetloop~j 1
    goto :J
  end
end

return
