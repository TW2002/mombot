loadvar $bot~parm1
loadvar $bot~parm2
gosub :help~initialize

setvar $help~help[1]  $help~tab&"sendfile - Output contents of file to screen, subspace, or fedcom"
setvar $help~help[2]  $help~tab&"  "
setvar $help~help[3]  $help~tab&"   sendfile {s[u]bspace|[f]edcom} [file]"
gosub :help~helpfile

if ($bot~parm1 = "u")
	setvar $mode "'"
elseif ($bot~parm1 = "f")
	setvar $mode "`"
else
	setvar $mode 0
end

if ($mode = 0)
	setvar $file $bot~parm1
else
	setvar $file $bot~parm2
end

fileexists $exists $file
if ($exists = 0)
	setvar $switchboard~message "File not found: " & $file & "*"
	gosub :switchboard~switchboard
end

if ($mode <> 0)
	send $mode & "*"
end

readtoarray $file $content
setvar $i 1
while ($i <= $content)
	if ($mode = 0)
		echo ansi_15 $content[$i] & "*"
	else
		send $content[$i] & "*"
	end
	add $i 1
end

if ($mode <> 0)
	send "*"
end

halt

include "source\include\switchboard.ts"
include "source\include\help.ts"
