/** Re-mounts on every navigation, so each screen eases in like a native app. */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route">{children}</div>;
}
