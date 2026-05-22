openmenu twx_toggledeaf false
openmenu twx_localecho false
closemenu
setvar $start_fig_hit "Deployed Fighters Report Sector "
setvar $end_fig_hit   ":"
setvar $alien_ansi    #27 & "[1;36m" & #27 & "["
setvar $start_fig_hit_owner ":"
setvar $end_fig_hit_owner "'s"

settextlinetrigger fighter :fighter $start_fig_hit
settextlinetrigger waiting :filter
settexttrigger reecho :reecho
settextouttrigger enter :enter #13
pause

:filter
if ($fighterblank = false)
	echo #27&"[255D"&#27&"[K"&currentansiline&#27&"[0;1;37;40m"
end
setvar $fighterblank false
settextlinetrigger waiting :filter
pause

:enter
echo #27&"[0m*"
send #13
settextouttrigger enter :enter #13
pause

:reecho
echo #27&"[255D"&#27&"[255B"&#27&"[K"&currentansiline
settexttrigger reecho :reecho
pause

:fighter
gettext currentansiline $alien_check $start_fig_hit_owner $end_fig_hit_owner
getwordpos currentline $pos $start_fig_hit_owner
getwordpos $alien_check $apos $alien_ansi
if (($apos > 0) or ($pos = 0))
	setvar $fighterblank true
else
	echo currentansiline
end
settextlinetrigger fighter :fighter $start_fig_hit
pause
