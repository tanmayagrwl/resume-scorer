import { getResume } from "@/lib/actions/file";
import { notFound, redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  const resume = await getResume(id);

  if (!resume) {
    notFound()
  }

  return (
    <div className="bg-white min-h-screen pt-10">
      <div className="mx-auto max-w-3xl px-4 md:p-0 text-zinc-800">
        <h1 className="mb-3 text-3xl font-semibold">Hi, I'm {resume.name}</h1>
        <p className="text-zinc-800">
          {resume.introduction}
        </p>
        <section className="mt-4">
          <h2 className="mb-2 text-2xl font-semibold">Links</h2>
          <div className="flex flex-wrap gap-2">
            {resume?.links.linkedin && (
              <a href={resume.links.linkedin} className="text-blue-500 underline">
                LinkedIn
              </a>
            )}
            {resume?.links.github && (
              <a href={resume.links.github} className="text-blue-500 underline">
                GitHub
              </a>
            )}
            {resume?.links.portfolio && (
              <a href={resume.links.portfolio} className="text-blue-500 underline">
                Portfolio
              </a>
            )}
            {resume?.links.personal && (
              <a href={resume.links.personal} className="text-blue-500 underline">
                Personal Website
              </a>
            )}
          </div>
        </section>
        <p className="mt-4 text-zinc-800">
          Feel free to connect with me on LinkedIn or GitHub!
        </p>
        <section className="mt-8">
          <h2 className="mb-2 text-2xl font-semibold">Projects</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {resume?.projects.map((project) => {
              return (
                <article className="group rounded-md border border-border/10 px-4 pb-3 pt-2" key={project.name}>
                  <a href={project.link || "#"} className="block">
                    <h3 className="w-fit group-hover:text-main group-hover:underline">
                      {project.name}
                    </h3>
                    <p className=" text-sm text-zinc-500">
                      {project.description}
                    </p>
                  </a>
                </article>
              );
            })}
          </div>
        </section>
        <section className="mt-8">
          <h2 className="mb-2 text-2xl font-semibold">Education</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {resume?.education.map((edu) => {
              return (
                <article className="group rounded-md border border-border/10 px-4 pb-3 pt-2" key={edu.school}>
                  <h3 className="w-fit group-hover:text-main group-hover:underline">
                    {edu.degree} in {edu.fieldOfStudy}
                  </h3>
                  <p className=" text-sm text-zinc-500">
                    {edu.school} ({edu.startDate} - {edu.endDate || "Present"})
                  </p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="mt-8 pb-20">
          <h2 className="mb-2 text-2xl font-semibold">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume?.skills.map((skill) => (
              <span key={skill} className="px-2 py-1 bg-gray-200 rounded-full text-sm">
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
