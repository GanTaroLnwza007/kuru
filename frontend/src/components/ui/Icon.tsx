type IconProps = {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
};

export function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 1.75,
  className,
}: IconProps) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24" as const,
    fill: "none",
    stroke: color,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
  };

  switch (name) {
    case "arrow-left":
      return <svg {...props}><path d="M19 12H5M11 18l-6-6 6-6"/></svg>;
    case "arrow-right":
      return <svg {...props}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
    case "search":
      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>;
    case "filter":
      return <svg {...props}><path d="M4 5h16M7 12h10M10 19h4"/></svg>;
    case "close":
      return <svg {...props}><path d="M6 6l12 12M18 6 6 18"/></svg>;
    case "heart":
      return <svg {...props}><path d="M12 20.5s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3.5c0 5.5-7.5 10-7.5 10z"/></svg>;
    case "heart-fill":
      return <svg {...props} fill={color}><path d="M12 20.5s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7.5 3.5c0 5.5-7.5 10-7.5 10z"/></svg>;
    case "pin":
      return <svg {...props}><path d="M12 21v-7M8 4h8l-1 6 3 3H6l3-3z"/></svg>;
    case "pin-fill":
      return <svg {...props} fill={color}><path d="M12 21v-7M8 4h8l-1 6 3 3H6l3-3z"/></svg>;
    case "flag":
      return <svg {...props}><path d="M5 21V4M5 4h12l-2 4 2 4H5"/></svg>;
    case "brain":
      return <svg {...props}><path d="M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 3 3 3 0 0 0 1 2 3 3 0 0 0 2 4 3 3 0 0 0 3 2v-3"/><path d="M15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 3 3 3 0 0 1-1 2 3 3 0 0 1-2 4 3 3 0 0 1-3 2V8"/><path d="M9 4a3 3 0 0 1 6 0"/></svg>;
    case "palette":
      return <svg {...props}><path d="M12 3a9 9 0 1 0 0 18c1 0 2-1 2-2 0-1.5-1-2-1-3 0-1 1-2 2-2h2a4 4 0 0 0 4-4c0-4.5-4-7-9-7z"/><circle cx="7.5" cy="11" r="1" fill={color}/><circle cx="9.5" cy="7" r="1" fill={color}/><circle cx="14.5" cy="7" r="1" fill={color}/></svg>;
    case "rocket":
      return <svg {...props}><path d="M14 6c4 0 6 3 6 6-3 0-6-2-6-6zM14 6c-3 1-6 4-7 8l3 3c4-1 7-4 8-7M9 18l-2 2M11 14l-3 3"/></svg>;
    case "list":
      return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>;
    case "play":
      return <svg {...props} fill={color}><path d="M7 4v16l13-8z"/></svg>;
    case "sparkles":
      return <svg {...props}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>;
    case "briefcase":
      return <svg {...props}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>;
    case "chat":
      return <svg {...props}><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z"/></svg>;
    case "check":
      return <svg {...props}><path d="m5 12 5 5L20 7"/></svg>;
    case "coins":
      return <svg {...props}><ellipse cx="9" cy="8" rx="6" ry="3"/><path d="M3 8v4c0 1.7 2.7 3 6 3"/><ellipse cx="15" cy="14" rx="6" ry="3"/><path d="M9 14v4c0 1.7 2.7 3 6 3s6-1.3 6-3v-4"/></svg>;
    case "trending":
      return <svg {...props}><path d="m3 17 6-6 4 4 8-8M14 7h7v7"/></svg>;
    case "star-fill":
      return <svg {...props} fill={color}><path d="m12 3 2.7 5.7 6.3.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.3-.9z"/></svg>;
    case "graduation":
      return <svg {...props}><path d="M2 9 12 4l10 5-10 5z"/><path d="M6 11v5c0 1 3 2 6 2s6-1 6-2v-5M22 9v5"/></svg>;
    case "leaf":
      return <svg {...props}><path d="M5 19c8 0 14-6 14-14C9 5 5 11 5 19z"/><path d="M5 19c4-4 8-6 14-14"/></svg>;
    default:
      return <svg {...props}><circle cx="12" cy="12" r="3"/></svg>;
  }
}
