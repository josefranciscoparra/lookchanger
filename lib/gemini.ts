const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) console.warn('[gemini] OPENROUTER_API_KEY no está definido (modo demo)')

type VariantType = 'pose' | 'fit' | 'lighting' | 'angle' | 'accessories'

interface VariantConfig {
  id: number
  type: VariantType
  description?: string
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
    adaptShoesToLook: true
  }
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
    adaptShoesToLook: boolean
  }
}): Promise<string[]> {
  // Si no hay API_KEY, devolvemos imágenes "eco" (echo) para demo
  if (!OPENROUTER_API_KEY) {
    return garmentUrls.slice(0, variants).map((g, i) => g)
  }

  // Crear el prompt base con configuraciones específicas de variantes
  let promptText = `Create ${variants} photorealistic virtual try-on images using EXACTLY the same garments in all variants.

CORE REQUIREMENTS (apply to ALL variants):
- Take the person from the first image
- REPLACE their existing clothing with the garments shown below
- The person should ONLY wear the new garments (remove original clothes)  
- Keep the person's face, hair, and body shape exactly the same
- Fit the garments naturally on the person's body
- For dresses: remove any pants, shirts or conflicting items
- For tops: keep bottom clothing if no bottom garment provided

ADDITIONAL OUTFIT OPTIONS:
- Body framing: ${outfitOptions.fullBodyVisible ? 'Show the complete figure from head to toe in full body view' : 'Focus on upper body/torso area'}
- Footwear: ${outfitOptions.showShoes ? 'Include appropriate footwear in the image' : 'Crop image to exclude feet/shoes'}
- Head accessories: ${outfitOptions.hideHatsAndCaps ? 'Do NOT add hats, caps, beanies or any head coverings' : 'Head accessories are allowed if they complement the outfit'}
- Shoe coordination: ${outfitOptions.adaptShoesToLook ? 'Choose footwear that matches and complements the outfit style and colors' : 'Use neutral/basic footwear'}`

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

  promptText += `\n\nCRITICAL: All variants must use the EXACT same garments. Only vary the specified elements above.`

  // Añadir información de estilo si está activada
  if (style && style.style && style.season) {
    promptText += `

Style Preferences:
- Style: ${style.style} (adjust clothing fit, accessories, and overall aesthetic accordingly)
- Season: ${style.season === 'any' ? 'universal styling' : style.season + ' season appropriate'}`
  }

  // Preparar el contenido del mensaje
  const content = [
    {
      type: "text",
      text: promptText
    }
  ]

  // Agregar imágenes del modelo
  for (const modelUrl of modelUrls) {
    content.push({
      type: "image_url",
      image_url: {
        url: modelUrl
      }
    })
  }

  // Agregar prendas
  for (const garmentUrl of garmentUrls) {
    content.push({
      type: "text", 
      text: "GARMENT:"
    })
    content.push({
      type: "image_url",
      image_url: {
        url: garmentUrl
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