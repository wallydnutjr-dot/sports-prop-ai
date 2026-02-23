import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    console.log('Starting alert monitoring cycle...');

    // Get all active alerts
    const activeAlerts = await base44.asServiceRole.entities.AlertPlay.filter({ is_active: true });
    console.log(`Found ${activeAlerts.length} active alerts`);

    // Scan for new edges and get updates
    const scanResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are the Alert Plays Monitoring Engine.

MISSION: 
1. Scan for NEW high-probability betting edges across all major sports TODAY
2. Update existing alerts based on current game state and market conditions

Current Time: ${new Date().toISOString()}

SPORTS TO SCAN: NBA, NCAAM, NCAAW, NFL, NCAAF, MLB, NHL, Soccer, KBL
MARKETS: Moneyline, Spread, Totals only

EXISTING ALERTS TO UPDATE:
${activeAlerts.map(a => `- ${a.teams} ${a.suggested_play} (Confidence: ${a.confidence}, Last Updated: ${a.last_updated})`).join('\n')}

For EXISTING alerts:
- Check if game state changed significantly
- Recalculate confidence based on current data
- Update regression/spike probabilities
- Adjust strike timing
- If confidence drops below 6, mark as expired
- If game concluded, mark as expired

For NEW edges:
- Apply same detection signals as initial scan
- Only include if confidence ≥ 6
- Maximum 15 total active alerts

EDGE DETECTION SIGNALS (minimum 2 required):
1. Market Overreaction (live inflation)
2. Statistical Regression Model
3. Injury/Rotation Impact
4. Game Script Classification
5. Fair Line Projection deviation

CONFIDENCE SCORING (1-10):
Start at 1, +2 per signal, +1 for regression ≥65%, +1 for spike ≥65%, +1 for fair line deviation, +1 if low volatility, -1 if high volatility. Cap at 10.

Search live scores, odds, and injury news from ESPN and sports sources.

Return updates for existing alerts AND new alerts to add.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          updated_alerts: {
            type: "array",
            description: "Updates for existing alerts",
            items: {
              type: "object",
              properties: {
                teams: { type: "string" },
                confidence: { type: "number", minimum: 1, maximum: 10 },
                regression_probability: { type: "number", minimum: 0, maximum: 100 },
                spike_probability: { type: "number", minimum: 0, maximum: 100 },
                fair_line: { type: "string" },
                strike_timing: { type: "string", enum: ["STRIKE NOW", "WAIT", "MONITOR"] },
                edge_summary: { type: "string" },
                game_state: { type: "string" },
                should_expire: { type: "boolean", description: "True if confidence < 6 or game concluded" }
              }
            }
          },
          new_alerts: {
            type: "array",
            description: "New alerts to create",
            items: {
              type: "object",
              properties: {
                teams: { type: "string" },
                sport: { type: "string" },
                bet_type: { type: "string", enum: ["Moneyline", "Spread", "Total"] },
                suggested_play: { type: "string" },
                game_state: { type: "string" },
                confidence: { type: "number", minimum: 6, maximum: 10 },
                regression_probability: { type: "number", minimum: 0, maximum: 100 },
                spike_probability: { type: "number", minimum: 0, maximum: 100 },
                fair_line: { type: "string" },
                strike_timing: { type: "string", enum: ["STRIKE NOW", "WAIT", "MONITOR"] },
                edge_summary: { type: "string" }
              }
            }
          }
        }
      }
    });

    let updatedCount = 0;
    let expiredCount = 0;
    let newCount = 0;

    // Process updates to existing alerts
    for (const update of (scanResult.updated_alerts || [])) {
      const existingAlert = activeAlerts.find(a => a.teams === update.teams);
      if (existingAlert) {
        if (update.should_expire || update.confidence < 6) {
          // Expire the alert
          await base44.asServiceRole.entities.AlertPlay.update(existingAlert.id, {
            is_active: false,
            last_updated: new Date().toISOString()
          });
          expiredCount++;
          console.log(`Expired alert: ${existingAlert.teams}`);
        } else {
          // Update the alert
          await base44.asServiceRole.entities.AlertPlay.update(existingAlert.id, {
            confidence: update.confidence,
            regression_probability: update.regression_probability,
            spike_probability: update.spike_probability,
            fair_line: update.fair_line,
            strike_timing: update.strike_timing,
            edge_summary: update.edge_summary,
            game_state: update.game_state,
            last_updated: new Date().toISOString()
          });
          updatedCount++;
          console.log(`Updated alert: ${existingAlert.teams} (Confidence: ${update.confidence})`);
        }
      }
    }

    // Create new alerts
    for (const newAlert of (scanResult.new_alerts || [])) {
      // Check if alert already exists
      const exists = activeAlerts.some(a => a.teams === newAlert.teams && a.suggested_play === newAlert.suggested_play);
      if (!exists && newAlert.confidence >= 6) {
        await base44.asServiceRole.entities.AlertPlay.create({
          ...newAlert,
          last_updated: new Date().toISOString(),
          is_active: true
        });
        newCount++;
        console.log(`Created new alert: ${newAlert.teams} (Confidence: ${newAlert.confidence})`);
      }
    }

    // Cleanup: Remove expired alerts older than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const oldExpired = await base44.asServiceRole.entities.AlertPlay.filter({ 
      is_active: false 
    });
    for (const old of oldExpired) {
      if (old.last_updated < oneDayAgo) {
        await base44.asServiceRole.entities.AlertPlay.delete(old.id);
      }
    }

    return Response.json({
      success: true,
      summary: {
        updated: updatedCount,
        expired: expiredCount,
        new: newCount,
        total_active: await base44.asServiceRole.entities.AlertPlay.filter({ is_active: true }).then(r => r.length)
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Monitor error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});