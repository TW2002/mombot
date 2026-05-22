reqrecording
logging off
gosub :loadvars~loadvars
gosub :help~initialize
setvar $bot~command "select"
loadvar $bot~bot_turn_limit
loadvar $map~stardock
loadvar $bot~subspace
loadvar $switchboard~self_command

setvar $help~help[1]   $help~tab&"select {planet|trader|ship|anomoly|unexplored|sector|port}"
setvar $help~help[2]   $help~tab&"       {port:type} {count:#} {mark:PARAM} {none|dist|route}"
setvar $help~help[3]   $help~tab&"       {warps:#} {beam:botname} {limit:#} {from:#} {to:#}"
setvar $help~help[4]   $help~tab&"       {secure | paranoid}"
setvar $help~help[5]   $help~tab&"       "
setvar $help~help[6]   $help~tab&"     Searches TWX database for known info."
setvar $help~help[7]   $help~tab&"     You can use selectors = > < like !"
setvar $help~help[8]   $help~tab&"      "
setvar $help~help[9]   $help~tab&"     {mark:PARAM}  marks sectors PARAM=1 default QUERY=1 "
setvar $help~help[10]  $help~tab&"     {port:type}   match ports to pattern (xbx, sbb, xxx)"
setvar $help~help[11]  $help~tab&"                  "
setvar $help~help[12]  $help~tab&"    Examples:  "
setvar $help~help[13]  $help~tab&"              >select traders bubble=false equ-mcic<=60"
setvar $help~help[14]  $help~tab&"              >select planet like "&#34&"<<<< (a)"&#34
setvar $help~help[15]  $help~tab&"              >select port port.f>10000 figsec=true"
setvar $help~help[16]  $help~tab&"              >select port port.o>10000 figsec=false"
setvar $help~help[17]  $help~tab&"              >select port port.e>10000 warps:1"
setvar $help~help[18]  $help~tab&"              >select sector fig.owner=1 armid.owner=kane"
setvar $help~help[19]  $help~tab&"              >select sector limp.owner=3 limp.count>10"
setvar $help~help[20]  $help~tab&"              >select sector armid.count>100"
setvar $help~help[21]  $help~tab&"              >select sector limp.owner!3 "
setvar $help~help[22]  $help~tab&"         "
setvar $help~help[23]  $help~tab&"         {dist} - All results include distance from current. "
setvar $help~help[24]  $help~tab&"        {route} - Plots a basic shortest path (slow). "
setvar $help~help[25]  $help~tab&"          {ppt} - Finds port pair trading ports  "
setvar $help~help[26]  $help~tab&"      {warps:#} - Restrict matches to nwarps  "
setvar $help~help[27]  $help~tab&"      {count:#} - limit results to sectors with a  "
setvar $help~help[28]  $help~tab&"                  minimum count of planets/traders/ships"
setvar $help~help[29]  $help~tab&"      {limit:#} - limit query results to first n found "
setvar $help~help[30]  $help~tab&" {beam:botname} - Beam to bot name  "
setvar $help~help[31]  $help~tab&"   {origin:sec} - Specify which sector to use for DIST "
setvar $help~help[32]  $help~tab&"     {backdoor} - Result must include a backdoor "
setvar $help~help[33]  $help~tab&"       {from:#} - Lowest sector number to include "
setvar $help~help[34]  $help~tab&"         {to:#} - Highest sector number to include "

# ham select ports ore-mcic<-70
gosub :help~helpfile

#setVar $BOT~script_title "Select"
#gosub :BOT~banner

setvar $player~save true

getsectorparameter sectors "FIGSEC" $isfigged

setvar $mark "QUERY"
setvar $portclassok 8
setvar $portclasswanted 0
#final filter of search results 0 - none, 1 - secure (figs surrounded) 2- PAranoid (Figs + Limps)
setvar $securitylevel 0
setvar $warps 0

setvar $i 1

setvar $original_query $bot~user_command_line

setvar $searchfrom 1
setvar $searchto sectors

getwordpos $bot~user_command_line $pos "from:"
if ($pos > 0)
	gettext $bot~user_command_line $from "from:" " "
	if ($from = "")
		setvar $bot~user_command_line $bot~user_command_line & " "
		gettext $bot~user_command_line $from "from:" " "
	end
	isnumber $test $from
	if ($test = false)

		setvar $switchboard~message "From Sector should be a number.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $searchfrom $from
	end
end

getwordpos $bot~user_command_line $pos "to:"
if ($pos > 0)
	gettext $bot~user_command_line $to "to:" " "
	if ($to = "")
		setvar $bot~user_command_line $bot~user_command_line & " "
		gettext $bot~user_command_line $to "to:" " "
	end
	isnumber $test $to
	if ($test = false)

		setvar $switchboard~message "To Sector should be a number.*"
		gosub :switchboard~switchboard
		halt
	else
		setvar $searchto $to
	end
end

setvar $limit (($searchto - $searchfrom) + 1)

getwordpos $bot~user_command_line $pos "dist"
setvar $origin currentsector

if ($pos > 0)
	setvar $dist 1
	replacetext $bot~user_command_line " dist " " "
	replacetext $bot~user_command_line " dist" " "

	getwordpos $bot~user_command_line $pos "origin:"
	if ($pos > 0)
		gettext $bot~user_command_line $origin "origin:" " "
		if ($origin = "")
			setvar $bot~user_command_line $bot~user_command_line & " "
			gettext $bot~user_command_line $origin "origin:" " "
		end
		isnumber $test $origin

		if ($test = false)

			setvar $switchboard~message "Origin should be a number.*"
			gosub :switchboard~switchboard
			halt
		end
	end
end

getwordpos $bot~user_command_line $pos "warps:"
if ($pos > 0)

	gettext $bot~user_command_line $warps "warps:" " "

	if ($warps = "")
		setvar $bot~user_command_line $bot~user_command_line & " "
		gettext $bot~user_command_line $warps "warps:" " "
	end
	isnumber $test $warps

	if ($test)
		if (($warps > 6) or ($warps < 1))
			setvar $switchboard~message "Warps should be a number 1-6.*"
			gosub :switchboard~switchboard
			halt
		else
			replacetext $bot~user_command_line " warps:" & $warps & " " " "
			replacetext $bot~user_command_line " warps:" & $warps " "

		end
	else
		setvar $switchboard~message "Warps should be a number 1-6.*"
		gosub :switchboard~switchboard
		halt
	end

end

setvar $backdoor false
getwordpos " "&$bot~user_command_line&" " $pos " backdoor "
if ($pos > 0)
	setvar $backdoor true
	replacetext $bot~user_command_line " backdoor " " "
	replacetext $bot~user_command_line " backdoor" " "
end

getwordpos " "&$bot~user_command_line&" " $pos " ppt "
if ($pos > 0)
	setvar $portpair true
	replacetext $bot~user_command_line " ppt " " "
	replacetext $bot~user_command_line " ppt" " "
end

getwordpos $bot~user_command_line $pos "route"
if ($pos > 0)
	setvar $dist 0
	setvar $doroute 1
	replacetext $bot~user_command_line " route " " "
	replacetext $bot~user_command_line " route" " "

end

# $sector_params param
# $sector_params[1] true/false
#
setarray $sector_params 100 3
setvar $sector_param_count 0

getwordpos $bot~user_command_line $pos #34
if ($pos > 0)
	gettext $bot~user_command_line $like " "&#34 #34
	if ($like <> "")

		#remove like statement from command line
		striptext $bot~user_command_line #34&$like&#34
		striptext $bot~user_command_line " like "
	end
	#echo "**[Like statement found]["&$like&"]**"
else
	setvar $like ""
end
setvar $beam ""
setvar $mincount 1

while ($word <> "@@@###@@@")
	getword $bot~user_command_line $word $i "@@@###@@@"

	getlength $word $l
	if ($l = 3)
		setvar $portreqf 0
		gosub :checkportrequirements
		if ($portreqf = 1)
			goto :nextword
		end
	elseif ($word = "secure")
		setvar $securitylevel 1
		goto :nextword
	elseif ($word = "paranoid")
		setvar $securitylevel 2
		goto :nextword
	end

	getwordpos $word $pos "limit:"
	if ($pos > 0)
		replacetext $word "limit:" ""
		setvar $limit $word
		isnumber $test $limit
		if ($test <> true)
			setvar $limit sectors
		end
	end
	getwordpos $word $pos "count:"
	if ($pos > 0)
		replacetext $word "count:" ""
		setvar $mincount $word
		isnumber $test $mincount
		if ($test <> true)
			setvar $mincount 1
		end
	end

	getwordpos $word $pos "beam:"
	if ($pos > 0)
		replacetext $word "beam:" ""
		setvar $beam $word
	else
		getwordpos $word $pos "mark:"
		if ($pos > 0)
			replacetext $word "mark:" ""
			setvar $mark $word
			uppercase $mark
		else

			getwordpos $word $pos "="
			if ($pos > 0)
				add $sector_param_count 1
				replacetext $word "=" " "
				getword $word $sector_params[$sector_param_count] 1
				uppercase $sector_params[$sector_param_count]
				getword $word $sector_params[$sector_param_count][1] 2
				if ($sector_params[$sector_param_count][1] = "true")
					setvar $sector_params[$sector_param_count][1] 1
				end
				if ($sector_params[$sector_param_count][1] = "false")
					setvar $sector_params[$sector_param_count][1] 0
				end
				setvar $sector_params[$sector_param_count][2] "="
			else

				setvar $selectchar ""

				getwordpos $word $pos ">"
				if ($pos > 0)
					setvar $selectchar ">"
					replacetext $word ">" " "
				else
					getwordpos $word $pos "<"
					if ($pos > 0)
						setvar $selectchar "<"
						replacetext $word "<" " "
					else
						getwordpos $word $pos "!"
						if ($pos > 0)
							setvar $selectchar "!"
							replacetext $word "!" " "
						end
					end
				end

				if ($selectchar <> "")
					add $sector_param_count 1
					getword $word $sector_params[$sector_param_count] 1
					uppercase $sector_params[$sector_param_count]
					getword $word $sector_params[$sector_param_count][1] 2
					setvar $sector_params[$sector_param_count][2] $selectchar
				end
			end
		end
	end

	:nextword
	add $i 1
end

setvar $result_memory " "
setvar $results ""
setarray $sectorresults sectors
setarray $pairedports sectors
setvar $sectorresults 0
setvar $sectorresultsi 0
setvar $count 0
setvar $done false
setvar $i $searchfrom
while (($i <= $searchto) and ($done <> true))
	setvar $j 1
	setvar $skip false
	if ((($warps > 0) and (sector.warpcount[$i] = $warps)) or ($warps = 0))
		while (($j <= $sector_param_count) and ($skip <> true))
			setvar $value "[[NOVALUE]]"

			setvar $bot~parmameter $sector_params[$j]
			lowercase $bot~parmameter
			getwordpos $bot~parmameter $pos "port.f"
			getwordpos $bot~parmameter $pos2 "ports.f"
			if (($pos > 0) or ($pos2 > 0))
				setvar $value port.fuel[$i]
			else
				getwordpos $bot~parmameter $pos "port.o"
				getwordpos $bot~parmameter $pos2 "ports.o"
				if (($pos > 0) or ($pos2 > 0))
					setvar $value port.org[$i]
				else
					getwordpos $bot~parmameter $pos "port.e"
					getwordpos $bot~parmameter $pos2 "ports.e"
					if (($pos > 0) or ($pos2 > 0))
						setvar $value port.equip[$i]
					end
				end
			end

			getwordpos $bot~parmameter $pos "fig.o"
			if ($pos > 0)
				setvar $value sector.figs.owner[$i]
				isnumber $test $sector_params[$j][1]
				lowercase $value
				#belong to corp#4, king's court#
				getwordpos $value $pos "belong to corp#"
				if ($pos > 0)
					gettext $value $corpnumber "belong to corp#" ","
					setvar $value "belong to corp#"&$corpnumber
				end
				getwordpos $value $pos "belong to your corp"
				if ($pos > 0)
					setvar $value "belong to corp#"&currentcorp
				end
				isnumber $test $sector_params[$j][1]
				getwordpos $sector_params[$j][1] $pos "belong to"
				if ($pos <= 0)
					if ($test = true)
						setvar $sector_params[$j][1] "belong to corp#"&$sector_params[$j][1]
					else
						setvar $sector_params[$j][1] "belong to "&$sector_params[$j][1]
					end
				end
			else
				getwordpos $bot~parmameter $pos "limp.o"
				if ($pos > 0)
					setvar $value sector.limpets.owner[$i]
					lowercase $value
					#belong to corp#4, king's court#
					getwordpos $value $pos "belong to corp#"
					if ($pos > 0)
						gettext $value $corpnumber "belong to corp#" ","
						setvar $value "belong to corp#"&$corpnumber
					end
					getwordpos $value $pos "belong to your corp"
					if ($pos > 0)
						setvar $value "belong to corp#"&currentcorp
					end
					isnumber $test $sector_params[$j][1]
					getwordpos $sector_params[$j][1] $pos "belong to"
					if ($pos <= 0)
						if ($test = true)
							setvar $sector_params[$j][1] "belong to corp#"&$sector_params[$j][1]
						else
							setvar $sector_params[$j][1] "belong to "&$sector_params[$j][1]
						end
					end
				else
					getwordpos $bot~parmameter $pos "armid.o"
					if ($pos > 0)
						setvar $value sector.mines.owner[$i]
						lowercase $value
						#belong to corp#4, king's court#
						getwordpos $value $pos "belong to corp#"
						if ($pos > 0)
							gettext $value $corpnumber "belong to corp#" ","
							setvar $value "belong to corp#"&$corpnumber
						end
						getwordpos $value $pos "belong to your corp"
						if ($pos > 0)
							setvar $value "belong to corp#"&currentcorp
						end
						isnumber $test $sector_params[$j][1]
						getwordpos $sector_params[$j][1] $pos "belong to"
						if ($pos <= 0)
							if ($test = true)
								setvar $sector_params[$j][1] "belong to corp#"&$sector_params[$j][1]
							else
								setvar $sector_params[$j][1] "belong to "&$sector_params[$j][1]
							end
						end
						#						if ($value <> "")
						#							echo "*["&$value&"] = ["&$sector_params[$j][1]&"]*"
						#						end
					end
				end
			end

			getwordpos $bot~parmameter $pos "fig.c"
			if ($pos > 0)
				setvar $value sector.figs.quantity[$i]
				lowercase $value
			else
				getwordpos $bot~parmameter $pos "limp.c"
				if ($pos > 0)
					setvar $value sector.limpets.quantity[$i]
					lowercase $value
				else
					getwordpos $bot~parmameter $pos "armid.c"
					if ($pos > 0)
						setvar $value sector.mines.quantity[$i]
						lowercase $value
					end
				end
			end

			if ($value = "[[NOVALUE]]")
				//if it's not one of these specific variables, assume sector param
				getsectorparameter $i $sector_params[$j] $value
			end

			if ($sector_params[$j][2] = "=")

				if ($value = $sector_params[$j][1])
					//possible candidate
				else
					if (($value = "") and ($sector_params[$j][1] = 0))
						//possible candidate
					else
						setvar $skip true
					end
				end
			else

				if ($value <> "")
					if ($sector_params[$j][2] = ">")

						if ($value > $sector_params[$j][1])
							//possible candidate
						else
							setvar $skip true
						end
					elseif ($sector_params[$j][2] = "<")

						if ($value < $sector_params[$j][1])
							//possible candidate
						else
							setvar $skip true
						end
					elseif ($sector_params[$j][2] = "!")

						if ($value <> $sector_params[$j][1])
							//possible candidate
						else
							setvar $skip true
						end
					end
				else
					setvar $skip true
				end
			end

			add $j 1
		end
	else
		setvar $skip true
	end
	if ($backdoor = true)
		if (sector.backdoorcount[$i] = 0)
			setvar $skip true
		end
	end
	if ($skip <> true)
		if (($bot~parm1 = "planet") or ($bot~parm1 = "planets"))
			if (sector.planetcount[$i] < $mincount)
				setvar $skip true
			else
				if ($like <> "")
					setvar $j 1
					setvar $isfound false
					while (($j <= sector.planetcount[$i]) and ($isfound <> true))
						setvar $temp sector.planets[$i][$j]
						lowercase $temp
						getwordpos $temp $pos $like
						if ($pos > 0)
							setvar $isfound true
						end
						add $j 1
					end
					if ($isfound <> true)
						setvar $skip true
					end
				end
			end
		else
			if (($bot~parm1 = "trader") or ($bot~parm1 = "traders"))
				if (sector.tradercount[$i] < $mincount)
					setvar $skip true
				else
					if ($like <> "")
						setvar $j 1
						setvar $isfound false
						while (($j <= sector.tradercount[$i]) and ($isfound <> true))
							setvar $temp sector.traders[$i][$j]
							lowercase $temp
							getwordpos $temp $pos $like
							if ($pos > 0)
								setvar $isfound true
							end
							add $j 1
						end
						if ($isfound <> true)
							setvar $skip true
						end
					end
				end
			else
				if (($bot~parm1 = "ship") or ($bot~parm1 = "ships"))
					if (sector.shipcount[$i] < $mincount)
						setvar $skip true
					else
						if ($like <> "")
							setvar $j 1
							setvar $isfound false
							while (($j <= sector.shipcount[$i]) and ($isfound <> true))
								setvar $temp sector.ships[$i][$j]
								lowercase $temp
								getwordpos $temp $pos $like
								if ($pos > 0)
									setvar $isfound true
								end
								add $j 1
							end
							if ($isfound <> true)
								setvar $skip true
							end
						end
					end
				else
					if (($bot~parm1 = "unexplore") or ($bot~parm1 = "unexplored"))
						if (sector.explored[$i] = "YES")
							setvar $skip true
						end
					else
						if (($bot~parm1 = "anomoly") or ($bot~parm1 = "anomolies"))
							if (sector.anomoly[$i] <> true)
								setvar $skip true
							end
						else
							if (($bot~parm1 = "explore") or ($bot~parm1 = "explored"))
								if (sector.explored[$i] <> "YES")
									setvar $skip true
								end
							else
								if (($bot~parm1 = "trader") or ($bot~parm1 = "traders"))
									if ((sector.shipcount[$i] <= 0) and (sector.tradercount <= 0))
										setvar $skip true
									else

										if ($like <> "")
											setvar $j 1
											setvar $isfound false
											while (($j <= sector.tradercount[$i]) and ($isfound <> true))
												setvar $temp sector.traders[$i][$j]
												lowercase $temp
												getwordpos $temp $pos $like
												if ($pos > 0)
													setvar $isfound true
												end
												add $j 1
											end
											setvar $j 1
											while (($j <= sector.shipcount[$i]) and ($isfound <> true))
												setvar $temp sector.ships[$i][$j]
												lowercase $temp
												getwordpos $temp $pos $like
												if ($pos > 0)
													setvar $isfound true
												end
												add $j 1
											end
											if ($isfound <> true)
												setvar $skip true
											end
										end
									end
								else
									if (($bot~parm1 = "port") or ($bot~parm1 = "ports"))
										if (port.exists[$i] <> 1)
											setvar $skip true
										else
											if ($portclasswanted = 1)
												if ($portclassok[port.class[$i]] = 0)
													setvar $skip true
												end
											end
											if ($portpair = true)
												setvar $possible_ppt_classes " 1 2 4 5 "
												getwordpos $possible_ppt_classes $pos " "&port.class[$i]&" "
												if ($pos > 0)
													setvar $isfound false
													setvar $class port.class[$i]
													if ($class = "1")
														setvar $pair "2"
														setvar $pair2 "4"
													elseif ($class = "2")
														setvar $pair "5"
														setvar $pair2 "1"
													elseif ($class = "4")
														setvar $pair "5"
														setvar $pair2 "1"
													elseif ($class = "5")
														setvar $pair "4"
														setvar $pair2 "2"
													end
													setvar $j 1
													while (sector.warps[$i][$j] > 0)
														setvar $neighbor sector.warps[$i][$j]
														# check and see if result for neighbor sector is already been selected as result. #
														getwordpos $result_memory $pos " "&$neighbor&" "
														if ((port.exists[$neighbor]) and ($pos <= 0))
															if ((port.class[$neighbor] = $pair) or (port.class[$neighbor] = $pair2))
																setvar $pairedports[$i] $neighbor
																setvar $isfound true
															end
														end
														add $j 1
													end
													if ($isfound <> true)
														setvar $skip true
													end
												else
													setvar $skip true
												end
												#1 - 4,2
												#2 - 1,5
												#4 - 1,5
												#5 - 2,4

											end

											if (($like <> "") and ($skip <> true))
												setvar $temp port.name[$i]
												lowercase $temp
												getwordpos $temp $pos $like
												if ($pos <= 0)
													setvar $skip true
												end
											end
										end

									else
										if (($bot~parm1 = "sector") or ($bot~parm1 = "sectors"))

										else
											setvar $switchboard~message "You must select either sectors, planets, ships, unexplored, explored, anomoly, ports, or traders.*"
											gosub :switchboard~switchboard
											halt
										end

									end
								end
							end
						end
					end
				end
			end
		end
	end
	if ($skip <> true)
		setvar $securitybreach 0
		if ($securitylevel > 0)
			setvar $di 1
			while ($di <= sector.warpincount[$i])
				getsectorparameter sector.warpsin[$i][$di] "FIGSEC" $hasfig

				if ($hasfig <> 1)
					add $securitybreach 1
				end
				if ($securitylevel = 2)
					getsectorparameter sector.warpsin[$i][$di] "LIMPSEC" $haslimp
					if ($haslimp <> 1)
						add $securitybreach 1
					end
				end
				add $di 1
			end
		end
		if ($securitybreach = 0)
			add $count 1
			add $sectorresultsi 1
			setvar $result_memory $result_memory&" "&$i&" "
			setvar $sectorresults[$sectorresultsi] $i

			if (($count >= $limit) and ($dist <> true))
				setvar $done true
			end
			#getSectorParameter $i "FIGSEC" $isFigged
			#setSectorParameter $i $mark TRUE
			#if ($isFigged = true)
			#	setvar $results $results&"["&$i&"] "
			#else
			#	setvar $results $results&$i&" "
			#end
		else
			setsectorparameter $i $mark ""
		end
	else
		setsectorparameter $i $mark ""
	end
	add $i 1
end

# if we hit the limit, unmark others
if ($i < sectors)
	while ($i <= sectors)
		setsectorparameter $i $mark ""
		add $i 1
	end
end

setvar $sortedresults 0
setvar $sortedresultsi 0
setvar $sorteddistance 0
# NEed Dist and Route
setvar $distances 0
if ($dist = 1)
	# Measures distance from this point of origin
	getallcourses $courses $origin
	setvar $y 1
	while ($y <= $sectorresultsi)
		setvar $distances[$y] $courses[$sectorresults[$y]]
		add $y 1
	end

	setvar $l 1
	while ($l <= 45)

		setvar $y 1
		while ($y <= $sectorresultsi)
			if ($distances[$y] = $l)
				add $sortedresultsi 1
				setvar $sortedresults[$sortedresultsi] $sectorresults[$y]
				setvar $sorteddistance[$sortedresultsi] $distances[$y]

			end
			add $y 1
		end

		add $l 1
	end
elseif ($doroute = 1)
	if ($limit < $sectorresultsi)
		setvar $sectorresultsi $limit
	end
	if ($sectorresultsi > 50)
		setvar $switchboard~message "To many results for route calculation; please narrow search.*"
		gosub :switchboard~switchboard
		halt
	end

	setvar $routedone 0
	setvar $y 1
	while ($y <= $sectorresultsi)
		setvar $routedone[$y] 0
		add $y 1
	end

	setvar $routecurrent $origin
	setvar $route 0
	setvar $routei 0

	setvar $go 1
	while ($go = 1)

		setvar $found 0
		getnearestwarps $near $routecurrent
		setvar $i 1
		while ($i <= $near)

			setvar $y 1
			while ($y <= $sectorresultsi)
				if (($near[$i] = $sectorresults[$y]) and ($routedone[$y] = 0))

					setvar $routedone[$y] 1
					setvar $found 1
					add $routei 1
					setvar $route[$routei] $sectorresults[$y]
					getdistance $dist $routecurrent $sectorresults[$y]
					setvar $routecurrent $sectorresults[$y]

					setvar $sorteddistance[$routei] $dist

					# for exit the loops
					setvar $y 99999
					setvar $i 99999
				end

				add $y 1
			end
			add $i 1
		end

		if ($found = 0)
			# if ever not found, then we'll have to exit loop and report
			setvar $go 0
			setvar $switchboard~message "Debug: Did we just exit route creation without completing all sectors?*"
			gosub :switchboard~switchboard
		end

		if ($routei = $sectorresultsi)
			setvar $go 0
		end

	end

	setvar $y 1
	while ($y <= $routei)
		setvar $sortedresults[$y] $route[$y]

		add $y 1
	end

else
	setvar $y 1
	while ($y <= $sectorresultsi)
		setvar $sortedresults[$y] $sectorresults[$y]
		setvar $sorteddistance[$y] ""
		add $y 1
	end
end

setvar $d ""
setvar $y 1
if ($limit < $sectorresultsi)
	setvar $sectorresultsi $limit
end
while ($y <= $sectorresultsi)
	setvar $count $sectorresultsi
	if ($sortedresults[$y] > 0)
		getsectorparameter $sortedresults[$y] "FIGSEC" $isfigged
		setsectorparameter $sortedresults[$y] $mark true
		if (($dist = 1) or ($doroute = 1))
			setvar $d "(" & $sorteddistance[$y] &")"
		end
		if ($portpair = true)
			getsectorparameter $pairedports[$sortedresults[$y]] "FIGSEC" $isfigged2
			if ($isfigged2 = true)
				setvar $pair "["&$pairedports[$sortedresults[$y]]&"]"
			else
				setvar $pair $pairedports[$sortedresults[$y]]
			end
			if ($isfigged = true)
				setvar $results $results&"["& $sortedresults[$y] &"]<->"&$pair& $d & " "
			else
				setvar $results $results& $sortedresults[$y]&"<->"&$pair& $d & " "
			end
		else
			if ($isfigged = true)
				setvar $results $results&"["& $sortedresults[$y] &"]" & $d & " "
			else
				setvar $results $results& $sortedresults[$y] & $d & " "
			end
		end
	end
	add $y 1
end

if ($switchboard~self_command <> true) or ($bot~silent_running <> true)
	setvar $switchboard~self_command 2
end

if ($count <= 0)
	setvar $switchboard~message "Displaying results for: select "&$original_query&"* *Your query returned "&$count&" results.*"
else
	if ($count > 1000)
		setvar $switchboard~message "Displaying results for: select "&$original_query&"* *Your query returned "&$count&" results.*This is too many to display on subspace. *If you'd like to narrow your search, add more parameters.*All result sectors are now marked with QUERY sector parameter.*You can also display individual results with the sector bot command.*"
	else
		setvar $switchboard~message "Displaying results for: select "&$original_query&"* *"&$results&"* *Your query returned "&$count&" results.*All result sectors are now marked with QUERY sector parameter.*You can also display individual results with the sector bot command.*"
	end
end
gosub :switchboard~switchboard
if ($beam <> "")
	setvar $switchboard~message "Autobeaming to "&$beam&".*"
	setvar $bot~command "beam"
	setvar $bot~user_command_line " beam param "&$mark&" "&$beam&" delete "
	setvar $bot~parm1 "param"
	savevar $bot~parm1
	setvar $bot~parm2 $mark
	savevar $bot~parm2
	setvar $bot~parm3 $beam
	savevar $bot~parm3
	setvar $bot~parm4 "delete"
	savevar $bot~parm5
	savevar $bot~command
	savevar $bot~user_command_line
	load "scripts\"&$bot~mombot_directory&"\modes\data\beam.cts"
	seteventtrigger		beamdone		:beamdone "SCRIPT STOPPED" "scripts\"&$bot~mombot_directory&"\modes\data\beam.cts"
	pause

	:beamdone
end
halt

setvar $i 1
while ($i <= sectors)
	setvar $isbubble false
	getsectorparameter $i "BUBBLE" $isbubble
	getsectorparameter $i "FIGSEC" $isfigged

	getwordpos $tl_planets $pos " "&$i&" "
	if ($pos > 0)
		setvar $isbubble true
	end
	if (($isbubble <> true) and ($isfigged <> true))
		if (sector.planetcount[$i] > 0)
			setvar $map~displaysector $i
			gosub :map~displaysector
			setvar $switchboard~message "  *"&$map~output
			if ($switchboard~self_command <> true)
				setvar $switchboard~self_command 2
			end
			listsectorparameters $i $bot~parms
			setvar $j 1
			setvar $switchboard~message $switchboard~message&"  *"
			while ($j <= $bot~parms)
				getsectorparameter $i $bot~parms[$j] $check
				setvar $switchboard~message $switchboard~message&"    "&$bot~parms[$j]&": "&$check&"*"
				add $j 1
			end
			gosub :switchboard~switchboard

		end
	end
	add $i 1
end

halt

:checkportrequirements
# Mark them all ok, and we'll rule them out
setvar $pi 1
while ($pi <= 8)
	setvar $portclassok[$pi] 1
	add $pi 1
end

setvar $tword $word
uppercase $tword
cuttext $tword $f 1 1
cuttext $tword $o 2 1
cuttext $tword $e 3 1
if (($f = "B") or ($f = "S") or ($f = "X"))
	if (($o = "B") or ($o = "S") or ($o = "X"))
		if (($e = "B") or ($e = "S") or ($e = "X"))
			setvar $portclasswanted 1
		end
	end
end
if ($portclasswanted = 0)
	return
end
# 0 - zzz
# 1 - BBS
# 2 - BSB
# 3 - SBB
# 4 - SSB
# 5 - SBS
# 6 - BSS
# 7 - SSS
# 8 - BBB

if ($f = "B")
	setvar $portclassok[3] 0
	setvar $portclassok[4] 0
	setvar $portclassok[5] 0
	setvar $portclassok[7] 0
elseif ($f = "S")
	setvar $portclassok[1] 0
	setvar $portclassok[2] 0
	setvar $portclassok[6] 0
	setvar $portclassok[8] 0
end

if ($o = "B")
	setvar $portclassok[2] 0
	setvar $portclassok[4] 0
	setvar $portclassok[6] 0
	setvar $portclassok[7] 0
elseif ($o = "S")
	setvar $portclassok[1] 0
	setvar $portclassok[3] 0
	setvar $portclassok[5] 0
	setvar $portclassok[8] 0
end

if ($e = "B")
	setvar $portclassok[1] 0
	setvar $portclassok[5] 0
	setvar $portclassok[6] 0
	setvar $portclassok[7] 0
elseif ($e = "S")
	setvar $portclassok[2] 0
	setvar $portclassok[3] 0
	setvar $portclassok[4] 0
	setvar $portclassok[8] 0

end
setvar $portreqf 1

return

#INCLUDES:
include "source\include\loadvars"
include "source\include\map"
include "source\include\help"
include "source\include\switchboard.ts"
