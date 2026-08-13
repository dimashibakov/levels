import type { Tier } from "@/lib/scoring";

export const STRINGS = {
  header: "Check",
  scale: ["Rarely", "Some days", "Most days", "Nearly every day"] as const,
  yes: "Yes",
  no: "No",
  nav: { back: "Back", next: "Next", continue: "Continue", done: "Done" },
  stages: { quick: "Quick check", deeper: "Deeper", safety: "Safety" },
  items: {
    c1: "Over the last two weeks, how often has stuff you normally care about felt not worth the effort?",
    c2: "…and how often did things feel flat, low, or done?",
    d1: "Sleep been off — hard to fall asleep, or up at 3 and can't switch off?",
    d2: "Running on empty — tired even when you've slept?",
    d3: "Hard to focus — zoning out, rereading the same line?",
    d4: "Shorter fuse than usual — snapping at people who didn't earn it?",
    d5: "Drinking more, or leaning on something to take the edge off?",
    d6: "Feeling like you're letting people down — or they'd be better off without the hassle?",
    s1: "In the last month, have you wished you could go to sleep and not wake up, or just not be here?",
    s2: "Have you had actual thoughts of ending your life?",
    s3: "Does it feel like it could be soon, not someday?",
  },
  safetyReassurance:
    "These get asked of everyone — not because something's wrong with you. Whatever you mark, nothing happens automatically. Next comes a person, not a system.",
  result: {
    heading: "Your read",
    sentence: {
      in_level: "A steady read for the last couple of weeks — not a verdict. The level moves.",
      off_level: "Something's pulling you off level. Catching it early is the point.",
      edge: "You're carrying a lot right now. What follows is built for this moment.",
    } satisfies Record<Tier, string>,
  },
  response: {
    in_level: [
      {
        title: "Check in later",
        body: "A quiet question in a few weeks. The level slips unnoticed; an early tap catches the drift.",
      },
      {
        title: "What keeps you level",
        body: "Sleep, movement, a couple of people you don't have to perform for.",
      },
    ],
    off_level: [
      {
        title: "Safety plan",
        body: "Your own plan: the tilt signals, what helps, who to go to. It borrows your brain for the moment thinking is hard.",
      },
      {
        title: "Move the means aside",
        body: "If something you could use is within reach, put time and distance there. Temporary, your call.",
      },
      {
        title: "A real person, not a form",
        body: "Connect to therapy (CBT/DBT lower thoughts and attempts), not a bot.",
      },
    ],
    edge: [
      {
        title: "988",
        body: "Suicide & Crisis Lifeline. Call or text, 24/7. A trained counselor — not the police. Reach out before the peak, not only in a crisis.",
        kind: "988" as const,
      },
      {
        title: "Safety plan — now",
        body: "A short plan for the next few hours: what helps you hold, who to reach, where to go.",
      },
      {
        title: "Distance from the means",
        body: "Time and distance between you and anything you could use.",
      },
      {
        title: "Someone calls you back",
        body: "A real person checks in over the coming days. The window after a crisis is the peak — it isn't left empty.",
      },
    ],
  },
} as const;
