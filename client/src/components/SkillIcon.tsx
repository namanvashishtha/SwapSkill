type SkillIconProps = {
  name: string;
  icon: string;
};

export default function SkillIcon({ name, icon }: SkillIconProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover-pop">
        <i className={`fas ${icon} text-primary text-xl`}></i>
      </div>
      <span className="text-xs mt-1 text-white">{name}</span>
    </div>
  );
}
