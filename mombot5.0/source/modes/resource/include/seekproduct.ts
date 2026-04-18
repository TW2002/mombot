:seekproduct~seekproduct

if ($seekproduct~holds = 0)
  gosub :playerinfo~infoquick
  setvar $seekproduct~holds $playerinfo~holds
end
:seekproduct~gogather

setvar $move~checksub ":SEEKPRODUCT~CHECKSECTOR"
send "d"
gosub :move~move

if ($seekproduct~found = "P")
  :seekproduct~buyproduct

  if ($seekproduct~product = 1)
    setvar $haggle~buyprod "Fuel"
  elseif ($seekproduct~product = 2)
    setvar $haggle~buyprod "Organics"
  else
    setvar $haggle~buyprod "Equipment"
  end

  setvar $haggle~quantity 0
  setvar $haggle~sector $seekproduct~sourcesector
  send "pt"
  gosub :haggle~haggle

  if ($haggle~abort)
    goto :BUYPRODUCT
  end
else
  send "tnt"&$seekproduct~product "*q"
end
return
:seekproduct~checksector


setvar $findproduct~quantity $seekproduct~holds
setvar $findproduct~product $seekproduct~product
setvar $findproduct~ignorelist $seekproduct~ignorelist
setvar $findproduct~stayonplanet 1
setvar $findproduct~sector $move~cursector

gosub :findproduct~findproduct

setvar $seekproduct~ignorelist $findproduct~ignorelist

if ($findproduct~location <> 0)
  setvar $move~found 1
  setvar $seekproduct~sourcesector $move~cursector
  setvar $seekproduct~found $findproduct~location
end

return
