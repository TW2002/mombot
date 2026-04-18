:gather~gather

setvar $gather~gathered 0
setvar $gather~failed 0

if ($gather~holds = 0)
  gosub :playerinfo~infoquick
  setvar $gather~holds $playerinfo~holds
end
:gather~gogather


if (($gather~quantity - $gather~gathered) < $gather~holds)
  setvar $gather~get ($gather~quantity - $gather~gathered)
else
  setvar $gather~get $gather~holds
end

if ($gather~seek)

  setvar $move~checksub ":GATHER~CHECKSECTOR"
  send "d"
  gosub :move~move
else

  setvar $findproduct~quantity $gather~get
  setvar $findproduct~product $gather~product
  setvar $findproduct~ignorelist $gather~ignorelist
  setvar $findproduct~stayonplanet 1
  setvar $findproduct~sector $gather~sector

  gosub :findproduct~findproduct

  setvar $gather~ignorelist $findproduct~ignorelist

  if ($findproduct~location = 0)

    setvar $gather~failed 1
    send "t"
    return
  end

  setvar $gather~sourcesector $gather~sector
  setvar $gather~found $findproduct~location
end

if ($gather~product = "C")
  setvar $moveproduct~sourcecategory $findproduct~category
  setvar $moveproduct~destcategory $gather~destcategory
end


setvar $moveproduct~source $gather~found
setvar $moveproduct~sourcesector $gather~sourcesector
setvar $moveproduct~dest $gather~planetid
setvar $moveproduct~destsector $gather~sector
setvar $moveproduct~product $gather~product
setvar $moveproduct~quantity ($gather~quantity - $gather~gathered)
setvar $moveproduct~safe 0
gosub :moveproduct~moveproduct

add $gather~gathered $moveproduct~moved

if ($gather~gathered < $gather~quantity)
  send "q"
  goto :GOGATHER
end

if ($gather~stayonplanet = 0)
  send "q"
end
return
:gather~checksector



setvar $findproduct~quantity $gather~get
setvar $findproduct~product $gather~product
setvar $findproduct~ignorelist $gather~ignorelist
setvar $findproduct~stayonplanet 1
setvar $findproduct~sector $move~cursector

gosub :findproduct~findproduct

setvar $gather~ignorelist $findproduct~ignorelist

if ($findproduct~location <> 0)
  setvar $move~found 1
  setvar $gather~sourcesector $move~cursector
  setvar $gather~found $findproduct~location
end

return
