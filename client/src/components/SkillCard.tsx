type SkillCardProps = {
  title: string;
  description: string;
  icon: string;
  color: string;
  teachers: number;
  learners: number;
};

export default function SkillCard({ 
  title, 
  description, 
  icon, 
  color, 
  teachers, 
  learners 
}: SkillCardProps) {
  const getBgColor = () => {
    switch (color) {
      case 'primary': return 'bg-primary';
      case 'secondary': return 'bg-secondary';
      case 'accent': return 'bg-accent';
      default: return 'bg-primary';
    }
  };
  
  return (
    <div className="pt-6 hover-pop">
      <div className="flow-root bg-white rounded-lg px-6 pb-8 shadow-md">
        <div className="-mt-6">
          <div>
            <span className={`inline-flex items-center justify-center p-3 ${getBgColor()} rounded-md shadow-lg`}>
              <i className={`fas ${icon} text-white text-xl`}></i>
            </span>
          </div>
          <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">{title}</h3>
          <p className="mt-5 text-base text-gray-500">
            {description}
          </p>
          <div className="mt-5 flex items-center text-sm text-gray-500">
            <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">
              <span className="mr-1">●</span> {teachers} teachers
            </span>
            <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              <span className="mr-1">●</span> {learners} learners
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
