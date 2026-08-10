import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

export const demoMockInterceptor: HttpInterceptorFn = (req, next) => {
  // Verificamos si la URL del navegador está en una ruta "demo-"
  const isDemo = typeof window !== 'undefined' && window.location.pathname.includes('/demo-');
  
  if (isDemo) {
    console.warn('⚠️ [MODO DEMO] Petición interceptada. Protegiendo BD Real. URL:', req.url);
    
    // Retornamos una respuesta falsa exitosa (200 OK) con un delay para simular carga
    // Retornar un array u objeto vacío evita que la vista estalle por falta de datos
    return of(new HttpResponse({ status: 200, body: [] })).pipe(delay(400));
  }

  // Si no estamos en el Demo, la petición fluye normalmente
  return next(req);
};
