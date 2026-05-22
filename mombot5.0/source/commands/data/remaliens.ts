gosub :help~initialize

setvar $help~help[1]  $help~tab&"  Alien Remember - Original Code by Promethius  "
setvar $help~help[2]  $help~tab&"  Updated by Shadow to organize sectors for display  "
gosub :help~helpfile

setvar $start 11
setarray $aliens 25
setarray $races 25
setvar $races_idx 0

while ($start <= sectors)
	getsector $start $chksector
	if ($chksector.explored = "YES")
		getwordpos $chksector.constellation $pos "uncharted"
		if ($pos = 0)
			getwordpos $chksector.constellation $pos "Space"
			if ($pos > 0)
				cuttext $chksector.constellation $race 1 ($pos - 2)
				setvar $idx 0
				while ($idx < $races_idx)
					add $idx 1
					if ($races[$idx] = $race)
						goto :race_found
					end
				end
				add $races_idx 1
				setvar $idx $races_idx
				setvar $races[$idx] $race
				setvar $aliens[$idx] $start
				goto :race_done

				:race_found
				setvar $aliens[$idx] $aliens[$idx] & ", " & $start

				:race_done
			end
		end
	end
	add $start 1
end

setvar $switchboard~message "*Alien Sectors Organized by Race:**"
setvar $idx 0
while ($idx < $races_idx)
	add $idx 1
	setvar $switchboard~message $switchboard~message&$races[$idx]&": "&$aliens[$idx]&"**"
end
gosub :switchboard~switchboard
halt

include "source\include\switchboard.ts"
include "source\include\help.ts"
