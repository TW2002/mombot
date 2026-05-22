gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"busts -"
setvar $help~help[2] $help~tab&"    displays all busted sectors on subspace"
gosub :help~helpfile

setvar $switchboard~message "Scanning BUSTED SectorParameter ...*"
gosub :switchboard~switchboard

setvar $idx 11
setvar $count 0
setvar $column 1
setvar $string "      "
while ($idx <= sectors)
	getsectorparameter $idx "BUSTED" $bus
	isnumber $tst $bus
	if ($tst = 0)
		setvar $bus 0
	end
	if ($bus <> 0)
		add $count 1
		gosub :pad
		if ($column <= 10)
			setvar $string ($string & " " & $pad & $idx)
			add $column 1
		else
			setvar $string ($string & "*       " & $pad & $idx)
			setvar $column 1
		end
	end
	add $idx 1
end
setvar $switchboard~message $count&" Busts Found In DataBase*"
if ($count <> 0)
	setvar $switchboard~message $switchboard~message&$string&"*"
end
setvar $switchboard~message $switchboard~message&"*"
gosub :switchboard~switchboard
halt

:pad
setvar $pad ""
getlength $idx $len
setvar $pad_i 1
while ($pad_i <= (5 - $len))
	setvar $pad ($pad & " ")
	add $pad_i 1
end
return

#INCLUDES:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
