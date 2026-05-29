import { Link } from "react-router-dom";

export default function Avatar({ user, size = "md", showName = false }) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-2xl",
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  const avatarContent = user?.avatar_url ? (
    <img
      src={user.avatar_url}
      alt={user.name}
      className={`${sizeClasses[size]} rounded-full object-cover`}
    />
  ) : (
    <div
      className={`${sizeClasses[size]} rounded-full bg-[#ffc400] text-black font-bold flex items-center justify-center`}
    >
      {getInitials(user?.name)}
    </div>
  );

  if (showName) {
    return (
      <div className="flex items-center gap-2">
        {avatarContent}
        <span className="text-white">{user?.name}</span>
      </div>
    );
  }

  return avatarContent;
}