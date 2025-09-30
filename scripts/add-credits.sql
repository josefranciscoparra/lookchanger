-- Script para añadir créditos a un usuario
--
-- Uso:
-- 1. Obtén tu user_id ejecutando: SELECT id, email FROM auth.users;
-- 2. Reemplaza 'TU_USER_ID_AQUI' con tu user_id real
-- 3. Cambia el número 100 por la cantidad de créditos que quieras añadir
-- 4. Ejecuta este script en el SQL Editor de Supabase

-- Paso 1: Ver todos los usuarios disponibles
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

-- Paso 2: Añadir créditos (AJUSTA LOS VALORES ABAJO)
SELECT admin_adjust_credits(
  'TU_USER_ID_AQUI'::uuid,  -- 👈 Reemplaza con tu user_id
  100,                        -- 👈 Cantidad de créditos a añadir
  'Créditos de prueba',      -- 👈 Descripción
  '{"reason": "testing", "added_by": "admin"}'::jsonb
);

-- Paso 3: Verificar que se añadieron correctamente
SELECT
  u.email,
  uc.credits,
  uc.total_purchased,
  uc.total_spent,
  uc.updated_at
FROM user_credits uc
JOIN auth.users u ON u.id = uc.user_id
WHERE uc.user_id = 'TU_USER_ID_AQUI'::uuid;  -- 👈 Reemplaza con tu user_id

-- Paso 4: Ver el historial de transacciones
SELECT
  created_at,
  type,
  amount,
  description,
  metadata
FROM credit_transactions
WHERE user_id = 'TU_USER_ID_AQUI'::uuid  -- 👈 Reemplaza con tu user_id
ORDER BY created_at DESC
LIMIT 10;