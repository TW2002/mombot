gosub :LOADVARS~LOADVARS
gosub :HELP~INITIALIZE
	
if (($bot~parm1 = "?") or ($bot~parm1 = "help"))
	goto :wait_for_command
end

setVar $getAllParamsFromSectors FALSE
if ($bot~parm1 = "")
	setvar $bot~parm1 currentsector
end
isNumber $test $bot~parm1
if ($test = TRUE)
    if (($bot~parm1 <= 0) OR ($bot~parm1 > SECTORS))
        setvar $bot~parm1 CURRENTSECTOR
   end
    if ($SWITCHBOARD~self_command <> TRUE) or ($bot~silent_running <> TRUE)
        setVar $SWITCHBOARD~self_command 2
    end
    listSectorParameters $bot~parm1 $bot~parms
    setvar $i 1
    setVar $SWITCHBOARD~message "  *Displaying sector parameters for sector "&$bot~parm1&": *"
	
	# HAMMER - 23/10 - Added this because EP HAGGLE creates so many prams
	# that the BUST / FAKE Bust params weren't showing
	# So probably a bug in TWX...

    getSectorParameter $bot~parm1 "BUSTED" $bustthissec
    if ($bustthissec = TRUE)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  BUSTED: 1*"
    end
    getSectorParameter $bot~parm1 "FAKEBUST" $fakebust
    if ($fakebust = TRUE)
		setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  FAKEBUST: 1*"
    end
    while ($i <= $bot~parms)
        getSectorParameter $bot~parm1 $bot~parms[$i] $check
		if ($bot~parms[$i] = "BUSTED")
		elseif ($bot~parms[$i] = "FAKEBUST")
		else
			setVar $SWITCHBOARD~message $SWITCHBOARD~message&"  "&$bot~parms[$i]&": "&$check&"*"
		end
        add $i 1
    end
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command      
    
else
    setvar $i 1
    setvar $count 0
    uppercase $bot~parm1
    setVar $output "Displaying sectors for "&$bot~parm1&": *"
    if ($bot~parm1 <> "PSECTOR")
        while ($i <= SECTORS)
            getSectorParameter $i $bot~parm1 $check
            getSectorParameter $i "FIGSEC" $isFigged
            if (($check <> "") AND ($check <> "0"))
                if ($isFigged = true)
                    setVar $output $output&"["&$i&"] "
                else
                    setVar $output $output&$i&" "
                end
                add $count 1
            end
            add $i 1
        end
    else
        while ($i <= 2000)
            getSectorParameter $i "PSECTOR" $check
            if (($check <> "") AND ($check <> "0"))
                setVar $output $output&" Planet #"&$i&"==>["&$check&"]*"
                add $count 1
            end
            add $i 1
        end        
    end

    if ($SWITCHBOARD~self_command <> TRUE) or ($bot~silent_running <> TRUE)
        setVar $SWITCHBOARD~self_command 2
    end

    setVar $SWITCHBOARD~message $output&"*Total Count: "&$count&"*"
    gosub :SWITCHBOARD~switchboard
    goto :wait_for_command      

end


:wait_for_command
	setVar $HELP~HELP[1]  $HELP~TAB&"   PARAM - Displays sector parameters saved in game."
	setVar $HELP~HELP[2]  $HELP~TAB&"   "
	setVar $HELP~HELP[3]  $HELP~TAB&"   - param [sector]  "
	setVar $HELP~HELP[4]  $HELP~TAB&"        Displays all bot sector parameters "
	setVar $HELP~HELP[5]  $HELP~TAB&"          (FIGSEC, MINESEC, LIMPSEC, MSLSEC, BUSTED, PSECTOR)"
	setVar $HELP~HELP[6]  $HELP~TAB&"   "
	setVar $HELP~HELP[7]  $HELP~TAB&"   - param [param]"
	setVar $HELP~HELP[8]  $HELP~TAB&"        Displays all sectors where that param is non-zero/non-blank"
	setVar $HELP~HELP[9]  $HELP~TAB&"   "
	gosub :HELP~HELPFILE
halt

:killthetriggers
    killalltriggers
return


# includes:
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
