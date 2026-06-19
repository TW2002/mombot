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

gosub :help~initialize
setvar $help~help[1] $help~tab&"Locates a corporate or personal planet and reports back.  "
setvar $help~help[2] $help~tab&"   "
setvar $help~help[3] $help~tab&"Usage:  findplanet # | list"
gosub :help~helpfile

setvar $bot~validprompts "Command"
gosub :player~checkstartingprompt

getwordpos " "&$bot~user_command_line&" " $pos " list "
if ($pos > 0)
	setvar $listplanets true
else
	setvar $listplanets false
end

setvar $target 0
if ($bot~parm1 <> "") and ($bot~parm1 <> 0) and ($listplanets = false)
	isnumber $test $bot~parm1
	if ($test)
		setvar $target $bot~parm1
	end
	if ($target = 0)
		setvar $switchboard~message "Invalid planet number.  Usage: findplanet #*"
		gosub :switchboard~switchboard
		halt
	end
end

setvar $plist ""
setvar $plist_cnt 0
setvar $plist_columns 6
setvar $plist_width 10

setvar $corp true
send "tl"
waitfor "========="

:buildplanetlist
settextlinetrigger gotplanet :gotplanet "Class"
settextlinetrigger endtl :endtl "======   ============"
pause

:gotplanet
getword currentline $sector 1
getword currentline $pnum 2
cuttext $pnum $pnum_first_char 1 1
if ($pnum_first_char <> "#")
	getword currentline $pnum 3
	cuttext $pnum $pnum_first_char 1 1
end
if ($pnum_first_char = "#")
	striptext $pnum "#"
	if ($pnum = $target)
		goto :gotpnum
	end
	if ($listplanets = true)
		setvar $newplanet $pnum & ":" & $sector
		if ($plist_cnt = 0)
			add $plist_cnt 1
			setvar $plist $newplanet
		else
			setvar $tmplist ""
			setvar $inserted false
			setvar $i 0
			while ($i < $plist_cnt)
				add $i 1
				getword $plist $ptmp $i
				getwordpos $ptmp $pos ":"
				cuttext $ptmp $tmp_pnum 1 ($pos - 1)
				if ($inserted = false) and ($pnum < $tmp_pnum)
					setvar $tmplist $tmplist & $newplanet & " "
					setvar $inserted true
				end
				setvar $tmplist $tmplist & $ptmp & " "
			end
			if ($inserted = false)
				setvar $tmplist $tmplist & $newplanet & " "
			end
			add $plist_cnt 1
			setvar $plist $tmplist
		end
	end
end

settextlinetrigger gotplanet :gotplanet "Class"
pause

:gotpnum
killalltriggers
if ($corp = true)
	setvar $switchboard~message "Corporate "
else
	setvar $switchboard~message "Personal "
end
setvar $switchboard~message $switchboard~message & "planet #"&$pnum&" is located in sector "&$sector&".*"
gosub :switchboard~switchboard
send "q"
halt

:endtl
killalltriggers
setvar $corp false
send "qcy"
waitfor "========="
settextlinetrigger noplanets :noplanet "No Planets claimed"
settextlinetrigger gotplanet :gotplanet "Class"
settextlinetrigger endcy :noplanet "======   ============"
pause

:noplanet
killalltriggers
setvar $switchboard~message ""
if ($listplanets = true)
	setvar $switchboard~message "*"
	setvar $row_cnt 0
	setvar $i 0
	while ($i < $plist_cnt)
		add $i 1
		getword $plist $ptmp $i
		gosub :padlistentry
		if ($row_cnt >= $plist_columns)
			setvar $switchboard~message $switchboard~message & "*"
			setvar $row_cnt 0
		elseif ($row_cnt > 0)
			setvar $switchboard~message $switchboard~message & " "
		end
		setvar $switchboard~message $switchboard~message & $ptmp
		add $row_cnt 1
	end
	gosub :switchboard~switchboard
	send "q"
	halt
end

setvar $switchboard~message "Planet #"&$target&" not found.*"
gosub :switchboard~switchboard
send "q"
halt

:padlistentry
getlength $ptmp $plen
while ($plen < $plist_width)
	setvar $ptmp " " & $ptmp
	add $plen 1
end
return

# includes:
include "source\include\help"
include "source\include\loadvars"
include "source\include\player"
include "source\include\switchboard.ts"
