setTextOutTrigger fed :fed "`"
pause

:fed
	send "'"
	setTextOutTrigger fed :fed "`"
	pause
