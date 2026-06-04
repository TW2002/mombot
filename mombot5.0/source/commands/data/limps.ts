gosub :loadvars~loadvars
gosub :help~initialize

setvar $help~help[1] $help~tab&"Refreshes Deployed Limpet List"
setvar $help~help[2] $help~tab&"  - Will show difference since last command was run."
gosub :help~helpfile

setvar $switchboard~message "Limpet Report starting up!*"
gosub :switchboard~switchboard

logging off
gosub :mines~updatelimps
logging on
gosub :mines~reportlimps
gosub :switchboard~switchboard
halt

# includes:
include "source\include\mines"
include "source\include\loadvars"
include "source\include\help"
include "source\include\switchboard.ts"
