:BOT~FORMATHELPLINE

replacetext $BOT~LINE "[" ANSI_2&"["&ANSI_6
replacetext $BOT~LINE "]" ANSI_2&"]"&ANSI_13
replacetext $BOT~LINE "  >" ANSI_2&"  >"&ANSI_14
replacetext $BOT~LINE " - " ANSI_7&" - "&ANSI_13


replacetext $BOT~LINE "|" ANSI_2&"|"&ANSI_6
replacetext $BOT~LINE "{" ANSI_2&"{"&ANSI_6
replacetext $BOT~LINE "}" ANSI_2&"}"&ANSI_13
replacetext $BOT~LINE "Options:" ANSI_6&"Options"&ANSI_2&":"&ANSI_13
replacetext $BOT~LINE "Examples:" ANSI_6&"Examples"&ANSI_2&":"&ANSI_13
replacetext $BOT~LINE "Example:" ANSI_6&"Example"&ANSI_2&":"&ANSI_13
replacetext $BOT~LINE "Usage:" ANSI_6&"Usage"&ANSI_2&":"&ANSI_13
setvar $BOT~LINE ANSI_13&$BOT~LINE&ANSI_15

return
