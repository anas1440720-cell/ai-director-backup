export type PipelineInput = {
  idea: string;
  videoType: string;
  audience: string;
  goal: string;
  character: string;
  style: string;
};

export type PipelineResult = {
  vision: {
    emotion: string;
    pacing: string;
    storyType: string;
  };
  prompts: {
    systemPrompt: string;
    styleDirective: string;
  };
};

export default function PipelineEngine(input: PipelineInput): PipelineResult {
  let emotion = "Emotional cinematic feeling";
  let pacing = "Balanced cinematic pacing";
  let storyType = "Cinematic Story";

  if (input.goal === "Teach") {
    emotion = "Curiosity and discovery";
    pacing = "Clear educational storytelling";
    storyType = "Educational cinematic journey";
  } else if (input.goal === "Get More Views") {
    emotion = "Shock and excitement";
    pacing = "Fast viral editing style";
    storyType = "Viral attention grabbing story";
  } else if (input.goal === "Entertain") {
    emotion = "Fun and excitement";
    pacing = "Dynamic entertaining scenes";
    storyType = "Entertainment adventure";
  } else if (input.goal === "Sell Product") {
    emotion = "Trust and desire";
    pacing = "Professional advertising rhythm";
    storyType = "Commercial cinematic story";
  }

  const vision = {
    emotion,
    pacing,
    storyType,
  };

  const prompts = {
    systemPrompt: `Produce a cinematic ${input.videoType} in ${input.style} style focusing on ${input.character}.`,
    styleDirective: `Visual style: ${input.style}, Target Audience: ${input.audience}, Emotional Tone: ${emotion}`,
  };

  return {
    vision,
    prompts,
  };
}