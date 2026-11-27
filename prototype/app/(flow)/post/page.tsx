'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chips, TopBar, WhenReady } from '@/components/ui';
import { captions, hashtags } from '@/lib/maco';
import { useStore } from '@/lib/store';

/** G 게시: photo + caption Maco drafted. Posting hands the photo and text to the channel app. */
export default function Post() {
  return <WhenReady><Body /></WhenReady>;
}

function Body() {
  const router = useRouter();
  const { analysis: a, data, session, setSession, toast } = useStore();
  const [tone, setTone] = useState(0);
  const caps = captions(a.noun);
  const text = session.caption ?? caps[0];
  const tags = hashtags(data.answers, a.noun);
  const album = useRef<HTMLInputElement>(null);

  const pickTone = (i: number) => { setTone(i); setSession({ caption: caps[i] }); };

  const pickFromAlbum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setSession({ photo: URL.createObjectURL(f), fromAlbum: true });
  };

  // navigator.clipboard needs https; on the phone's Wi-Fi address (http) fall back to a hidden textarea.
  const copy = async (s: string) => {
    try { await navigator.clipboard.writeText(s); return true; } catch { /* fall through */ }
    const ta = document.createElement('textarea');
    ta.value = s; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select(); ta.setSelectionRange(0, s.length);
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  };

  const post = async () => {
    const full = `${text}\n\n${tags}`;
    try {
      if (session.photo && navigator.canShare) {
        const blob = await (await fetch(session.photo)).blob();
        const file = new File([blob], 'maco.jpg', { type: blob.type || 'image/jpeg' });
        if (navigator.canShare({ files: [file] })) {
          await copy(full);
          await navigator.share({ files: [file], text: full });
          router.push('/record');
          return;
        }
      }
      toast((await copy(full)) ? `문구를 복사했어요. ${a.channel}에서 붙여 넣으세요` : `${a.channel}에 올린 뒤 기록해 주세요`);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return; // user closed the share sheet
      toast(`${a.channel}에 올린 뒤 기록해 주세요`);
    }
    setTimeout(() => router.push('/record'), 900);
  };

  return (
    <main className="screen fade">
      <TopBar title="게시하기" step="2/3" backHref={session.busy ? '/today' : '/shoot'} />
      <div className="pic">
        {session.photo
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={session.photo} alt="올릴 사진" />
          : <span>{session.busy ? '앨범에서 예전 사진을 골라 주세요' : '사진이 아직 없어요'}</span>}
        {session.busy || session.fromAlbum
          ? <button className="again" type="button" onClick={() => album.current?.click()}>{session.photo ? '다른 사진' : '앨범 열기'}</button>
          : <button className="again" type="button" onClick={() => router.push('/shoot')}>다시 찍기</button>}
      </div>
      <input ref={album} className="sr-only" type="file" accept="image/*" onChange={pickFromAlbum} tabIndex={-1} aria-hidden="true" />
      <label className="lbl" htmlFor="caption">한 줄 소개 <span className="tag">마코 추천</span></label>
      <textarea id="caption" className="cap" value={text} onChange={(e) => setSession({ caption: e.target.value })} />
      <div className="cap-meta"><span className="tags">{tags}</span><span>{text.length}자</span></div>
      <Chips label="말투" items={['기본', '짧게', '친근하게']} value={tone} onChange={pickTone} />
      <div className="bottom">
        <button className="btn" type="button" onClick={post}>{a.channel}에 올리기</button>
        <div className="foot">사진과 문구를 {a.channel} 앱으로 넘겨 드려요</div>
      </div>
    </main>
  );
}
