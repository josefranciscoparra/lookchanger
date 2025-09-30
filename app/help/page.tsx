'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { HelpCircle, Book, MessageCircle, Mail, Lightbulb } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { ContactForm } from '@/components/ContactForm'

export default function HelpPage() {
  return (
    <div className="container mx-auto py-6 max-w-5xl">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Ayuda</h1>
      </div>

      <Tabs defaultValue="guide" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guide">
            <Book className="h-4 w-4 mr-2" />
            Guía
          </TabsTrigger>
          <TabsTrigger value="faq">
            <MessageCircle className="h-4 w-4 mr-2" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="h-4 w-4 mr-2" />
            Contacto
          </TabsTrigger>
          <TabsTrigger value="resources">
            <Lightbulb className="h-4 w-4 mr-2" />
            Recursos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="guide" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Guía de Uso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Sube tus Modelos</h3>
                    <p className="text-sm text-muted-foreground">
                      Dirígete a la sección "Modelos" y sube fotografías de las personas que quieras usar como modelos para tus outfits. Asegúrate de usar imágenes de buena calidad y bien iluminadas.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Añade Prendas</h3>
                    <p className="text-sm text-muted-foreground">
                      En la sección "Prendas", sube fotos de las prendas de ropa que quieres probar. Puedes organizar tus prendas por categorías para facilitar su búsqueda.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Crea Outfits</h3>
                    <p className="text-sm text-muted-foreground">
                      Ve a "Crear Outfit", selecciona un modelo y las prendas que quieras combinar. La IA generará imágenes realistas mostrando cómo quedaría el outfit.
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Gestiona tus Resultados</h3>
                    <p className="text-sm text-muted-foreground">
                      Accede a "Mis Imágenes" para ver, descargar y gestionar todas las imágenes generadas por la IA.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Preguntas Frecuentes</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>¿Qué formato de imagen debo usar?</AccordionTrigger>
                  <AccordionContent>
                    Recomendamos usar formatos JPG o PNG. Las imágenes deben ser claras, con buena iluminación y en alta resolución para obtener los mejores resultados.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>¿Cuánto tiempo tarda en generar un outfit?</AccordionTrigger>
                  <AccordionContent>
                    La generación de imágenes con IA suele tardar entre 30 segundos y 2 minutos, dependiendo de la complejidad y la cantidad de variantes solicitadas.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>¿Puedo editar las imágenes generadas?</AccordionTrigger>
                  <AccordionContent>
                    Las imágenes generadas se pueden descargar y editar con cualquier software de edición de imágenes. Desde la aplicación puedes descargarlas directamente.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>¿Hay límite de modelos o prendas?</AccordionTrigger>
                  <AccordionContent>
                    No hay un límite específico. Puedes subir tantos modelos y prendas como necesites para crear tus combinaciones perfectas.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>¿Es seguro subir mis fotos?</AccordionTrigger>
                  <AccordionContent>
                    Sí, todas tus imágenes están protegidas y se almacenan de forma cifrada. Solo tú tienes acceso a tus contenidos y puedes eliminarlos en cualquier momento.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger>¿Puedo usar fotos de modelos profesionales?</AccordionTrigger>
                  <AccordionContent>
                    Sí, puedes usar cualquier imagen siempre que tengas los derechos para hacerlo. Asegúrate de que las fotos sean de buena calidad para obtener mejores resultados.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <div className="grid gap-6">
            <ContactForm />

            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Soporte Técnico</h3>
                  <p className="text-sm text-muted-foreground">
                    Si experimentas problemas técnicos o tienes dudas sobre el funcionamiento de la aplicación,
                    utiliza el formulario anterior para contactarnos.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Tiempo de Respuesta</h3>
                  <p className="text-sm text-muted-foreground">
                    Normalmente respondemos en un plazo de 24-48 horas hábiles. Para consultas urgentes,
                    por favor indícalo en el asunto del mensaje.
                  </p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2">Horario de Atención</h3>
                  <p className="text-sm text-muted-foreground">
                    Lunes a Viernes: 9:00 - 18:00 (CET)<br />
                    Sábados, Domingos y Festivos: Cerrado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Consejos para Mejores Resultados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Usa imágenes con fondo limpio y neutro para obtener mejores resultados
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Asegúrate de que el modelo esté bien iluminado y la foto sea nítida
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Las prendas deben ser visibles completamente en la fotografía
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Evita imágenes borrosas o de baja calidad
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">
                      Prueba diferentes ángulos y poses para variedad
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacidad y Seguridad</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Tus imágenes están seguras con nosotros. Toda la información se almacena de forma cifrada y solo tú tienes acceso a tus contenidos. Respetamos tu privacidad y nunca compartiremos tus datos con terceros.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tecnología IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Utilizamos <strong>Google Gemini 2.5 Flash Image</strong>, una de las tecnologías de IA más avanzadas para generar imágenes realistas de alta calidad. Esta tecnología nos permite crear visualizaciones precisas y naturales de cómo quedarían las prendas en diferentes modelos.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}