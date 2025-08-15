import React from 'react';

const Avatar = ({ 
  user, 
  size = 'md', 
  className = '', 
  showOnlineStatus = false,
  isOnline = false 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const onlineStatusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5'
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const profileImage = user?.profilePicture || user?.avatar;
  const userName = user?.name || 'Unknown User';
  const initials = getInitials(userName);

  return (
    <div className={`relative ${className}`}>
      <div className={`${sizeClasses[size]} bg-green-500 rounded-full flex items-center justify-center text-white font-semibold overflow-hidden`}>
        {profileImage ? (
          <>
            <img 
              src={profileImage} 
              alt={userName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <span className="hidden w-full h-full flex items-center justify-center">
              {initials}
            </span>
          </>
        ) : (
          <span className="flex items-center justify-center">
            {initials}
          </span>
        )}
      </div>
      
      {showOnlineStatus && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${onlineStatusSizes[size]} rounded-full border-2 border-white ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
      )}
    </div>
  );
};

export default Avatar;