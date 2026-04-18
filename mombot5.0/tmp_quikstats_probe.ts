:player~addfigtodata

































if (($player~target > 0) and ($player~target <= SECTORS))
  setsectorparameter $player~target "FIGSEC" TRUE
end
return
