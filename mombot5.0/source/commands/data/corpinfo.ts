gosub :loadvars~loadvars
setvar $i 0
setvar $mycount 0
setvar $numfig 0
setarray $cits 7
setvar $resetcn9 0
setvar $cbarlen 25
setvar $shiptypes "All"
setvar $minesdeployed "Yes"
setvar $basedetails "Yes"
setvar $baseid "Sector"
setvar $output "SubSpace"
setvar $totalbasefighters 0

setvar $shiptypes "All"
setvar $minesdeployed "Yes"
setvar $basedetails "Yes"
setvar $output "SubSpace"

setvar $bot~validprompts "Citadel Planet Command"
gosub :player~checkstartingprompt
if (($player~startinglocation = "Citadel") or ($player~startinglocation = "Planet"))
	send " q "
	gosub :planet~getplanetinfo
	send " q "
end

send "v"
waitfor "Traders on a Corp:"
getword currentline $maxplanets 8
striptext $maxplanets ","
waitfor "% have Citadels."
getword currentline $gameplanets 1
getword currentline $gamecitpercent 7
striptext $gameplanets ","
striptext $gamecitpercent "%"
waitfor "Mines are in use"
getword currentline $gamefighters 1
striptext $gamefighters ","
setvar $gamecitadels ($gameplanets * $gamecitpercent)
divide $gamecitadels 100

send "cn1qq"
send "g"
waitfor "==="

:buildfigarray
settexttrigger corpfig :addtolist "Corp"
if ($minesdeployed = "No")
	settexttrigger listdone :chkships "Command"
else
	settexttrigger listcomplete :mineassets "Command"
end
pause

:addtolist
killalltriggers
add $mycount 1
getword currentline $figsector 1
getword currentline $num 2
setvar $fighter[$mycount] $figsector
getwordpos $num $pos "T"
if ($pos > 1)
	striptext $num "T"
	multiply $num 1000
end
getwordpos $num $pos "M"
if ($pos > 1)
	striptext $num "M"
	multiply $num 1000000
end
getwordpos $num $pos "B"
if ($pos > 1)
	striptext $num "B"
	multiply $num 1000000000
end
if ($num = 0)
	add $numfig 1
else
	add $numfig $num
	setvar $num 0
end
goto :buildfigarray

:mineassets
killalltriggers
setvar $aramidtotal 0
send "k1"
waitfor "====="

:chkaramids
settexttrigger corparamid :addaramidtolist "Corp"
settexttrigger noaramids :noaramidsfound "No mines deployed"
settexttrigger aramiddone :limpetassets "Total"
pause

:addaramidtolist
killalltriggers
getword currentline $aramidamount 2
add $aramidtotal $aramidamount
add $aramidsectors 1
goto :chkaramids

:noaramidsfound
:limpetassets
killalltriggers
setvar $limpettotal 0
send "k2"
waitfor "====="

:chklimpets
settexttrigger corplimpet :addlimpettolist "Corp"
settexttrigger nolimpets :nolimpetsfound "No Limpet mines deployed"
settexttrigger limpetdone :chkships "Total"
pause

:addlimpettolist
killalltriggers
getword currentline $limpetamount 2
add $limpettotal $limpetamount
add $player~limpetsectors 1
goto :chklimpets

:displayall
if ($output = "Window")
	goto :windowdisplayall
end
send "cn1qq"
setvar $mycountx $mycount
multiply $mycountx 100
setvar $tmp ($mycountx / sectors)
setvar $tmpstr $mycount
gosub :myformat
setvar $mycount $tmpstr
setvar $tmpstr sectors
gosub :myformat
setvar $mysectors $tmpstr
setvar $tmpstr $numfig
gosub :myformat
setvar $numfig $tmpstr
setvar $switchboard~message "<--------------------- Corporate Assets Report --------------------->*"
setvar $switchboard~message $switchboard~message&" *"
setvar $switchboard~message $switchboard~message&" ------------------ *"
setvar $switchboard~message $switchboard~message&" Deployed Fighters *"
setvar $switchboard~message $switchboard~message&" ------------------*"
setvar $switchboard~message $switchboard~message&"  "&$mycount&" of "&$mysectors&" Sectors - "&$tmp&"% Coverage*"
setvar $switchboard~message $switchboard~message&"  "&$numfig&" Total Fighters Deployed*"
if ($minesdeployed = "Yes")
	setvar $switchboard~message $switchboard~message&" *"
	setvar $switchboard~message $switchboard~message&" ------------------ *"
	setvar $switchboard~message $switchboard~message&" Mines Deployed  *"
	setvar $switchboard~message $switchboard~message&" ------------------*"
	setvar $switchboard~message $switchboard~message&"  Limpet mines in "&$player~limpetsectors&" sectors totaling "&$limpettotal&" mines.*"
	setvar $switchboard~message $switchboard~message&"  Aramid mines in "&$aramidsectors&" sectors totaling "&$aramidtotal&" mines.*"
end
setvar $switchboard~message $switchboard~message&" *"
setvar $switchboard~message $switchboard~message&" ------------------ *"
if ($basedetails = "Yes")
	setvar $switchboard~message $switchboard~message&" Detail"
end
setvar $switchboard~message $switchboard~message&" Base Status  *"
setvar $switchboard~message $switchboard~message&" ------------------*"

if ($basedetails = "Yes")
	setvar $switchboard~message $switchboard~message&" Base     Planets   Status     Cit Levels      Figs     Credits*"
else
	setvar $switchboard~message $switchboard~message&" Base     Planets   Status       Base     Planets   Status*"
end
setvar $plcnt 0
setvar $plntcnt 0
setvar $i 11
while ($i < sectors)
	if ($planet~planets[$i] > 0)
		add $plntcnt 1
		add $plcnt 1
		setvar $padit 6
		if ($baseid = "Base")
			setvar $instr $plcnt
			gosub :padleft
			setvar $switchboard~message $switchboard~message&"  "&$padl&$plcnt&"    "&$planet~planets[$i]
		else
			setvar $instr $i
			gosub :padleft
			setvar $switchboard~message $switchboard~message&"  "&$padl&$i&"    "&$planet~planets[$i]
		end
		if ($planet~planets[$i] > $maxplanets)
			setvar $switchboard~message $switchboard~message&"    OVERLOADED"
		else
			setvar $switchboard~message $switchboard~message&"    Checked Ok"
		end
		if ($basedetails = "Yes")
			getlength $basedetail[$i] $strlen
			while ($strlen < 10)
				setvar $basedetail[$i] $basedetail[$i]&" "
				add $strlen 1
			end
			add $totalbasefighters $basefigs[$i]
			setvar $basefig $basefigs[$i]
			if ($basefig > 999999999)
				divide $basefig 1000000000
				setvar $basefig $basefig&"B"
			elseif ($basefig > 999999)
				divide $basefig 1000000
				setvar $basefig $basefig&"M"
			elseif ($basefig > 999)
				divide $basefig 1000
				setvar $basefig $basefig&"K"
			end
			setvar $instr $basefig
			setvar $padit 8
			gosub :padleft
			setvar $basefig $padl&$basefig

			setvar $citcash $basecash[$i]
			if ($basecash[$i] > 999999999)
				divide $citcash 1000000000
				setvar $citcash $citcash&"B"
			elseif ($basecash[$i] > 999999)
				divide $citcash 1000000
				setvar $citcash $citcash&"M"
			elseif ($basecash[$i] > 999)
				divide $citcash 1000
				setvar $citcash $citcash&"K"
			end
			setvar $instr $citcash
			setvar $padit 5
			gosub :padleft
			setvar $switchboard~message $switchboard~message&"    "&$basedetail[$i]&$basefig&$padl&$citcash
			setvar $switchboard~message $switchboard~message&"*"
			setvar $plntcnt 0
		end
	end
	if ($plntcnt = 2)
		setvar $switchboard~message $switchboard~message&"*"
		setvar $plntcnt 0
	end
	add $i 1
end
if ($plcnt = 0)
	setvar $switchboard~message $switchboard~message&"               No Planets Found for your Corp*"
else
	setvar $switchboard~message $switchboard~message&" *"
	setvar $switchboard~message $switchboard~message&" *"
	setvar $switchboard~message $switchboard~message&" ------------------ *"
	setvar $switchboard~message $switchboard~message&" Citadel Status*"
	setvar $switchboard~message $switchboard~message&" ------------------ *"
	setvar $switchboard~message $switchboard~message&"   Lvl 0   Lvl 1   Lvl 2   Lvl 3   Lvl 4   Lvl 5   Lvl 6*"
	setvar $switchboard~message $switchboard~message&"     "&$cits[1]
	setvar $switchboard~message $switchboard~message&"       "&$cits[2]
	setvar $switchboard~message $switchboard~message&"       "&$cits[3]
	setvar $switchboard~message $switchboard~message&"       "&$cits[4]
	setvar $switchboard~message $switchboard~message&"       "&$cits[5]
	setvar $switchboard~message $switchboard~message&"       "&$cits[6]
	setvar $switchboard~message $switchboard~message&"       "&$cits[7]&"*"
	setvar $switchboard~message $switchboard~message&" *"
	setvar $switchboard~message $switchboard~message&" ------------------ *"
	setvar $switchboard~message $switchboard~message&" Planet Assets*"
	setvar $switchboard~message $switchboard~message&" ------------------ *"
	setvar $switchboard~message $switchboard~message&"                Ore  Org  Equ   Ore   Org   Equ   Fighters*"
	setvar $switchboard~message $switchboard~message&"Population     -=Productions=-  -=-=-=-=-On Hands-=-=-=-=-    Credits*"
	setvar $switchboard~message $switchboard~message&$bott&"*"
	setvar $switchboard~message $switchboard~message&" *"
	setvar $switchboard~message $switchboard~message&" ------------------ *"
	setvar $switchboard~message $switchboard~message&" Available Ships*"
	setvar $switchboard~message $switchboard~message&" ------------------ *"
	setvar $switchboard~message $switchboard~message&"   Cnt   Type                      Total Figs*"
	setvar $i 1
	setvar $totalship 0
	if ($shipcnt[1] > 0)
		while ($i <= 20)
			if ($shipcnt[$i] > 0)
				setvar $switchboard~message $switchboard~message&"    "&$shipcnt[$i]&" -- "&$shiptypes[$i]&" -- "&$shipfigs[$i]&"*"
			end
			add $totalship $shipfigs[$i]
			add $i 1
		end
		setvar $switchboard~message $switchboard~message&"                      All Ships -- "&$totalship&"*"
	else
		setvar $switchboard~message $switchboard~message&"   No corporate ships are available*"
	end
end
setvar $switchboard~message $switchboard~message&" *"
setvar $switchboard~message $switchboard~message&" -------------------- *"
setvar $switchboard~message $switchboard~message&" Corp Assets vs Game *"
setvar $switchboard~message $switchboard~message&" -------------------- *"
striptext $numfig ","
add $totalship $numfig
setvar $totalcorpfigs $totalship
if ($totalbasefighters = 0)
	getword $bott $fig 8
	getwordpos $fig $tpos "T"
	getwordpos $fig $mpos "M"
	getwordpos $fig $bpos "B"
	if ($tpos > 0)
		striptext $fig "T"
		multiply $fig 1000
	elseif ($mpos > 0)
		striptext $fig "M"
		multiply $fig 1000000
	elseif ($bpos > 0)
		striptext $fig "B"
		multiply $fig 1000000000
	end
	add $totalcorpfigs $fig
else
	add $totalcorpfigs $totalbasefighters
end
if ($totalcorpfigs > $gamefighters)
	setvar $switchboard~message $switchboard~message&" ! Fighters on unmanned ships do not count for game totals !*"
end
setvar $instr $totalcorpfigs
setvar $padit 16
gosub :padleft
setvar $switchboard~message $switchboard~message&" Corp fighters: "&$totalcorpfigs&" ("&(($totalcorpfigs * 100) / $gamefighters)&"%)"&$padl&"Game fighters:  "&$gamefighters&"*"
setvar $switchboard~message $switchboard~message&" Corp planets: "
setvar $i 1
setvar $player~corpplanets 0
setvar $player~corpcits 0
while ($i <= 7)
	add $player~corpplanets $cits[$i]
	add $i 1
end
setvar $i 2
while ($i <= 7)
	add $player~corpcits $cits[$i]
	add $i 1
end
setvar $switchboard~message $switchboard~message&$player~corpplanets&" ("&$player~corpcits&") Citadels    Game planets: "&$gameplanets&" ("&$gamecitadels&") Citadels*"

setvar $switchboard~message $switchboard~message&" *"
setvar $switchboard~message $switchboard~message&"<--------------------------- Promethius ---------------------------->*"
setvar $switchboard~message $switchboard~message&"*"
gosub :switchboard~switchboard

killalltriggers
if (($player~startinglocation = "Citadel") or ($player~startinglocation = "Planet"))
	gosub :planet~landingsub
end

halt

:nolimpetsfound
:chkships
killalltriggers
setarray $shiptypes 20
setarray $shipcnt 20
setarray $shipfigs 20
if ($shiptypes = "All")
	send "cz"
else
	send "x "
end
waitfor "----"

:getships
killalltriggers

settextlinetrigger ship :corpship ""
if ($shiptypes = "All")
	settexttrigger allships :chkplanets "Computer command [TL"
else
	settexttrigger endship :chkplanets "details"
	settexttrigger noships :noships "You do not own"
end
pause

:noships
setvar $shiptypes[1] "You do not own any other ships!"
setvar $i 1
goto :chkplanets

:corpship
getlength currentline $len
if ($len < 57)
	goto :getships
end
setvar $cutpoint ($len - 56)
cuttext currentline $type 56 $cutpoint

cuttext currentline $sfigs 35 7
striptext $sfigs " "
getwordpos $sfigs $pos "T"
if ($pos > 0)
	striptext $sfigs "T"
	multiply $sfigs 1000
end
setvar $i 1
while ($i <= 20)
	if ($shiptypes[$i] = 0)
		setvar $shiptypes[$i] $type
	end
	if ($shiptypes[$i] = $type)
		add $shipcnt[$i] 1
		add $shipfigs[$i] $sfigs
		add $i 21
	end
	add $i 1
end
goto :getships

:chkplanets
if ($shiptypes[1] <> "You do not own any other ships!")
	send "q"
end
killalltriggers
setarray $planet~planets sectors
send "tl"
waitfor "========="

:buildplanetlist
settextlinetrigger more :findplanet "Class"
settextlinetrigger bottom :botline "======   ============"
settexttrigger nomore :pldisplay "Corporate command [TL="
pause

:pldisplay
send "q"
goto :displayall

:botline
killalltriggers

settextlinetrigger bot :bottotal ")  "
pause

:bottotal
getlength currentline $len
subtract $len 8
striptext $len " "
cuttext currentline $bott 9 $len
goto :buildplanetlist

:findplanet
killalltriggers
getword currentline $plsector 1
add $planet~planets[$plsector] 1
if ($planet~planets[$plsector] = 1)
	setvar $basedetail[$plsector] ""
end
cuttext currentline $cit 77 1
if ($cit = "l")
	add $cits[1] 1
	setvar $planet~planetcits 0
else
	setvar $planet~planetcits $cit
	add $cit 1
	add $cits[$cit] 1
end
setvar $basedetail[$plsector] $basedetail[$plsector]&" "&$planet~planetcits
settextlinetrigger getcash :cash ")"
pause

:cash
cuttext currentline $cash 72 7
striptext $cash " "
striptext $cash ","
if ($cash = "---")
else
	getwordpos $cash $pos "T"
	if ($pos > 0)
		striptext $cash "T"
		multiply $cash 1000
	end
	getwordpos $cash $pos "M"
	if ($pos > 0)
		striptext $cash "M"
		multiply $cash 1000000
	end
	getwordpos $cash $pos "B"
	if ($pos > 0)
		striptext $cash "B"
		multiply $cash 1000000000
	end
	add $basecash[$plsector] $cash
end
gosub :planetfigs
goto :buildplanetlist

:myformat
getlength $tmpstr $tlen
if ($tlen < 4)
	return
end
setvar $instr $tmpstr
setvar $i 1
add $tlen 1
if ($tlen > 3)
	setvar $tmpstr ""
	while ($i < $tlen)
		cuttext $instr $tmpstr1 ($tlen - $i) 1
		setvar $tmpstr $tmpstr1&$tmpstr
		if ($i = 3)
			setvar $tmpstr ","&$tmpstr
		end
		if (($i = 6) and ($tlen > 7))
			setvar $tmpstr ","&$tmpstr
		end
		if (($i = 9) and ($tlen > 10))
			setvar $tmpstr ","&$tmpstr
		end
		add $i 1
	end
end

return

:format
setvar $padl ""
setvar $padr ""
getlength $i $tlen
while ($tlen < 5)
	setvar $padl $padl&" "
	add $tlen 1
end
getlength $numfig[$i] $tlen
while ($tlen < 5)
	setvar $padr $padr&" "
	add $tlen 1
end
return

:padleft
setvar $padl ""
getlength $instr $tlen
while ($tlen <= $padit)
	setvar $padl $padl&" "
	add $tlen 1
end
return

:colorbar
setvar $i 1
while ($i <= $cbarlen)
	echo ansi_12 "-" ansi_15 "=" ansi_11 "-"
	add $i 1
end
return

:planetfigs
cuttext currentline $num 60 7
striptext $num " "
striptext $num ","
getwordpos $num $pos "T"
if ($pos > 1)
	striptext $num "T"
	multiply $num 1000
end
getwordpos $num $pos "M"
if ($pos > 1)
	striptext $num "M"
	multiply $num 1000000
end
getwordpos $num $pos "B"
if ($pos > 1)
	striptext $num "B"
	multiply $num 1000000000
end
add $basefigs[$plsector] $num
return

:windowdisplayall
setvar $window 1
window "PROASSETS" 640 780 "                        Corporate Assets Report        by Promethius            " "ONTOP"
send "cn1qq"
setvar $mycountx $mycount
multiply $mycountx 100
setvar $tmp ($mycountx / sectors)
setvar $tmpstr $mycount
gosub :myformat
setvar $mycount $tmpstr
setvar $tmpstr sectors
gosub :myformat
setvar $mysectors $tmpstr
setvar $tmpstr $numfig
gosub :myformat
setvar $numfig $tmpstr
setvar $windisp "*"&" ------------------------ *"&" Deployed Fighters *"&" ------------------------*"
setvar $windisp $windisp&"  "&$mycount&" of "&$mysectors&" Sectors - "&$tmp&"% Coverage*"
setvar $windisp $windisp&"  "&$numfig&" Total Fighters Deployed*"
if ($minesdeployed = "Yes")
	setvar $windisp $windisp&" *"
	setvar $windisp $windisp&" ------------------------ *"&" Mines Deployed  *"&" ------------------------*"
	setvar $windisp $windisp&"  Limpet mines in "&$player~limpetsectors&" sectors totaling "&$limpettotal&" mines.*"
	setvar $windisp $windisp&"  Aramid mines in "&$aramidsectors&" sectors totaling "&$aramidtotal&" mines.*"
end
setvar $windisp $windisp&"*"&" ------------------------ *"
if ($basedetails = "Yes")
	setvar $windisp $windisp&" Detail"
end
setvar $windisp $windisp&" Base Status  *"&" ------------------------*"

if ($basedetails = "Yes")
	setvar $windisp $windisp&"     Base     Planets   Status     Cit Levels      Figs     Credits*"
else
	setvar $windisp $windisp&"     Base     Planets   Status                       Base     Planets   Status*"
end
setvar $plcnt 0
setvar $plntcnt 0
setvar $i 11
while ($i < sectors)
	if ($planet~planets[$i] > 0)
		add $plntcnt 1
		add $plcnt 1
		setvar $padit 10
		if ($baseid = "Base")
			setvar $instr $plcnt
			gosub :padleft
			setvar $windisp $windisp&"  "&$padl&$plcnt&"        "&$planet~planets[$i]
		else
			setvar $instr $i
			gosub :padleft
			setvar $windisp $windisp&"  "&$padl&$i&"        "&$planet~planets[$i]
		end
		if ($planet~planets[$i] > $maxplanets)
			setvar $windisp $windisp&"              OVERLOADED"
		else
			setvar $windisp $windisp&"              Checked Ok"
		end
		if ($basedetails = "Yes")
			getlength $basedetail[$i] $strlen
			while ($strlen < 10)
				setvar $basedetail[$i] $basedetail[$i]&" "
				add $strlen 1
			end
			setvar $basefig $basefigs[$i]
			if ($basefig > 999999999)
				divide $basefig 1000000000
				setvar $basefig $basefig&"B"
			elseif ($basefig > 999999)
				divide $basefig 1000000
				setvar $basefig $basefig&"M"
			elseif ($basefig > 999)
				divide $basefig 1000
				setvar $basefig $basefig&"K"
			end
			setvar $instr $basefig
			setvar $padit 8
			gosub :padleft
			setvar $basefig $padl&$basefig

			setvar $citcash $basecash[$i]
			if ($basecash[$i] > 999999999)
				divide $citcash 1000000000
				setvar $citcash $citcash&"B"
			elseif ($basecash[$i] > 999999)
				divide $citcash 1000000
				setvar $citcash $citcash&"M"
			elseif ($basecash[$i] > 999)
				divide $citcash 1000
				setvar $citcash $citcash&"K"
			end
			setvar $instr $citcash
			setvar $padit 9
			gosub :padleft

			setvar $windisp $windisp&"    "&$basedetail[$i]&$basefig&$padl&$citcash
			setvar $windisp $windisp&"*"
			setvar $plntcnt 0
		end
	end
	if ($plntcnt = 2)
		setvar $windisp $windisp&"*"
		setvar $plntcnt 0
	end
	add $i 1
end
if ($plcnt = 0)
	setvar $windisp $windisp&"               No Planets Found for your Corp*"
else
	setvar $windisp $windisp&"*"&" ------------------------ *"&" Citadel Status*"&" ------------------------ *"
	setvar $windisp $windisp&"   Lvl 0   Lvl 1   Lvl 2   Lvl 3   Lvl 4   Lvl 5   Lvl 6*"
	setvar $windisp $windisp&"      "&$cits[1]&"         "&$cits[2]&"         "&$cits[3]
	setvar $windisp $windisp&"         "&$cits[4]&"         "&$cits[5]&"         "&$cits[6]
	setvar $windisp $windisp&"         "&$cits[7]&"*"
	setvar $windisp $windisp&" *"&" ------------------------ *"&" Planet Assets*"&" ------------------------ *"
	setvar $windisp $windisp&"                Ore  Org  Equ   Ore   Org   Equ   Fighters*"
	setvar $windisp $windisp&"Population     -=Productions=-  -=-=-=-=-On Hands-=-=-=-=-    Credits*"
	setvar $windisp $windisp&$bott&"*"
	setvar $windisp $windisp&" *"&" ------------------------ *"&" Available Ships*"&" ------------------------ *"
	setvar $windisp $windisp&"   Cnt   Type                      Total Figs*"
	setvar $i 1
	setvar $totalship 0
	if ($shipcnt[1] > 0)
		while ($i <= 20)
			if ($shipcnt[$i] > 0)
				setvar $windisp $windisp&"    "&$shipcnt[$i]&" -- "&$shiptypes[$i]&" -- "&$shipfigs[$i]&"*"
			end
			add $totalship $shipfigs[$i]
			add $i 1
		end
		setvar $windisp $windisp&"                         All Ships -- "&$totalship&"*"
	else
		setvar $windisp $windisp&"   No corporate ships are available*"
	end
end
setvar $windisp $windisp&"*"
setwindowcontents "PROASSETS" $windisp
echo "**" ansi_12 "Press any key to continue"
getconsoleinput $inkey singlekey
halt

# includes:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\switchboard.ts"
