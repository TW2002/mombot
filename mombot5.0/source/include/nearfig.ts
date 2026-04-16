:nearfig~nearfig

setvar $nearfig~seeksectors[1] $nearfig~sector
setvar $nearfig~seeksectorssize 1
setvar $nearfig~seekindex 1

if (($nearfig~checkindex = 0) or ($nearfig~checkindex >= 99))
  setvar $nearfig~checkindex 1
  setarray $nearfig~checkedlist SECTORS
else
  add $nearfig~checkindex 1
end

if ($cache~figs[$nearfig~sector] = 1)

  setvar $nearfig~nearfig $nearfig~sector
  return
end
:nearfig~checknext

if ($nearfig~seekindex > $nearfig~seeksectorssize)

  setvar $nearfig~nearfig 0
  return
end

setvar $nearfig~warpindex 1
:nearfig~nextwarp
setvar $nearfig~testsector SECTOR.WARPSIN[$nearfig~seeksectors[$nearfig~seekindex]][$nearfig~warpindex]
if ($nearfig~testsector > 0)
  if ($cache~figs[$nearfig~testsector] = 1)

    setvar $nearfig~nearfig $nearfig~testsector
    return
  end

  if ($nearfig~checkedlist[$nearfig~testsector] <> $nearfig~checkindex)
    add $nearfig~seeksectorssize 1
    setvar $nearfig~seeksectors[$nearfig~seeksectorssize] $nearfig~testsector
    setvar $nearfig~checkedlist[$nearfig~testsector] $nearfig~checkindex
  end

  add $nearfig~warpindex 1
  goto :NEXTWARP
end

add $nearfig~seekindex 1
goto :CHECKNEXT
:nearfig~nearaos















setvar $nearfig~seeksectors[1] $nearfig~sector
setvar $nearfig~seeksectorssize 1
setvar $nearfig~seekindex 1

if (($nearfig~checkindex = 0) or ($nearfig~checkindex >= 99))
  setvar $nearfig~checkindex 1
  setarray $nearfig~checkedlist SECTORS
else
  add $nearfig~checkindex 1
end

if (($cache~aos[$nearfig~sector] <> 0) and ($cache~aos[$nearfig~sector] <> "L"))

  setvar $nearfig~nearaos $nearfig~sector
  setvar $nearfig~aostype $cache~aos[$nearfig~sector]
  return
end
:nearfig~checknextaos

if ($nearfig~seekindex > $nearfig~seeksectorssize)

  setvar $nearfig~nearaos 0
  return
end

setvar $nearfig~warpindex 1
:nearfig~nextwarpaos
setvar $nearfig~testsector SECTOR.WARPS[$nearfig~seeksectors[$nearfig~seekindex]][$nearfig~warpindex]
if ($nearfig~testsector > 0)
  if (($cache~aos[$nearfig~testsector] <> 0) and ($cache~aos[$nearfig~testsector] <> "L"))

    setvar $nearfig~nearaos $nearfig~testsector
    setvar $nearfig~aostype $cache~aos[$nearfig~testsector]
    return
  end

  if ($nearfig~checkedlist[$nearfig~testsector] <> $nearfig~checkindex)
    add $nearfig~seeksectorssize 1
    setvar $nearfig~seeksectors[$nearfig~seeksectorssize] $nearfig~testsector
    setvar $nearfig~checkedlist[$nearfig~testsector] $nearfig~checkindex
  end

  add $nearfig~warpindex 1
  goto :NEXTWARPAOS
end

add $nearfig~seekindex 1
goto :CHECKNEXTAOS
