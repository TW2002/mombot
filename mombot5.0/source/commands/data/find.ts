loadvar $bot~command
loadvar $map~stardock
gosub :loadvars~loadvars
gosub :help~initialize
loadvar $player~unlimitedgame
loadvar $switchboard~bot_name
loadvar $switchboard~self_command

setvar $help~help[1]  $help~tab&"find - Search TWX-DBase for Fighter/Port data"
setvar $help~help[2]  $help~tab&"  "
setvar $help~help[3]  $help~tab&"   find [f/nf/fp/p/de/ufde] [type] {sector} [port type]"
setvar $help~help[4]  $help~tab&"     - [type] :       [de]ad-end or"
setvar $help~help[5]  $help~tab&"                      [f]igged or  "
setvar $help~help[6]  $help~tab&"                      [nf] no-fig or  "
setvar $help~help[7]  $help~tab&"                      [fp] figged port or "
setvar $help~help[8]  $help~tab&"                      [p]ort or  "
setvar $help~help[9]  $help~tab&"                      [ufde] un-figged dead end"
setvar $help~help[10] $help~tab&"     - {sector}       sector number that you need finder data on,  "
setvar $help~help[11] $help~tab&"                      (default is current sector)"
setvar $help~help[12] $help~tab&"     - [port type]    port type (s)ell , (b)uy, or (x) either"
setvar $help~help[13] $help~tab&"                      (ex: s, b, sxb, bxb, sxx, etc.)"
setvar $help~help[14] $help~tab&"     - [upgraded]     only list upgraded ports"
setvar $help~help[15] $help~tab&"     - [write {file}] write output to specified file on local disk"
gosub :help~helpfile

gosub :search~find
halt

# includes:
include "source\include\search"
include "source\include\loadvars"
include "source\include\help"
