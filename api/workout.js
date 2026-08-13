export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405 }
      );
    }

    try {
      const { goal, level, style } = await request.json();

      if (!goal || !level || !style) {
        return Response.json(
          { error: "Missing workout details" },
          { status: 400 }
        );
      }

      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini",
          input: `
You are the AI workout assistant for GR Fitness.

Create a personalised 4-day weekly gym workout plan.

Fitness goal: ${goal}
Experience level: ${level}
Preferred training style: ${style}

For each day include:
- workout focus
- exercises
- sets
- reps

Keep the plan suitable for the user's experience level.
Keep it clear and concise.
Finish with a short safety reminder.
`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("OpenAI error:", data);

        return Response.json(
          { error: data?.error?.message || "OpenAI request failed" },
          { status: 500 }
        );
      }

      const workout =
        data.output?.[0]?.content?.find(
          item => item.type === "output_text"
        )?.text;

      if (!workout) {
        return Response.json(
          { error: "No workout generated" },
          { status: 500 }
        );
      }

      return Response.json({ workout });

    } catch (error) {
      console.error(error);

      return Response.json(
        { error: "Unable to generate workout" },
        { status: 500 }
      );
    }
  }
};
