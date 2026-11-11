# Moldes y Diseños Gaby's — tienda moderna

Sitio independiente, responsive, con diseño renovado, buscador, catálogo real de **297 fotos de Halloween**, carrito de pedidos y asistente de búsqueda. Aquí se reemplaza el contenido anterior del repositorio `soobroon-beep/moldesgabys` bajo autorización expresa de su propietaria; no se toca ningún otro repositorio ni se modifican las fotografías originales de Google Drive.

## Publicación GitHub Pages

- Sitio: `https://soobroon-beep.github.io/moldesgabys/` (si GitHub Pages está habilitado y la acción se ejecutó correctamente).
- El workflow `.github/workflows/publicar.yml` despliega el sitio estático al recibir cambios en `main`.
- El workflow `.github/workflows/sincronizar-fotos.yml` intenta guardar versiones WebP optimizadas de las **297 fotografías públicas** de Drive. Los archivos se guardan como `images/HAL-253.webp`, etc. Si hay una limitación de Google Drive, la interfaz intenta miniaturas alternativas y ofrece ver la fotografía original. Se puede volver a ejecutar manualmente desde **Actions**.
- El catálogo conserva la numeración de Drive; variantes y fotos sin número tienen códigos únicos.

## Funcionalidad y seguridad

- El carrito permite elegir molde **digital o físico** y generar una solicitud por WhatsApp.
- Los precios `$30/$65 MXN` son **de referencia** y deben confirmarse antes de cobrar.
- **No hay cobro real en GitHub Pages.** Mercado Pago requiere un backend privado para firmar preferencias, verificar webhooks y liberar archivos; nunca pongas credenciales en JS/HTML.
- Las fotografías exhibidas son ejemplos de las figuras; **no son los archivos PDF de moldes** para descarga.
- El asistente en GitHub Pages es una **guía local** de preguntas frecuentes y búsqueda. El código base incluye soporte futuro para **Ollama/Qwen**, pero un servicio de IA open source real requiere backend desplegado. No se presenta como IA generativa activa cuando no lo está.
- `configuracion.js` guarda solo parámetros **públicos**, como un número WhatsApp comercial (cuando se confirme), nunca tokens.

## Para próximas temporadas

Añade entradas al arreglo del `catalogo.json` con `seccion` y `codigo` distintos. El catálogo público usa `catalogo.js` con `window.GABYS_CATALOGO` equivalente; regenera ambos para sincronizar. La galería mostrará automáticamente las fotos sin inventar diseños.

Los archivos `server.mjs`, `admin.html` y `pedido.html` permanecen **solo en el paquete de desarrollo local**, no se publican con el sitio estático. Para ventas con tarjetas y descarga automática se necesitará preparar y desplegar un backend de producción.


## Navidad y búsqueda por descripción (noviembre 2026)

- Colección Navidad: `navidad.js`/`navidad.json` (1,135 fotografías). Conserva los números de Drive; códigos con sufijos para variantes.
- Halloween: 297 fotografías en `catalogo.js`. Total 1,432.
- El asesor permite buscar por descripción, número y código y devuelve tarjetas pulsables de las fotos; botón **Ver modelos en la página** muestra todos los encontrados.
- `etiquetas-visuales.js` es un índice sugerido creado por un modelo open source CLIP en GitHub Actions (`scripts/etiquetar_fotos.py`). Los resultados visuales son aproximados, no exhaustivos, y el índice puede tardar en procesarse tras añadir muchas fotografías.
- Las imágenes son ejemplos de figuras terminadas, no los patrones descargables. **No hay pagos activos**.
- Contacto público: WhatsApp +52 272 130 0818, presente en el pie de página y en los pedidos.
- Si Google Drive limita miniaturas al sincronizar, el catálogo conserva enlaces a las fotografías originales.