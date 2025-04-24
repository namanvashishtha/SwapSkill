type TestimonialCardProps = {
  name: string;
  location: string;
  image: string;
  text: string;
};

export default function TestimonialCard({ name, location, image, text }: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover-pop">
      <div className="flex items-center mb-4">
        <img className="h-12 w-12 rounded-full object-cover" src={image} alt={name} />
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-900">{name}</h3>
          <div className="flex items-center">
            <p className="text-sm text-gray-500">{location}</p>
          </div>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-gray-600">{text}</p>
      </div>
    </div>
  );
}
