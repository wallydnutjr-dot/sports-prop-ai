import { createClientFromRequest } from "npm:@base44/sdk@0.8.6";

function getSportConfig(sport) {
  switch (sport) {
    case "nba":
    case "ncaab":
      return { scoringFactor: 1.0 };
    case "nfl":
    case "ncaaf":
      return { scoringFactor: 0.85 };
    case "mlb":
      return { scoringFactor: 0.6 };
    case "nhl":
      return { scoringFactor: 1.05 };
    case "soccer":
      return { scoringFactor: 0.75 };
    default:
      return { scoringFactor: 1.0 };
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const sport = (body?.sport_type || "nba").toLowerCase();
    const date = body?.date;

    if (!date) {
      return Response.json({ error: "Missing date" }, { status: 400 });
    }

    const apiKey = Deno.env.get("SPORTSDATA_API_KEY");
    if (!apiKey) {
      return Response.json({ error: "Missing API key" }, { status: 500 });
    }

    const config = getSportConfig(sport);

    const gamesUrl = `https://api.sportsdata.io/v3/${sport}/scores/json/GamesByDate/${date}`;

    const response = await fetch(gamesUrl, {
      headers: { "Ocp-Apim-Subscription-Key": apiKey }
    });

    const games = await response.json();

    const totals = [];
    const spreads = [];
    const playerProps = []; // placeholder for now

    games.forEach((game) => {

      const home = game?.HomeTeam;
      const away = game?.AwayTeam;

      const homeAvg = game?.HomeTeamScore || 0;
      const awayAvg = game?.AwayTeamScore || 0;

      const projectedTotal =
        (homeAvg + awayAvg) * config.scoringFactor;

      const marketTotal =
        typeof game?.OverUnder === "number"
          ? game.OverUnder
          : null;

      if (marketTotal !== null) {
        const edge = projectedTotal - marketTotal;

        totals.push({
          home,
          away,
          projectedTotal: projectedTotal.toFixed(1),
          marketTotal,
          edge: edge.toFixed(2),
          recommendation:
            edge > 5 ? "OVER" :
            edge < -5 ? "UNDER" :
            "PASS"
        });
      }

      const spread = game?.PointSpread;
      if (typeof spread === "number") {

        const projectedSpread =
          (homeAvg - awayAvg) * config.scoringFactor;

        const spreadEdge = projectedSpread - spread;

        spreads.push({
          home,
          away,
          projectedSpread: projectedSpread.toFixed(1),
          marketSpread: spread,
          edge: spreadEdge.toFixed(2),
          recommendation:
            spreadEdge > 3 ? "HOME" :
            spreadEdge < -3 ? "AWAY" :
            "PASS"
        });
      }

      // PLAYER PROP ENGINE COMING NEXT
      // we will integrate /Players + season stats endpoints
    });

    return Response.json({
      success: true,
      sport,
      date,
      totals,
      spreads,
      playerProps
    });

  } catch (error) {
    return Response.json({
      success: false,
      error: error?.message || "Engine error"
    }, { status: 500 });
  }
});