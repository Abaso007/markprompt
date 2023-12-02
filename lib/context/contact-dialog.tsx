import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';

import { ContactSalesDialog } from '@/components/dialogs/public/ContactDialog';

export type State = {
  contactDialogOpen: boolean;
  setContactDialogOpen: (open: boolean) => void;
};

const initialState: State = {
  contactDialogOpen: false,
  setContactDialogOpen: () => {
    // Do nothing
  },
};

const ContactDialogProvider = ({ children, ...rest }: PropsWithChildren) => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return (
    <ContactDialogContext.Provider
      value={{
        contactDialogOpen,
        setContactDialogOpen,
      }}
      {...rest}
    >
      {children}
      <ContactSalesDialog
        open={contactDialogOpen}
        setOpen={setContactDialogOpen}
      />
    </ContactDialogContext.Provider>
  );
};

export const useContactDialogContext = (): State => {
  const context = useContext(ContactDialogContext);
  if (context === undefined) {
    throw new Error(
      `useContactDialogContext must be used within a ContactDialogProvider`,
    );
  }
  return context;
};

const ContactDialogContext = createContext<State>(initialState);

ContactDialogContext.displayName = 'ContactDialogContext';

export const ManagedContactDialogContext: FC<PropsWithChildren> = ({
  children,
}) => <ContactDialogProvider>{children}</ContactDialogProvider>;
