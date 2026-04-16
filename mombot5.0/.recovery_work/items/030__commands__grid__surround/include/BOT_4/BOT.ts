:BOT~FORMATHELPLINE

replacetext $BOT~LINE "[" ANSI_2&"["&ANSI_6
replacetext $BOT~LINE "]" ANSI_2&"]"&ANSI_13
replacetext $BOT~LINE "-" ANSI_7&"-"&ANSI_13
replacetext $BOT~LINE "<<<<" ANSI_14&"<"&ANSI_7&"<"&ANSI_14&"<"&ANSI_7&"<"&ANSI_15
replacetext $BOT~LINE ">>>>" ANSI_7&">"&ANSI_14&">"&ANSI_7&">"&ANSI_14&">"
replacetext $BOT~LINE "{" ANSI_2&"{"&ANSI_6
replacetext $BOT~LINE "}" ANSI_2&"}"&ANSI_13
replacetext $BOT~LINE "Options:" ANSI_6&"Options"&ANSI_2&":"&ANSI_13
setvar $BOT~LINE ANSI_13&$BOT~LINE&ANSI_15

return
