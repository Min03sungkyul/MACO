'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/ui';
import { useStore } from '@/lib/store';

/** F 촬영: opens the phone camera (or the album) through a file input, with a framing guide. */
export default function Shoot() {
  const router = useRouter();
  const { session, setSession } = useStore();
  const cam = useRef<HTMLInputElement>(null);
  const album = useRef<HTMLInputElement>(null);

  const onFile = (fromAlbum: boolean) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (session.photo) URL.revokeObjectURL(session.photo);
    setSession({ photo: URL.createObjectURL(f), fromAlbum });
    router.push('/post');
  };

  return (
    <main className="screen dark shoot">
      <TopBar title="촬영" step="1/3" close backHref="/today" />
      <div className="vf">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {session.photo && <img src={session.photo} alt="찍은 사진" />}
        <div className="guide">위에서 내려다보듯 찍어 보세요</div>
        <div className="frame" aria-hidden="true" />
      </div>
      <div className="tips"><span>밝은 창가</span><span>접시는 가운데</span><span>배경은 단순하게</span></div>
      <div className="shut">
        <button className="alb" type="button" aria-label="앨범에서 고르기" onClick={() => album.current?.click()}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 16 5-5 4 4 3-3 6 6" /></svg>
        </button>
        <button className="btnS" type="button" aria-label="찍기" onClick={() => cam.current?.click()} />
        {session.photo ? <button className="use" type="button" onClick={() => router.push('/post')}>이 사진 쓰기</button> : <span />}
      </div>
      <input ref={cam} className="sr-only" type="file" accept="image/*" capture="environment" onChange={onFile(false)} tabIndex={-1} aria-hidden="true" />
      <input ref={album} className="sr-only" type="file" accept="image/*" onChange={onFile(true)} tabIndex={-1} aria-hidden="true" />
    </main>
  );
}
