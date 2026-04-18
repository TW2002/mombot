:moveproduct~moveproduct
gosub :playerinfo~infoquick

setvar $moveproduct~pscan $playerinfo~planetscanner
setvar $moveproduct~credits $playerinfo~credits
setvar $moveproduct~moved 0
setvar $moveproduct~restore_haggle 0

if (($moveproduct~source = "P") and HAGGLE)
  setvar $moveproduct~restore_haggle 1
  autohaggle "OFF"
end

if ($moveproduct~product = 4)
  send "qc;ql " $moveproduct~source "* "

  settextlinetrigger GETMAXFIGS :GETMAXFIGS "Max Fighters:"
  pause
  :moveproduct~getmaxfigs
  cuttext CURRENTLINE $moveproduct~holds 48 7
  striptext $moveproduct~holds ","
  striptext $moveproduct~holds " "
else
  setvar $moveproduct~holds $playerinfo~holds
end

if ($moveproduct~sourcesector <> $moveproduct~destsector)
  setvar $moveproduct~safe 1
end

if ($moveproduct~product = "C")
  setvar $moveproduct~pickuptext "snt"&$moveproduct~sourcecategory
  setvar $moveproduct~dropofftext "snl"&$moveproduct~destcategory
  setvar $moveproduct~waittext "Which production group are you changing?"
elseif ($moveproduct~product = 4)
  setvar $moveproduct~pickuptext "mnt"
  setvar $moveproduct~dropofftext "mnl"
  setvar $moveproduct~waittext "There are currently "
else
  setvar $moveproduct~pickuptext "tnt"&$moveproduct~product
  setvar $moveproduct~dropofftext "tnl"&$moveproduct~product
  setvar $moveproduct~waittext "Which product are you leaving?"
end

if (($moveproduct~source = "P") and ($moveproduct~portquantity = 0))

  send "cr*q"

  waiton "Commerce report for "

  if ($moveproduct~product = 1)
    settextlinetrigger GETPRODUCT :GETPRODUCT "Fuel Ore   "
  elseif ($moveproduct~product = 2)
    settextlinetrigger GETPRODUCT :GETPRODUCT "Organics   "
  else
    settextlinetrigger GETPRODUCT :GETPRODUCT "Equipment  "
  end
  pause
  :moveproduct~getproduct

  if ($moveproduct~product = 1)
    getword CURRENTLINE $moveproduct~portquantity 4
  else
    getword CURRENTLINE $moveproduct~portquantity 3
  end
end


if ($moveproduct~source = "P")
  if ($moveproduct~portquantity < $moveproduct~quantity)
    setvar $moveproduct~quantity $moveproduct~portquantity
  end
else
  send "d"
  gosub :planetinfo~planetinfo

  if ($moveproduct~product = "C")
    if ($planetinfo~colo[$moveproduct~sourcecategory] < $moveproduct~quantity)
      setvar $moveproduct~quantity $planetinfo~colo[$moveproduct~sourcecategory]
    end
  else
    if ($planetinfo~amount[$moveproduct~product] < $moveproduct~quantity)
      setvar $moveproduct~quantity $planetinfo~amount[$moveproduct~product]
    end
  end
end

if ($moveproduct~safe)
  setvar $moveproduct~firstrun 1
  setvar $moveproduct~finished 0

  if ($moveproduct~product = "C")
    setvar $moveproduct~planetamount $planetinfo~colo[$moveproduct~sourcecategory]
  else
    setvar $moveproduct~planetamount $planetinfo~amount[$moveproduct~product]
  end
  :moveproduct~safecycle

  if ($moveproduct~quantity < $moveproduct~holds)
    setvar $moveproduct~pickup $moveproduct~quantity
  else
    setvar $moveproduct~pickup $moveproduct~holds
  end

  if ($moveproduct~source = "P")
    if ($moveproduct~pickup = 0)

      gosub :SUB_LANDDEST
      waiton "Planet #"&$moveproduct~dest
      waiton "Planet command (?=help)"
      gosub :RESTOREHAGGLE
      return
    end


    if ($moveproduct~product = 1)
      setvar $moveproduct~buyprod "Fuel"
    elseif ($moveproduct~product = 2)
      setvar $moveproduct~buyprod "Organics"
    else
      setvar $moveproduct~buyprod "Equipment"
    end
    :moveproduct~retryhaggle

    send "pt"
    setvar $moveproduct~sector $moveproduct~sourcesector

    if ($moveproduct~pickup < $moveproduct~holds)
      setvar $moveproduct~quantity $moveproduct~pickup
    end

    waiton "Docking..."

    settextlinetrigger BUY :BUY "We are selling up to "
    settextlinetrigger SELL :SELL "We are buying up to "
    pause
    :moveproduct~buy

    killtrigger GETCREDITS
    killtrigger DONE
    settexttrigger ONHAND :BUYONHAND "]?"
    pause
    :moveproduct~buyonhand

    getword CURRENTLINE $moveproduct~product 5
    if ($moveproduct~product <> $moveproduct~buyprod)
      send "0*"
      settexttrigger GETCREDITS :GETCREDITS "empty cargo holds."
      pause
    end
    send "*"

    settexttrigger GETCREDITS :GETCREDITS "empty cargo holds."
    pause
    :moveproduct~getcredits
    killtrigger CLASS0
    killtrigger BUY
    killtrigger SELL
    getword CURRENTLINE $moveproduct~credits 3
    striptext $moveproduct~credits ","
    settextlinetrigger BUY :BUY "We are selling up to "
    settextlinetrigger SELL :SELL "We are buying up to "
    settexttrigger HAGGLEDONE :HAGGLEDONE "Command [TL="
    pause
    :moveproduct~haggledone
    killtrigger BUY
    killtrigger SELL


    if ($moveproduct~abort)
      goto :RETRYHAGGLE
    end

    if ($moveproduct~credits < 10000)
      setvar $moveproduct~finished 1
    end
  else
    if ($moveproduct~firstrun = 0)

      gosub :planetinfo~planetinfo

      if ($moveproduct~product = "C")
        setvar $moveproduct~planetamount $planetinfo~colo[$moveproduct~sourcecategory]
      else
        setvar $moveproduct~planetamount $planetinfo~amount[$moveproduct~product]
      end
    end

    if ($moveproduct~planetamount < $moveproduct~pickup)
      setvar $moveproduct~pickup $moveproduct~planetamount
    end

    if ($moveproduct~pickup = 0)

      setvar $moveproduct~finished 1
      send "q"
    else
      if ($moveproduct~pickup = $moveproduct~holds)
        send $moveproduct~pickuptext "*q"
      else
        send $moveproduct~pickuptext $moveproduct~pickup "*q"
      end
    end
  end


  if ($moveproduct~sourcesector <> $moveproduct~destsector)
    setvar $warp~dest $moveproduct~destsector
    setvar $warp~mode "E"
    gosub :warp~warp
  end


  if ($moveproduct~finished)
    gosub :SUB_LANDDEST
    waiton "<Preparing ship to land"
  else
    if ($moveproduct~pscan or (SECTOR.PLANETCOUNT[$moveproduct~destsector] > 1))
      send "l " $moveproduct~dest "*" $moveproduct~dropofftext "*"
    else
      send "l " $moveproduct~dropofftext "*"
    end
    waiton $moveproduct~waittext
  end

  waiton "Planet command (?=help)"
  subtract $moveproduct~quantity $moveproduct~pickup
  add $moveproduct~moved $moveproduct~pickup

  if (($moveproduct~quantity <= 0) or $moveproduct~finished)

    gosub :RESTOREHAGGLE
    return
  end

  send "q"

  if ($moveproduct~sourcesector <> $moveproduct~destsector)
    setvar $warp~dest $moveproduct~sourcesector
    setvar $warp~mode "E"
    gosub :warp~warp
  end

  if ($moveproduct~source <> "P")

    gosub :SUB_LANDSOURCE
  end

  setvar $moveproduct~firstrun 0
  goto :SAFECYCLE

else

  setvar $moveproduct~cycles ($moveproduct~quantity / $moveproduct~holds)
  setvar $moveproduct~remainder ($moveproduct~quantity - ($moveproduct~cycles * $moveproduct~holds))

  if ($moveproduct~remainder > 0)
    add $moveproduct~cycles 1
  end

  if ($moveproduct~source <> "P")
    send "q"
  end



  if ($moveproduct~cycles <= 0)

    gosub :SUB_LANDDEST
    gosub :RESTOREHAGGLE
    return
  end

  setvar $gameprefs~bank "MOVEPRODUCT"
  setvar $gameprefs~abortdisplayall[$gameprefs~bank] "ON"
  setvar $gameprefs~ansi[$gameprefs~bank] "ON"
  gosub :gameprefs~setgameprefs

  setvar $moveproduct~clock 3
  :moveproduct~cycle


  setvar $moveproduct~send ""

  if ($moveproduct~source = "P")


    setvar $moveproduct~send "pt"

    if ((($moveproduct~product = 2) or ($moveproduct~product = 3)) and (PORT.BUYFUEL[$moveproduct~sourcesector] = 0))
      setvar $moveproduct~send $moveproduct~send&"0*"
    end
    if (($moveproduct~product = 3) and (PORT.BUYORG[$moveproduct~sourcesector] = 0))
      setvar $moveproduct~send $moveproduct~send&"0*"
    end

    if (($moveproduct~cycles = 1) and ($moveproduct~remainder > 0))
      setvar $moveproduct~send $moveproduct~send&$moveproduct~remainder&"**"
    else
      setvar $moveproduct~send $moveproduct~send&"**"
    end

    if ((($moveproduct~product = 1) or ($moveproduct~product = 2)) and (PORT.BUYEQUIP[$moveproduct~sourcesector] = 0))
      setvar $moveproduct~send $moveproduct~send&"0*"
    end
    if (($moveproduct~product = 1) and (PORT.BUYORG[$moveproduct~sourcesector] = 0))
      setvar $moveproduct~send $moveproduct~send&"0*"
    end

  else


    if ($moveproduct~pscan or (SECTOR.PLANETCOUNT[$moveproduct~sourcesector] > 1))
      setvar $moveproduct~send $moveproduct~send&"l"&$moveproduct~source&"*"
    else
      setvar $moveproduct~send $moveproduct~send&"l"
    end

    if (($moveproduct~cycles = 1) and ($moveproduct~remainder > 0))
      setvar $moveproduct~send $moveproduct~send&$moveproduct~pickuptext&$moveproduct~remainder&"*q"
    else
      setvar $moveproduct~send $moveproduct~send&$moveproduct~pickuptext&"*q"
    end
  end


  setvar $moveproduct~send $moveproduct~send&"l"&$moveproduct~dest&"*"&$moveproduct~dropofftext&"*q"

  send $moveproduct~send
  subtract $moveproduct~cycles 1

  if (($moveproduct~cycles = 1) and ($moveproduct~remainder > 0))
    add $moveproduct~moved $moveproduct~remainder
  else
    add $moveproduct~moved $moveproduct~holds
  end

  if ($moveproduct~cycles <= 0)



    while ($moveproduct~clock < 4)
      waiton $moveproduct~waittext
      add $moveproduct~clock 1
    end


    setvar $gameprefs~bank "MOVEPRODUCT"
    gosub :gameprefs~setgameprefs

    send "l" $moveproduct~dest "*"
    waiton "Planet command (?=help)"

    gosub :RESTOREHAGGLE
    return
  end

  if ($moveproduct~clock > 0)
    subtract $moveproduct~clock 1
  else
    if ($moveproduct~source = "P")

      settextlinetrigger GETCREDITS :GETCREDITS "Your offer ["
      pause
      :moveproduct~getcredits
      getword CURRENTLINE $moveproduct~offer 3
      striptext $moveproduct~offer ","
      striptext $moveproduct~offer "["
      striptext $moveproduct~offer "]"
      subtract $moveproduct~credits $moveproduct~offer

      if ($moveproduct~credits < 10000)

        setvar $moveproduct~cycles 0
      end
    end
    waiton $moveproduct~waittext
  end

  goto :CYCLE
end
:moveproduct~restorehaggle
if ($moveproduct~restore_haggle = 1)
  autohaggle "ON"
  setvar $moveproduct~restore_haggle 0
end
return
:moveproduct~sub_landdest


if ($moveproduct~pscan or (SECTOR.PLANETCOUNT[$moveproduct~destsector] > 1))
  send "l " $moveproduct~dest "*"
else
  send "l "
end

return
:moveproduct~sub_landsource

if ($moveproduct~pscan or (SECTOR.PLANETCOUNT[$moveproduct~sourcesector] > 1))
  send "l " $moveproduct~source "*"
else
  send "l"
end

return
