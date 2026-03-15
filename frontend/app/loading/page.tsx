import { Suspense } from "react";
import LoadingState from "@/app/pages/LoadingState";

export default function LoadingPage() {
     return (
          <Suspense
               fallback={
                    <div className="text-cyan-400 font-mono flex h-screen w-screen items-center justify-center">
                         Loading scanner...
                    </div>
               }
          >
               <LoadingState />
          </Suspense>
     );
}
