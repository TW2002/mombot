gosub :loadvars~loadvars
gosub :help~initialize
setvar $help~help[1]  $help~tab&"Reads and reports daily game news."
setvar $help~help[2]  $help~tab&" "
setvar $help~help[3]  $help~tab&"news [category] {r|yest}"
setvar $help~help[4]  $help~tab&" "
setvar $help~help[5]  $help~tab&"Categories:"
setvar $help~help[6]  $help~tab&"        {rep}    Overall reporting of events in the Log"
setvar $help~help[7]  $help~tab&"      {foton}    Lists fotons fired"
setvar $help~help[8]  $help~tab&"        {tow}    Who was towed"
setvar $help~help[9]  $help~tab&"      {ports}    Port activity"
setvar $help~help[10] $help~tab&"    {planets}    Who popped planet(s) and how many"
setvar $help~help[11] $help~tab&"       {corp}    Corporate news"
setvar $help~help[12] $help~tab&"        {fed}    Commish awards and bounties"
setvar $help~help[13] $help~tab&"       {pods}    Itemized list of who podded"
setvar $help~help[14] $help~tab&"  {overloads}    Sectors with overloaded planets"
setvar $help~help[15] $help~tab&"   {announce}    Announcements made"
setvar $help~help[16] $help~tab&" "
setvar $help~help[17] $help~tab&"Refresh:"
setvar $help~help[18] $help~tab&"          {r}    Refreshes using current game date"
setvar $help~help[19] $help~tab&"       {yest}    Refreshes previous day game date data"
gosub :help~helpfile

loadvar $bot_name
loadvar $user_command_line
loadvar $parm1
loadvar $parm2
loadvar $parm3
loadvar $parm4
loadvar $parm5
loadvar $parm6
loadvar $parm7
loadvar $parm8
loadvar $bot~folder

getword $user_command_line $parm1 1
getword $user_command_line $parm2 2
getword $user_command_line $parm3 3
getword $user_command_line $parm4 4
getword $user_command_line $parm5 5
getword $user_command_line $parm6 6
getword $user_command_line $parm7 7
getword $user_command_line $parm8 8

:read_news_paper
setvar $news_param1 $parm1
setvar $news_param2 $parm2

setvar $news_version "v2.0"

setvar $under_construction "    *    Feature Currently Not Implemented*     *"
setvar $news_header "-------------=[Lonestar's M()M Dailies News Reader "&$news_version&"]=-------------*"
setvar $universal_file_err "    *    Problem Reading Data File*    *    "
setvar $unexpected_eof "** '{"&$bot_name&"} - Unexpected End Of Array. Halting.*"
setvar $news_empty "[32mNo log entries today."

setvar $news_validated false
setvar $news_footer ""
setvar $news_file $bot~folder&"/_MOM_"&gamename&".news"

setvar $file_header ""
setvar $news_read false
loadvar $news_yest

setvar $actuallines 0

gosub :player~quikstats
setvar $startinglocal $player~current_prompt

if (($startinglocal <> "Citadel") and ($startinglocal <> "Command"))
	setvar $switchboard~message "Must start at citadel or command prompt*"
	gosub :switchboard~switchboard
	halt
end

if (($news_param1 = "yest") or ($news_param2 = "yest"))
	setvar $news_yest true
	gosub :log_2_file
elseif (($news_param1 = "r") or ($news_param2 = "r"))
	setvar $news_yest false
	gosub :log_2_file
else
	fileexists $news_file_chk $news_file
	if ($news_file_chk = false)
		gosub :log_2_file
	end

end
gosub :file_2_array
gosub :format_footer
gosub :validate

send "'*"
waitfor "Comm-link open on sub-space band"

send $news_header

if ($news_validated = false)
	send "     *      No News To Report*     *     *"
elseif (($news_param1 = "rep") or ($news_param1 = 0) or ($news_param1 = "r") or ($news_param1 = "yest"))
	gosub :overload
	send $umass_results&"    *"
	gosub :tow_detail
	send $towresults&"       *"
	gosub :port_authority
	send $portresults&"      *"
	gosub :planets_popped
	send $poppedresults&"     *"
	gosub :photons_fired
	send $launchedresults&"    *"
	gosub :podingss
	send $podresults&"        *"
	gosub :announced
	send $annonresults&"      *"
	gosub :corporate
	send $corpresults&"       *"
	gosub :fed
	send $fedresults&"        *"
elseif ($news_param1 = "foton")
	gosub :photons_list
	send $photonresults
elseif ($news_param1 = "tow")
	gosub :tow_detail
	send $towresults&"       *"
elseif ($news_param1 = "ports")
	gosub :port_authority
	send $portresults&"      *"
elseif ($news_param1 = "planets")
	gosub :planets_popped
	send $poppedresults&"    *"
elseif ($news_param1 = "obits")
	send $under_construction
elseif ($news_param1 = "pods")
	gosub :podingss
	send $podresults&"        *"
elseif ($news_param1 = "corp")
	gosub :corporate
	send $corpresults&"       *"
elseif ($news_param1 = "invasions")
	send $under_construction
elseif ($news_param1 = "overload")
	gosub :overload
	send $umass_results&"    *"
elseif ($news_param1 = "announce")
	gosub :announced
	send $annonresults&"     *"
elseif ($news_param1 = "fed")
	gosub :fed
	send $fedresults&"        *"
else
	send "    *    SYNTAX ERROR!*      *"

end
send $news_footer&"** "
halt

:podingss
setvar $idx 1
setvar $podresults ""
setvar $podsize 20
setvar $poddings 10

setarray $pods $podsize $poddings
setvar $podcnt 0
if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[0;32m was on the pl"
			if ($pos <> 0)
				setvar $i 1
				setvar $trderresp " N/A  "
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "[0;32m was"

				while ($i <= "($IDX+10")
					setvar $ctline $news_array[$i]
					getwordpos $cline $pos "DESTROYED[32m the planet"
					if ($pos <> 0)
						gettext $cline $traderresp "[1;36m" "[5;31m"
						goto :resp_srch_done
					end
					add $i 1
				end

				:resp_srch_done
				setvar $i 1
				while ($i <= $possize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Was on a planet Blown-up by: "&$traderresp
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Was on a planet Blown-up by: "&$traderresp
						goto :next_podding
					end
				end
			end

			getwordpos $currentline $pos "[31mGOT BLOWN UP TOO!"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" " [31mGOT"
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Destroyed a Planet and got blown up too!"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Destroyed a Planet and got blown up too!"
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[32m by collision with a Nav"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "'s ["
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Collided with a Navigational Hazard!"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Collided with a Navigational Hazard!"
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[32m by a Corbomite Reaction!"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "'s "
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Ship was Destroyed by a Corbomite Reaction!"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Ship was Destroyed by a Corbomite Reaction!"
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[32m while invading [1;36m"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "'s [0"
				gettext $currentline $planetoid "invading [1;36m" "[0;32m!"
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Ship was Destroyed Invading "&$planetoid&"!"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Ship was Destroyed Invading "&$planetoid&"!"
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "destroyed[32m by a Quasar"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "'s ["
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Ship was Destroyed by a Quasar Cannon!"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Ship was Destroyed by a Quasar Cannon!"
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[0;32m's fighters!"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "'s ["
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" was destroyed by fighters!"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" was destroyed by fighters!"
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[5;31m DESTROYED [1;36m"
			if ($pos <> 0)
				getwordpos $currentline $pos "[1;36mCorp #[33m"
				if ($pos <> 0)

					goto :next_podding
				end
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "DESTROYED [1;36m" "'s "
				gettext $currentline $podder "[1;36m" "[5;31m"
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Ship Destroyed by "&$podder
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Ship Destroyed by "&$podder
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos " [0;32msurrendered a"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode

				gettext $currentline $trader "[1;36m" " [0;32msurrendered a"
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" surrendered a ship!"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" "&$speacial
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[32m by atomic fusion!"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "'s ["
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Ship was Destroyed by atomic fusion"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Ship was Destroyed by atomic fusion!"
						goto :next_podding
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "by [1;36mCaptain Zyrain"
			if ($pos <> 0)
				setvar $i 1
				add $podcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "'s ["
				while ($i <= $podsize)
					if ($pods[$i] = $trader)
						setvar $ii 1
						while ($ii <= $poddings)
							if ($pods[$i][$ii] = 0)
								setvar $pods[$i][$ii] $timecode&" Ship was Destroyed by Captain Zyrain!"
								goto :next_podding
							end
							add $ii 1
						end
					elseif ($pods[$i] = 0)
						setvar $pods[$i] $trader
						setvar $pods[$i][1] $timecode&" Ship was Destroyed by Captain Zyrain!"
						goto :next_podding
					end
					add $i 1
				end
			end
		end

		:next_podding
		add $idx 1
	end

	setvar $podresults "Possible Poddings:*"
	setvar $i 1

	while ($i <= $podsize)
		if ($pods[$i] <> 0)
			setvar $ii 1
			setvar $podresults $podresults&"           "&$pods[$i]&"*"
			while ($ii <= 10)
				if ($pods[$i][$ii] <> 0)
					setvar $podresults $podresults&"              "&$pods[$i][$ii]&"*"
				end
				add $ii 1
			end
		end
		add $i 1
	end

else
	setvar $podresults $universal_file_err
end

return

:fed
setvar $idx 1
setvar $fedresults ""
setvar $bountysize 50
setarray $bounties $bountysize
setvar $bountycnt 0
setvar $commishsize 50
setarray $commish $commishsize
setvar $commishcnt 0

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[33mThe Federation hereby posts"
			if ($pos <> 0)
				add $bountycnt 1
				gettext $currentline $amount "of [1m" "[0;33m credits"
				setvar $i ($idx + 1)
				while ($i <= $lines)
					setvar $tradersearch $news_array[$i]
					getwordpos $tradersearch $pos "[33m  for the destruction of"
					if ($pos <> 0)
						gettext $tradersearch $trader "of [1;36m" " [0;33mship!"
						goto :got_trader
					end
					add $i 1
				end
				setvar $trader "-- Not Known --"

				:got_trader
				setvar $i 1
				while ($i <= $bountysize)
					if ($bounties[$i] <> 0)
						setvar $bounties[$i] $trader&" for "&$amount
						goto :next_fed_item
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[31m was awarded a Federal"
			if ($pos <> 0)
				add $commishcnt 1
				gosub :time_decode
				gettext $currentline $trader "[1;32m" "[31m was"
				setvar $i 1
				while ($i <= $commishsize)
					if ($commish[$i] <> 0)
						setvar $commish[$i] $timecode&" - "&$trader
						goto :next_fed_item
					end
					add $i 1
				end
			end
		end

		:next_fed_item
		add $idx 1
	end

	if ($bountycnt > 0)
		setvar $fedresults $bountycnt&" Federal Bounties Posted:*"
		setvar $i 1
		while ($i <= $bountysize)
			if ($bounties[$i] <> 0)
				setvar $fedresults $fedresults&"                               "&$bounties[$i]&"*"
			end
			add $i 1
		end
		setvar $fedresults $fedresults&"         *"
	else
		setvar $fedresults "Federal Bounties Posted:        None*     *"
	end
	if ($commishcnt > 0)
		setvar $fedresults $fedresults&$commishcnt&" Federal Commissions Issued:*"
		setvar $i 1
		while ($i <= $commishsize)
			if ($commish[$i] <> 0)
				setvar $fedresults $fedresults&"                               "&$commish[$i]&"*"
			end
			add $i 1
		end
	else
		setvar $fedresults $fedresults&"Federal Commissions Issued:     None*"
	end
else
	setvar $fedresults $universal_file_err
end
return

:corporate
setvar $idx 1
setvar $corpresults ""
setvar $corps_new 0
setvar $corparraysize 5
setvar $corpmembersize 5
setarray $corporations $corparraysize $corpmembersize
setvar $firedsize 20
setarray $fired $firedsize
setvar $firedcnt 0

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "name of [1;33m"
			if ($pos <> 0)
				add $corps_new 1
				setvar $i 1
				gosub :time_decode
				while ($i <= $corparraysize)
					if ($corporations[$i] = 0)
						gettext $currentline $trader "[1;36m" "[0;32m created"
						gettext $currentline $corpname "of [1;33m" "[0;32m."
						setvar $corporations[$i] $corpname
						setvar $corporations[$i][1] $timecode&" "&$trader&" Created Corp"
						goto :next_corpitem
					end
					add $i 1
				end
				goto :next_corpitem
			end

			getwordpos $currentline $pos "[0;32m joined up with"
			if ($pos <> 0)
				gettext $currentline $corpname "with [1;33m" "[0;32m."
				gettext $currentline $trader "[1;36m" "[0;32m joined"
				gosub :time_decode
				setvar $i 1
				while ($i <= $corparraysize)
					if ($corpname = $corporations[$i])
						setvar $ii 1
						while ($ii <= $corpmembersize)
							if ($corporations[$i][$ii] = 0)
								setvar $corporations[$i][$ii] $timecode&" "&$trader&" joined corp"
								goto :next_corpitem
							end
							add $ii 1
						end
					elseif ($corporations[$i] = 0)
						setvar $corporations[$i] $corpname
						setvar $corporations[$i][1] $timecode&" "&$trader&" joined corp"
						goto :next_corpitem
					end
					add $i 1
				end
				goto :next_corpitem
			end

			getwordpos $currentline $pos "[0;32m tried to"
			if ($pos <> 0)
				gettext $currentline $corpname "Corp: [1;33m" "[0;32m!"
				setvar $i 1
				gosub :time_decode
				gettext $currentline $trader "[1;36m" "[0;32m tried"
				while ($i <= $corparraysize)
					if ($corpname = $corporations[$i])
						setvar $ii 1
						while ($ii <= $corpmembersize)
							if ($corporations[$i][$ii] = 0)
								setvar $corporations[$i][$ii] $timecode&" "&$trader&" Attempted a B&E"
								goto :next_corpitem
							end
							add $ii 1
						end
					elseif ($corporations[$i] = 0)
						setvar $corporations[$i] $corpname
						setvar $corporations[$i][1] $timecode&" "&$trader&" Attempted a B&E"
						goto :next_corpitem
					end
					add $i 1
				end
				goto :next_corpitem
			end

			getwordpos $currentline $pos "[0;32m disbanded Corp"
			if ($pos <> 0)
				gettext $currentline $corpname "Corp [1;33m" "[0;32m."
				gettext $currentline $trader "[1;36m" "[0;32m disbanded"
				setvar $i 1
				gosub :time_decode
				while ($i <= $corparraysize)
					if ($corpname = $corporations[$i])
						setvar $ii 1
						while ($ii <= $corpmembersize)
							if ($corporations[$i][$ii] = 0)
								setvar $corporations[$i][$ii] $timecode&" "&$trader&" Disbanded Corp"
								goto :next_corpitem
							end
							add $ii 1
						end
					elseif ($corporations[$i] = 0)
						setvar $corporations[$i] $corpname
						setvar $corporations[$i][1] $timecode&" "&$trader&" Disbanded Corp"
						goto :next_corpitem
					end
					add $i 1
				end
				goto :next_corpitem
			end

			getwordpos $currentline $pos "[0;32m deserted"
			if ($pos <> 0)
				gettext $currentline $corpname "Corp [1;33m" "[0;32m."
				gettext $currentline $trader "[1;36m" "[0;32m deserted"
				gosub :time_decode
				setvar $i 1
				while ($i <= $corparraysize)
					if ($corpname = $corporations[$i])
						setvar $ii 1
						while ($ii <= $corpmembersize)
							if ($corporations[$i][$ii] = 0)
								setvar $corporations[$i][$ii] $timecode&" "&$trader&" Deserted Corp"
								goto :next_corpitem
							end
							add $ii 1
						end
					elseif ($corporations[$i] = 0)
						setvar $corporations[$i] $corpname
						setvar $corporations[$i][1] $timecode&" "&$trader&" Deserted Corp"
						goto :next_corpitem
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[0;32m removed [1;33m"
			if ($pos <> 0)
				add $firedcnt 1
				setvar $i 0
				while ($i <= $firedsize)
					if ($fired[$i] = 0)
						gettext $currentline $trader "[1;36m" "[0;32m removed"
						gettext $currentline $player~corpnumber "Corp#[1;33m" "[0;32m."
						gosub :time_decode
						setvar $fired[$i] $timecode&" "&$trader&" removed from Corp #"&$player~corpnumber
						goto :next_corpitem
					end
					add $i 1
				end
			end
		end

		:next_corpitem
		add $idx 1
	end

	setvar $corpresults "Corporate Happenings:*            *"

	if ($corporations[1] <> 0)
		setvar $i 1
		while ($i <= $corparraysize)
			if ($corporations[$i] <> 0)
				setvar $currentcorp $corporations[$i]
				setvar $corpresults $corpresults&"        "&$currentcorp&"*"
				setvar $ii 1
				while ($ii <= $corpmembersize)
					if ($corporations[$i][$ii] <> 0)
						setvar $corpresults $corpresults&"           "&$corporations[$i][$ii]&"*"
					end
					add $ii 1
				end
			end
			add $i 1
		end
		return
		if ($firedcnt <> 0)
			setvar $i 1
			while ($i <= $firedsize)
				if ($fired[$i] <> 0)
					setvar $corpresults $corpresults&"           "&$fired[$i]&"*"
				end
				add $i 1
			end
		end
	else
		setvar $corpresults "Corporate Happenings:           None*"
	end
else
	setvar $corpresults $universal_file_err
end
return

:announced
setvar $idx 1
setvar $annoncnt 0
setvar $annonresults ""
setvar $annonsize 50
setarray $annon $annonsize

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[0;32mposted this"
			if (($pos <> 0) and ($annoncnt < $annonsize))
				add $annoncnt 1
				gettext $currentline $trader "[1;36m" " [0;32mposted"
				gosub :time_decode
				setvar $currentline $news_array[($idx + 1)]
				striptext $currentline "0m[1;34m"
				striptext $currentline "[1;34m"
				setvar $temp $timecode&"::"&$trader&"::"&$currentline
				getlength $temp $length
				if ($length > 70)
					cuttext $temp $temp1 1 70
					if ($length > 127)
						setvar $temp3 ""
						setvar $temp2 ""
						striptext $temp $temp1
						cuttext $temp $temp2 1 57
						striptext $temp $temp2
						cuttext $temp $temp3 1 9999
						setvar $temp $temp1&"*             "&$temp2&"*             "&$temp3
					else
						striptext $temp $temp1
						cuttext $temp $temp2 1 9999
						setvar $temp $temp1&"*             "&$temp2
					end
				end
				setvar $annon[$annoncnt] $temp
			end
		end
		add $idx 1
	end

	if ($annoncnt <> 0)
		setvar $annonresults "    *"&$annoncnt&" Public Addresses Made:*     *"
		setvar $i 1
		while ($i <= $annoncnt)
			setvar $annonresults $annonresults&$annon[$i]&"*"
			add $i 1
		end
	else
		setvar $annonresults "   *"&"Public Addresses Made:  None*"
	end
else
	setvar $annonresults $universal_file_err
end
return

:planets_popped
setvar $idx 1
setvar $poppedresults ""
setvar $popped 0
setvar $poppersize 50
setarray $poppers $poppersize 2
setvar $poppingtraders 0

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[5;31m DESTROYED[32m the planet"
			getwordpos $currentline $poz "[1;36m"
			if (($pos <> 0) and ($poz = 1))
				add $popped 1
				gettext $currentline $trader "[1;36m" "[5;31m DESTROYED"
				setvar $i 1
				if ($i <= $poppersize)
					if ($poppers[$i][1] = $trader)
						setvar $temp $poppers[$i][2]
						striptext $temp " "
						add $temp 1
						if ($temp < 10)
							setvar $poppers[$i][2] "   "&$temp
						elseif ($temp < 100)
							setvar $poppers[$i][2] "  "&$temp
						elseif ($temp < 1000)
							setvar $poppers[$i][2] " "&$temp
						else
							setvar $poppers[$i][2] $temp
						end
						goto :done_popper
					elseif ($poppers[$i][2] = 0)
						setvar $poppers[$i][1] $trader
						setvar $poppers[$i][2] "   1"
						goto :done_popper
					end
					add $i 1
				end
			end
		end

		:done_popper
		add $idx 1
	end
	if ($popped <> 0)
		setvar $poppedresults $popped&" Planet(s) Popped:*"
		setvar $i 1
		while ($i <= $poppersize)
			if ($poppers[$i][1] <> 0)
				setvar $poppedresults $poppedresults&"                       "&$poppers[$i][2]&" by "&$poppers[$i][1]&"*"
			end
			add $i 1
		end
	else
		setvar $poppedresults "Planet(s) Popped:*"
		setvar $poppedresults $poppedresults&"                       None*"
	end
else
	setvar $poppedresults $universal_file_err
end
return

:port_authority
setvar $idx 1
setvar $portresults ""
setvar $blowncnt 0
setvar $portarraysize 75
setarray $portblown $portarraysize 52
setarray $newports 75
setvar $newportidx 0
setarray $opened 75
setvar $openedidx 0
setarray $advanced 75
setvar $advancedidx 0
setarray $nadvanced 75
setvar $nadvancedidx 0
setvar $portoffsize 75
setarray $portoff $portoffsize
setvar $portoffcnt 0

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[0;32m began construction!"
			if ($pos <> 0)
				add $newportidx 1
				gettext $currentline $currentline "[1;36m" "[0;32m began"
				setvar $newports[$newportidx] $currentline
				goto :next_port
			end

			getwordpos $currentline $pos "[0;32m opened"
			if ($pos <> 0)
				add $openedidx 1
				striptext $currentline "[0;32m opened for business today. ("&$news_date&")"
				striptext $currentline "[32mPort [1;36m"
				gosub :time_decode
				setvar $opened[$openedidx] $currentline&" at "&$timecode
				goto :next_port
			end

			getwordpos $currentline $pos "[0;32m construction advanced."
			if ($pos <> 0)
				add $advancedidx 1
				striptext $currentline "[1;36m"
				striptext $currentline "[0;32m construction advanced."
				setvar $advanced[$advancedidx] $currentline
				goto :next_port
			end

			getwordpos $currentline $pos "[5;31m construction did not"
			if ($pos <> 0)
				add $nadvancedidx 1
				striptext $currentline "[32mPort [1;36m"
				striptext $currentline "[5;31m construction did not advance."
				setvar $nadvanced[$nadvancedidx] $currentline
				goto :next_port
			end

			getwordpos $currentline $pos "by Star Port [35m"
			if ($pos <> 0)
				add $portoffcnt 1
				gettext $currentline $trader "[1;36m" "[0;32m was"
				gettext $currentline $portname "Port [35m" "[32m!"
				gosub :time_decode
				while ($i <= $portoffsize)
					if ($i <> 0)
						if ($portoff[$i] <> 0)
							setvar $portoff[$i] $timecode&" "&$trader&" attacked by Port "&$portname
							goto :next_port
						end
					end
					add $i 1
				end
			end

			getwordpos $currentline $pos "[5;31m DESTROYED [32mthe Star Port in sector"
			if ($pos <> 0)
				add $blowncnt 1
				gettext $currentline $trader "[1;36m" "[5;31m DESTROYED"
				gettext $currentline $port_addy "sector [1;33m" "[0;32m!"
				setvar $i 1
				if ($i <= $portarraysize)
					if ($portblown[$i][1] = $trader)
						setvar $temp $portblown[$i][2]
						striptext $temp " "
						gosub :time_decode
						add $temp 1
						if ($temp < 10)
							setvar $portblown[$i][2] "   "&$temp
						elseif ($temp < 100)
							setvar $portblown[$i][2] "  "&$temp
						elseif ($temp < 1000)
							setvar $portblown[$i][2] " "&$temp
						else
							setvar $portblown[$i][2] $temp
						end
						setvar $portblown[$i][($temp + 2)] $port_addy&" at "&$timecode
						goto :next_port
					else
						gosub :time_decode
						setvar $portblown[$i][1] $trader
						setvar $portblown[$i][2] "   1"
						setvar $portblown[$i][3] $port_addy&" at "&$timecode
						goto :next_port
					end
					add $i 1
				end
			end
		end

		:next_port
		add $idx 1

	end
	if ($newportidx <> 0)
		setvar $portresults $portresults&"       *"
		setvar $portresults $newportidx&" New Ports:*"
		setvar $i 1
		while ($i <= $newportidx)
			setvar $portresults $portresults&"                       "&$newports[$i]&"*"
			add $i 1
		end
	else
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&"New Ports:                    None*"
	end
	if ($openedidx <> 0)
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&$openedidx&" Ports Opened Today:*"
		setvar $i 1
		while ($i <= $openedidx)
			setvar $portresults $portresults&"                       "&$opened[$i]&"*"
			add $i 1
		end
	else
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&"Opened Today:                 None*"
	end

	if ($advancedidx <> 0)
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&$advancedidx&" Ports Construction Advanced:*"
		setvar $i 1
		while ($i <= $advancedidx)
			setvar $portresults $portresults&"                              "&$advanced[$i]&"*"
			add $i 1
		end
	else
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&"Port Construction Advanced:   None*"
	end

	if ($nadvancedidx <> 0)
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&$nadvancedidx&" Ports Construction Stalled:*"
		setvar $i 1
		while ($i <= $nadvancedidx)
			setvar $portresults $portresults&"                              "&$nadvanced[$i]&"*"
			add $i 1
		end
	else
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&"Port Construction Stalled:    None*"
	end

	if ($blowncnt <> 0)
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&$blowncnt&" Ports Blown Up:*"
		setvar $i 1
		while ($i <= $portarraysize)
			if ($portblown[$i][1] <> 0)
				setvar $portresults $portresults&"                       "&$portblown[$i][2]&" by "&$portblown[$i][1]&"*"
				setvar $ii 3
				while ($portblown[$i][$ii] <> 0)
					setvar $portresults $portresults&"                                Sector "&$portblown[$i][$ii]&"*"
					add $ii 1
				end
			end
			add $i 1
		end
	else
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&"Ports Blown Up:               None*"
	end

	if ($portoffcnt <> 0)
		setvar $portresults $portresults&"       *"
		setvar $portresults $portresults&$portoffcnt&" Port Attacks:*"
		setvar $i 1
		while ($i <= $portoffsize)
			if ($portoff[$i] <> 0)
				setvar $portresults $portresults&"                       "&$portoff[$i]&"*"
			end
			add $i 1
		end
	end
	setvar $portresults $portresults&"       *"
else
	setvar $portresults $universal_file_err
end
return

:overload
setvar $idx 1
setvar $umass_results "Unstable Planetary Masses: Non Detected*"
setvar $umass 0
setvar $collidedsize 50
setarray $collided $collidedsize

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[32mAn unstable "
			if ($pos <> 0)
				add $umass 1
				gettext $currentline $umassaddy "sector [1;33m" ""
				setvar $currentline $news_array[($idx + 1)]
				getwordpos $currentline $pos "[31m collided!"
				if ($pos <> 0)
					gettext $currentline $temp1 "Planets [36m" " [31mand"
					gettext $currentline $temp2 "and [36m" "[31m collided"
					setvar $umassaddy "Sector: "&$umassaddy&", Planets "&$temp1&" and "&$temp2
				else
					setvar $umassaddy "Sector: "&$umassaddy&", Planet Name Unkown"
				end
				setvar $collided[$umass] $umassaddy
			else
				getwordpos $currentline $pos "[33mEnd Daily Journal [34m"
				if ($pos <> 0)
					if ($umass <> 0)
						setvar $umass_results $umass&" Unstable Planetary Masses:*"
						setvar $i 1
						while ($i <= $umass)
							setvar $umass_results $umass_results&"                      "&$collided[$i]&"*"
							add $i 1
						end
					end
					return
				end
			end
		end
		add $idx 1
	end
else
	setvar $umass_results $universal_file_err
end
return

:photons_fired
setvar $idx 1
setvar $launchedresults ""
setvar $launched 0
setvar $launchedsize 50
setarray $launchers $launchedsize 52

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[0;32m launched a"
			if ($pos <> 0)
				add $launched 1
				setvar $trader $currentline
				striptext $trader "[1;36m"
				striptext $trader "[0;32m launched a Photon Missile somewhere!"
				setvar $i 1
				if ($i <= $launchedsize)
					if ($launchers[$i][1] = $trader)
						setvar $temp $launchers[$i][2]
						striptext $temp " "
						gosub :time_decode
						add $temp 1
						if ($temp < 10)
							setvar $launchers[$i][2] "   "&$temp
						elseif ($temp < 100)
							setvar $launchers[$i][2] "  "&$temp
						elseif ($temp < 1000)
							setvar $launchers[$i][2] " "&$temp
						else
							setvar $launchers[$i][2] $temp
						end
						setvar $launchers[$i][($temp + 2)] $timecode
						goto :done_torper
					elseif ($launchers[$i][1] = 0)
						gosub :time_decode
						setvar $launchers[$i][1] $trader
						setvar $launchers[$i][2] "   1"
						setvar $launchers[$i][3] $timecode
						goto :done_torper
					end
					add $i 1
				end
			end
		end

		:done_torper
		add $idx 1

	end
	if ($launched <> 0)
		setvar $launchedresults $launched&" Photons Launched:*"
		setvar $i 1
		while ($i <= $launchedsize)
			if ($launchers[$i][1] <> 0)
				setvar $launchedresults $launchedresults&"                       "&$launchers[$i][2]&" by "&$launchers[$i][1]&"*"
				if ($launchers[$i][2] > 4)

					setvar $math4dummies ($launchers[$i][2] - 4)
					setvar $ii ($math4dummies + 3)
				else
					setvar $ii 3
				end
				while ($launchers[$i][$ii] <> 0)
					setvar $launchedresults $launchedresults&"                                  "&$launchers[$i][$ii]&"*"
					add $ii 1
				end
			end
			add $i 1
		end
	else
		setvar $launchedresults "Photons Launched:*"
		setvar $launchedresults $launchedresults&"                       None Were Found In Log*"
	end
else
	setvar $launchedresults $universal_file_err
end
return

:photons_list
setvar $idx 1
setvar $photonresults ""
setvar $totalfired 0

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[0;32m launched a Photon Missile somewhere!"
			if ($pos <> 0)
				add $totalfired 1
				gosub :time_decode
				striptext $currentline " somewhere!"
				striptext $currentline "[1;36m"
				striptext $currentline "[0;32m"
				setvar $photonresults $photonresults&$timecode&" - "&$currentline&"*"
			end
		end
		add $idx 1
	end

	if ($totalfired <> 0)
		setvar $photonresults $photonresults&"------------*"&"Total Fired: "&$totalfired&"*"
	else
		setvar $photonresults "   *    No Photons Fired*    *"
	end
else
	setvar $photonresults $universal_file_err
end

return

:time_decode
setvar $timeidx ($idx - 1)
while ($timeidx > 0)
	getwordpos $news_array[$timeidx] $pos $filter
	if ($pos <> 0)
		setvar $timecode $news_array[$timeidx]
		striptext $timecode $filter&" [0;35m"
		striptext $timecode "[1;31m-- [0;35m"
		striptext $timecode "[1;31m --"
		return
	end
	subtract $timeidx 1
end
setvar $timecode "  UnKnown  "
return

:tow_detail
setvar $idx 1
setvar $towresults ""
setvar $arraysize 20
setarray $towed $arraysize
setvar $hits 0

if ($news_read and ($lines <> 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos "[0;33m was towed"
			if ($pos <> 0)
				add $hits 1
				striptext $currentline "[0;33m was towed out of FedSpace"
				setvar $ii $idx
				while ($ii <= $lines)
					setvar $search $news_array[$ii]
					getwordpos $search $pos $currentline
					if ($pos = 1)
						striptext $currentline "[1;36m"
						setvar $towresults $towresults&"                      "&$currentline&" - Has Been Online*"
						goto :search_complete
					end
					add $ii 1
				end
				striptext $currentline "[1;36m"
				setvar $towresults $towresults&"                      "&$currentline&"*"

				:search_complete
			else
				getwordpos $currentline $pos "[33mEnd Daily Journal [34m"
				if ($pos <> 0)
					if ($hits = 0)
						setvar $towresults "Towed From Fed Space: No One*"
					else
						setvar $towresults "Towed From Fed Space:*"&$towresults
					end
					return
				end
			end
		end
		add $idx 1
	end
else
	setvar $towresults $universal_file_err
end
return

:format_footer
setvar $idx 1
loadvar $news_date
setvar $filter "[1;31m-- [0;35m"&$news_date&"[1;31m --"

if ($news_read and ($lines > 0))
	while ($idx <= $lines)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		end
		getwordpos $currentline $pos $filter
		if ($pos = 0)
			add $actuallines 1
		end
		add $idx 1
	end

	setvar $news_footer "---={Lines In Log: "&$actuallines
	if ($news_yest)
		setvar $news_footer $news_footer&" - Yesturday's Log Data."
	end
	setvar $news_footer $news_footer&"*---={Last Updated: "&$news_array[1]&"*"
else
	setvar $news_footer "---------------- ERROR - DATA CORRUPTION -------------------"
end
return

:file_2_array
setvar $news_read true
read $news_file $file_header 1
readtoarray $news_file $news_array
setvar $lines $news_array

if (($file_header = "EOF") or ($lines <= 0))
	setvar $switchboard~message "Problem Reading File. Try A Refresh. Halting*"
	gosub :switchboard~switchboard
	halt
else
	setvar $switchboard~message "Loading NEWS::AS OF "&$file_header&"*"
	gosub :switchboard~switchboard
	waitfor "(?="
end
return

:validate
setvar $idx 1
setvar $limitor 35

if ($news_read and ($lines <> 0))
	if ($lines < $limitor)
		setvar $limitor $lines
	end
	while ($idx <= $limitor)
		setvar $currentline $news_array[$idx]
		if ($currentline = "EOF")
			send $unexpected_eof
			halt
		else
			getwordpos $currentline $pos $news_empty
			if ($pos <> 0)
				setvar $news_validated false
				return
			end
		end
		add $idx 1
	end
	setvar $news_validated true
else
	setvar $news_validated false
end

return

:log_2_file
delete $news_file
setvar $stop_date ""
savevar $news_yest
send "'{"&$bot_name&"} - Reading Log To File... Comms will be off during this...*"
gosub :player~msgs_off
send "C D"
setvar $s time&"-"&date
gettime $s "h:nna/p - d/m/yyy"
write $news_file $s

:getdate_spoof
setstrigger getdate :getdate "Enter the beginning date you wish to read from. Today is"
pause

:getdate
killtrigger getdate
setvar $ansi currentansiline
striptext $ansi "[0m"
striptext $ansi #10
striptext $ansi #13

getwordpos $ansi $pos "is [1;33m"
if ($pos <> 0)
	gettext $ansi $news_date "is [1;33m" ""

	if ($news_yest)

		setvar $stop_date $news_date
		replacetext $news_date "/" " "
		getword $news_date $news_month 1
		getword $news_date $news_day 2
		getword $news_date $news_year 3

		if (($news_month = 12) and ($news_day = 01))
			setvar $news_month 11
			setvar $news_day 30
		elseif (($news_month = 11) and ($news_day = 1))
			setvar $news_month 10
			setvar $news_day 31
		elseif (($news_month = 10) and ($news_day = 1))
			setvar $news_month 9
			setvar $news_day 30
		elseif (($news_month = 9) and ($news_day = 1))
			setvar $news_month 8
			setvar $news_day 31
		elseif (($news_month = 8) and ($news_day = 1))
			setvar $news_month 7
			setvar $news_day 31
		elseif (($news_month = 7) and ($news_day = 1))
			setvar $news_month 6
			setvar $news_day 30
		elseif (($news_month = 6) and ($news_day = 1))
			setvar $news_month 5
			setvar $news_day 31
		elseif (($news_month = 5) and ($news_day = 1))
			setvar $news_month 4
			setvar $news_day 30
		elseif (($news_month = 4) and ($news_day = 1))
			setvar $news_month 3
			setvar $news_day 31
		elseif (($news_month = 3) and ($news_day = 1))

			setvar $news_month 2
			setvar $news_day 28
		elseif (($news_month = 2) and ($news_day = 1))
			setvar $news_month 1
			setvar $news_day 31
		elseif (($news_month = 1) and ($news_day = 1))
			setvar $news_month 12
			setvar $news_day 30
		else
			subtract $news_day 1

		end
		setvar $news_date $news_month&"/"&$news_day&"/"&$news_year
	end
	savevar $news_date
else
	goto :getdate_spoof
end

:indate_spoof
settexttrigger indate :indate "Input search date"
pause

:indate
killtrigger indate
getwordpos currentansiline $pos "[35mInput"
if ($pos <> 0)
	send $news_date&"*y*"
else
	goto :indate_spoof
end

:topoflog_spoof
settexttrigger topoflog :topoflog "-=-=-=-=-=-=-=-=-=- "
pause

:topoflog
killtrigger topoflog
getwordpos currentansiline $pos "[1;34m  -="
if ($pos <> 0)
else
	goto :topoflog_spoof
end

:end_of_lines_spoof
if ($news_yest)
	settextlinetrigger end_of_lines1 :end_of_lines "S.D. "&$stop_date
else
	setstrigger end_of_lines2 :end_of_lines "command [TL="
end
settextlinetrigger nothing_2_do :nothing_2_do "No log entries today."

:reset_line_trigger
settextlinetrigger line_trig :parse_scan_line
pause

:parse_scan_line
killtrigger :line_trig
setvar $ansi currentansiline
striptext $ansi "[0m"
striptext $ansi #13
striptext $ansi #16

getwordpos $ansi $pos "[Pause]"
if ($pos <> 0)
	send "*"
	goto :reset_line_trigger
end
if (($ansi = "") or ($ansi = 0))
	goto :reset_line_trigger
end
write $news_file $ansi
goto :reset_line_trigger

:nothing_2_do
killalltriggers
setvar $ansi currentansiline
getwordpos $ansi $pos $news_empty
if ($pos <> 0)
	write $news_file $news_empty
	send "***  Q"
	goto :done_reading_news
else
	goto :end_of_lines_spoof
end

:end_of_lines
killtrigger end_of_lines
killtrigger line_trig

if ($news_yest)
	getwordpos currentansiline $pos "[1;34m-="
	if ($pos <> 0)
		send "*  *   *  ** Q"
	else
		goto :end_of_lines_spoof
	end
else
	getwordpos currentansiline $pos "[1;33mTL"
	if ($pos <> 0)
		send " Q"
	else
		goto :end_of_lines_spoof
	end
end

:done_reading_news
setvar $news_read true
waiton "<Computer deactivated>"
gosub :player~msgs_on
return
include "source\include\loadvars"
include "source\include\player"
include "source\include\help"
include "source\include\switchboard.ts"
