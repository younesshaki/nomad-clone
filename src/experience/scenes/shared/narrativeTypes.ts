export type NarrativeLine = {
  text: string;
  className?: string;
};

type NarrativeSceneBase = {
  id: string;
  title: string;
  voiceOver?: string | null;
  voiceOverStartOffset?: number;
  voiceOverEndOffset?: number;
  position?: {
    x: number;
    y: number;
    align?: "left" | "center" | "right";
  };
};

type NarrativeSceneSingle = NarrativeSceneBase & {
  lines: NarrativeLine[];
  columns?: never;
  mergeLines?: never;
};

type NarrativeSceneColumns = NarrativeSceneBase & {
  columns: {
    left: NarrativeLine[];
    right: NarrativeLine[];
  };
  mergeLines: NarrativeLine[];
  lines?: never;
};

export type NarrativeScene = NarrativeSceneSingle | NarrativeSceneColumns;
