import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  children: React.ReactNode;
  containerId?: string;
};

const Portal: React.FC<PortalProps> = ({ children, containerId = 'portal-root' }) => {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    let portalRoot = document.getElementById(containerId);
    
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.setAttribute('id', containerId);
      portalRoot.style.position = 'fixed';
      portalRoot.style.top = '0';
      portalRoot.style.left = '0';
      portalRoot.style.zIndex = '9999';
      document.body.appendChild(portalRoot);
    }
    
    setContainer(portalRoot);
    
    return () => {
      if (portalRoot && portalRoot.childNodes.length === 0) {
        document.body.removeChild(portalRoot);
      }
    };
  }, [containerId]);

  if (!mounted || !container) return null;

  return createPortal(children, container);
};

export default Portal;
