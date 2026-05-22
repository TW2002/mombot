gosub :loadvars~loadvars
gosub :help~initialize
loadvar $game~rob_factor
loadvar $bot~subspace

setvar $help~help[1] $help~tab&"Attempts to rob a port"
gosub :help~helpfile

:rob
gosub :player~quikstats
setvar $bot~validprompts "Citadel Command"
setvar $bot~startinglocation $player~current_prompt

if (($player~turns = 0) and ($player~unlimitedgame = false))
	setvar $switchboard~message "I have no turns*"
	gosub :switchboard~switchboard
	halt
end
gosub :player~checkstartingprompt
cuttext $player~alignment $neg_ck 1 1
striptext $player~alignment "-"
if ((($player~alignment < 100) and ($neg_ck = "-")) or ($neg_ck <> "-"))
	setvar $switchboard~message "Need -100 Alignment Minimum*"
	gosub :switchboard~switchboard
	goto :portrm_done
end
if ($bot~startinglocation = "Citadel")
	send "q"
	gosub :planet~getplanetinfo
	send "q"
end
setvar $second_mega 0
setvar $leftover_cash 0
setvar $mega_min 2970000
setvar $mega_max 5760000
send "p r * r"
settextlinetrigger fake :port_fake "Busted!"
settextlinetrigger mega :port_ok "port has in excess of"
pause

:port_fake
killalltriggers
if ($bot~startinglocation = "Citadel")
	gosub :planet~landingsub
end
setsectorparameter $player~current_sector "BUSTED" true
setvar $switchboard~message "Fake Busted*"
gosub :switchboard~switchboard
goto :portrm_done

:port_ok
killalltriggers
setvar $rob ($game~rob_factor*$player~experience)
getword currentline $port_cash 11
striptext $port_cash ","
striptext $port_cash "."
if ($port_cash < $mega_min)
	if ($ismega)
		setvar $port_cash (($port_cash*10)/9)
		setvar $mega_short (3300000 - $port_cash)
		send "0* "
		if ($bot~startinglocation = "Citadel")
			gosub :planet~landingsub
		end
		setvar $switchboard~message "Port is short "&$mega_short&" credits*"
		gosub :switchboard~switchboard
		goto :portrm_done
	else
		goto :do_rob
	end
elseif (($game~mbbs = true) and ($ismega = false))
	setvar $switchboard~message  $port_cash&" credits on port.  Port is ready for Mega Rob*"
	gosub :switchboard~switchboard
	send "*"
	if ($bot~startinglocation = "Citadel")
		gosub :planet~landingsub
	end
	goto :portrm_done
else
	if ($ismega)
		setvar $actual_cash $port_cash
		multiply $actual_cash 10
		divide $actual_cash 9
		setvar $mega_cash $actual_cash
		if ($actual_cash >= 3300000)

			:mega_loop
			if ($mega_cash > 6400000)
				subtract $mega_cash 3300000
				add $leftover_cash 3300000
				setvar $second_mega 1
				goto :mega_loop
			end
			if ($second_mega = 0)
				send $actual_cash "*"
			elseif ($second_mega = 1)
				send $mega_cash "*"
				setvar $actual_cash $mega_cash
			end
		end
		settextlinetrigger mega_suc :port_suc "Success!"
		settextlinetrigger mega_bust :port_bust "Busted!"
		pause
	else
		goto :do_rob
	end
end

:port_bust
killalltriggers
if ($bot~startinglocation = "Citadel")
	gosub :planet~landingsub
end
setsectorparameter $player~current_sector "BUSTED" true
send "'<" & $bot~subspace & ">[Busted:" & $player~current_sector & "]<" & $bot~subspace & ">*"
goto :portrm_done

:port_suc
killalltriggers
if ($bot~startinglocation = "Citadel")
	gosub :planet~landingsub
	send "tt" $actual_cash "*"
end
setvar $switchboard~message "Success! - "&$actual_cash&" credits robbed*"
gosub :switchboard~switchboard
if ($second_mega = true)
	setvar $switchboard~message "There are "&$leftover_cash&" credits left for a second mega*"
	gosub :switchboard~switchboard
end

:portrm_done
setvar $ismega false
halt

:do_rob
setvar $port_cash (($port_cash*10)/9)
if ($port_cash < $rob)
	setvar $rob $port_cash
end
send $rob "*"
setvar $actual_cash $rob
settextlinetrigger port_empty :port_suc "Maybe some other day, eh?"
settextlinetrigger mega_suc :port_suc "Success!"
settextlinetrigger port_bust :port_bust "Busted!"
pause

#INCLUDES:
include "source\include\planet"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
