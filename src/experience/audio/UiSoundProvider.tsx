import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useStory } from "../story/StoryProvider";
import { UiSoundService } from "./uiSoundService";

const UiSoundContext = createContext<UiSoundService | null>(null);

export function UiSoundProvider({ children }: PropsWithChildren) {
  const { isReady, state } = useStory();
  const [service] = useState(() => new UiSoundService());

  useEffect(() => {
    service.setEnabled(isReady ? state.preferences.soundEnabled : true);
  }, [isReady, service, state.preferences.soundEnabled]);

  useEffect(() => {
    const prime = () => {
      service.prime();
    };

    window.addEventListener("pointerdown", prime, { passive: true });
    window.addEventListener("keydown", prime);

    return () => {
      window.removeEventListener("pointerdown", prime);
      window.removeEventListener("keydown", prime);
    };
  }, [service]);

  const contextValue = useMemo(() => service, [service]);

  return (
    <UiSoundContext.Provider value={contextValue}>
      {children}
    </UiSoundContext.Provider>
  );
}

export function useUiSoundService() {
  const service = useContext(UiSoundContext);
  if (!service) {
    throw new Error("useUiSoundService must be used within UiSoundProvider");
  }

  return service;
}
