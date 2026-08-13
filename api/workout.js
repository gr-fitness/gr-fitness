export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { goal, level, style } = req.body;

    if (!goal || !level || !style) {
      return res.status(400).json({
        error: "Please select your goal, experience level and training style."
      });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        input: `You are the AI workout assistant for GR Fitness.

Create a personalised weekly gym workout plan for this member.

Fitness goal: ${goal}
Experience level: ${level}
Preferred training style: ${style}

Create a clear 4-day workout plan.

For each day include:
- workout focus
- exercises
- sets
- reps

Keep the plan simple and suitable for the person's experience level.
Do not provide medical advice.
Finish with a short reminder to use correct form and speak to a qualified professional if they have an injury or medical condition.`
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({
        error: "AI workout generation failed."
      });
    }

    const workout =
      data.output?.[0]?.content?.find(item => item.type === "output_text")?.text;

    if (!workout) {
      return res.status(500).json({
        error: "No workout was generated."
      });
    }

    return res.status(200).json({ workout });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Unable to generate your workout."
    });
  }
}
