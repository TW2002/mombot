loadvar $bot~parm1
loadvar $bot~parm2
gosub :HELP~INITIALIZE

setVar $HELP~HELP[1]  $HELP~TAB&"sendfile - Output contents of file to screen, subspace, or fedcom"
setVar $HELP~HELP[2]  $HELP~TAB&"  "
setVar $HELP~HELP[3]  $HELP~TAB&"   sendfile {s[u]bspace|[f]edcom} [file]"
gosub :HELP~HELPFILE

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
        echo ANSI_15 $content[$i] & "*"
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

