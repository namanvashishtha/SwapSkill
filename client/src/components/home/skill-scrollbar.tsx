import { skillIcons } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SkillScrollbar() {
  // Double the skills array to create a seamless loop
  const doubledSkills = [...skillIcons, ...skillIcons];

  return (
    <div className="bg-white py-4 overflow-hidden">
      <h3 className="text-center text-gray-500 mb-2 font-medium">POPULAR SKILLS</h3>
      <div className="skill-scrollbar-container overflow-hidden relative">
        <div className="skill-scrollbar">
          {doubledSkills.map((skill, index) => (
            <motion.div
              key={`${skill.id}-${index}`}
              whileHover={{ scale: 1.1 }}
              className="flex flex-col items-center mx-4"
            >
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center ${skill.bgColor} ${skill.textColor} mb-1`}
                dangerouslySetInnerHTML={{ __html: skill.icon }}
              ></div>
              <span className="text-sm">{skill.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
