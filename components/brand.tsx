import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand rx-brand" aria-label="Roxodeal home">
      <img src="/roxodeal-mark.svg" width="42" height="42" alt="" />
      <span>Roxodeal</span>
    </Link>
  );
}
