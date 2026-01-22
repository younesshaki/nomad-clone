import "./LoadingIndicator.css";

export function LoadingIndicator() {
  return (
    <div className="loadingIndicator" role="status" aria-live="polite">
      <div className="loadingIndicatorSpinner" />
      <div className="loadingIndicatorText">Loading scene...</div>
    </div>
  );
}
