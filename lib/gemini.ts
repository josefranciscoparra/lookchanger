const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

if (!OPENROUTER_API_KEY) console.warn('[gemini] OPENROUTER_API_KEY no está definido (modo demo)')

export async function generateLook({
  modelUrls,
  garmentUrls,
  variants = 2,
  style = { style: 'casual', season: 'any' },
  modelCharacteristics
}: { 
  modelUrls: string[], 
  garmentUrls: string[], 
  variants?: number,
  style?: { style: string, season: string },
  modelCharacteristics?: any
}): Promise<string[]> {
  // Si no hay API_KEY, devolvemos imágenes "eco" (echo) para demo
  if (!OPENROUTER_API_KEY) {
    return garmentUrls.slice(0, variants).map((g, i) => g)
  }

  // Crear el prompt base
  let promptText = `Create a photorealistic virtual try-on image. 
IMPORTANT: Generate ${variants} actual images, not descriptions.

Instructions:
- Take the person from the first image
- REPLACE their existing clothing with the garments shown below
- The person should ONLY wear the new garments (remove original clothes)
- Keep the person's face, hair, and body shape exactly the same
- Fit the garments naturally on the person's body
- For dresses: remove any pants, shirts or conflicting items
- For tops: keep bottom clothing if no bottom garment provided
- Maintain proper lighting and perspective
- Use neutral background
- Generate actual images, not text descriptions`

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