gosub :HELP~INITIALIZE

setVar $HELP~HELP[1]  $HELP~TAB&"  Alien Remember - Original Code by Promethius  "
setVar $HELP~HELP[2]  $HELP~TAB&"  Updated by Shadow to organize sectors for display  "
gosub :HELP~HELPFILE

setvar $START 11
setarray $aliens 25
setarray $races 25
setvar $races_idx 0

while ($START <= SECTORS)
  getsector $START $CHKSECTOR
  if ($CHKSECTOR.EXPLORED = "YES")
    getwordpos $CHKSECTOR.CONSTELLATION $POS "uncharted"
    if ($POS = 0)
      getwordpos $CHKSECTOR.CONSTELLATION $POS "Space"
      if ($POS > 0)
        cuttext $CHKSECTOR.CONSTELLATION $race 1 ($POS - 2)
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
	        setvar $aliens[$idx] $START
	        goto :race_done
	        :race_found
	        setvar $aliens[$idx] $aliens[$idx] & ", " & $START
	        :race_done
	    	end
		end
	end
  add $START 1
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
