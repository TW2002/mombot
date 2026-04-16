



















gosub :BOT~LOADVARS
setvar $I 0
setvar $MYCOUNT 0
setvar $NUMFIG 0
setarray $CITS 7
setvar $RESETCN9 0
setvar $CBARLEN 25
setvar $SHIPTYPES "All"
setvar $MINESDEPLOYED "Yes"
setvar $BASEDETAILS "Yes"
setvar $BASEID "Sector"
setvar $OUTPUT "SubSpace"
setvar $TOTALBASEFIGHTERS 0


setvar $SHIPTYPES "All"
setvar $MINESDEPLOYED "Yes"
setvar $BASEDETAILS "Yes"
setvar $OUTPUT "SubSpace"



setvar $BOT~VALIDPROMPTS "Citadel Planet Command"
gosub :BOT~CHECKSTARTINGPROMPT
if (($PLAYER~STARTINGLOCATION = "Citadel") or ($PLAYER~STARTINGLOCATION = "Planet"))
  send " q "
  gosub :PLANET~GETPLANETINFO
  send " q "
end



send "v"
waitfor "Traders on a Corp:"
getword CURRENTLINE $MAXPLANETS 8
striptext $MAXPLANETS ","
waitfor "% have Citadels."
getword CURRENTLINE $GAMEPLANETS 1
getword CURRENTLINE $GAMECITPERCENT 7
striptext $GAMEPLANETS ","
striptext $GAMECITPERCENT "%"
waitfor "Mines are in use"
getword CURRENTLINE $GAMEFIGHTERS 1
striptext $GAMEFIGHTERS ","
setvar $GAMECITADELS ($GAMEPLANETS * $GAMECITPERCENT)
divide $GAMECITADELS 100

send "cn1qq"
send "g"
waitfor "==="
:BUILDFIGARRAY

settexttrigger CORPFIG :ADDTOLIST "Corp"
if ($MINESDEPLOYED = "No")
  settexttrigger LISTDONE :CHKSHIPS "Command"
else
  settexttrigger LISTCOMPLETE :MINEASSETS "Command"
end
pause
:ADDTOLIST

killalltriggers
add $MYCOUNT 1
getword CURRENTLINE $FIGSECTOR 1
getword CURRENTLINE $NUM 2
setvar $FIGHTER[$MYCOUNT] $FIGSECTOR
getwordpos $NUM $POS "T"
if ($POS > 1)
  striptext $NUM "T"
  multiply $NUM 1000
end
getwordpos $NUM $POS "M"
if ($POS > 1)
  striptext $NUM "M"
  multiply $NUM 1000000
end
getwordpos $NUM $POS "B"
if ($POS > 1)
  striptext $NUM "B"
  multiply $NUM 1000000000
end
if ($NUM = 0)
  add $NUMFIG 1
else
  add $NUMFIG $NUM
  setvar $NUM 0
end
goto :BUILDFIGARRAY
:MINEASSETS

killalltriggers
setvar $ARAMIDTOTAL 0
send "k1"
waitfor "====="
:CHKARAMIDS

settexttrigger CORPARAMID :ADDARAMIDTOLIST "Corp"
settexttrigger NOARAMIDS :NOARAMIDSFOUND "No mines deployed"
settexttrigger ARAMIDDONE :LIMPETASSETS "Total"
pause
:ADDARAMIDTOLIST

killalltriggers
getword CURRENTLINE $ARAMIDAMOUNT 2
add $ARAMIDTOTAL $ARAMIDAMOUNT
add $ARAMIDSECTORS 1
goto :CHKARAMIDS
:NOARAMIDSFOUND
:LIMPETASSETS



killalltriggers
setvar $LIMPETTOTAL 0
send "k2"
waitfor "====="
:CHKLIMPETS

settexttrigger CORPLIMPET :ADDLIMPETTOLIST "Corp"
settexttrigger NOLIMPETS :NOLIMPETSFOUND "No Limpet mines deployed"
settexttrigger LIMPETDONE :CHKSHIPS "Total"
pause
:ADDLIMPETTOLIST

killalltriggers
getword CURRENTLINE $LIMPETAMOUNT 2
add $LIMPETTOTAL $LIMPETAMOUNT
add $PLAYER~LIMPETSECTORS 1
goto :CHKLIMPETS
:DISPLAYALL



if ($OUTPUT = "Window")
  goto :WINDOWDISPLAYALL
end
send "cn1qq"
setvar $MYCOUNTX $MYCOUNT
multiply $MYCOUNTX 100
setvar $TMP ($MYCOUNTX / SECTORS)
setvar $TMPSTR $MYCOUNT
gosub :MYFORMAT
setvar $MYCOUNT $TMPSTR
setvar $TMPSTR SECTORS
gosub :MYFORMAT
setvar $MYSECTORS $TMPSTR
setvar $TMPSTR $NUMFIG
gosub :MYFORMAT
setvar $NUMFIG $TMPSTR
setvar $SWITCHBOARD~MESSAGE "<--------------------- Corporate Assets Report --------------------->*"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Deployed Fighters *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------*"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"  "&$MYCOUNT&" of "&$MYSECTORS&" Sectors - "&$TMP&"% Coverage*"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"  "&$NUMFIG&" Total Fighters Deployed*"
if ($MINESDEPLOYED = "Yes")
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Mines Deployed  *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"  Limpet mines in "&$PLAYER~LIMPETSECTORS&" sectors totaling "&$LIMPETTOTAL&" mines.*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"  Aramid mines in "&$ARAMIDSECTORS&" sectors totaling "&$ARAMIDTOTAL&" mines.*"
end
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
if ($BASEDETAILS = "Yes")
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Detail"
end
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Base Status  *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------*"


if ($BASEDETAILS = "Yes")
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Base     Planets   Status     Cit Levels      Figs     Credits*"
else
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Base     Planets   Status       Base     Planets   Status*"
end
setvar $PLCNT 0
setvar $PLNTCNT 0
setvar $I 11
while ($I < SECTORS)
  if ($PLANET~PLANETS[$I] > 0)
    add $PLNTCNT 1
    add $PLCNT 1
    setvar $PADIT 6
    if ($BASEID = "Base")
      setvar $INSTR $PLCNT
      gosub :PADLEFT
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"  "&$PADL&$PLCNT&"    "&$PLANET~PLANETS[$I]
    else
      setvar $INSTR $I
      gosub :PADLEFT
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"  "&$PADL&$I&"    "&$PLANET~PLANETS[$I]
    end
    if ($PLANET~PLANETS[$I] > $MAXPLANETS)
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"    OVERLOADED"
    else
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"    Checked Ok"
    end
    if ($BASEDETAILS = "Yes")
      getlength $BASEDETAIL[$I] $STRLEN
      while ($STRLEN < 10)
        setvar $BASEDETAIL[$I] $BASEDETAIL[$I]&" "
        add $STRLEN 1
      end
      add $TOTALBASEFIGHTERS $BASEFIGS[$I]
      setvar $BASEFIG $BASEFIGS[$I]
      if ($BASEFIG > 999999999)
        divide $BASEFIG 1000000000
        setvar $BASEFIG $BASEFIG&"B"
      elseif ($BASEFIG > 999999)
        divide $BASEFIG 1000000
        setvar $BASEFIG $BASEFIG&"M"
      elseif ($BASEFIG > 999)
        divide $BASEFIG 1000
        setvar $BASEFIG $BASEFIG&"K"
      end
      setvar $INSTR $BASEFIG
      setvar $PADIT 8
      gosub :PADLEFT
      setvar $BASEFIG $PADL&$BASEFIG

      setvar $CITCASH $BASECASH[$I]
      if ($BASECASH[$I] > 999999999)
        divide $CITCASH 1000000000
        setvar $CITCASH $CITCASH&"B"
      elseif ($BASECASH[$I] > 999999)
        divide $CITCASH 1000000
        setvar $CITCASH $CITCASH&"M"
      elseif ($BASECASH[$I] > 999)
        divide $CITCASH 1000
        setvar $CITCASH $CITCASH&"K"
      end
      setvar $INSTR $CITCASH
      setvar $PADIT 5
      gosub :PADLEFT
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"    "&$BASEDETAIL[$I]&$BASEFIG&$PADL&$CITCASH
      setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*"
      setvar $PLNTCNT 0
    end
  end
  if ($PLNTCNT = 2)
    setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*"
    setvar $PLNTCNT 0
  end
  add $I 1
end
if ($PLCNT = 0)
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"               No Planets Found for your Corp*"
else
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Citadel Status*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"   Lvl 0   Lvl 1   Lvl 2   Lvl 3   Lvl 4   Lvl 5   Lvl 6*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"     "&$CITS[1]
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"       "&$CITS[2]
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"       "&$CITS[3]
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"       "&$CITS[4]
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"       "&$CITS[5]
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"       "&$CITS[6]
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"       "&$CITS[7]&"*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Planet Assets*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"                Ore  Org  Equ   Ore   Org   Equ   Fighters*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"Population     -=Productions=-  -=-=-=-=-On Hands-=-=-=-=-    Credits*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&$BOTT&"*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Available Ships*"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ------------------ *"
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"   Cnt   Type                      Total Figs*"
  setvar $I 1
  setvar $TOTALSHIP 0
  if ($SHIPCNT[1] > 0)
    while ($I <= 20)
      if ($SHIPCNT[$I] > 0)
        setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"    "&$SHIPCNT[$I]&" -- "&$SHIPTYPES[$I]&" -- "&$SHIPFIGS[$I]&"*"
      end
      add $TOTALSHIP $SHIPFIGS[$I]
      add $I 1
    end
    setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"                      All Ships -- "&$TOTALSHIP&"*"
  else
    setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"   No corporate ships are available*"
  end
end
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" -------------------- *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Corp Assets vs Game *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" -------------------- *"
striptext $NUMFIG ","
add $TOTALSHIP $NUMFIG
setvar $TOTALCORPFIGS $TOTALSHIP
if ($TOTALBASEFIGHTERS = 0)
  getword $BOTT $FIG 8
  getwordpos $FIG $TPOS "T"
  getwordpos $FIG $MPOS "M"
  getwordpos $FIG $BPOS "B"
  if ($TPOS > 0)
    striptext $FIG "T"
    multiply $FIG 1000
  elseif ($MPOS > 0)
    striptext $FIG "M"
    multiply $FIG 1000000
  elseif ($BPOS > 0)
    striptext $FIG "B"
    multiply $FIG 1000000000
  end
  add $TOTALCORPFIGS $FIG
else
  add $TOTALCORPFIGS $TOTALBASEFIGHTERS
end
if ($TOTALCORPFIGS > $GAMEFIGHTERS)
  setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" ! Fighters on unmanned ships do not count for game totals !*"
end
setvar $INSTR $TOTALCORPFIGS
setvar $PADIT 16
gosub :PADLEFT
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Corp fighters: "&$TOTALCORPFIGS&" ("&(($TOTALCORPFIGS * 100) / $GAMEFIGHTERS)&"%)"&$PADL&"Game fighters:  "&$GAMEFIGHTERS&"*"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" Corp planets: "
setvar $I 1
setvar $PLAYER~CORPPLANETS 0
setvar $PLAYER~CORPCITS 0
while ($I <= 7)
  add $PLAYER~CORPPLANETS $CITS[$I]
  add $I 1
end
setvar $I 2
while ($I <= 7)
  add $PLAYER~CORPCITS $CITS[$I]
  add $I 1
end
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&$PLAYER~CORPPLANETS&" ("&$PLAYER~CORPCITS&") Citadels    Game planets: "&$GAMEPLANETS&" ("&$GAMECITADELS&") Citadels*"

setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&" *"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"<--------------------------- Promethius ---------------------------->*"
setvar $SWITCHBOARD~MESSAGE $SWITCHBOARD~MESSAGE&"*"
gosub :SWITCHBOARD~SWITCHBOARD

killalltriggers
if (($PLAYER~STARTINGLOCATION = "Citadel") or ($PLAYER~STARTINGLOCATION = "Planet"))
  gosub :PLANET~LANDINGSUB
end

halt
:NOLIMPETSFOUND
:CHKSHIPS


killalltriggers
setarray $SHIPTYPES 20
setarray $SHIPCNT 20
setarray $SHIPFIGS 20
if ($SHIPTYPES = "All")
  send "cz"
else
  send "x "
end
waitfor "----"
:GETSHIPS
killalltriggers

settextlinetrigger SHIP :CORPSHIP ""
if ($SHIPTYPES = "All")
  settexttrigger ALLSHIPS :CHKPLANETS "Computer command [TL"
else
  settexttrigger ENDSHIP :CHKPLANETS "details"
  settexttrigger NOSHIPS :NOSHIPS "You do not own"
end
pause
:NOSHIPS

setvar $SHIPTYPES[1] "You do not own any other ships!"
setvar $I 1
goto :CHKPLANETS
:CORPSHIP


getlength CURRENTLINE $LEN
if ($LEN < 57)
  goto :GETSHIPS
end
setvar $CUTPOINT ($LEN - 56)
cuttext CURRENTLINE $TYPE 56 $CUTPOINT

cuttext CURRENTLINE $SFIGS 35 7
striptext $SFIGS " "
getwordpos $SFIGS $POS "T"
if ($POS > 0)
  striptext $SFIGS "T"
  multiply $SFIGS 1000
end
setvar $I 1
while ($I <= 20)
  if ($SHIPTYPES[$I] = 0)
    setvar $SHIPTYPES[$I] $TYPE
  end
  if ($SHIPTYPES[$I] = $TYPE)
    add $SHIPCNT[$I] 1
    add $SHIPFIGS[$I] $SFIGS
    add $I 21
  end
  add $I 1
end
goto :GETSHIPS
:CHKPLANETS

if ($SHIPTYPES[1] <> "You do not own any other ships!")
  send "q"
end
killalltriggers
setarray $PLANET~PLANETS SECTORS
send "tl"
waitfor "========="
:BUILDPLANETLIST

settextlinetrigger MORE :FINDPLANET "Class"
settextlinetrigger BOTTOM :BOTLINE "======   ============"
settexttrigger NOMORE :PLDISPLAY "Corporate command [TL="
pause
:PLDISPLAY

send "q"
goto :DISPLAYALL
:BOTLINE

killalltriggers

settextlinetrigger BOT :BOTTOTAL ")  "
pause
:BOTTOTAL
getlength CURRENTLINE $LEN
subtract $LEN 8
striptext $LEN " "
cuttext CURRENTLINE $BOTT 9 $LEN
goto :BUILDPLANETLIST
:FINDPLANET

killalltriggers
getword CURRENTLINE $PLSECTOR 1
add $PLANET~PLANETS[$PLSECTOR] 1
if ($PLANET~PLANETS[$PLSECTOR] = 1)
  setvar $BASEDETAIL[$PLSECTOR] ""
end
cuttext CURRENTLINE $CIT 77 1
if ($CIT = "l")
  add $CITS[1] 1
  setvar $PLANET~PLANETCITS 0
else
  setvar $PLANET~PLANETCITS $CIT
  add $CIT 1
  add $CITS[$CIT] 1
end
setvar $BASEDETAIL[$PLSECTOR] $BASEDETAIL[$PLSECTOR]&" "&$PLANET~PLANETCITS
settextlinetrigger GETCASH :CASH ")"
pause
:CASH
cuttext CURRENTLINE $CASH 72 7
striptext $CASH " "
striptext $CASH ","
if ($CASH = "---")
else
  getwordpos $CASH $POS "T"
  if ($POS > 0)
    striptext $CASH "T"
    multiply $CASH 1000
  end
  getwordpos $CASH $POS "M"
  if ($POS > 0)
    striptext $CASH "M"
    multiply $CASH 1000000
  end
  getwordpos $CASH $POS "B"
  if ($POS > 0)
    striptext $CASH "B"
    multiply $CASH 1000000000
  end
  add $BASECASH[$PLSECTOR] $CASH
end
gosub :PLANETFIGS
goto :BUILDPLANETLIST
:MYFORMAT

getlength $TMPSTR $TLEN
if ($TLEN < 4)
  return
end
setvar $INSTR $TMPSTR
setvar $I 1
add $TLEN 1
if ($TLEN > 3)
  setvar $TMPSTR ""
  while ($I < $TLEN)
    cuttext $INSTR $TMPSTR1 ($TLEN - $I) 1
    setvar $TMPSTR $TMPSTR1&$TMPSTR
    if ($I = 3)
      setvar $TMPSTR ","&$TMPSTR
    end
    if (($I = 6) and ($TLEN > 7))
      setvar $TMPSTR ","&$TMPSTR
    end
    if (($I = 9) and ($TLEN > 10))
      setvar $TMPSTR ","&$TMPSTR
    end
    add $I 1
  end
end

return
:FORMAT

setvar $PADL ""
setvar $PADR ""
getlength $I $TLEN
while ($TLEN < 5)
  setvar $PADL $PADL&" "
  add $TLEN 1
end
getlength $NUMFIG[$I] $TLEN
while ($TLEN < 5)
  setvar $PADR $PADR&" "
  add $TLEN 1
end
return
:PADLEFT

setvar $PADL ""
getlength $INSTR $TLEN
while ($TLEN <= $PADIT)
  setvar $PADL $PADL&" "
  add $TLEN 1
end
return
:COLORBAR

setvar $I 1
while ($I <= $CBARLEN)
  echo ANSI_12 "-" ANSI_15 "=" ANSI_11 "-"
  add $I 1
end
return
:PLANETFIGS

cuttext CURRENTLINE $NUM 60 7
striptext $NUM " "
striptext $NUM ","
getwordpos $NUM $POS "T"
if ($POS > 1)
  striptext $NUM "T"
  multiply $NUM 1000
end
getwordpos $NUM $POS "M"
if ($POS > 1)
  striptext $NUM "M"
  multiply $NUM 1000000
end
getwordpos $NUM $POS "B"
if ($POS > 1)
  striptext $NUM "B"
  multiply $NUM 1000000000
end
add $BASEFIGS[$PLSECTOR] $NUM
return
:WINDOWDISPLAYALL


setvar $WINDOW 1
window "PROASSETS" 640 780 "                        Corporate Assets Report        by Promethius            " "ONTOP"
send "cn1qq"
setvar $MYCOUNTX $MYCOUNT
multiply $MYCOUNTX 100
setvar $TMP ($MYCOUNTX / SECTORS)
setvar $TMPSTR $MYCOUNT
gosub :MYFORMAT
setvar $MYCOUNT $TMPSTR
setvar $TMPSTR SECTORS
gosub :MYFORMAT
setvar $MYSECTORS $TMPSTR
setvar $TMPSTR $NUMFIG
gosub :MYFORMAT
setvar $NUMFIG $TMPSTR
setvar $WINDISP "*"&" ------------------------ *"&" Deployed Fighters *"&" ------------------------*"
setvar $WINDISP $WINDISP&"  "&$MYCOUNT&" of "&$MYSECTORS&" Sectors - "&$TMP&"% Coverage*"
setvar $WINDISP $WINDISP&"  "&$NUMFIG&" Total Fighters Deployed*"
if ($MINESDEPLOYED = "Yes")
  setvar $WINDISP $WINDISP&" *"
  setvar $WINDISP $WINDISP&" ------------------------ *"&" Mines Deployed  *"&" ------------------------*"
  setvar $WINDISP $WINDISP&"  Limpet mines in "&$PLAYER~LIMPETSECTORS&" sectors totaling "&$LIMPETTOTAL&" mines.*"
  setvar $WINDISP $WINDISP&"  Aramid mines in "&$ARAMIDSECTORS&" sectors totaling "&$ARAMIDTOTAL&" mines.*"
end
setvar $WINDISP $WINDISP&"*"&" ------------------------ *"
if ($BASEDETAILS = "Yes")
  setvar $WINDISP $WINDISP&" Detail"
end
setvar $WINDISP $WINDISP&" Base Status  *"&" ------------------------*"


if ($BASEDETAILS = "Yes")
  setvar $WINDISP $WINDISP&"     Base     Planets   Status     Cit Levels      Figs     Credits*"
else
  setvar $WINDISP $WINDISP&"     Base     Planets   Status                       Base     Planets   Status*"
end
setvar $PLCNT 0
setvar $PLNTCNT 0
setvar $I 11
while ($I < SECTORS)
  if ($PLANET~PLANETS[$I] > 0)
    add $PLNTCNT 1
    add $PLCNT 1
    setvar $PADIT 10
    if ($BASEID = "Base")
      setvar $INSTR $PLCNT
      gosub :PADLEFT
      setvar $WINDISP $WINDISP&"  "&$PADL&$PLCNT&"        "&$PLANET~PLANETS[$I]
    else
      setvar $INSTR $I
      gosub :PADLEFT
      setvar $WINDISP $WINDISP&"  "&$PADL&$I&"        "&$PLANET~PLANETS[$I]
    end
    if ($PLANET~PLANETS[$I] > $MAXPLANETS)
      setvar $WINDISP $WINDISP&"              OVERLOADED"
    else
      setvar $WINDISP $WINDISP&"              Checked Ok"
    end
    if ($BASEDETAILS = "Yes")
      getlength $BASEDETAIL[$I] $STRLEN
      while ($STRLEN < 10)
        setvar $BASEDETAIL[$I] $BASEDETAIL[$I]&" "
        add $STRLEN 1
      end
      setvar $BASEFIG $BASEFIGS[$I]
      if ($BASEFIG > 999999999)
        divide $BASEFIG 1000000000
        setvar $BASEFIG $BASEFIG&"B"
      elseif ($BASEFIG > 999999)
        divide $BASEFIG 1000000
        setvar $BASEFIG $BASEFIG&"M"
      elseif ($BASEFIG > 999)
        divide $BASEFIG 1000
        setvar $BASEFIG $BASEFIG&"K"
      end
      setvar $INSTR $BASEFIG
      setvar $PADIT 8
      gosub :PADLEFT
      setvar $BASEFIG $PADL&$BASEFIG

      setvar $CITCASH $BASECASH[$I]
      if ($BASECASH[$I] > 999999999)
        divide $CITCASH 1000000000
        setvar $CITCASH $CITCASH&"B"
      elseif ($BASECASH[$I] > 999999)
        divide $CITCASH 1000000
        setvar $CITCASH $CITCASH&"M"
      elseif ($BASECASH[$I] > 999)
        divide $CITCASH 1000
        setvar $CITCASH $CITCASH&"K"
      end
      setvar $INSTR $CITCASH
      setvar $PADIT 9
      gosub :PADLEFT

      setvar $WINDISP $WINDISP&"    "&$BASEDETAIL[$I]&$BASEFIG&$PADL&$CITCASH
      setvar $WINDISP $WINDISP&"*"
      setvar $PLNTCNT 0
    end
  end
  if ($PLNTCNT = 2)
    setvar $WINDISP $WINDISP&"*"
    setvar $PLNTCNT 0
  end
  add $I 1
end
if ($PLCNT = 0)
  setvar $WINDISP $WINDISP&"               No Planets Found for your Corp*"
else
  setvar $WINDISP $WINDISP&"*"&" ------------------------ *"&" Citadel Status*"&" ------------------------ *"
  setvar $WINDISP $WINDISP&"   Lvl 0   Lvl 1   Lvl 2   Lvl 3   Lvl 4   Lvl 5   Lvl 6*"
  setvar $WINDISP $WINDISP&"      "&$CITS[1]&"         "&$CITS[2]&"         "&$CITS[3]
  setvar $WINDISP $WINDISP&"         "&$CITS[4]&"         "&$CITS[5]&"         "&$CITS[6]
  setvar $WINDISP $WINDISP&"         "&$CITS[7]&"*"
  setvar $WINDISP $WINDISP&" *"&" ------------------------ *"&" Planet Assets*"&" ------------------------ *"
  setvar $WINDISP $WINDISP&"                Ore  Org  Equ   Ore   Org   Equ   Fighters*"
  setvar $WINDISP $WINDISP&"Population     -=Productions=-  -=-=-=-=-On Hands-=-=-=-=-    Credits*"
  setvar $WINDISP $WINDISP&$BOTT&"*"
  setvar $WINDISP $WINDISP&" *"&" ------------------------ *"&" Available Ships*"&" ------------------------ *"
  setvar $WINDISP $WINDISP&"   Cnt   Type                      Total Figs*"
  setvar $I 1
  setvar $TOTALSHIP 0
  if ($SHIPCNT[1] > 0)
    while ($I <= 20)
      if ($SHIPCNT[$I] > 0)
        setvar $WINDISP $WINDISP&"    "&$SHIPCNT[$I]&" -- "&$SHIPTYPES[$I]&" -- "&$SHIPFIGS[$I]&"*"
      end
      add $TOTALSHIP $SHIPFIGS[$I]
      add $I 1
    end
    setvar $WINDISP $WINDISP&"                         All Ships -- "&$TOTALSHIP&"*"
  else
    setvar $WINDISP $WINDISP&"   No corporate ships are available*"
  end
end
setvar $WINDISP $WINDISP&"*"
setwindowcontents "PROASSETS" $WINDISP
echo "**" ANSI_12 "Press any key to continue"
getconsoleinput $INKEY SINGLEKEY
halt

# includes:
include "source\include\bot"
include "source\include\player"
include "source\include\planet"
