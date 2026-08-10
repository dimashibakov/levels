export type Lang = "en" | "ru";

export const t = {
  en: {
    today: "Today", patterns: "Patterns", playbook: "Playbook",
    yourLevel: "Your level", runCheck: "Run today's check",
    private: "2 min · private · no one gets called",
    signals: "Signals", sleep: "Sleep", hrv: "HRV baseline", steps: "Steps",
  },
  ru: {
    today: "Сегодня", patterns: "Паттерны", playbook: "Плейбук",
    yourLevel: "Твой уровень", runCheck: "Пройти сегодняшний чек",
    private: "2 мин · приватно · никто никому не звонит",
    signals: "Сигналы", sleep: "Сон", hrv: "База HRV", steps: "Шаги",
  },
} as const;
