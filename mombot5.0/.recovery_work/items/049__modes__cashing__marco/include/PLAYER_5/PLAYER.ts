:PLAYER~ISEPHAGGLE
setvar $PLAYER~ISEPHAGGLE FALSE
listactivescripts $PLAYER~SCRIPTS
setvar $PLAYER~I 1
while ($PLAYER~I <= $PLAYER~SCRIPTS)
  getwordpos "<><><>"&$PLAYER~SCRIPTS[$PLAYER~I] $PLAYER~POS "<><><>ephaggle"
  if ($PLAYER~POS > 0)
    setvar $PLAYER~ISEPHAGGLE TRUE
  end
  add $PLAYER~I 1
end
return
