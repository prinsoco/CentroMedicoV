import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Injectable({
    providedIn: 'root'
  })

export class EmailValidoDirective {
  // Caracteres permitidos en la parte local (antes de @)
  private readonly localAllowedChar = /^[A-Za-z0-9._+-]$/;
  // Caracteres permitidos en el dominio (después de @)
  private readonly domainAllowedChar = /^[A-Za-z0-9.-]$/;

  isValidEmail(email: string): boolean {
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email.trim());
  }
  
  //valida evento keydown
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const selStart = input.selectionStart ?? value.length;
    const selEnd = input.selectionEnd ?? value.length;
    const hasSelection = selEnd > selStart;

    // Teclas de control/navegación permitidas
    const controlKeys = [
      'Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
      'Home','End','Escape','Enter'
    ];
    if (controlKeys.includes(event.key)) return;

    // Bloquear espacios siempre
    if (event.key === ' ') {
      event.preventDefault();
      return;
    }

    // Permitir combinaciones comunes (Ctrl/Cmd)
    if (event.ctrlKey || event.metaKey) return;

    const atIndex = value.indexOf('@');
    const isBeforeAt = atIndex === -1 ? true : (selStart <= atIndex);
    const segment = isBeforeAt ? 'local' : 'domain';

    // Manejo de @ (solo uno, no al inicio, no duplicado)
    if (event.key === '@') {
      const insertingAtStart = selStart === 0;
      const alreadyHasAt = atIndex !== -1;

      if (insertingAtStart) {
        event.preventDefault(); // no permitir @ al inicio
        return;
      }
      if (alreadyHasAt && !hasSelection) {
        event.preventDefault(); // ya existe @ y no está siendo reemplazado
        return;
      }
      return; // permitir @
    }

    // Manejo de '.' (evitar consecutivos, no al inicio de segmento, no como último antes de @ o final)
    if (event.key === '.') {
      const prevChar = value.charAt(selStart - 1);
      const nextChar = value.charAt(selStart);

      const isSegmentStart = (() => {
        if (segment === 'local') {
          return selStart === 0;
        } else {
          // en dominio, inicio es justo después de @
          return selStart === atIndex + 1;
        }
      })();

      const consecutiveDot = prevChar === '.' || nextChar === '.';

      // No permitir punto al inicio del segmento ni puntos consecutivos
      if (isSegmentStart || consecutiveDot) {
        event.preventDefault();
        return;
      }
      return; // permitir '.'
    }

    // Caracteres permitidos según segmento
    const isCharAllowed =
      segment === 'local'
        ? this.localAllowedChar.test(event.key)
        : this.domainAllowedChar.test(event.key);

    if (!isCharAllowed) {
      event.preventDefault();
      return;
    }
  }

  
  onPaste(event: ClipboardEvent) {
    const input = event.target as HTMLInputElement;
    const pasted = event.clipboardData?.getData('text') ?? '';

    // Bloquear espacios y saltos
    if (/\s/.test(pasted)) {
      event.preventDefault();
      return;
    }

    /**
     * Regex razonable para emails simples:
     * - una parte local sin espacios/@
     * - un '@'
     * - dominio con al menos un punto y TLD de 2+ caracteres
     *
     * Evita puntos consecutivos y puntos al inicio/fin de etiquetas.
     * (No cubre todos los casos RFC, pero es sólida para UI)
     */
    const emailRegex =
      /^(?!.*\.\.)[^\s@.][^\s@]*@[^\s@.][^\s@]*\.[^\s@]{2,}$/;

    if (!emailRegex.test(pasted)) {
      event.preventDefault();
      return;
    }
  }

  // Validación al salir del campo (opcional, para limpiar pequeños errores)
  
  onBlur(event: FocusEvent) {
    const input = event.target as HTMLInputElement;
    const val = (input.value || '').trim();

    if (val === '') return;

    const emailRegex =
      /^(?!.*\.\.)[^\s@.][^\s@]*@[^\s@.][^\s@]*\.[^\s@]{2,}$/;

    if (!emailRegex.test(val)) {
      // Puedes mostrar un mensaje, marcar invalid, o limpiar
      // Aquí solo prevenimos pequeños errores: quitar espacios accidentales
      input.value = val;
    }
  }
}
