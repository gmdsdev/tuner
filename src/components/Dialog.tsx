import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useI18n } from '../i18n/context'
import { CloseIcon } from './icons'

interface DialogProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}

/**
 * Modal built on the native <dialog>: the browser provides the focus trap,
 * Escape handling, inert background and top-layer stacking. We add focus
 * restoration and click-on-backdrop to close.
 */
export function Dialog({ open, onClose, title, children }: DialogProps) {
  const { t } = useI18n()
  const ref = useRef<HTMLDialogElement>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const titleId = useId()
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
      if (typeof dialog.showModal === 'function') dialog.showModal()
      else dialog.setAttribute('open', '')
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') dialog.close()
      else {
        dialog.removeAttribute('open')
        dialog.dispatchEvent(new Event('close'))
      }
    }
  }, [open])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const handleClose = () => {
      onCloseRef.current()
      returnFocus.current?.focus()
      returnFocus.current = null
    }
    // Clicks on the ::backdrop land on the <dialog> element itself.
    const handleClick = (event: MouseEvent) => {
      if (event.target === dialog) dialog.close()
    }
    dialog.addEventListener('close', handleClose)
    dialog.addEventListener('click', handleClick)
    return () => {
      dialog.removeEventListener('close', handleClose)
      dialog.removeEventListener('click', handleClick)
    }
  }, [])

  return (
    <dialog ref={ref} className="dialog" aria-labelledby={titleId}>
      <div className="dialog__panel">
        <div className="dialog__handle" aria-hidden="true" />
        <div className="dialog__header">
          <h2 id={titleId} className="dialog__title">
            {title}
          </h2>
          <button type="button" className="icon-button icon-button--ghost" onClick={() => ref.current?.close()} aria-label={t.close}>
            <CloseIcon />
          </button>
        </div>
        <div className="dialog__body">{open ? children : null}</div>
      </div>
    </dialog>
  )
}
