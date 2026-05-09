# fedbd - simple command to find fedspace backdoors. By Shadow

gosub :HELP~INITIALIZE
setVar $HELP~HELP[1]  $HELP~TAB&"       Finds backdoors adjacent to fedspace and reports them"
gosub :HELP~HELPFILE

echo "*One moment, working...*"
setvar $i 1
setdeafclients TRUE
setvar $msg ""
while ($i < 11)
    setvar $sector~destination $i
    gosub :sector~getbackdoor
    if ($sector~backdoor > 0)
        setvar $msg $msg & "Backdoor for sector " & $i & ": " & $sector~backdoor & "*"
    end
    add $i 1
end
setdeafclients FALSE
setvar $switchboard~message $msg
gosub :switchboard~switchboard
halt

include "source\include\help.ts"
include "source\include\sector.ts"
include "source\include\switchboard.ts"
