import { Suspense } from "react";
import { ReserveFlow } from "./ReserveFlow";

export const metadata = { title: "Reserve a table" };

export default function ReservePage() {
  return (
    <Suspense>
      <ReserveFlow />
    </Suspense>
  );
}
