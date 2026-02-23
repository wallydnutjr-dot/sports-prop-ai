import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { teams, sport_type, league } = body;

    if (!teams) {
      return Response.json({ error: 'Missing teams parameter' }, { status: 400 });
    }

    const apiKey = Deno.env.get('ODDS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Missing ODDS_API_KEY' }, { status: 500 });
    }

    // Use The Odds API for live game data
    const sport = mapSportToOddsAPI(sport_type);
    const url = `https://api.the-odds-api.com/v4/sports/${sport}/events?apiKey=${apiKey}`;

    const response = await Promise.race([
      fetch(url),
      new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 8000))
    ]);

    if (!response || !response.ok) {
      return Response.json({ 
        success: false, 
        is_live: false,
        error: 'Could not verify live game state' 
      });
    }

    const data = await response.json();
    const games = data.events || [];
    
    // Find matching game by team names
    const teamsLower = teams?.toLowerCase() || '';
    const game = games.find((g: any) => {
      const name = (g.name || '').toLowerCase();
      const homeTeam = (g.home_team || '').toLowerCase();
      const awayTeam = (g.away_team || '').toLowerCase();
      return name.includes(homeTeam) && name.includes(awayTeam) && 
             (teamsLower.includes(homeTeam) || teamsLower.includes(awayTeam));
    });

    if (!game) {
      return Response.json({ 
        success: false, 
        is_live: false,
        error: 'Game not found' 
      });
    }

    // Parse game state - status can be "live", "upcoming", "completed"
    const isLive = game.status === 'live' || game.status === 'in_play';
    
    // Extract scores if available
    let scoreHome = 0;
    let scoreAway = 0;
    
    if (game.scores && Array.isArray(game.scores)) {
      const homeScore = game.scores.find((s: any) => s.name === game.home_team);
      const awayScore = game.scores.find((s: any) => s.name === game.away_team);
      scoreHome = homeScore ? parseInt(homeScore.score) || 0 : 0;
      scoreAway = awayScore ? parseInt(awayScore.score) || 0 : 0;
    }

    return Response.json({
      success: true,
      is_live: isLive,
      score_home: scoreHome,
      score_away: scoreAway,
      period: isLive ? 'Live' : 'Pregame',
      time_remaining: isLive ? 'In Progress' : 'Not Started',
      data_source: 'The Odds API',
      verified: true
    });

  } catch (error) {
    return Response.json({
      success: false,
      is_live: false,
      error: error?.message || 'Failed to fetch live data'
    });
  }
});

function mapSportToOddsAPI(sportType: string) {
  const sport = sportType?.toLowerCase() || '';
  
  const mapping: Record<string, string> = {
    'nba': 'basketball_nba',
    'ncaab': 'basketball_ncaab',
    'nfl': 'americanfootball_nfl',
    'ncaaf': 'americanfootball_ncaaf',
    'nhl': 'icehockey_nhl',
    'mlb': 'baseball_mlb',
    'soccer': 'soccer_epl,soccer_france,soccer_germany,soccer_spain,soccer_italy',
    'tennis': 'tennis_atp,tennis_wta'
  };
  
  // Handle variations
  if (sport.includes('ncaab') || sport.includes('college basketball')) return 'basketball_ncaab';
  if (sport.includes('ncaaf') || sport.includes('college football')) return 'americanfootball_ncaaf';
  
  return mapping[sport] || 'basketball_nba';
}