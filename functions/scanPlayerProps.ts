import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

function getStatKey(propType) {
  const map = {
    points: "Points",
    rebounds: "Rebounds",
    assists: "Assists"
  };
  return map[propType] || null;
}

function assignConfidence(edgePercent, volatilityFlags) {
  if (volatilityFlags >= 2) return "PASS";
  if (edgePercent > 20) return "HIGH";
  if (edgePercent > 12) return "MEDIUM";
  if (edgePercent > 6) return "LOW";
  return "PASS";
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const playerId = body?.playerId;
    const propType = body?.propType;
    const line = Number(body?.line);
    const season = body?.season || 2026;

    if (!playerId || !propType || !line) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const statKey = getStatKey(propType);
    if (!statKey) {
      return Response.json({ error: "Unsupported prop type" }, { status: 400 });
    }

    const apiKey = Deno.env.get("SPORTSDATA_API_KEY");

    // --------------------
    // 1️⃣ Pull Player Season Stats
    // --------------------
    const seasonUrl =
      `https://api.sportsdata.io/v3/nba/stats/json/PlayerSeasonStats/${season}`;

    const seasonRes = await fetch(seasonUrl, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey }
    });

    const seasonStats = await seasonRes.json();
    const player = seasonStats.find(p => p.PlayerID === playerId);

    if (!player) {
      return Response.json({ error: "Player not found" }, { status: 404 });
    }

    const seasonAvg = (player?.[statKey] || 0) / (player?.Games || 1);
    const minutesSeason = (player?.Minutes || 0) / (player?.Games || 1);

    // --------------------
    // 2️⃣ Pull Last 5 Games
    // --------------------
    const last5Url =
      `https://api.sportsdata.io/v3/nba/stats/json/PlayerGameStatsByPlayer/${season}/${playerId}`;

    const last5Res = await fetch(last5Url, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey }
    });

    const gameStats = await last5Res.json();
    const last5 = gameStats.slice(0, 5);

    const last5Avg =
      last5.reduce((sum, g) => sum + (g?.[statKey] || 0), 0) /
      (last5.length || 1);

    const minutesLast5 =
      last5.reduce((sum, g) => sum + (g?.Minutes || 0), 0) /
      (last5.length || 1);

    // --------------------
    // 3️⃣ Pull Opponent Defensive Data
    // --------------------
    const teamUrl =
      `https://api.sportsdata.io/v3/nba/stats/json/TeamSeasonStats/${season}`;

    const teamRes = await fetch(teamUrl, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey }
    });

    const teamStats = await teamRes.json();

    const opponentTeam = teamStats.find(t => t.TeamID === player.OpponentID);

    const leagueAvgAllowed =
      teamStats.reduce((sum, t) => sum + (t.PointsAllowed || 0), 0) /
      teamStats.length;

    const opponentAllowed = opponentTeam?.PointsAllowed || leagueAvgAllowed;

    const defenseFactor = opponentAllowed / leagueAvgAllowed;
    const defenseAdj = seasonAvg * (defenseFactor - 1);

    // --------------------
    // 4️⃣ Minutes Trend Adj
    // --------------------
    const minutesTrend = minutesLast5 - minutesSeason;
    const minutesAdj = minutesTrend * 0.2;

    // --------------------
    // 5️⃣ Final Projection
    // --------------------
    const projection =
      (seasonAvg * 0.45) +
      (last5Avg * 0.35) +
      minutesAdj +
      defenseAdj;

    const edge = projection - line;
    const edgePercent = line > 0 ? (edge / line) * 100 : 0;

    // --------------------
    // 6️⃣ Volatility Flags
    // --------------------
    let volatilityFlags = 0;

    if (last5Avg > seasonAvg * 1.25) volatilityFlags++;
    if (minutesLast5 < minutesSeason * 0.8) volatilityFlags++;

    const confidence = assignConfidence(edgePercent, volatilityFlags);

    return Response.json({
      success: true,
      player: player?.Name,
      propType,
      line,
      projection: projection.toFixed(2),
      edge: edge.toFixed(2),
      edgePercent: edgePercent.toFixed(2),
      defenseFactor: defenseFactor.toFixed(3),
      volatilityFlags,
      confidence
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error?.message || "Engine error"
    }, { status: 500 });
  }
});