import {
  ComposedModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  InlineLoading,
} from '@carbon/react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  loading = false,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <ComposedModal open={open} onClose={onClose} size="sm">
      <ModalHeader label={danger ? 'Confirm action' : undefined}>
        {title}
      </ModalHeader>
      <ModalBody>{description && <p>{description}</p>}</ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button
          kind={danger ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <InlineLoading description={confirmLabel} /> : confirmLabel}
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
}
