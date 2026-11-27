import { TabBar } from '@/components/ui';
import { SideNav } from '@/components/SideNav';

/** 휴대폰: 화면 + 아래 탭 바. 컴퓨터: 왼쪽 메뉴 + 가운데 화면. */
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="shell">
        <SideNav />
        <div className="shell-main">{children}</div>
      </div>
      <TabBar />
    </>
  );
}
