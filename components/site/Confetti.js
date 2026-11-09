// Decorative confetti bits. Positions are fixed so server and client render identically.
const BITS = [
  ["dot", 12, 4, "#f26a21", 0], ["sq", 29, 2, "#139485", 22], ["ring", 54, 3, "#ffc53d", 0], ["plus", 8, 78, "#f26a21", 0],
  ["dot", 44, 1.5, "#f4a3bf", 0], ["sq", 16, 92, "#139485", 45], ["dot", 63, 95, "#ffc53d", 0],
  ["dot", 78, 10, "#f26a21", 0], ["plus", 86, 4, "#ffc53d", 0], ["ring", 70, 88, "#139485", 0],
  ["dot", 92, 50, "#f4a3bf", 0], ["dot", 34, 97, "#f26a21", 0],
];

// edges: only use shapes in the outer margins, so they never sit behind text.
export default function Confetti({ count = BITS.length, edges = false }) {
  const bits = edges ? BITS.filter(([, , left]) => left <= 4 || left >= 88) : BITS;
  return (
    <div className="bf-confetti" aria-hidden="true">
      {bits.slice(0, count).map(([shape, top, left, color, rot], i) => (
        <span
          key={i}
          className={`cf ${shape}`}
          style={{ top: `${top}%`, left: `${left}%`, color, transform: rot ? `rotate(${rot}deg)` : undefined }}
        />
      ))}
    </div>
  );
}
