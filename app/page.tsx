"use client";

import { Cover } from "@/components/ui/cover";
import { FileUpload } from "@/components/ui/file-upload";
import { useRef, useState, type FormEventHandler } from "react";
import { motion } from "framer-motion";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { readConfiguration, writeConfiguration } from "@/lib/actions/file";

const apiKey = "AIzaSyB0bWLvi-vcE1D334c2ij7oMCp8WZnMxHU";

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash-8b",
  systemInstruction: `Generate a structured resume response, including score, summary, and improvements`,
  generationConfig: {
    responseMimeType: "application/json",
    responseSchema: {
      description:
        "Structured resume response, including score, summary, and improvements",
      type: SchemaType.OBJECT,
      properties: {
        score: {
          type: SchemaType.NUMBER,
          description: `Score OUT OF 100`,
          nullable: false,
        },
        name: {
          type: SchemaType.STRING,
          description: "Name of the candidate",
          nullable: true,
        },
        summary: {
          type: SchemaType.STRING,
          description:
            "Summary of the resume highlighting strengths from the resume. NO CREATIVE WRITING",
          nullable: false,
        },
        whyScore: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description:
            "Explanation of why the resume received the following score",
          nullable: false,
        },
        improvements: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: "List of improvements that can be made to the resume",
          nullable: false,
        },
        keywords: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: "Keywords extracted from the resume",
          nullable: false,
        },
        links: {
          type: SchemaType.OBJECT,
          properties: {
            linkedin: {
              type: SchemaType.STRING,
              description: "LinkedIn profile URL",
              nullable: true,
            },
            github: {
              type: SchemaType.STRING,
              description: "GitHub profile URL",
              nullable: true,
            },
            portfolio: {
              type: SchemaType.STRING,
              description: "Portfolio URL",
              nullable: true,
            },
            personal: {
              type: SchemaType.STRING,
              description: "Personal website URL",
              nullable: true,
            },
          },
          description:
            "Links to LinkedIn, GitHub, Portfolio, and Personal website if not available set to null",
        },
        introduction: {
          type: SchemaType.STRING,
          description:
            "Introduction of the resume as first person, e.g. 'I am a software engineer with 5 years of experience' in 200 words",
          nullable: false,
        },
        experience: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              title: {
                type: SchemaType.STRING,
                description: "Job title",
                nullable: false,
              },
              company: {
                type: SchemaType.STRING,
                description: "Company name",
                nullable: false,
              },
              location: {
                type: SchemaType.STRING,
                description: "Location of the job",
                nullable: false,
              },
              startDate: {
                type: SchemaType.STRING,
                description: "Start date of the job",
                nullable: false,
              },
              endDate: {
                type: SchemaType.STRING,
                description: "End date of the job",
                nullable: true,
              },
              description: {
                type: SchemaType.STRING,
                description: "Description of the job",
                nullable: false,
              },
            },
            required: [
              "title",
              "company",
              "location",
              "startDate",
              "description",
            ],
          },
          description:
            "List of work experiences if not available set to null, try to get title, company, location, description, start date",
          nullable: false,
        },
        education: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              school: {
                type: SchemaType.STRING,
                description: "School name",
                nullable: false,
              },
              degree: {
                type: SchemaType.STRING,
                description: "Degree obtained",
                nullable: false,
              },
              fieldOfStudy: {
                type: SchemaType.STRING,
                description: "Field of study",
                nullable: false,
              },
              startDate: {
                type: SchemaType.STRING,
                description: "Start date of the education",
                nullable: false,
              },
              endDate: {
                type: SchemaType.STRING,
                description: "End date of the education",
                nullable: true,
              },
            },
            required: ["school", "degree", "fieldOfStudy", "startDate"],
          },
          description:
            "List of educational experiences if not available set to null, try to get school, degree, field of study, start date",
          nullable: false,
        },
        skills: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: "List of skills",
          nullable: false,
        },
        projects: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: {
                type: SchemaType.STRING,
                description: "Project name",
                nullable: false,
              },
              description: {
                type: SchemaType.STRING,
                description: "Description of the project",
                nullable: false,
              },
              startDate: {
                type: SchemaType.STRING,
                description: "Start date of the project",
                nullable: false,
              },
              endDate: {
                type: SchemaType.STRING,
                description: "End date of the project",
                nullable: true,
              },
              link: {
                type: SchemaType.STRING,
                description: "Link to the project",
                nullable: true,
              },
            },
            required: ["name", "description", "startDate"],
          },
          description:
            "List of projects if not available set to null, try to get name, description, start date",
          nullable: false,
        },
      },
      required: [
        "score",
        "summary",
        "whyScore",
        "improvements",
        "keywords",
        "links",
        "introduction",
        "experience",
        "education",
        "skills",
        "projects",
      ],
    },
  },
});

async function fileToGenerativePart(file: File) {
  return {
    inlineData: {
      data: Buffer.from(await file.arrayBuffer()).toString("base64"),
      mimeType: file.type,
    },
  };
}

export interface Resume {
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

async function generateScore(file: File, jobDescription: string) {
  const resume = await fileToGenerativePart(file);
  const prompt = `Job Description: ${jobDescription}`;
  const response = await model.generateContent([prompt, resume]);
  return response;
}

export default function Home() {
  const [file, setFile] = useState<File>();
  const [jobDescription, setJobDescription] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<Resume>();
  const [isBuilding, setIsBuilding] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (file: File) => {
    setFile(file);
    console.log("File uploaded:", file.name);
  };

  const buildWebsite = async () => {
    if (!result) {
      toast.error("Please generate a score for the resume first.");
      return;
    }

    if (isBuilding) {
      toast.error("Website is already being built.");
      return;
    }

    setIsBuilding(true);

    try {
      console.log("Building website...");
      const uuid = crypto.randomUUID().replaceAll("-", "");
      const config = await readConfiguration();
      config[uuid] = result;
      const configString = JSON.stringify(config, null, 2);
      await writeConfiguration(configString);

      toast.success("Website built successfully.", {
        action: {
          label: "Copy Link",
          onClick: async () => {
            await navigator.clipboard.writeText(
              `${window.location.origin}/u/${uuid}`
            );
          }
        }
      });
    } catch (error) {
      toast.error("Failed to build website.");
    }

    setIsBuilding(false);
  };

  const color = {
    low: {
      bg: "from-red-400/0 via-red-400/90 to-red-400/0",
      border: "from-red-400/60 to-red-400/0",
      text: "text-red-400",
    },
    medium: {
      bg: "from-yellow-500/0 via-yellow-500/90 to-yellow-500/0",
      border: "from-yellow-500/60 to-yellow-500/0",
      text: "text-yellow-500",
    },
    good: {
      bg: "from-orange-400/0 via-orange-400/90 to-orange-400/0",
      border: "from-orange-400/60 to-orange-400/0",
      text: "text-orange-400",
    },
    better: {
      bg: "from-emerald-400/0 via-emerald-400/90 to-emerald-400/0",
      border: "from-emerald-400/60 to-emerald-400/0",
      text: "text-emerald-400",
    },
  };

  function getColor(score: number) {
    if (score >= 80) return color.better;
    if (score >= 60) return color.good;
    if (score >= 40) return color.medium;
    return color.low;
  }

  const handleGenerateScore: FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please upload a resume file.");
      setIsUploading(false);
      return;
    }

    setIsUploading(true);
    console.log("Generating score for the file...");

    try {
      const result = await generateScore(file, jobDescription);
      const resumeResult = result.response.text();
      console.log(resumeResult);
      setResult(JSON.parse(resumeResult));

      setTimeout(() => {
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 1000);
    } catch (error) {
      toast.error("Failed to generate score for the file.");
    }

    setIsUploading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="h-screen p-4 flex flex-col items-center pt-20 overflow-hidden">
        <h1 className="text-4xl md:text-4xl font-semibold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white mb-4">
          Resume <Cover>Scorer</Cover> and Website Builder
        </h1>
        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg mb-8">
          <FileUpload onChange={handleFileUpload} />
        </div>
        <form
          onSubmit={handleGenerateScore}
          className="flex flex-col justify-center items-center"
        >
          <Input
            placeholder="Job Description"
            required
            minLength={5}
            onChange={(e) => setJobDescription(e.target.value)}
            value={jobDescription}
          />
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="submit"
            disabled={isUploading}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px font-semibold leading-6 text-white inline-block disabled:cursor-not-allowed mt-4 w-max"
          >
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </span>
            <motion.div
              layout
              className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-2.5 px-5 ring-1 ring-white/10"
            >
              <span>
                {isUploading
                  ? "Generating score..."
                  : file
                  ? "Generate score"
                  : "Upload a resume"}
              </span>
            </motion.div>
            <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
          </motion.button>
        </form>
      </div>
      <section ref={sectionRef}>
        {result && (
          <motion.div
            layout
            className="min-h-screen p-4 flex flex-col items-center pt-10 overflow-hidden"
          >
            <h1 className="text-4xl md:text-4xl font-bold max-w-7xl mx-auto text-center mt-6 relative z-20 py-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white mb-4">
              Result
            </h1>
            <div className="mb-8">
              <div className="relative">
                <Cover className="text-6xl font-semibold max-w-7xl mx-auto text-center relative z-20 bg-clip-text text-transparent bg-gradient-to-b from-neutral-800 via-neutral-700 to-neutral-700 dark:from-neutral-800 dark:via-white dark:to-white">
                  <span
                    className={`${
                      getColor(result.score).text
                    } px-2 py-1 rounded-md`}
                  >
                    {Math.round(result.score)}
                  </span>
                </Cover>
                <span
                  className={`absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 ${
                    getColor(result.score).bg
                  } to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40`}
                />
                <span className="absolute right-0 -bottom-6 text-neutral-400 dark:text-neutral-600 text-xs">
                  of 100
                </span>
              </div>
            </div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => {
                setResult(undefined);
                setFile(undefined);
                setJobDescription("");
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px font-semibold leading-6 text-white inline-block disabled:cursor-not-allowed mt-4 w-max"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <motion.div
                layout
                className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-2.5 px-5 ring-1 ring-white/10"
              >
                <span>Score Another Resume</span>
              </motion.div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              disabled={isBuilding}
              onClick={buildWebsite}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="bg-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px font-semibold leading-6 text-white inline-block disabled:cursor-not-allowed mt-4 mb-4 w-max"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <motion.div
                layout
                className="relative flex space-x-2 items-center z-10 rounded-full bg-zinc-950 py-2.5 px-5 ring-1 ring-white/10"
              >
                <span>
                  {isBuilding ? "Building Website..." : "Build My Website"}
                </span>
              </motion.div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </motion.button>
            <Card title="Summary" color={getColor(result.score).border}>
              <h1 className="text-lg font-medium mb-3">{result.name}</h1>
              <div className="mb-4 bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg flex flex-col gap-4">
                {result.experience.map((exp) => (
                  <div key={exp.company}>
                    <h2 className="text-xl font-semibold">{exp.title}</h2>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {exp.company} - {exp.location}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {exp.startDate} - {exp.endDate || "Current"}
                    </p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
              {result.skills.map((skill) => (
                <span
                  key={skill + Math.random()}
                  className="inline-block bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 px-2 py-1 rounded-md text-sm mr-2 mb-2"
                >
                  {skill}
                </span>
              ))}
            </Card>
            <Card title="Why Score" color={getColor(result.score).border}>
              <ul className="list-disc ml-4 text-pretty flex flex-col gap-2">
                {result.whyScore.map((reason) => (
                  <li
                    key={reason}
                    className="text-neutral-600 dark:text-neutral-200"
                  >
                    {reason}
                  </li>
                ))}
              </ul>
            </Card>
          </motion.div>
        )}
      </section>
    </main>
  );
}

function Card({
  title,
  children,
  color,
}: {
  title: string;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <div className="w-full max-w-3xl mx-auto border border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg p-4 mb-4 group">
      <h2 className="text-2xl font-bold text-muted-foreground">{title}</h2>
      <span
        className={`block h-px w-[20%] bg-gradient-to-r ${color} transition-opacity duration-500 group-hover:opacity-40 mb-2`}
      />
      {children}
    </div>
  );
}
