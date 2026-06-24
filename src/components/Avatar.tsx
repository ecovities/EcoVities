interface AvatarProps {
  seed: string;
  size?: number;
  className?: string;
}

export function Avatar({ seed, size = 36, className = "" }: AvatarProps) {
  const url = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c8f0ce`;
  return (
    <img
      src={url}
      alt={seed}
      className={`rounded-full object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

const PALETTE = [
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-green-100", text: "text-green-700" },
  { bg: "bg-purple-100", text: "text-purple-700" },
  { bg: "bg-orange-100", text: "text-orange-700" },
  { bg: "bg-pink-100", text: "text-pink-700" },
  { bg: "bg-indigo-100", text: "text-indigo-700" },
  { bg: "bg-teal-100", text: "text-teal-700" },
];

export function colorForName(name: string) {
  const idx = name.charCodeAt(0) % PALETTE.length;
  return PALETTE[idx];
}

interface InitialAvatarProps {
  name: string;
  size?: number;
  isBusiness?: boolean;
  icon?: string;
}

/** Letter-circle avatar matching the prototype's contact list style. */
export function InitialAvatar({ name, size = 56, isBusiness, icon }: InitialAvatarProps) {
  const { bg, text } = colorForName(name);
  const dim = `${size}px`;

  if (isBusiness && icon) {
    return (
      <div
        className={`rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-700 shadow-sm`}
        style={{ width: dim, height: dim }}
      >
        <span className="material-symbols-rounded" style={{ fontSize: size * 0.45 }}>
          {icon}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-full ${bg} ${text} flex items-center justify-center font-medium shadow-sm`}
      style={{ width: dim, height: dim, fontSize: size * 0.32 }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}
