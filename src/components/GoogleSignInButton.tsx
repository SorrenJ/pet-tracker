import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-service-script';
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Google auth script failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google auth script failed to load'));
    document.body.appendChild(script);
  });
  return googleScriptPromise;
}

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => void;
  onError?: (message: string) => void;
}

export function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!buttonRef.current) return;
    if (!clientId) {
      onError?.('Google client ID is not configured.');
      return;
    }

    let mounted = true;

    loadGoogleScript()
      .then(() => {
        if (!mounted || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: { credential: string }) => {
            if (response?.credential) {
              onSuccess(response.credential);
            } else {
              onError?.('Google sign-in returned no credential.');
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        });
      })
      .catch(error => {
        onError?.(error instanceof Error ? error.message : 'Failed to load Google auth.');
      });

    return () => {
      mounted = false;
    };
  }, [clientId, onError, onSuccess]);

  return <div ref={buttonRef} className="w-full" />;
}
