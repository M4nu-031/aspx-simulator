import type { ReactNode } from 'react';
import { Button, DrawerBody, DrawerFooter, DrawerHeader, DrawerHeaderTitle } from '@fluentui/react-components';
import { Dismiss20Regular } from '@fluentui/react-icons';
import { useApp } from '../../store';

/** Shared header/body/footer for every right-hand panel (480px OverlayDrawer). */
export function Drawer({ title, children, footer }: { title: string; children: ReactNode; footer?: ReactNode }) {
  const close = useApp((s) => s.closePanel);
  return (
    <>
      <DrawerHeader>
        <DrawerHeaderTitle action={<Button appearance="subtle" aria-label="Close" icon={<Dismiss20Regular />} onClick={close} />}>
          {title}
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody>{children}</DrawerBody>
      {footer && <DrawerFooter>{footer}</DrawerFooter>}
    </>
  );
}
