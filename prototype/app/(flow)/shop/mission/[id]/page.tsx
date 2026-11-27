'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { WhenReady } from '@/components/ui';
import { useTrain } from '@/components/train/common';
import { TI } from '@/components/train/icons';
import { MISSIONS, missionOpen } from '@/components/train/shop';
import { gradeText, judgePhoto, type Graded, type PhotoCheck } from '@/lib/ai/adapter';
import { XP, addXp } from '@/lib/train/engine';

/** S19 미션 제출·첨삭 (D1·D2): 사장님이 직접 하고, 마코는 채점만. 첨삭 통과 시 +50 XP. */
export default function Mission() {
  return <WhenReady><Body /></WhenReady>;
}

const REVIEW = '★3 "무화과 케이크는 맛있는데 조금 달았어요. 자리도 좁았고요."';

function Body() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, p, setProg, setTrain, today } = useTrain();
  const m = MISSIONS.find((x) => x.id === id);
  const [img, setImg] = useState<string | null>(null);
  const [photo, setPhoto] = useState<PhotoCheck | null>(null);
  const [text, setText] = useState('');
  const [graded, setGraded] = useState<Graded | null>(null);
  if (!m || !missionOpen(t, m)) { if (typeof window !== 'undefined') router.replace('/shop'); return null; }

  const pass = (score: number) => {
    if (p.missions[m.id]) return;
    setProg((pp) => ({ missions: { ...pp.missions, [m.id]: { date: today, score } } }));
    setTrain((s) => addXp(s, today, XP.mission));
  };
  const onPhoto = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImg(url);
    const im = new Image();
    im.onload = () => {
      const w = 160, h = Math.max(1, Math.round((im.height / im.width) * 160));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d')!; ctx.drawImage(im, 0, 0, w, h);
      const res = judgePhoto(ctx.getImageData(0, 0, w, h).data, w, h);
      setPhoto(res);
      if (res.pass) pass(100);
    };
    im.src = url;
  };
  const check = () => {
    const g = gradeText('complaint', text);
    setGraded(g);
    if (g.pass) pass(g.score);
  };
  const done = p.missions[m.id];

  return (
    <main className="screen t-screen">
      <div className="t-ltop flat"><button type="button" onClick={() => router.push('/shop')} aria-label="닫기">{TI.close}</button><span className="t-where">실전 미션</span></div>
      <h1 className="t-h1">{m.title}</h1>
      <p className="t-sub">{m.desc}</p>
      {m.id === 'm-photo' ? (
        <>
          <label className="t-upload">
            {TI.camera}<b>{img ? '다시 찍기' : '사진 찍기 / 고르기'}</b><span>창가 자연광 · 주인공 하나 크게</span>
            <input type="file" accept="image/*" capture="environment" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          {img && <img className="t-shot" src={img} alt="올린 사진" />}
          {photo && (
            <div className={`t-feedback inline ${photo.pass ? 'good' : 'bad'}`}>
              <h4>{photo.pass ? TI.check : TI.cross}{photo.pass ? '첨삭 통과!' : '한 번만 다시 찍어 봐요'}</h4>
              <p><b>잘한 점</b> {photo.good}{photo.fix && <><br /><b>고칠 점</b> {photo.fix}</>}</p>
              <p className="t-muted">밝기 {photo.brightness} · 선명도 {photo.sharpness} (규칙으로 계산한 값이에요)</p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="t-context">{p.mode === 'learn' ? '연습 가게 리뷰 · ' : '최근 리뷰 · '}{REVIEW}</div>
          <textarea id="mission-reply" className="t-area" rows={5} maxLength={300} value={text} placeholder="답글을 직접 써 보세요" onChange={(e) => setText(e.target.value)} aria-label="답글" />
          <button type="button" className="btn accent" disabled={text.trim().length < 8} onClick={check}>첨삭받기</button>
          {graded && (
            <div className={`t-feedback inline ${graded.pass ? 'good' : 'bad'}`}>
              <h4>{graded.pass ? TI.check : TI.cross}{graded.pass ? `첨삭 통과 · ${graded.score}점` : `${graded.score}점 · 조금만 고쳐 봐요`}</h4>
              <ul className="t-rubric">{graded.checks.map((c) => <li key={c.label} className={c.ok ? 'ok' : ''}>{c.ok ? TI.check : TI.cross}{c.label}</li>)}</ul>
              <p><b>잘한 점</b> {graded.good}{graded.fix && <><br /><b>고칠 점</b> {graded.fix}</>}</p>
            </div>
          )}
        </>
      )}
      {done && <p className="t-done-note">{TI.check} 미션 완료 · +{XP.mission} XP{p.mode === 'shop' ? ' · 다음 주간 체크인 때 다시 캡처해서 관문 점수 변화를 봐요' : ''}</p>}
    </main>
  );
}
