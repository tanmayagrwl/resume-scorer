'use server';

import { readFile, writeFile } from "fs/promises";

interface Resume {
  name: string;
  score: number;
  summary: string;
  whyScore: string[];
  improvements: string[];
  keywords: string[];
  links: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    personal?: string;
  };
  introduction: string;
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    description: string;
  }[];
  education: {
    school: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate?: string;
  }[];
  skills: string[];
  projects: {
    name: string;
    description: string;
    startDate: string;
    endDate?: string;
    link?: string;
  }[];
}

const FILE_PATH = 'data/resumes.json';

async function readConfiguration() {
  const file = await readFile(FILE_PATH, 'utf8');
  return JSON.parse(file) as Record<string, Resume>;
}

async function getResume(id: string): Promise<Resume | null> {
  const config = await readConfiguration();
  return config[id] ?? null;
}

async function writeConfiguration(config: string) {
  await writeFile(FILE_PATH, config);
}

export { readConfiguration, writeConfiguration, getResume };