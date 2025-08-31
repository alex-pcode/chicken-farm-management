import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  name, 
  size = 'md', 
  className = '' 
}) => {
  const getInitials = (fullName: string): string => {
    if (!fullName) return '?';
    
    const names = fullName.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl'
  };

  const baseClasses = `
    inline-flex items-center justify-center rounded-full 
    bg-gradient-to-br from-[#524AE6] to-[#4338CA] 
    text-white font-semibold shadow-sm
    ${sizeClasses[size]}
    ${className}
  `;

  if (src) {
    return (
      <div className={baseClasses}>
        <img
          src={src}
          alt={`${name}'s avatar`}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.textContent = getInitials(name);
          }}
        />
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {getInitials(name)}
    </div>
  );
};