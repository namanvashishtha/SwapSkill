import SkillIcon from "./SkillIcon";
import { skills } from "@/lib/utils";

export default function SkillRibbon() {
  return (
    <div className="overflow-hidden w-full h-16 mt-4">
      <div className="skill-ribbon flex animate-scroll">
        {/* First set of icons */}
        <div className="flex space-x-8 items-center">
          {skills.map((skill, index) => (
            <SkillIcon key={`skill-1-${index}`} name={skill.name} icon={skill.icon} />
          ))}
        </div>
        
        {/* Duplicate set for infinite scroll effect */}
        <div className="flex space-x-8 items-center">
          {skills.map((skill, index) => (
            <SkillIcon key={`skill-2-${index}`} name={skill.name} icon={skill.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}
