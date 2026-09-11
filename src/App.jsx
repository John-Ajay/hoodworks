import { useState } from "react";
import Landing from "./components/Landing";
import Processing from "./components/Processing";
import WorkmanResult from "./components/WorkmanResult";
import Workshop from "./components/Workshop";
import { submitWorkmanHandle } from "./api";
import "./App.css";

const VIEWS = {
  LANDING: "landing",
  PROCESSING: "processing",
  RESULT: "result",
  WORKSHOP: "workshop",
};

export default function App() {
  const [view, setView] = useState(VIEWS.LANDING);
  const [workman, setWorkman] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(rawHandle) {
    setError("");

    if (!rawHandle || !rawHandle.trim()) {
      setError("ENTER YOUR X HANDLE.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await submitWorkmanHandle(rawHandle);
      setWorkman(data);
      setIsLoading(false);
      setView(VIEWS.PROCESSING);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || "THAT HANDLE DOESN'T LOOK RIGHT.");
    }
  }

  function handleProcessingDone() {
    setView(VIEWS.RESULT);
  }

  function handleEnterWorkshop() {
    setView(VIEWS.WORKSHOP);
  }

  function handleExitWorkshop() {
    setWorkman(null);
    setError("");
    setView(VIEWS.LANDING);
  }

  return (
    <>
      {view === VIEWS.LANDING && (
        <Landing onSubmit={handleSubmit} error={error} isLoading={isLoading} />
      )}
      {view === VIEWS.PROCESSING && <Processing onDone={handleProcessingDone} />}
      {view === VIEWS.RESULT && workman && (
        <WorkmanResult workman={workman} onEnterWorkshop={handleEnterWorkshop} />
      )}
      {view === VIEWS.WORKSHOP && workman && (
        <Workshop workman={workman} onExit={handleExitWorkshop} />
      )}
    </>
  );
}
