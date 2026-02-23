import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { play_id } = await req.json();

    if (!play_id) {
      return Response.json({ error: 'play_id is required' }, { status: 400 });
    }

    // Fetch the play
    const play = await base44.entities.ParsedPlay.get(play_id);

    if (!play) {
      return Response.json({ error: 'Play not found' }, { status: 404 });
    }

    // Check if game is concluded and get results
    const gameResultPrompt = `Check if this game has concluded and determine the outcome:

Sport: ${play.sport_type}
League: ${play.league_or_competition}
Teams: ${play.teams}
Game Time: ${play.game_time}
Market Type: ${play.market_type}
Line: ${play.line}
Segment: ${play.segment || 'Full Game'}
${play.player ? `Player: ${play.player}` : ''}

Original Recommendation: ${play.recommendation}
Projection: ${play.projection}

Go to ESPN.com or other reliable sports sources and:
1. Check if the game has concluded
2. Get the final score/result
3. For player props, get the actual player stats
4. Determine if the play was a HIT, MISS, or PUSH based on the recommendation vs actual outcome

For totals: Check if Over/Under hit based on the line
For spreads: Check if the spread covered
For player props: Compare actual stats to the line
For moneyline: Check who won

Return detailed analysis of the outcome.`;

    const outcomeResult = await base44.integrations.Core.InvokeLLM({
      prompt: gameResultPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          game_concluded: { type: "boolean" },
          final_score: { type: "string" },
          actual_stat: { type: "string" },
          outcome: { type: "string", enum: ["hit", "miss", "push", "pending"] },
          outcome_explanation: { type: "string" }
        }
      }
    });

    // Update the play
    await base44.entities.ParsedPlay.update(play_id, {
      game_concluded: outcomeResult.game_concluded,
      recap_outcome: outcomeResult.outcome,
      recap_checked_at: new Date().toISOString(),
      final_score: outcomeResult.final_score,
      actual_stat: outcomeResult.actual_stat,
      outcome_explanation: outcomeResult.outcome_explanation
    });

    return Response.json({
      success: true,
      outcome: outcomeResult
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});