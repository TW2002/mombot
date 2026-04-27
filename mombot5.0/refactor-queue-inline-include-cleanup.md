## Inline Include Refactor Queue

This queue tracks scripts that still carry local replicas of behavior already
provided by shared includes under `source/include/`.

### Easy

- [x] `source/commands/resource/sellship.ts`
  Replace local ship-sell loop with `PORT~SHIPSELL`.
- [x] `source/commands/cashing/trade.ts`
  Replace local adjacent avoid helpers with `PLAYER~VOIDADJACENT` and
  `PLAYER~CLEARADJACENT`, keeping the command's success messages local.
- [ ] `source/StripExample.ts`
  Local `quikstats` and `getPlanetInfo` are close copies of `player.ts` and
  `planet.ts`. Low-risk cleanup, but lower operational priority than live
  commands.

### Medium

- [x] `source/modes/resource/movefig.ts`
  Local `GETSHIPSTATS` and the legacy `GETPLANETINFO` alias wrapper are now
  routed through `SHIP~GETSHIPSTATS` and `PLANET~GETPLANETINFO`.
- [ ] `source/modes/grid/gridcheck.ts`
  Local `GETPLANETINFO` adapter can be replaced with `PLANET~GETPLANETINFO`.
- [ ] `source/modes/grid/limpshovel.ts`
  Local `GETPLANETINFO` adapter can be replaced with `PLANET~GETPLANETINFO`.
- [ ] `source/modes/grid/minesweep.ts`
  Local `GETPLANETINFO` adapter can be replaced with `PLANET~GETPLANETINFO`.
- [ ] `source/modes/grid/ugrid.ts`
  Local `GETPLANETINFO` adapter can be replaced with `PLANET~GETPLANETINFO`.
- [ ] `source/modes/resource/move.ts`
  Local `GETPLANETINFO` adapter can be replaced with `PLANET~GETPLANETINFO`.
- [ ] `source/modes/resource/stripships.ts`
  Local `GETPLANETINFO` adapter can be replaced with `PLANET~GETPLANETINFO`.
- [ ] `source/modes/resource/farm.ts`
  Local `GETPLANETINFO`, `GETPORTINFO`, and buy-side helpers should be split
  into shared include calls in smaller passes.
- [ ] `source/modes/grid/passgrid.ts`
  Local FM `getCourse` parser should be evaluated against `PLAYER~GETCOURSE`
  and replaced only if the exact behavior still matches.
- [ ] `source/modes/cashing/salesman.ts`
  Local twarp/bwarp/save-me helpers should move to `player.ts` and `combat.ts`
  in a dedicated pass.
- [ ] `source/modes/cashing/wsst.ts`
  Local course and jump helpers should move to `player.ts` and `combat.ts`.
- [ ] `source/modes/resource/lsd.ts`
  Local jump-sector and twarp helper family should move to `player.ts`.

### Hard

- [ ] `source/modes/cashing/quikpanel.ts`
  Large embedded subsystem with local `quikstats`, haggle, and warp helpers.
- [ ] `source/modes/cashing/wrob.ts`
  Large embedded copies of `planet.ts`, `planethaggle.ts`, and `player.ts`.
- [ ] `source/modes/cashing/sdt.ts`
  Large embedded copies of `player.ts` and `planethaggle.ts`.
- [ ] `source/modes/cashing/sst.ts`
  Large embedded copies of `player.ts` and `planethaggle.ts`.
- [ ] `source/commands/resource/buy.ts`
  Deep buy/haggle/port-info fork that should be normalized in stages.

### Deferred / Not Straight Duplicates

- `source/commands/cashing/ppt.ts`
  Local avoid helpers are similar to `PLAYER~VOIDADJACENT`, but intentionally
  skip the paired trade sector, so this is not a direct swap.
- `source/modes/grid/mowfuel.ts`
  Embedded fighter-drop macro is coupled to the surrounding macro flow.
- `source/modes/general/xenter.ts`
  Embedded fighter-drop macro is coupled to the exit/enter loop.
