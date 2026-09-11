import { useEffect, useState } from "react";
import Landing from "./components/Landing";
import Processing from "./components/Processing";
import WorkmanResult from "./components/WorkmanResult";
import Workshop from "./components/Workshop";
import TaskView from "./components/TaskView";
import {
  submitWorkmanHandle,
  submitWork,
  submitSignal,
  fetchWorkmanState,
} from "./api";
import "./App.css";

const VIEWS = {
  LANDING: "landing",
  PROCESSING: "processing",
  RESULT: "result",
  WORKSHOP: "workshop",
  TASK_WORK: "task_work",
  TASK_SIGNAL: "task_signal",
};

// Only the handle is persisted, so a refresh can re-enter as the same
// Workman. The Workman ID and completion state are always re-derived
// from the backend, not trusted from local storage — this isn't a
// second identity system, just a pointer back to the existing one.
const STORAGE_KEY = "hoods-works:handle";

export default function App() {
  const [view, setView] = useState(VIEWS.LANDING);
  const [workman, setWorkman] = useState(null);
  const [progress, setProgress] = useState({ workCompleted: false, signalCompleted: false });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // On load, if a handle was saved from a previous visit, silently
  // re-register (deterministic — always returns the same Workman ID)
  // and restore their task completion state, then drop straight into
  // the Workshop instead of the landing form.
  useEffect(() => {
    const savedHandle = localStorage.getItem(STORAGE_KEY);
    if (!savedHandle) return;

    (async () => {
      try {
        const data = await submitWorkmanHandle(savedHandle);
        setWorkman(data);
        const state = await fetchWorkmanState(data.handle);
        setProgress(state);
        setView(VIEWS.WORKSHOP);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    })();
  }, []);

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
      localStorage.setItem(STORAGE_KEY, data.handle);

      const state = await fetchWorkmanState(data.handle);
      setProgress(state);

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
    localStorage.removeItem(STORAGE_KEY);
    setWorkman(null);
    setProgress({ workCompleted: false, signalCompleted: false });
    setError("");
    setView(VIEWS.LANDING);
  }

  function handleOpenTask(key) {
    if (key === "work") setView(VIEWS.TASK_WORK);
    if (key === "signal") setView(VIEWS.TASK_SIGNAL);
  }

  function handleReturnToWorkshop() {
    setView(VIEWS.WORKSHOP);
  }

  async function handleSubmitWork(responseText) {
    const result = await submitWork(workman.handle, workman.workmanId, responseText);
    setProgress((prev) => ({ ...prev, workCompleted: result.workCompleted }));
  }

  async function handleSubmitSignal(responseText) {
    const result = await submitSignal(workman.handle, workman.workmanId, responseText);
    setProgress((prev) => ({ ...prev, signalCompleted: result.signalCompleted }));
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
        <Workshop
          workman={workman}
          progress={progress}
          onExit={handleExitWorkshop}
          onOpenTask={handleOpenTask}
        />
      )}
      {view === VIEWS.TASK_WORK && workman && (
        <TaskView
          cornerTl="HW / TASK 001"
          cornerTr="THE WORK"
          taskLabel="TASK 001"
          title="LEAVE YOUR MARK."
          supportText="Tell us what you bring to the workshop."
          placeholder="I bring..."
          fieldType="input"
          submitLabel="SUBMIT THE WORK"
          receivingText="WORK RECEIVED…"
          completeHeadline="TASK 001 COMPLETE."
          completeSupportText="Every Workman leaves something behind."
          workman={workman}
          onSubmit={handleSubmitWork}
          onReturn={handleReturnToWorkshop}
        />
      )}
      {view === VIEWS.TASK_SIGNAL && workman && (
        <TaskView
          cornerTl="HW / TASK 002"
          cornerTr="THE SIGNAL"
          taskLabel="TASK 002"
          title="WHAT DO YOU EXPECT FROM HOODS WORKS?"
          supportText="Tell us what you want to see from the team."
          placeholder="What would you like Hoods Works to build, experiment with, or bring to the community?"
          fieldType="textarea"
          submitLabel="SEND SIGNAL"
          receivingText="SIGNAL RECEIVED…"
          completeHeadline="SIGNAL TRANSMITTED ✓"
          completeSupportText="The workshop is listening."
          workman={workman}
          onSubmit={handleSubmitSignal}
          onReturn={handleReturnToWorkshop}
        />
      )}
    </>
  );
}
