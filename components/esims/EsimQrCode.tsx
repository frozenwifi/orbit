interface EsimQrCodeProps {
  value: string;
}

const SIZE = 29;

function finderValue(x: number, y: number, originX: number, originY: number) {
  const dx = x - originX;
  const dy = y - originY;
  if (dx < 0 || dx > 6 || dy < 0 || dy > 6) return null;
  return dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4);
}

function cellValue(x: number, y: number, seed: number) {
  const finder = finderValue(x, y, 0, 0) ?? finderValue(x, y, SIZE - 7, 0) ?? finderValue(x, y, 0, SIZE - 7);
  if (finder !== null) return finder;
  if ((x < 8 && y < 8) || (x >= SIZE - 8 && y < 8) || (x < 8 && y >= SIZE - 8)) return false;
  if (x === 6 || y === 6) return (x + y) % 2 === 0;
  return ((x * 17 + y * 31 + seed + x * y * 7) % 13) < 6;
}

export function EsimQrCode({ value }: EsimQrCodeProps) {
  const seed = [...value].reduce((total, character, index) => total + character.charCodeAt(0) * (index + 3), 0);
  return (
    <span className="esim-qr-code" role="img" aria-label="eSIM activation QR code">
      {Array.from({ length: SIZE * SIZE }, (_, index) => {
        const x = index % SIZE;
        const y = Math.floor(index / SIZE);
        return <i className={cellValue(x, y, seed) ? "filled" : ""} key={index} aria-hidden="true" />;
      })}
    </span>
  );
}
