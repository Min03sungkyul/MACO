/** 상황극 말풍선: customer(손님) 왼쪽, owner(사장님) 오른쪽 */
export function ChatBubble({ role, text }: { role: 'customer' | 'owner'; text: string }) {
  const mine = role === 'owner';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <p className={`max-w-[80%] whitespace-pre-line rounded-card px-4 py-2.5 text-[15px] ${mine ? 'bg-accent text-bg' : 'bg-soft text-ink'}`}>{text}</p>
    </div>
  );
}
