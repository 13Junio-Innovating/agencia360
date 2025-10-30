export function Currency({ value }: { value: number }) {
  return <span>R$ {value.toFixed(2)}</span>;
}