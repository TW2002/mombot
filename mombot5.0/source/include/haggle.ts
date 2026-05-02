:HAGGLE~HAGGLE
:HAGGLE~STARTHAGGLE
#
# If defined, $haggle~buyprod will limit the routine to buying one of: Fuel, Organics, or Equipment.
# If not defined, the routine will attempt to buy any product that is offered.
#You have 11,511,493 credits and 147 empty cargo holds.
#
#We are buying up to 1940.  You have 108 in your holds.

waiton "Commerce report for"
setTextLineTrigger sell :sell "We are buying up to "
setTextLineTrigger buy :buy "We are selling up to "
setTextTrigger done :done "Command [TL="
pause

:sell
killTrigger done
send "*"
if (HAGGLE = FALSE)
  setVar $firstOffer 0
  setVar $offerPerc (1000 + $SellFactor[$Sector])
  :SellReset
  killTrigger line
  killTrigger offer
  setTextLineTrigger line :sellLine
  setTextTrigger offer :sellOffer "Your offer ["
  pause

  :sellLine
  getWord CURRENTLINE $test 1

  if ($test = 0)
    setVar $lastLineBlank 1
  else
    setVar $lastLinkBlank 0

    if (CURRENTLINE = "We're not interested.")
      goto :abort
    else
      cutText CURRENTLINE $test 1 12


      if ($test = "Command [TL=")
        goto :done
      else
        cutText CURRENTLINE $test 1 9

        if ($test = "You have ")
          goto :sellDone
        end
      end
    end
  end

  setTextLineTrigger line :sellLine
  pause

  :sellOffer
  # get the first offer (if we don't have it)
  if ($firstOffer = 0)
    getWord CURRENTLINE $firstOffer 3
    stripText $firstOffer "["
    stripText $firstOffer "]"
    stripText $firstOffer ","
  end

  # calculate and make an offer
  setVar $offer $firstOffer
  multiply $offer $offerPerc
  divide $offer 1000
  send $offer "*"
  if ($SellFactor[$Sector] < 0)
    if ($SellDone[$Sector])
      add $offerPerc 5
      add $SellFactor[$Sector] 5
    else
      add $offerPerc 10
      add $SellFactor[$Sector] 10
    end
  else
    if ($SellDone[$Sector])
      subtract $offerPerc 3
      subtract $SellFactor[$Sector] 3
    else
      subtract $offerPerc 10
      subtract $SellFactor[$Sector] 10
    end
  end
  goto :sellReset

  :sellDone
  # product sold, get credits
  getWord CURRENTLINE $test 3
  if ($test <> "been")
    setVar $Credits $test
    stripText $Credits ","
  end
  killTrigger offer
  killTrigger line
  setVar $SellDone[$Sector] 1
  if ($SellFactor[$Sector] < 0)
    subtract $SellFactor[$sector] 4
  else
    add $SellFactor[$Sector] 6
  end
end
setTextTrigger done :done "Command [TL="
pause

:buy
killTrigger done

# make sure we're buying the right stuff
waitOn "do you want to buy ["
getWord CURRENTLINE $Product 5
if ($Product <> $buyProd)
    send "0*"
    setTextLineTrigger Buy :Buy "We are selling up to "
    setTextTrigger done :done "Command [TL="
    pause
end

if ($Quantity > 0)
  send $Quantity "*"
else
  send "*"
end

if (HAGGLE = FALSE)
  setVar $firstOffer 0
  setVar $offerPerc (1000 - $BuyFactor[$Sector])
  :buyReset
  killTrigger line
  killTrigger offer
  setTextLineTrigger line :buyLine
  setTextTrigger offer :BuyOffer "Your offer ["
  pause

  :buyLine
  getWord CURRENTLINE $test 1

  if ($test = 0)
    setVar $lastLineBlank 1
  else
    setVar $lastLinkBlank 0

    if (CURRENTLINE = "We're not interested.")
      goto :Abort
    else
      cutText CURRENTLINE $test 1 12
      if ($test = "Command [TL=")
        goto :Done
      else
        cutText CURRENTLINE $test 1 9

        if ($test = "You have ")
          goto :BuyDone
        end
      end
    end
  end

  setTextLineTrigger line :buyLine
  pause

  :buyOffer
  if ($lastLinkBlank)
    # prompt display caused by a message
    setTextTrigger offer :buyOffer "Your offer ["
    pause
  end

  # get the first offer (if we don't have it)
  if ($firstOffer = 0)
    getWord CURRENTLINE $firstOffer 3
    stripText $firstOffer "["
    stripText $firstOffer "]"
    stripText $firstOffer ","
  end

  # calculate and make an offer
  setVar $offer $firstOffer
  multiply $offer $offerPerc
  divide $offer 1000
  send $offer "*"
  if ($BuyFactor[$Sector] < 0)
    if ($BuyDone[$Sector])
      subtract $offerPerc 5
      add $BuyFactor[$Sector] 5
    else
      subtract $offerPerc 10
      add $BuyFactor[$Sector] 10
    end
  else
    if ($BuyDone[$Sector])
      add $offerPerc 3
      subtract $BuyFactor[$Sector] 3
    else
      add $offerPerc 10
      subtract $BuyFactor[$Sector] 10
    end
  end
  goto :BuyReset

  :buyDone
  # product bought, get credits
  getWord CURRENTLINE $test 3
  if ($test <> "been")
    setVar $Credits $test
    stripText $Credits ","
  end
  killTrigger offer
    killTrigger line
  setVar $BuyDone[$Sector] 1

  if ($BuyFactor[$Sector] < 0)
    subtract $BuyFactor[$sector] 4
  else
    add $BuyFactor[$Sector] 6
  end
end

setTextLineTrigger buy :buy "We are selling up to "
setTextTrigger done :done "Command [TL="
pause

:abort
setVar $abort 1
killTrigger buy
killTrigger sell
killTrigger done
killTrigger line
killTrigger offer
setTextLineTrigger buy :buy "We are selling up to "
setTextLineTrigger sell :sell "We are buying up to "
setTextTrigger done :done "Command [TL="
pause

:Done
killTrigger abort
killTrigger sell
killTrigger buy
setVar $Quantity 0
return
