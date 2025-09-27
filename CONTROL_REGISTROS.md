# Control de Registros - Documentación Temporal

Este documento explica cómo habilitar/deshabilitar temporalmente el sistema de registros de la aplicación LookChanger para proteger el API key de Gemini mientras se desarrolla la integración con Stripe.

## 🚫 Estado Actual: REGISTROS DESHABILITADOS

### ¿Por qué están deshabilitados?

- **Protección del API key**: Evitar que usuarios no autorizados consuman créditos de Gemini
- **Preparación para Stripe**: Se implementará un sistema de pago por créditos en el futuro
- **Control temporal**: Solución provisional hasta completar la monetización

## 🔧 Cómo Funciona el Sistema

### Variable de Control

```bash
# En .env.local
NEXT_PUBLIC_DISABLE_SIGNUP=true   # Deshabilita registros
NEXT_PUBLIC_DISABLE_SIGNUP=false  # Habilita registros
```

### Archivos Modificados

1. **`.env.local`**: Variable de control principal
2. **`app/(auth)/signup/page.tsx`**: Muestra mensaje de deshabilitado
3. **`middleware.ts`**: Redirige `/signup` → `/login` cuando está deshabilitado

## 🔄 Cómo Revertir (Habilitar Registros)

### Paso 1: Cambiar Variable de Entorno

```bash
# En .env.local, cambiar:
NEXT_PUBLIC_DISABLE_SIGNUP=false
```

### Paso 2: Reiniciar el Servidor

```bash
npm run dev
```

### Paso 3: Verificar

- Visitar `/signup` debería mostrar el formulario normal
- El registro debería funcionar completamente
- El middleware no debería redirigir a `/login`

## 🎯 Implementación Futura con Stripe

Cuando implementes el sistema de pago:

1. **Mantener la variable de control** para poder deshabilitar registros rápidamente si es necesario
2. **Añadir lógica de créditos** en la base de datos (tabla `users` con campo `credits`)
3. **Integrar Stripe Checkout** para comprar créditos
4. **Modificar API de Gemini** para consumir créditos del usuario
5. **Dashboard de créditos** para que usuarios vean su saldo

### Estructura Sugerida para Créditos

```sql
-- Añadir a la tabla users en Supabase
ALTER TABLE auth.users ADD COLUMN credits INTEGER DEFAULT 0;

-- Tabla para historial de transacciones
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(20) CHECK (type IN ('purchase', 'usage', 'refund')),
  amount INTEGER, -- positivo para compras, negativo para uso
  description TEXT,
  stripe_payment_id VARCHAR(255), -- para compras
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🛡️ Seguridad Adicional

### Variables de Entorno en Vercel

Asegúrate de que en Vercel tengas configurado:

```bash
NEXT_PUBLIC_DISABLE_SIGNUP=true
GEMINI_API_KEY=tu_api_key_secreta
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

### Monitoreo de Uso

Para monitorear el uso del API de Gemini:

1. **Google AI Studio**: Revisar dashboard de uso
2. **Logs de aplicación**: Implementar logging de requests a Gemini
3. **Alertas**: Configurar alertas cuando se supere un umbral de requests

## 📝 Notas Importantes

- ✅ Los usuarios existentes pueden seguir haciendo login normalmente
- ✅ La funcionalidad principal de la app no se ve afectada
- ✅ Es completamente reversible sin pérdida de datos
- ✅ **Arreglado error de build en Vercel** añadiendo `export const dynamic = 'force-dynamic'` a todas las rutas API
- ⚠️ Recuerda actualizar esta documentación cuando implementes Stripe
- ⚠️ No olvides cambiar la variable a `false` cuando tengas el sistema de pagos listo

## 🚀 Fix para Vercel Build Error

Se añadió `export const dynamic = 'force-dynamic'` a todas las rutas API que usan autenticación de Supabase:
- `/api/gallery/route.ts`
- `/api/list/route.ts` 
- `/api/upload/route.ts`
- `/api/outfits/run/route.ts`

Esto resuelve el error de build "couldn't be rendered statically because it used `cookies`".

## 🔗 Archivos Relacionados

- `app/(auth)/signup/page.tsx` - Página de registro
- `middleware.ts` - Control de rutas
- `.env.local` - Variables de entorno
- `CLAUDE.md` - Instrucciones generales del proyecto

---

**Fecha de implementación**: $(date +%Y-%m-%d)  
**Estado**: Activo - Registros deshabilitados  
**Próximo paso**: Implementar integración con Stripe para sistema de créditos