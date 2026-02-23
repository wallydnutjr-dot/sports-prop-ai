import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

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

    const gameId = body?.gameId;
    const stat = body?.stat; // points, rebounds, assists
    const line = Number(body?.line);

    if (!gameId || !stat || !line) {
      return Response.json(
        { error: "Missing gameId, stat, or line" },
        { status: 400 }
      );
    }

    const apiKey = Deno.env.get("SPORTSDATA_API_KEY");

    const url =
      `https://api.sportsdata.io/v3/nba/stats/json/BoxScore/${gameId}`;

    const response = await fetch(url, {
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey
      }
    });

    const data = await response.json();
    const players = data?.PlayerGames || [];
    const game = data?.Game;

    const totalGameMinutes = 48;
    const minutesPerQuarter = 12;
    const currentQuarter = game?.Quarter || 1;

    const analyzed = players.map(player => {

      const minutes = player?.Minutes || 0;
      const seconds = player?.Seconds || 0;
      const totalMinutesPlayed = minutes + (seconds / 60);

      if (totalMinutesPlayed === 0) return null;

      let liveStat = 0;

      if (stat === "points") liveStat = player?.Points || 0;
      if (stat === "rebounds") liveStat = player?.Rebounds || 0;
      if (stat === "assists") liveStat = player?.Assists || 0;

      const perMinuteRate = liveStat / totalMinutesPlayed;

      // --------------------------
      // Role Factor
      // --------------------------
      let roleFactor = 0.65;
      if (totalMinutesPlayed >= 30) roleFactor = 0.95;
      else if (totalMinutesPlayed >= 20) roleFactor = 0.8;

      // --------------------------
      // Remaining Minutes Estimate
      // --------------------------
      const elapsedMinutes =
        (currentQuarter - 1) * minutesPerQuarter;

      const remainingGameMinutes =
        totalGameMinutes - elapsedMinutes;

      const projectedMinutes =
        totalMinutesPlayed +
        (remainingGameMinutes * roleFactor);

      // --------------------------
      // Pace Adjustment
      // --------------------------
      const liveTotal =
        (game?.HomeTeamScore || 0) +
        (game?.AwayTeamScore || 0);

      const paceFactor =
        liveTotal > 120 ? 1.05 :
        liveTotal < 80 ? 0.95 :
        1.0;

      // --------------------------
      // Blowout Risk
      // --------------------------
      const scoreDiff =
        Math.abs(
          (game?.HomeTeamScore || 0) -
          (game?.AwayTeamScore || 0)
        );

      const blowoutRisk =
        scoreDiff >= 20 ? "HIGH" : "LOW";

      // --------------------------
      // Projection
      // --------------------------
      const projection =
        perMinuteRate *
        projectedMinutes *
        paceFactor;

      const edge = projection - line;
      const edgePercent =
        line > 0 ? (edge / line) * 100 : 0;

      // --------------------------
      // Volatility Flags
      // --------------------------
      let volatilityFlags = 0;

      if (blowoutRisk === "HIGH") volatilityFlags++;
      if (totalMinutesPlayed < 12) volatilityFlags++;

      const confidence =
        assignConfidence(edgePercent, volatilityFlags);

      return {
        Player: player?.Name,
        MinutesPlayed: totalMinutesPlayed.toFixed(1),
        LiveStat: liveStat,
        PerMinuteRate: perMinuteRate.toFixed(3),
        ProjectedFinal: projection.toFixed(1),
        Line: line,
        Edge: edge.toFixed(2),
        EdgePercent: edgePercent.toFixed(2),
        BlowoutRisk: blowoutRisk,
        Confidence: confidence
      };

    }).filter(Boolean);

    return Response.json({
      success: true,
      gameId,
      stat,
      players: analyzed
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error?.message || "Live engine error"
    }, { status: 500 });
  }
});