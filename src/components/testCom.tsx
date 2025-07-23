import { motion } from 'framer-motion';

export const StatCard = ({title, total, label}: {title: string, total: number | string, label: React.ReactNode}) => {
  return  (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="neu-stat"
    >
      <h3 className="text-lg font-medium text-gray-600">{title}</h3>
      <p className="text-4xl font-bold mt-2 text-gray-900">{total}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </motion.div>
  );
};