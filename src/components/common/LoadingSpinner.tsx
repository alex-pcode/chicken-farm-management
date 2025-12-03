import { motion } from 'framer-motion';

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <motion.div
        className="relative w-16 h-16"
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="absolute w-full h-full rounded-full border-4 border-primary-light opacity-20" />
        <div className="absolute w-full h-full rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </motion.div>
    </div>
  );
};