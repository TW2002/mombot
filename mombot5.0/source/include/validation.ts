:VALIDATION~VALIDATION





gettime $VALIDATION~CURRENTDATE "d:m:yyyy"
getwordpos $VALIDATION~CURRENTDATE $VALIDATION~SEMIPOS ":"
cuttext $VALIDATION~CURRENTDATE $VALIDATION~DAY 1 ($VALIDATION~SEMIPOS - 1)
cuttext $VALIDATION~CURRENTDATE $VALIDATION~CURRENTDATE ($VALIDATION~SEMIPOS + 1) 999
getwordpos $VALIDATION~CURRENTDATE $VALIDATION~SEMIPOS ":"
cuttext $VALIDATION~CURRENTDATE $VALIDATION~MONTH 1 ($VALIDATION~SEMIPOS - 1)
cuttext $VALIDATION~CURRENTDATE $VALIDATION~YEAR ($VALIDATION~SEMIPOS + 1) 999
setvar $VALIDATION~OKAYTOUSE TRUE


















if ($VALIDATION~OKAYTOUSE = FALSE)
  echo "***"
  echo "ANSI13" "This script Version is no longer valid, contact A Mind ()ver Matter member for an extension.*"
  echo "ANSI14" "This script Version is no longer valid, contact A Mind ()ver Matter member for an extension.*"
  echo "ANSI15" "This script Version is no longer valid, contact A Mind ()ver Matter member for an extension.*"
  echo "ANSI16" "This script Version is no longer valid, contact A Mind ()ver Matter member for an extension.*"
  echo "***"
  halt
end
return
