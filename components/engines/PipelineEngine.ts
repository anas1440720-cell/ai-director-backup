"use client";

import DirectorBrain from "./DirectorBrain";
import PromptEngine from "./PromptEngine";


export type PipelineInput = {
  idea: string;
  videoType: string;
  audience: string;
  goal: string;
  character: string;
  style: string;
};


export type PipelineResult = {
  vision: any;
  prompts: any;
};


export default function PipelineEngine(
  input: PipelineInput
): PipelineResult {


  const vision = DirectorBrain(input);


  const prompts = PromptEngine(input);


  return {
    vision,
    prompts,
  };

}