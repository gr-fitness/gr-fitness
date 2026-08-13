import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { goal, level, style } = req.body;

    if (!goal || !level || !style) {
      return res.status(400).json({
        error: "Missing workout details"
      });
    }

    const response = await openai.responses.create({
      model: "gpt-5-mini",
      reasoning: {
        effort: "low"
      },
      input: `
You are the AI workout assistant for GR Fitness.

Create a personalised 4-day weekly gym workout plan.

Fitness goal: ${goal}
Experience level: ${level}
Preferred training style: ${style}

For each day include:
- workout focus
- 4 to 6 exercises
- sets
- reps

Keep the workout appropriate for the user's experience level.

Use a clear format like:

DAY 1 — UPPER BODY
Bench Press — 3 x 10
Lat Pulldown — 3 x 10

Finish with one short safety reminder.
`
    });

    const workout = response.output_text;

    if (!workout) {
      console.error("Full OpenAI response:", response);

      return res.status(500).json({
        error: "No workout was generated"
      });
    }

    return res.status(200).json({
      workout
    });

  } catch (error) {
    console.error("Workout API error:", error);

    return res.status(500).json({
      error: error.message || "Unable to generate workout"
    });
  }
}
