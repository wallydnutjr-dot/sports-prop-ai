import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const results = [];

    // -------------------------
    // 1️⃣ CALL LIVE TOTALS
    // -------------------------
    if (body?.includeLiveTotals) {
      const liveTotals = await base44.functions.invoke("scanAlertPlays", {
        sport_type: body?.sport_type
      });

      liveTotals?.games?.forEach(g => {
        if (g?.confidence === "HIGH") {
          results.push({
            type: "LIVE_TOTAL",
            ...g
          });
        }
      });
    }

    // -------------------------
    // 2️⃣ CALL LIVE PLAYER PROPS
    // -------------------------
    if (body?.includeLiveProps) {
      const liveProps = await base44.functions.invoke("scanLivePlayerProps", {
        gameId: body?.gameId,
        stat: body?.stat,
        line: body?.line
      });

      liveProps?.players?.forEach(p => {
        if (p?.Confidence === "HIGH") {
          results.push({
            type: "LIVE_PROP",
            ...p
          });
        }
      });
    }

    // -------------------------
    // 3️⃣ CALL PREGAME TOTALS
    // -------------------------
    if (body?.includePregameTotals) {
      const preTotals = await base44.functions.invoke("scanPregamePlays", {
        sport_type: body?.sport_type,
        date: body?.date
      });

      preTotals?.totals?.forEach(t => {
        if (t?.confidence === "HIGH") {
          results.push({
            type: "PREGAME_TOTAL",
            ...t
          });
        }
      });
    }

    // -------------------------
    // 4️⃣ CALL PREGAME PLAYER PROPS
    // -------------------------
    if (body?.includePregameProps) {
      const preProps = await base44.functions.invoke("scanPlayerProps", {
        sport_type: body?.sport_type,
        playerId: body?.playerId,
        propType: body?.propType,
        line: body?.line
      });

      if (preProps?.confidence === "HIGH") {
        results.push({
          type: "PREGAME_PROP",
          ...preProps
        });
      }
    }

    // -------------------------
    // SORT BY EDGE %
    // -------------------------
    const sorted = results.sort((a, b) => {
      const aEdge = Number(a?.edgePercent || 0);
      const bEdge = Number(b?.edgePercent || 0);
      return bEdge - aEdge;
    });

    return Response.json({
      success: true,
      topPlays: sorted.slice(0, 5) // only strongest 5
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error?.message || "Master engine error"
    }, { status: 500 });
  }
});