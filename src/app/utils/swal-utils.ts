
import Swal from "sweetalert2";

export function toastSuccess(mensaje: string, timer: number = 2500): void {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: mensaje,
    showConfirmButton: false,
    timer: timer,
    background: "#fff",
  });
}

export function toastError(mensaje: string, timer: number = 222500): void {
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'error',
    title: mensaje,
    showConfirmButton: false,
    timer: timer,
    background: "#fff",
  });
}
