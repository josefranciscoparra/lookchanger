const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) console.warn('[gemini] OPENROUTER_API_KEY no está definido (modo demo)')

type VariantType = 'pose' | 'fit' | 'lighting' | 'angle' | 'accessories'

interface VariantConfig {
  id: number
  type: VariantType
  description?: string
}

type GeminiContent = {
  type: 'text' | 'image_url'
  text?: string
  image_url?: {
    url: string
  }
}

function getPhotoStylePrompt(style: string): string {
  switch (style) {
    case 'studio':
      return 'Use professional studio photography with clean white or neutral background, professional lighting setup, and controlled shadows'
    case 'outdoor':
      return 'Use natural outdoor setting with natural lighting, could be urban street, park, or outdoor environment'
    case 'casual':
      return 'Use casual indoor setting like home, cafe, or relaxed environment with soft natural lighting'
    case 'professional':
      return 'Use professional business environment with clean background, professional lighting, and formal composition'
    case 'original':
    default:
      return 'Keep the same background, lighting, and photographic style as the original model image'
  }
}

export async function generateLook({
  modelUrls,
  garmentUrls,
  variants = 1,
  variantConfigs = [],
  style = { style: 'casual', season: 'any' },
  modelCharacteristics,
  outfitOptions = {
    fullBodyVisible: true,
    showShoes: true,
    hideHatsAndCaps: true,
    adaptShoesToLook: true,
    removeSunglasses: false,
    onlySelectedGarments: false,
    photoStyle: 'original'
  },
  physicalInfo
}: {
  modelUrls: string[],
  garmentUrls: string[],
  variants?: number,
  variantConfigs?: VariantConfig[],
  style?: { style: string, season: string },
  modelCharacteristics?: any,
  outfitOptions?: {
    fullBodyVisible: boolean,
    showShoes: boolean,
    hideHatsAndCaps: boolean,
    adaptShoesToLook: boolean,
    removeSunglasses: boolean,
    onlySelectedGarments: boolean,
    photoStyle: 'original' | 'studio' | 'outdoor' | 'casual' | 'professional'
  },
  physicalInfo?: {
    weight?: number | null,
    height?: number | null,
    bodyType?: string | null
  } | null
}): Promise<string[]> {
  // Si no hay API_KEY, devolvemos imágenes "eco" (echo) para demo
  if (!OPENROUTER_API_KEY) {
    return garmentUrls.slice(0, variants).map((g, i) => g)
  }

  // Crear el prompt base con configuraciones específicas de variantes
  let promptText = `⚠️ CRITICAL: VIRTUAL TRY-ON TASK - IDENTITY PRESERVATION IS MANDATORY ⚠️

This is a VIRTUAL TRY-ON task, NOT a person generation task.
You MUST preserve the EXACT identity of the person shown in the MODEL PERSON image.

🔴 ABSOLUTE REQUIREMENTS - FACIAL IDENTITY PRESERVATION:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• USE FACE SWAP / IDENTITY TRANSFER technique
• The MODEL PERSON image shows the EXACT face you MUST preserve
• Keep 100% IDENTICAL: eyes, nose, mouth, jawline, cheekbones, forehead, chin
• Keep 100% IDENTICAL: facial structure, face shape, skin tone, skin texture
• Keep 100% IDENTICAL: hair (color, style, texture, length)
• Keep 100% IDENTICAL: facial expressions and features
• This person's identity MUST be PERFECTLY recognizable in all outputs

🚫 FORBIDDEN - DO NOT:
• Generate a different person's face
• Modify ANY facial features (eyes, nose, mouth, face shape)
• Change eye color, skin tone, or facial structure
• Create a generic model - use THIS SPECIFIC PERSON
• Alter hair color or hairstyle from the original
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR ONLY JOB: Transfer this person's clothing to the new garments shown below.
Generate ${variants} photorealistic virtual try-on images using EXACTLY the same garments in all variants
${physicalInfo && (physicalInfo.weight || physicalInfo.height || physicalInfo.bodyType) ? `

📏 BODY PROPORTIONS (applies to BODY ONLY - NEVER change the FACE):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${physicalInfo.height ? `• Height: ${physicalInfo.height} cm` : ''}
${physicalInfo.weight ? `• Weight: ${physicalInfo.weight} kg` : ''}
${physicalInfo.bodyType ? `• Body type: ${physicalInfo.bodyType}` : ''}

⚠️ IMPORTANT: These measurements affect ONLY the body proportions and clothing fit.
The FACE must remain 100% identical to the MODEL PERSON regardless of weight/height.
${physicalInfo.weight && physicalInfo.weight > 90 ? '• Show realistic larger body frame and torso for this weight\n• Clothing should fit a heavier body build naturally\n• Body proportions reflect this weight (NOT the face)' : ''}
${physicalInfo.weight && physicalInfo.weight < 60 ? '• Show realistic slimmer body frame and torso for this weight\n• Clothing should fit a lighter body build naturally\n• Body proportions reflect this weight (NOT the face)' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` : ''}

✅ CORE TASK:
1. Take the MODEL PERSON from the image below (keep their EXACT face)
2. Dress them in the GARMENTS shown below
3. ${outfitOptions.onlySelectedGarments ? 'Remove ALL original clothing - use ONLY the provided garments' : 'Smart clothing replacement'}

Additional options:
• Framing: ${outfitOptions.fullBodyVisible ? 'Full body view' : 'Upper body focus'}
• Footwear: ${outfitOptions.showShoes ? 'Include appropriate shoes' : 'Exclude feet'}${outfitOptions.adaptShoesToLook ? ' matching the outfit style' : ''}
• ${outfitOptions.hideHatsAndCaps ? 'No head accessories' : 'Head accessories allowed'}
• ${outfitOptions.removeSunglasses ? 'No sunglasses (show eyes)' : 'Keep original eyewear'}
• Style: ${getPhotoStylePrompt(outfitOptions.photoStyle)}`

  // Generar instrucciones específicas para cada variante
  if (variants > 1 && variantConfigs.length > 0) {
    promptText += `\n\nVARIANT SPECIFICATIONS:`
    
    // Variante 1 siempre es la original
    promptText += `\n- Image 1: Standard frontal pose with neutral lighting and direct camera angle`
    
    // Variantes adicionales según configuración
    for (let i = 0; i < Math.min(variantConfigs.length, variants - 1); i++) {
      const config = variantConfigs[i]
      const variantNumber = i + 2
      
      let variantInstruction = `\n- Image ${variantNumber}: `
      
      switch (config.type) {
        case 'pose':
          variantInstruction += 'Same garments with different pose (walking, sitting, or 3/4 turn - choose naturally)'
          break
        case 'fit':
          variantInstruction += 'Same garments with different fit/draping (slightly looser or more fitted styling)'
          break
        case 'lighting':
          variantInstruction += 'Same garments with different lighting (soft studio lighting, natural daylight, or dramatic shadows)'
          break
        case 'angle':
          variantInstruction += 'Same garments from different camera angle (3/4 view, side profile, or slight back angle)'
          break
        case 'accessories':
          variantInstruction += 'Same garments with subtle complementary accessories (belt, jewelry, or scarf that matches the style)'
          break
        default:
          variantInstruction += 'Same garments with subtle variation in pose or styling'
      }
      
      promptText += variantInstruction
    }
  } else {
    promptText += `\n\n- Generate standard frontal pose with neutral lighting`
  }

  promptText += `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 FINAL CRITICAL REMINDERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. IDENTITY PRESERVATION IS MANDATORY
   → The person in ALL outputs must be INSTANTLY recognizable as the MODEL PERSON
   → Face, eyes, nose, mouth, hair MUST be 100% identical
   → This is a virtual try-on, NOT generating a new person

2. All variants use EXACTLY the same garments
   → Only vary pose/lighting/angle as specified above

3. VERIFY before generating:
   ✓ Am I using the EXACT face from MODEL PERSON image?
   ✓ Are the facial features 100% identical?
   ✓ Would someone recognize this person immediately?

If you cannot preserve the exact identity, DO NOT generate the image.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`

  // Añadir información de estilo si está activada
  if (style && style.style && style.season) {
    promptText += `

Style Preferences:
- Style: ${style.style} (adjust clothing fit, accessories, and overall aesthetic accordingly)
- Season: ${style.season === 'any' ? 'universal styling' : style.season + ' season appropriate'}`
  }

  // Preparar el contenido del mensaje
  const content: GeminiContent[] = [
    {
      type: "text",
      text: promptText
    }
  ]

  // Agregar sección de modelo con etiqueta clara
  content.push({
    type: "text",
    text: "\n\n🔴 MODEL PERSON - PRESERVE THIS EXACT IDENTITY:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nThis is the person whose FACE, HAIR, and BODY you MUST use.\nTheir identity must be PERFECTLY preserved in all outputs.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  })

  for (const modelUrl of modelUrls) {
    content.push({
      type: "image_url",
      image_url: {
        url: modelUrl
      }
    })
  }

  // Agregar sección de prendas con etiqueta clara
  content.push({
    type: "text",
    text: "\n\n👔 GARMENTS TO WEAR:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nDress the MODEL PERSON above in THESE garments.\nKeep their face identical.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  })

  for (let i = 0; i < garmentUrls.length; i++) {
    content.push({
      type: "text",
      text: `\nGARMENT ${i + 1} of ${garmentUrls.length}:`
    })
    content.push({
      type: "image_url",
      image_url: {
        url: garmentUrls[i]
      }
    })
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3001",
        "X-Title": "AI Look Try-On",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: content
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    console.log('OpenRouter full response:', JSON.stringify(result, null, 2))
    
    // Procesar la respuesta - OpenRouter devuelve imágenes en el campo "images"
    const outputs: string[] = []
    
    if (result.choices && result.choices[0]?.message) {
      const message = result.choices[0].message
      
      // Verificar si hay imágenes generadas
      if (message.images && Array.isArray(message.images)) {
        for (const imageObj of message.images) {
          if (imageObj.type === 'image_url' && imageObj.image_url?.url) {
            outputs.push(imageObj.image_url.url)
          }
        }
        console.log(`Generated ${outputs.length} images from OpenRouter`)
      } else {
        console.log('No images found in response, content:', message.content)
      }
    }

    return outputs.length > 0 ? outputs : garmentUrls.slice(0, variants)
    
  } catch (error) {
    console.error('Error with OpenRouter API:', error)
    // Fallback a modo demo
    return garmentUrls.slice(0, variants)
  }
}

/**
 * Edita una imagen ya generada según instrucciones específicas del usuario
 * El prompt se enfoca en preservar la imagen original y modificar solo lo solicitado
 */
export async function editGeneratedImage({
  imageUrl,
  editInstructions
}: {
  imageUrl: string,
  editInstructions: string
}): Promise<string | null> {
  // Si no hay API_KEY, devolvemos null para indicar fallo
  if (!OPENROUTER_API_KEY) {
    console.warn('[editGeneratedImage] No API key available')
    return null
  }

  const promptText = `⚠️ CRITICAL: IMAGE EDITING TASK - PRESERVE ORIGINAL IMAGE ⚠️

This is an IMAGE EDITING task. You MUST keep the image EXACTLY as it is, making ONLY the specific changes requested below.

🔴 ABSOLUTE REQUIREMENTS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• PRESERVE 100% of the original image composition, lighting, pose, and background
• Keep the person's face, body, and overall appearance IDENTICAL
• ONLY modify what is explicitly requested in the instructions below
• Maintain the same photographic style, quality, and resolution
• DO NOT regenerate the image - EDIT the existing one
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 USER EDIT INSTRUCTIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${editInstructions}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ YOUR TASK:
1. Analyze the image below carefully
2. Apply ONLY the modifications described in the user instructions
3. Keep everything else EXACTLY as it appears in the original
4. Return ONE edited image that looks natural and seamless

🚫 DO NOT:
• Change the person's identity, face, or body unless explicitly requested
• Modify the background, lighting, or composition unless specifically asked
• Add or remove elements not mentioned in the instructions
• Regenerate the image from scratch - this is an EDIT operation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 REMEMBER: This is a surgical edit. Change ONLY what was requested.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IMAGE TO EDIT:`

  const content: GeminiContent[] = [
    {
      type: "text",
      text: promptText
    },
    {
      type: "image_url",
      image_url: {
        url: imageUrl
      }
    }
  ]

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3001",
        "X-Title": "AI Look Try-On - Image Edit",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: content
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()

    console.log('OpenRouter edit response received')

    // Procesar la respuesta - OpenRouter devuelve imágenes en el campo "images"
    if (result.choices && result.choices[0]?.message) {
      const message = result.choices[0].message

      // Verificar si hay imágenes generadas
      if (message.images && Array.isArray(message.images) && message.images.length > 0) {
        const firstImage = message.images[0]
        if (firstImage.type === 'image_url' && firstImage.image_url?.url) {
          console.log('✅ Imagen editada generada exitosamente')
          return firstImage.image_url.url
        }
      } else {
        console.log('No images found in edit response')
      }
    }

    return null

  } catch (error) {
    console.error('Error with OpenRouter API (edit):', error)
    return null
  }
}
