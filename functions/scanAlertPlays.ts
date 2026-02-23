import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const API_KEY = Deno.env.get("ODDS_API_KEY");

if (!API_KEY) {
  throw new Error("ODDS_API_KEY missing");
}

function estimateMinutesPlayed(period, clock) {
  const quarterLength = 12;

  if (!period || !clock) return 0;

  const parts = clock.split(":");
  const minutesLeft = parseInt(parts[0]) || 0;
  const secondsLeft = parseInt(parts[1]) || 0;

  const minutesRemaining = minutesLeft + secondsLeft / 60;

  return (period - 1) * quarterLength + (quarterLength - minutesRemaining);
}

function projectGame(homeScore, awayScore, minutesPlayed) {
  const totalSoFar = homeScore + awayScore;
  const gameLength = 48;

  if (minutesPlayed <= 0) {
    return {
      projectedTotal: 0,
      pace: 0,
      volatility: "Low"
    };
  }

  const pace = totalSoFar / minutesPlayed;
  const projectedTotal = pace * gameLength;

  let volatility = "Low";
  if (minutesPlayed < 12) volatility = "High";
  else if (minutesPlayed < 24) volatility = "Medium";

  return {
    projectedTotal: Number(projectedTotal.toFixed(1)),
    pace: Number(pace.toFixed(2)),
    volatility
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      console.warn("Could not parse JSON body");
    }

    const sportType = body.sport_type || "nba";

    // Map sport to odds API format
    const sportMap = {
      "nba": "basketball_nba",
      "nfl": "americanfootball_nfl",
      "mlb": "baseball_mlb",
      "nhl": "icehockey_nhl",
      "ncaab": "basketball_ncaab",
      "ncaaf": "americanfootball_ncaaf"
    };

    const oddsApiSport = sportMap[sportType.toLowerCase()] || "basketball_nba";

    const url = `https://api.the-odds-api.com/v4/sports/${oddsApiSport}/events?apiKey=${API_KEY}`;

    const response = await Promise.race([
      fetch(url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("API timeout")), 8000)
      )
    ]);

    if (!response.ok) {
      throw new Error(`Odds API returned ${response.status}`);
    }

    const data = await response.json();
    const events = data.events || [];

    const results = [];

    for (const event of events) {
      // Only process live events
      if (event.status !== "live") continue;

      const homeTeam = event.home_team;
      const awayTeam = event.away_team;
      const homeScore = event.scores?.find(s => s.name === homeTeam)?.score || 0;
      const awayScore = event.scores?.find(s => s.name === awayTeam)?.score || 0;

      // Extract period and time (varies by sport)
      let period = 0;
      let clock = "0:00";

      if (event.sport_key === "basketball_nba" || event.sport_key === "basketball_ncaab") {
        const q = event.last_update?.match(/Q(\d+)/)?.[1];
        period = q ? parseInt(q) : 0;
        clock = event.last_update?.match(/(\d+:\d+)/)?.[1] || "0:00";
      }

      if (period === 0 || period > 4) continue;

      const minutesPlayed = estimateMinutesPlayed(period, clock);
      const projection = projectGame(homeScore, awayScore, minutesPlayed);

      const liveTotal = homeScore + awayScore;
      const edge = Number((projection.projectedTotal - liveTotal).toFixed(1));

      results.push({
        gameId: event.id,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        period,
        clock,
        minutesPlayed: Number(minutesPlayed.toFixed(2)),
        liveTotal,
        projectedTotal: projection.projectedTotal,
        pace: projection.pace,
        edge,
        volatility: projection.volatility
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        games: results
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: String(err.message),
        details: String(err)
      }),
      { status: 500 }
    );
  }
});