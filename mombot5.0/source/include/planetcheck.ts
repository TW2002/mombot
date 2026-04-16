:planetcheck~planetcheck

setvar $planetcheck~i 1
setvar $planetcheck~ignorecount 0

:planetcheck~i
getword $planetcheck~ignorelist $planetcheck~ignore[$planetcheck~i] $planetcheck~i
if ($planetcheck~ignore[$planetcheck~i] <> 0)
  add $planetcheck~i 1
  add $planetcheck~ignorecount 1
  goto :I
end

setvar $planetcheck~ignorelist ""
setvar $planetcheck~found 0
send "l"

settextlinetrigger NOPLANET :NOPLANET "There isn't a planet in this sector."
settextlinetrigger MULTIPLEPLANETS :MULTIPLEPLANETS "Registry# and Planet Name"
settextlinetrigger SINGLEPLANET :SINGLEPLANET "Landing sequence engaged..."
pause

:planetcheck~noplanet
killtrigger MULTIPLEPLANETS
killtrigger SINGLEPLANET
return

:planetcheck~multipleplanets
killtrigger SINGLEPLANET
killtrigger NOPLANET
setvar $planetcheck~lastid 0

:planetcheck~nextplanet
settexttrigger PLANETSCHECKED :PLANETSCHECKED "Land on which planet <Q to abort>"
settextlinetrigger GETID :GETID "<"
pause

:planetcheck~getid
getword CURRENTLINE $planetcheck~word 1
if ($planetcheck~word = "Owned")
  settextlinetrigger GETID :GETID "<"
  pause
end

killtrigger PLANETSCHECKED
setvar $planetcheck~line CURRENTLINE
striptext $planetcheck~line "<"
striptext $planetcheck~line ">"
getword $planetcheck~line $planetcheck~id 1
if ($planetcheck~id = "Land")
  goto :PLANETSCHECKED
end

gosub :SUB_CHECKIGNORE

if (($planetcheck~id > $planetcheck~lastid) and ($planetcheck~ignore = 0))
  send $planetcheck~id "*"
  setvar $planetcheck~lastid $planetcheck~id
  gosub :SUB_CHECK

  if ($planetcheck~found <> 0)
    return
  end

  send "ql"
  waitfor "Registry# and Planet Name"
end
goto :NEXTPLANET

:planetcheck~planetschecked
killtrigger GETID
send "q*"
return

:planetcheck~singleplanet
killtrigger MULTIPLEPLANETS
killtrigger NOPLANET
gosub :SUB_CHECK
if ($planetcheck~found = 0)
  send "q"
end
return

:planetcheck~sub_check
settextlinetrigger CHECK_GETPLANET :CHECK_GETPLANET "Planet #"
pause
:planetcheck~check_getplanet
getword CURRENTLINE $planetcheck~check_planet 2
striptext $planetcheck~check_planet "#"


setvar $planetcheck~id $planetcheck~check_planet
gosub :SUB_CHECKIGNORE

if ($planetcheck~ignore = 0)
  gosub $planetcheck~planetchecksub

  if ($planetcheck~found = 1)
    setvar $planetcheck~found $planetcheck~check_planet
  end
end

return

:planetcheck~sub_checkignore
setvar $planetcheck~j 1
setvar $planetcheck~ignore 0
:planetcheck~j
if ($planetcheck~j <= $planetcheck~ignorecount)
  if ($planetcheck~ignore[$planetcheck~j] = $planetcheck~id)
    setvar $planetcheck~ignore 1
  else
    add $planetcheck~j 1
    goto :J
  end
end

return
