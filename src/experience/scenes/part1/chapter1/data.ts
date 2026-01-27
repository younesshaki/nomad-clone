import type { NarrativeScene } from "../../shared/narrativeTypes";
import { chapter1VoiceOvers } from "./audio";

export const chapter1Scenes: NarrativeScene[] = [
  {
    id: "scene-1",
    title: "The Rebel Princess",
    voiceOver: chapter1VoiceOvers["scene-1"],
    lines: [
      { text: "She went to private schools.", className: "typewriter" },
      { text: "Pristine uniforms. Strict dress codes.", className: "typewriter" },
      { text: "But she refused to wear skirts.", className: "typewriter" },
      { text: "The principal tried to enforce the rules.", className: "typewriter" },
      { text: "She stood her ground.", className: "typewriter" },
      { text: "The dress code changed.", className: "typewriter emphasis" },
      { text: "Not because of policy.", className: "typewriter" },
      { text: "Because of her.", className: "typewriter" },
    ],
  },
  {
    id: "scene-2",
    title: "The Golden Years",
    voiceOver: chapter1VoiceOvers["scene-2"],
    lines: [
      { text: "Her father worked." },
      {
        text: "Her mother built businesses—clothing shops, strong hands, sharp mind.",
      },
      { text: "Money flowed. Dreams were funded." },
      { text: "Taekwondo. Football. Every sport she wanted." },
      { text: "Bikes appeared in the driveway." },
      { text: "Toys piled up like promises kept." },
      { text: "She was spoiled with love.", className: "glow" },
    ],
  },
  {
    id: "scene-3",
    title: "The Bathroom Tradition",
    voiceOver: chapter1VoiceOvers["scene-3"],
    lines: [
      { text: "There was this habit." },
      { text: "On her way to the shower, she'd strip off her clothes—" },
      { text: "Trail of tiny shirts and socks from bedroom to bathroom." },
      { text: "Her parents would laugh." },
      { text: "That's just who she was." },
      { text: "Wild. Free. Unapologetically herself." },
    ],
  },
  {
    id: "scene-4",
    title: "The Family She Came From",
    voiceOver: chapter1VoiceOvers["scene-4"],
    columns: {
      left: [
        { text: "Her mother was a handball champion." },
        { text: "Playing professionally. Opportunities abroad." },
      ],
      right: [
        { text: "Then she met him. In a club." },
        { text: "She chose love over the world stage." },
        { text: "Married him. Built a life." },
      ],
    },
    mergeLines: [
      { text: "Her daughter inherited that fire.", className: "merge-line" },
      { text: "The girl who would always choose passion.", className: "merge-line" },
    ],
  },
  {
    id: "scene-5",
    title: "Stadiums and Saturdays",
    voiceOver: chapter1VoiceOvers["scene-5"],
    lines: [
      { text: "Her father took her to WAC games." },
      { text: "The roar of the crowd." },
      { text: "His hand holding hers through the noise." },
      { text: "She loved those Saturdays." },
      { text: "The way he'd lift her on his shoulders." },
      { text: "The way he'd say:" },
      { text: '"Wait for me. I\'ll be right back."', className: "final-line" },
    ],
  },
];
