import type { LoaderAudio } from "../shared/types";
import { Loader } from "./Loader";
import preloaderLoopUrl from "./audio/Danny ElfmanThe Hulk(2003)-Main Theme (mp3cut.net).mp3?url";

export const loaderAudio: LoaderAudio = {
  loop: preloaderLoopUrl,
  volume: 0.7,
};

export { Loader };
