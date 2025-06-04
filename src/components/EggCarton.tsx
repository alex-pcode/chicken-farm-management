import { motion } from 'framer-motion';

interface EggCartonProps {
  count: number;
  maxEggs: number;
  onEggClick: (index: number) => void;
}

export const EggCarton = ({ count, maxEggs, onEggClick }: EggCartonProps) => {
  const rows = Math.ceil(maxEggs / 6);
  const eggSpots = Array(maxEggs).fill(null);

  return (
    <div 
      className="relative mx-auto"
      style={{
        perspective: '1000px',
      }}
    >
      <motion.div
        className="bg-[#e6d5c3] rounded-3xl p-6 shadow-inner"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(20deg)',
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <div 
          className={`grid gap-4`}
          style={{
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: 'repeat(6, 1fr)',
          }}
        >
          {eggSpots.map((_, index) => (
            <motion.button
              key={index}
              className={`aspect-square rounded-full relative cursor-pointer 
                ${index < count ? 'bg-white' : 'bg-[#d4c3b1]'}`}
              onClick={() => onEggClick(index)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: index < count 
                  ? 'inset -2px -2px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.8)'
                  : 'inset 2px 2px 6px rgba(0,0,0,0.1)',
              }}
            >
              <motion.div
                initial={false}
                animate={{
                  scale: index < count ? 1 : 0,
                  opacity: index < count ? 1 : 0,
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-100"
                style={{
                  boxShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}
              />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};