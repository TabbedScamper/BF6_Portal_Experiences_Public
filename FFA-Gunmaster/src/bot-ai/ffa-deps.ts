// ============================================================================
// FFA GUNMASTER — bot-ai dependency shims (adapts Deadlock's 2-team AI to FFA)
// ============================================================================
// The Deadlock bot brain finds enemies by TEAM (team 1 vs team 2). In this FFA
// every player is on their own solo team, so "enemy" = any OTHER alive soldier.
// senseEnemy()/los use aliveEnemies(bot) instead of getAlivePlayersOnTeam.
// Tlm is stubbed (no telemetry pipeline in this project).
// ============================================================================

import { isBenched } from '../bench.ts';

// One alive-player list shared by every bot sensor: each bot rescanning AllPlayers cost
// ~67 scans/s with 16 bots, 23 of the bot brains' 47 ms/s (mode_profile, Inferno, 2026-11-04).
// Each entry also carries the id, position and firing state the sensors read per enemy, which
// cut senseEnemy's ~2,500 per-enemy engine calls/s (round 2 profile, same day).
// 100 ms = the LOS tick, so an entry is at most one LOS step old (the brain ticks every 200 ms).
const ALIVE_SNAPSHOT_MS = 100;
export interface AliveEnemy { p: mod.Player; pid: number; pos: mod.Vector; firing: boolean }
let aliveSnapshot: { at: number; players: AliveEnemy[] } = { at: -Infinity, players: [] };

/** All alive soldiers except the given bot — every other player IS an enemy in FFA. */
export function aliveEnemies(self: mod.Player): AliveEnemy[] {
    const now = Date.now();
    if (now - aliveSnapshot.at >= ALIVE_SNAPSHOT_MS) {
        const players: AliveEnemy[] = [];
        try {
            const arr = mod.AllPlayers();
            const n = mod.CountOf(arr);
            for (let i = 0; i < n; i++) {
                try {
                    const p = mod.ValueInArray(arr, i) as mod.Player;
                    if (!mod.IsPlayerValid(p)) continue;
                    const pid = mod.GetObjId(p);
                    if (isBenched(pid)) continue; // parked freecam statue — invulnerable, never a target
                    if (!mod.GetSoldierState(p, mod.SoldierStateBool.IsAlive)) continue;
                    const pos = mod.GetSoldierState(p, mod.SoldierStateVector.GetPosition);
                    const firing = mod.GetSoldierState(p, mod.SoldierStateBool.IsFiring);
                    players.push({ p, pid, pos, firing });
                } catch {}
            }
        } catch {}
        aliveSnapshot = { at: now, players };
    }
    let selfId = -1;
    try { selfId = mod.GetObjId(self); } catch {}
    return aliveSnapshot.players.filter((e) => e.pid !== selfId);
}

/** Real team lookup — used only by the (unused-in-FFA) flag sensor path. */
export function getAlivePlayersOnTeam(teamId: number): mod.Player[] {
    const out: mod.Player[] = [];
    try {
        const arr = mod.AllPlayers();
        const n = mod.CountOf(arr);
        for (let i = 0; i < n; i++) {
            try {
                const p = mod.ValueInArray(arr, i) as mod.Player;
                if (!mod.IsPlayerValid(p)) continue;
                if (!mod.GetSoldierState(p, mod.SoldierStateBool.IsAlive)) continue;
                if (mod.GetObjId(mod.GetTeam(p)) !== mod.GetObjId(mod.GetTeam(teamId))) continue;
                out.push(p);
            } catch {}
        }
    } catch {}
    return out;
}

/** Telemetry stub (no-op). */
export const Tlm = {
    event(_name: string, _data?: unknown): void {},
    sample(_name: string, _data?: unknown): void {},
};
