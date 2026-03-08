import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, RefreshCw, X } from 'lucide-react';

type UpdateStatusPayload = {
  status: string;
  data?: {
    version?: string;
    percent?: number;
  };
};

const UpdateNotification: React.FC = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatusPayload | null>(null);
  const [visible, setVisible] = useState(false);
  const [appVersion, setAppVersion] = useState('');

  useEffect(() => {
    if (window.dummyForge?.getAppVersion) {
      window.dummyForge.getAppVersion().then(setAppVersion).catch(() => undefined);
    }

    if (window.dummyForge?.onUpdateStatus) {
      window.dummyForge.onUpdateStatus((data) => {
        setUpdateStatus(data as UpdateStatusPayload);

        if (['update-available', 'download-progress', 'update-downloaded'].includes((data as UpdateStatusPayload).status)) {
          setVisible(true);
        }
      });
    }

    return () => {
      window.dummyForge?.removeUpdateStatusListener?.();
    };
  }, []);

  if (!visible || !updateStatus) return null;

  const { status, data } = updateStatus;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="relative rounded-lg border border-gray-200 bg-white p-4 shadow-2xl dark:border-gray-700 dark:bg-gray-800">
        <button
          onClick={() => setVisible(false)}
          className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close update notification"
        >
          <X className="h-4 w-4" />
        </button>

        {status === 'update-available' && (
          <div className="flex items-start space-x-3">
            <Download className="mt-1 h-6 w-6 flex-shrink-0 text-blue-500" />
            <div className="flex-1">
              <h3 className="mb-1 font-bold text-gray-900 dark:text-white">Update Available!</h3>
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Version {data?.version} is now available.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">Current: v{appVersion}</p>
            </div>
          </div>
        )}

        {status === 'download-progress' && (
          <div className="flex items-start space-x-3">
            <RefreshCw className="mt-1 h-6 w-6 flex-shrink-0 animate-spin text-blue-500" />
            <div className="flex-1">
              <h3 className="mb-2 font-bold text-gray-900 dark:text-white">Downloading Update...</h3>
              <div className="mb-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${data?.percent ?? 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">{data?.percent ?? 0}% complete</p>
            </div>
          </div>
        )}

        {status === 'update-downloaded' && (
          <div className="flex items-start space-x-3">
            <CheckCircle className="mt-1 h-6 w-6 flex-shrink-0 text-green-500" />
            <div className="flex-1">
              <h3 className="mb-1 font-bold text-gray-900 dark:text-white">Update Ready!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Restart the app to install version {data?.version}.
              </p>
            </div>
          </div>
        )}

        <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-500">🔒 Privacy: No data collected during updates</p>
        </div>
      </div>
    </div>
  );
};

export default UpdateNotification;
