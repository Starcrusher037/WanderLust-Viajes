import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useDestinationsContext } from '../hooks/useDestinationsContext';

export default function Toast() {
  const { toastMessage } = useDestinationsContext();

  if (!toastMessage) return null;

  return (
    <div className={`toast-banner toast-${toastMessage.type}`} role="status">
      <div className="toast-icon">
        {toastMessage.type === 'error' ? (
          <AlertCircle size={18} />
        ) : toastMessage.type === 'info' ? (
          <Info size={18} />
        ) : (
          <CheckCircle2 size={18} />
        )}
      </div>
      <div className="toast-text">{toastMessage.message}</div>
    </div>
  );
}
