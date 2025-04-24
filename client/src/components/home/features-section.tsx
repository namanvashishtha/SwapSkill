import { features } from "@/lib/utils";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  return (
    <div id="features" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-poppins font-bold multi-color-hover">
            How SwapSkill Works
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Join our community of passionate learners and skilled teachers to exchange knowledge and grow together.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -10, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div 
                className={`w-14 h-14 rounded-full ${feature.bgColor} flex items-center justify-center mb-4`}
                dangerouslySetInnerHTML={{ __html: feature.icon }}
              ></div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
